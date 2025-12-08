import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import axios from 'axios'
import cors from "cors";
import Stripe from 'stripe'
import bodyParser from 'body-parser'
import polyline from '@mapbox/polyline'
import { createPublicClient, createWalletClient, decodeEventLog, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrumSepolia } from 'viem/chains'
import { AGRI_TRUTH_CHAIN_ABI, AGRI_TRUTH_CHAIN_ADDRESS } from './contract.js'
import { readAll as readVerification, writeFor as writeVerification } from './verificationStore.js'
import { connectDB } from './db.js'
import { fetchWeatherAndAlerts, getAlertHistory } from './services/weatherService.js'
import { listSchemes, upsertSubscription, getSubscriptions, getSubscriptionByFarmer, triggerSchemeTest } from './services/schemesService.js'
import { listCropGuides, getCropGuideByName } from './services/cropGuidesService.js'
import { listResources } from './services/awarenessService.js'

// Default EOAs for testing when inputs are missing
const DEFAULT_ADDRESSES = {
  FARMER: '0x1111111111111111111111111111111111111111',
  DISTRIBUTOR: '0x2222222222222222222222222222222222222222',
  RETAILER: '0x3333333333333333333333333333333333333333',
  CONSUMER: '0x4444444444444444444444444444444444444444',
}

// In-memory idempotency guards for Stripe sessions to avoid duplicate writes
const processedSessions = new Set()
const processingSessions = new Set()

// Load env from server/.env explicitly
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Load env from server/.env explicitly (must be before reading process.env values below)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

await connectDB().catch((err) => {
  console.error('MongoDB startup connection error', err)
  process.exit(1)
})

const app = express()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const port = process.env.PORT || 3001
const rpcUrl = process.env.ARB_SEPOLIA_RPC_URL
const transport = rpcUrl ? http(rpcUrl) : http()
const client = createPublicClient({ chain: arbitrumSepolia, transport })
const relayerKey = process.env.RELAYER_PRIVATE_KEY
const account = relayerKey ? privateKeyToAccount(relayerKey.startsWith('0x') ? relayerKey : ('0x' + relayerKey)) : undefined
const wallet = account ? createWalletClient({ account, chain: arbitrumSepolia, transport }) : undefined
const ownerKey = process.env.OWNER_PRIVATE_KEY
const ownerAccount = ownerKey ? privateKeyToAccount(ownerKey.startsWith('0x') ? ownerKey : ('0x' + ownerKey)) : undefined
const ownerWallet = ownerAccount ? createWalletClient({ account: ownerAccount, chain: arbitrumSepolia, transport }) : undefined
const CONTRACT_ADDRESS = (process.env.AGRI_TRUTH_CHAIN_ADDRESS || AGRI_TRUTH_CHAIN_ADDRESS)
const isValidAddress = (addr) => typeof addr === 'string' && /^0x[0-9a-fA-F]{40}$/.test(addr)
const isSameAddress = (a, b) => (a && b) ? a.toLowerCase() === b.toLowerCase() : false
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || ''
// All pricing is INR on-chain now; Stripe expects amounts in INR paise (minor units)

// Tiny cache for contract bytecode presence to avoid repeated RPC calls per request
app.use(cors({
  origin: "*", // optional, can use "*" for testing ["https://your-vercel-frontend.vercel.app"]
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// app.use(express.json()); // Moved down after webhook

// Example route
app.get("/", (req, res) => {
  res.json({ ok: true });
});

// Add JSON parsing middleware for API routes
app.use('/api', express.json());

// OpenRouteService proxy endpoint (for distributor map routing)
app.post("/api/get-route", async (req, res) => {
  try {
    const { start, end } = req.body;
    
    console.log('Route request received:', { start, end });
    
    if (!start || !end || !Array.isArray(start) || !Array.isArray(end)) {
      console.error('Invalid coordinates:', { start, end });
      return res.status(400).json({ error: 'Invalid coordinates format. Expected [lng, lat] arrays.' });
    }
    
    const ORS_API_KEY = process.env.ORS_API_KEY || '';
    if (!ORS_API_KEY) {
      console.error('ORS API key not configured');
      return res.status(500).json({ error: 'ORS API key not configured. Please add ORS_API_KEY to server/.env file' });
    }
    
    console.log('Calling ORS API...');
    // Request with geometry to get coordinate arrays
    const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        coordinates: [start, end],
        geometry: true,  // Request geometry coordinates
        instructions: false  // We don't need turn-by-turn instructions
      })
    });
    
    console.log('ORS API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('ORS API error:', errorData);
      
      // Check for specific error codes
      if (errorData.error && errorData.error.code === 2010) {
        return res.status(400).json({ 
          error: 'Could not find route. Coordinates may not be near roads. Try clicking closer to roads on the map.' 
        });
      }
      
      return res.status(response.status).json({ 
        error: errorData.error?.message || 'Failed to calculate route from ORS API' 
      });
    }
    
    const data = await response.json();
    console.log('ORS Response keys:', Object.keys(data));
    console.log('Has features?', !!data.features);
    console.log('Has routes?', !!data.routes);
    
    if (data.features && data.features[0]) {
      console.log('Feature geometry type:', data.features[0].geometry?.type);
      console.log('Feature geometry coords length:', data.features[0].geometry?.coordinates?.length);
    }
    
    console.log('Route calculated successfully');
    
    // Convert GeoJSON response to routes format for frontend compatibility
    if (data.features && Array.isArray(data.features)) {
      // GeoJSON format - convert to routes format
      const routes = data.features.map((feature) => {
        const route = {
          summary: feature.properties.summary,
          geometry: {
            coordinates: feature.geometry.coordinates,
            type: feature.geometry.type
          },
          segments: feature.properties.segments,
          bbox: data.bbox
        };
        console.log('Converted route geometry coords:', route.geometry.coordinates?.length);
        return route;
      });
      
      res.json({ routes, metadata: data.metadata });
    } else if (data.routes) {
      // Already in routes format - need to decode geometry if it's encoded
      console.log('Using routes format');
      
      const routes = data.routes.map((route) => {
        let geometry = route.geometry;
        
        // Check if geometry is an encoded polyline string
        if (typeof geometry === 'string') {
          console.log('Decoding polyline geometry, length:', geometry.length);
          // Decode polyline to get coordinates
          const decoded = polyline.decode(geometry);
          // Polyline.decode returns [lat, lng], we need [lng, lat] for GeoJSON
          geometry = {
            type: 'LineString',
            coordinates: decoded.map(coord => [coord[1], coord[0]])
          };
          console.log('Decoded to', geometry.coordinates.length, 'coordinate points');
        } else if (geometry && geometry.coordinates) {
          console.log('Geometry already has coordinates:', geometry.coordinates.length);
        } else {
          console.warn('No geometry found in route');
        }
        
        return {
          ...route,
          geometry
        };
      });
      
      res.json({ routes, metadata: data.metadata });
    } else {
      throw new Error('Unexpected response format from ORS');
    }
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});


let contractHasCode = null
let contractCodeCheckedAt = 0
const CONTRACT_CODE_TTL_MS = 30_000
async function hasContractCode() {
  if (!isValidAddress(CONTRACT_ADDRESS)) return false
  const now = Date.now()
  if (contractHasCode !== null && (now - contractCodeCheckedAt) < CONTRACT_CODE_TTL_MS) return contractHasCode
  const code = await client.getBytecode({ address: CONTRACT_ADDRESS }).catch(() => null)
  contractHasCode = !!code
  contractCodeCheckedAt = now
  return contractHasCode
}

// Map verification numeric -> label
const vNumToLabel = (n) => (n === 2 ? 'verified' : (n === 1 ? 'pending' : 'unverified'))

async function getVerificationStatusChain(batchId) {
  try {
    if (!isValidAddress(CONTRACT_ADDRESS)) return null
    const code = await client.getBytecode({ address: CONTRACT_ADDRESS })
    if (!code) return null
    const out = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'getVerification', args: [BigInt(batchId)] })
    const statusNum = Number(out?.[0] ?? 0)
    return { status: vNumToLabel(statusNum), by: out?.[1] || null, timestamp: Number(out?.[2] || 0n), verificationMetadataCID: out?.[3] || null }
  } catch { return null }
}

async function setVerificationStatusChain(batchId, statusLabel, verificationMetadataCID, verifiedQuantity) {
  try {
    if (!wallet || !account) return { ok: false, error: 'relayer_not_configured' }
    if (!isValidAddress(CONTRACT_ADDRESS)) return { ok: false, error: 'invalid_contract_address' }
    const code = await client.getBytecode({ address: CONTRACT_ADDRESS })
    if (!code) return { ok: false, error: 'not_a_contract' }
    const statusNum = statusLabel === 'verified' ? 2 : (statusLabel === 'pending' ? 1 : 0)
    const tx = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'setVerificationStatus', args: [BigInt(batchId), statusNum, verificationMetadataCID || "", BigInt(verifiedQuantity || 0)] })
    await client.waitForTransactionReceipt({ hash: tx })
    return { ok: true, tx }
  } catch (e) { return { ok: false, error: e?.message || 'set_verification_failed' } }
}

// Log relayer status
if (account) {
  console.log(`[server] Relayer configured: ${account.address}`)
} else {
  console.warn('[server] Relayer not configured. Set RELAYER_PRIVATE_KEY in server/.env')
}
console.log(`[server] Contract address: ${CONTRACT_ADDRESS}`)
console.log(`[server] Chain: arbitrum-sepolia (id=${arbitrumSepolia.id})`)
console.log(`[server] RPC: ${rpcUrl || 'default provider'}`)
console.log(`[server] n8n webhook: ${N8N_WEBHOOK_SECRET || 'not configured'}`)
if (account && isValidAddress(CONTRACT_ADDRESS)) {
  client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'verifiers', args: [account.address] })
    .then(isVerifier => {
      if (!isVerifier) console.warn(`[server] WARNING: Relayer ${account.address} is NOT a verifier. Webhook transfers will fail. Run /api/setup-relayer-as-verifier or set it manually.`)
      else console.log(`[server] Relayer is a verifier.`)
    })
    .catch(e => console.warn('[server] Failed to check relayer verifier status', e.message))
}
if (account && isValidAddress(CONTRACT_ADDRESS) && isSameAddress(CONTRACT_ADDRESS, account.address)) {
  console.warn('[server] WARNING: Contract address equals relayer address (EOA). This is not a contract. Update AGRI_TRUTH_CHAIN_ADDRESS in server/.env to your deployed contract address.')
}

// Shared logic for processing a successful checkout session
async function processCheckoutSession(session) {
  const meta = (session && session.metadata) || {}
  // Check if this is a split operation
  const isComplete = meta.completeBatch === 'true' || meta.completeBatch === true
  const isSplit = !isComplete && (meta.isSplit === 'true' || meta.isSplit === true || (meta.splitQuantity && Number(meta.splitQuantity) > 0))

  const batchIdStr = meta.batchId
  const batchId = batchIdStr && /^[0-9]+$/.test(batchIdStr) ? BigInt(batchIdStr) : null

  if (!batchId) return { ok: false, error: 'no_batch_id' }
  if (!wallet || !account) {
    console.warn('[process-session] relayer not configured')
    return { ok: false, error: 'relayer_not_configured' }
  }
  if (!isValidAddress(CONTRACT_ADDRESS)) {
    console.warn('[process-session] invalid contract address')
    return { ok: false, error: 'invalid_contract_address' }
  }

  const code = await client.getBytecode({ address: CONTRACT_ADDRESS })
  if (!code) throw new Error('not_a_contract')

  const role = meta.role
  let defaultTo = DEFAULT_ADDRESSES.DISTRIBUTOR
  if (role === 'retailer') defaultTo = DEFAULT_ADDRESSES.RETAILER
  else if (role === 'consumer') defaultTo = DEFAULT_ADDRESSES.CONSUMER
  const toAddress = meta.toAddress || defaultTo

  if (toAddress && /^0x[0-9a-fA-F]{40}$/.test(toAddress)) {
    try {
      if (isSplit) {
        // Handle Batch Splitting
        const splitQty = BigInt(meta.splitQuantity || 0)
        if (splitQty > 0n) {
          // 1. Fetch parent batch details BEFORE split to calculate new price
          let parentMinPrice = 0n
          let parentQty = 0n
          let parentDistributorPrice = 0n
          let parentRetailerPrice = 0n
          try {
            const parentBatch = await client.readContract({
              address: CONTRACT_ADDRESS,
              abi: AGRI_TRUTH_CHAIN_ABI,
              functionName: 'batches',
              args: [batchId]
            })
            // batch[7] is quantityKg, batch[13] is minPriceINR
            parentQty = parentBatch[7]
            parentMinPrice = parentBatch[13]
            parentDistributorPrice = parentBatch[14]
            parentRetailerPrice = parentBatch[15]
            // Fallback if minPrice is 0, use basePrice (batch[8])
            if (parentMinPrice === 0n) parentMinPrice = parentBatch[8]
          } catch (e) {
            console.warn('[process-session] Failed to fetch parent batch for price adjustment', e)
          }

          // 2. Execute Split
          const tx = await wallet.writeContract({
            address: CONTRACT_ADDRESS,
            abi: AGRI_TRUTH_CHAIN_ABI,
            functionName: 'splitBatchByVerifier',
            args: [batchId, splitQty, toAddress]
          })
          const receipt = await client.waitForTransactionReceipt({ hash: tx })
          // 3. Update Parent Batch Price (Proportional Reduction)
          // New Price = Old Price *
          if (parentQty > 0n && parentMinPrice > 0n) {
            const newParentQty = parentQty - splitQty
            if (newParentQty > 0n) {
              const newParentPrice = parentMinPrice 
              try {
                const priceTx = await wallet.writeContract({
                  address: CONTRACT_ADDRESS,
                  abi: AGRI_TRUTH_CHAIN_ABI,
                  functionName: 'setMinPriceInr',
                  args: [batchId, newParentPrice]
                })
                await client.waitForTransactionReceipt({ hash: priceTx })
              } catch (e) {
                console.error('[process-session] Failed to update parent batch price', e)
              }
            }
          }

          // Get the new child batch ID from the BatchSplit event
          const splitEvent = receipt.logs.find(log => {
            try {
              const decoded = decodeEventLog({
                abi: AGRI_TRUTH_CHAIN_ABI,
                data: log.data,
                topics: log.topics
              })
              return decoded.eventName === 'BatchSplit'
            } catch { return false }
          })

          if (splitEvent) {
            const decoded = decodeEventLog({
              abi: AGRI_TRUTH_CHAIN_ABI,
              data: splitEvent.data,
              topics: splitEvent.topics
            })
            const newBatchId = decoded.args.newBatchId

            // Consumer Logic (Historical Price Carryover)
            if (role === 'consumer') {
                 let childDistributorPrice = 0n
                 let childRetailerPrice = 0n
                 if (parentQty > 0n) {
                    if (parentDistributorPrice > 0n) childDistributorPrice = (parentDistributorPrice * splitQty) / parentQty
                    if (parentRetailerPrice > 0n) childRetailerPrice = (parentRetailerPrice * splitQty) / parentQty
                 }
                 
                 if (childDistributorPrice > 0n) {
                    const setTx1 = await wallet.writeContract({
                      address: CONTRACT_ADDRESS,
                      abi: AGRI_TRUTH_CHAIN_ABI,
                      functionName: 'setPriceByDistributorInr',
                      args: [newBatchId, childDistributorPrice]
                    })
                    await client.waitForTransactionReceipt({ hash: setTx1 })
                 }
                 if (childRetailerPrice > 0n) {
                    const setTx2 = await wallet.writeContract({
                      address: CONTRACT_ADDRESS,
                      abi: AGRI_TRUTH_CHAIN_ABI,
                      functionName: 'setPriceByRetailerInr',
                      args: [newBatchId, childRetailerPrice]
                    })
                    await client.waitForTransactionReceipt({ hash: setTx2 })
                 }
            }

            // Set resale price on the child batch if provided
            const resalePricePerKg = meta?.resalePricePerKg
            if (resalePricePerKg && Number(resalePricePerKg) > 0) {
              const resalePriceTotal = BigInt(Math.ceil(Number(resalePricePerKg) ))

              // Set price based on buyer's role
              if (role === 'distributor') {
                const setTx = await wallet.writeContract({
                  address: CONTRACT_ADDRESS,
                  abi: AGRI_TRUTH_CHAIN_ABI,
                  functionName: 'setPriceByDistributorInr',
                  args: [newBatchId, resalePriceTotal]
                })
                await client.waitForTransactionReceipt({ hash: setTx })
              } else if (role === 'retailer') {
                // Calculate proportional distributor price for this child batch
                let childDistributorPrice = 0n
                if (parentQty > 0n && parentDistributorPrice > 0n) {
                   childDistributorPrice = parentDistributorPrice
                }

                // Set the Distributor Price on the child batch (historical record of purchase)
                if (childDistributorPrice > 0n) {
                    const setTx1 = await wallet.writeContract({
                      address: CONTRACT_ADDRESS,
                      abi: AGRI_TRUTH_CHAIN_ABI,
                      functionName: 'setPriceByDistributorInr',
                      args: [newBatchId, childDistributorPrice]
                    })
                    await client.waitForTransactionReceipt({ hash: setTx1 })
                }

                const setTx2 = await wallet.writeContract({
                  address: CONTRACT_ADDRESS,
                  abi: AGRI_TRUTH_CHAIN_ABI,
                  functionName: 'setPriceByRetailerInr',
                  args: [newBatchId, resalePriceTotal]
                })
                await client.waitForTransactionReceipt({ hash: setTx2 })
              }
            }
          }
        } else {
          console.warn('[process-session] Split requested but invalid quantity')
        }
      } else {
        // Standard Transfer
        const latest = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'batches', args: [batchId] })
        const alreadyOwner = (latest?.[1] || '').toLowerCase?.() === toAddress.toLowerCase?.()
        if (!alreadyOwner) {
          const tx = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'transferOwnershipByVerifier', args: [batchId, toAddress] })
          await client.waitForTransactionReceipt({ hash: tx })
        }
      }
    } catch (e) {
      console.warn('[process-session] transfer/split failed', e?.message || e)
      return { ok: false, error: e?.message || 'transfer_failed' }
    }
  } else {
    console.warn('[process-session] toAddress missing or invalid')
  }

  // Optional downstream price updates (for non-split or parent batch updates)
  try {
    if (role === 'distributor') {
      if(!isSplit){
      const pInrMeta = meta?.distributorPriceINR
      const pInr = pInrMeta != null && String(pInrMeta).trim() !== '' ? BigInt(String(pInrMeta)) : 0n
      if (pInr > 0n) {
        const latest = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'batches', args: [batchId] })
        const current = latest?.[14]
        const same = (current?.toString?.() || '') === pInr.toString()
        if (!same) {
          const setTx = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'setPriceByDistributorInr', args: [batchId, pInr] })
          await client.waitForTransactionReceipt({ hash: setTx })
        } else {
        }
      }}
    } else if (role === 'retailer') {
      if (!isSplit) {
      const pInrMeta = meta?.consumerPriceINR
      const pInr = pInrMeta != null && String(pInrMeta).trim() !== '' ? BigInt(String(pInrMeta)) : 0n
      if (pInr > 0n) {
        const latest = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'batches', args: [batchId] })
        const current = latest?.[15]
        const same = (current?.toString?.() || '') === pInr.toString()
        if (!same) {
          const setTx = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'setPriceByRetailerInr', args: [batchId, pInr] })
          await client.waitForTransactionReceipt({ hash: setTx })
        }
      }
      }
    }
  } catch (e) { console.warn('[process-session] optional downstream price update failed', e?.message || e) }

  return { ok: true }
}

// Raw body is required for Stripe signature verification
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event
  try {
    // TEMPORARY: Disable signature verification for local testing
    event = JSON.parse(req.body.toString())
  } catch (err) {
    console.error('Webhook parsing failed', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    const session = event.data.object
    if (session?.id) {
      if (processedSessions.has(session.id)) return res.json({ received: true, skipped: true })
      if (processingSessions.has(session.id)) return res.json({ received: true, inProgress: true })
      processingSessions.add(session.id)
    }

    if (event.type === 'checkout.session.completed') {
      await processCheckoutSession(session)
    }
    res.json({ received: true })
  } catch (e) {
    console.error('[webhook] handler error', e)
    res.status(400).send(`Webhook Error: ${e.message}`)
  } finally {
    try {
      const id = event?.data?.object?.id
      if (id && processingSessions.has(id)) {
        processingSessions.delete(id)
        processedSessions.add(id)
      }
    } catch { }
  }
})


// Note: duplicate webhook route removed to prevent double handling

app.use(express.json())

// Weather: current conditions and alert generation
app.get('/api/weather/current', async (req, res) => {
  try {
    const { lat, lon, lang, farmerId, batchId } = req.query
    const result = await fetchWeatherAndAlerts({ lat, lon, lang, farmerId, batchId })
    res.json({ ok: true, weather: result.weather, alerts: result.alerts })
  } catch (e) {
    const msg = e?.message || 'weather_error'
    let status = 400
    if (msg === 'OPENWEATHER_API_KEY missing') status = 500
    else if (msg === 'openweather_unauthorized') status = 401
    else if (msg === 'openweather_rate_limited') status = 429
    res.status(status).json({ ok: false, error: msg })
  }
})

// Schemes: list and subscriptions (in-memory)
app.get('/api/schemes', (req, res) => {
  const data = listSchemes()
  res.json({ ok: true, schemes: data })
})

app.get('/api/schemes/subscriptions', async (req, res) => {
  const subscriptions = await getSubscriptions()
  res.json({ ok: true, subscriptions })
})

app.post('/api/schemes/subscribe', async (req, res) => {
  try {
    const { farmerId, farmerAddress, phone, language, schemeIds } = req.body || {}
    if (!phone) return res.status(400).json({ ok: false, error: 'phone_required' })
    const result = await upsertSubscription({ farmerId, farmerAddress, phone, language, schemeIds })
    if (!result.ok) return res.status(400).json(result)
    res.json({ ok: true, subscription: result.subscription })
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || 'scheme_subscribe_failed' })
  }
})

app.post('/api/schemes/notify-test', async (req, res) => {
  try {
    const { farmerId } = req.body || {}
    const result = await triggerSchemeTest(farmerId)
    res.json({ ok: true, result })
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || 'scheme_notify_failed' })
  }
})

// Zero-loss crop guides: list and lookup by name
app.get('/api/crop-guides', async (req, res) => {
  try {
    const lang = req.query.lang || 'en'
    const guides = await listCropGuides(lang)
    res.json({ ok: true, guides })
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || 'crop_guides_error' })
  }
})

app.get('/api/crop-guides/:name', async (req, res) => {
  try {
    const lang = req.query.lang || 'en'
    const guide = await getCropGuideByName(req.params.name, lang)
    if (!guide) return res.status(404).json({ ok: false, error: 'guide_not_found' })
    res.json({ ok: true, guide })
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || 'crop_guide_error' })
  }
})

app.get('/api/alerts/history', async (req, res) => {
  try {
    const { farmerId, limit } = req.query
    const alerts = await getAlertHistory({ farmerId, limit })
    res.json({ ok: true, alerts })
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || 'alert_history_error' })
  }
})

// Awareness resources (CFTRI/KVK/etc.)
app.get('/api/awareness', async (req, res) => {
  try {
    const { crop, scope, scheme, limit } = req.query
    const resources = await listResources({ crop, scope, scheme, limit: limit ? Number(limit) : 20 })
    res.json({ ok: true, resources })
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || 'awareness_error' })
  }
})

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { lineItems, successUrl, cancelUrl, metadata } = req.body
    // If a batch is specified, require verified status before allowing checkout
    try {
      const batchIdStr = metadata?.batchId
      if (batchIdStr && /^[0-9]+$/.test(String(batchIdStr))) {
        let status = null
        const vChain = await getVerificationStatusChain(batchIdStr)
        status = vChain?.status || null
        if (!status) {
          const v = readVerification()[String(batchIdStr)]
          status = v?.status || 'unverified'
        }
        if (status !== 'verified') return res.status(400).json({ error: 'batch_not_verified' })
      }
    } catch { }
    // Expect unit_amount already in INR paise; enforce currency and minimal amount
    const STRIPE_MAX = 999_999_999_999
    const safeLineItems = (Array.isArray(lineItems) ? lineItems : []).map((item) => {
      const src = item?.price_data || {}
      let amount = Number(src.unit_amount ?? 0)
      if (!Number.isFinite(amount) || amount <= 0) amount = 100 // ₹1.00
      amount = Math.min(Math.max(100, Math.floor(amount)), STRIPE_MAX)
      return {
        price_data: {
          currency: 'inr',
          product_data: src.product_data || { name: 'Agri batch' },
          unit_amount: amount
        },
        quantity: Number(item?.quantity ?? 1)
      }
    })
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: safeLineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata
    })
    res.json({ id: session.id, url: session.url })
  } catch (e) {
    console.error('create-checkout-session failed', e)
    res.status(500).json({ error: 'failed_to_create_session' })
  }
})

// Health/status: check relayer config (dev only; do not expose in prod)
app.get('/api/relayer-status', (req, res) => {
  res.json({ configured: !!(wallet && account), address: account?.address || null })
})

// Write: register a new batch on-chain using relayer key (test only)
app.post('/api/register-batch', async (req, res) => {
  try {
    if (!wallet || !account) return res.status(500).json({ error: 'relayer_not_configured' })
    if (!isValidAddress(CONTRACT_ADDRESS)) return res.status(400).json({ error: 'invalid_contract_address', address: CONTRACT_ADDRESS })
    const { cropType, quantityKg, basePriceINR, harvestDate, metadataCID, minPriceINR, farmerAddress, expiryDate } = req.body || {}
    if (!cropType || String(cropType).trim() === '') return res.status(400).json({ error: 'missing_crop_type' })
    if (quantityKg == null || Number(quantityKg) <= 0) return res.status(400).json({ error: 'invalid_quantity' })
    if (!harvestDate || Number(harvestDate) <= 0) return res.status(400).json({ error: 'invalid_harvest_date' })
    const baseInr = BigInt(basePriceINR ?? 0)
    if (baseInr <= 0n) return res.status(400).json({ error: 'invalid_base_price' })
    const expiry = expiryDate ? BigInt(expiryDate) : 0n

    // send registerBatch
    const wantsFor = farmerAddress && /^0x[0-9a-fA-F]{40}$/.test(farmerAddress)
    const metaCID = (metadataCID && String(metadataCID).trim() !== '') ? metadataCID : ('meta:' + JSON.stringify({
      kind: 'registration', cropType, quantityKg: Number(quantityKg), basePriceINR: baseInr.toString(), harvestDate: Number(harvestDate), minPriceINR: (minPriceINR != null) ? BigInt(minPriceINR).toString() : undefined, expiryDate: Number(expiry)
    }))
    const argsFor = [farmerAddress, cropType, BigInt(quantityKg), baseInr, BigInt(harvestDate), metaCID, expiry]
    const argsSimple = [cropType, BigInt(quantityKg), baseInr, BigInt(harvestDate), metaCID, expiry]
    let hash
    let receipt
    let usedFallback = false
    try {
      const fn = wantsFor ? 'registerBatchFor' : 'registerBatch'
      const args = wantsFor ? argsFor : argsSimple
      hash = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: fn, args })
      receipt = await client.waitForTransactionReceipt({ hash })
    } catch (e) {
      // Fallback path: some older deployments may not allow registerBatchFor.
      if (wantsFor) {
        try {
          usedFallback = true
          hash = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'registerBatch', args: argsSimple })
          receipt = await client.waitForTransactionReceipt({ hash })
        } catch (e2) {
          throw e2
        }
      } else {
        throw e
      }
    }
    // Robustly decode batchId from logs using viem.decodeEventLog
    let batchId
    for (const log of receipt.logs) {
      try {
        // Only consider logs from our contract
        if ((log.address || '').toLowerCase() !== (CONTRACT_ADDRESS || '').toLowerCase()) continue
        const decoded = decodeEventLog({ abi: AGRI_TRUTH_CHAIN_ABI, data: log.data, topics: log.topics })
        if (decoded.eventName === 'BatchRegistered' && decoded.args?.batchId != null) {
          batchId = BigInt(decoded.args.batchId)
          break
        }
      } catch (_) { /* skip non-matching logs */ }
    }

    // set min price if provided
    const minInrComputed = (minPriceINR != null) ? BigInt(minPriceINR) : null
    if (minInrComputed != null && batchId != null) {
      await wallet.writeContract({
        address: CONTRACT_ADDRESS,
        abi: AGRI_TRUTH_CHAIN_ABI,
        functionName: 'setMinPriceInr',
        args: [batchId, BigInt(minInrComputed)]
      })
    }
    // Metadata mirroring via payments/shipments removed in INR-only model
    // If we used fallback registerBatch, ensure the farmer is the owner
    if (usedFallback && wantsFor && batchId != null) {
      try {
        const tx2 = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'transferOwnership', args: [batchId, farmerAddress] })
        await client.waitForTransactionReceipt({ hash: tx2 })
      } catch (e) {
        console.warn('[register-batch] fallback transferOwnership failed', e?.message || e)
      }
    }
    res.json({ ok: true, batchId: batchId ? batchId.toString() : null, tx: hash, usedFallback })
  } catch (e) {
    console.error('register-batch failed', e)
    res.status(500).json({ error: 'register_failed', message: e?.message || String(e) })
  }
})

// Read: list all batches from chain (id + summary)
app.get('/api/batches', async (req, res) => {
  try {
    if (!isValidAddress(CONTRACT_ADDRESS)) {
      return res.status(400).json({ error: 'invalid_contract_address', address: CONTRACT_ADDRESS })
    }
    if (account && isSameAddress(CONTRACT_ADDRESS, account.address)) {
      return res.status(400).json({ error: 'address_matches_relayer', address: CONTRACT_ADDRESS })
    }
    // quick sanity: ensure address has code
    const code = await client.getBytecode({ address: CONTRACT_ADDRESS })
    if (!code) {
      return res.status(400).json({ error: 'not_a_contract', address: CONTRACT_ADDRESS })
    }
    let ids
    try {
      ids = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'getAllBatchIds' })
    } catch (e) {
      // Fallback: derive from events if getAllBatchIds is not available
      const logs = await client.getLogs({
        address: CONTRACT_ADDRESS,
        abi: AGRI_TRUTH_CHAIN_ABI,
        eventName: 'BatchRegistered',
        fromBlock: 0n
      })
      const seen = new Set()
      ids = []
      for (const log of logs) {
        const id = log.args?.batchId
        if (typeof id !== 'bigint') continue
        if (!seen.has(id)) { seen.add(id); ids.push(id) }
      }
    }

    // Filter by farmer (history) if requested
    const farmerFilter = req.query.farmer
    if (farmerFilter && /^0x[0-9a-fA-F]{40}$/.test(farmerFilter)) {
      const farmerIds = new Set()
      // 1. Registered by farmer
      const logsReg = await client.getLogs({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, eventName: 'BatchRegistered', fromBlock: 0n, args: { farmer: farmerFilter } })
      for (const log of logsReg) { if (log.args?.batchId != null) farmerIds.add(log.args.batchId) }
      // 2. Transferred to farmer
      const logsTransfer = await client.getLogs({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, eventName: 'OwnershipTransferred', fromBlock: 0n, args: { to: farmerFilter } })
      for (const log of logsTransfer) { if (log.args?.batchId != null) farmerIds.add(log.args.batchId) }
      ids = ids.filter(id => farmerIds.has(id))
    }

    // Filter by current owner if requested (strict ownership)
    const currentOwnerFilter = req.query.currentOwner
    if (currentOwnerFilter && /^0x[0-9a-fA-F]{40}$/.test(currentOwnerFilter)) {
      // Optimization: Only check batches where the user was involved (Registered or Transferred To)
      // Otherwise we'd have to check ownership of ALL batches on chain.
      const candidateIds = new Set()
      try {
        const logsReg = await client.getLogs({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, eventName: 'BatchRegistered', fromBlock: 0n, args: { farmer: currentOwnerFilter } })
        
        for (const log of logsReg) { 
            if (log.args?.batchId != null) {
                candidateIds.add(log.args.batchId) 
            } else {
                // Fallback: manual decode if args is undefined
                try {
                    const decoded = decodeEventLog({ abi: AGRI_TRUTH_CHAIN_ABI, data: log.data, topics: log.topics })
                    if (decoded.eventName === 'BatchRegistered' && decoded.args?.batchId != null) {
                        candidateIds.add(decoded.args.batchId)
                    }
                } catch (e) { }
            }
        }
        
        const logsTransfer = await client.getLogs({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, eventName: 'OwnershipTransferred', fromBlock: 0n, args: { to: currentOwnerFilter } })
        
        for (const log of logsTransfer) { 
            if (log.args?.batchId != null) {
                candidateIds.add(log.args.batchId) 
            } else {
                // Fallback: manual decode if args is undefined
                try {
                    const decoded = decodeEventLog({ abi: AGRI_TRUTH_CHAIN_ABI, data: log.data, topics: log.topics })
                    if (decoded.eventName === 'OwnershipTransferred' && decoded.args?.batchId != null) {
                        candidateIds.add(decoded.args.batchId)
                    }
                } catch (e) { }
            }
        }
      } catch (e) {
        console.error('[server] Error fetching logs for filter:', e)
      }
      
      // Now verify current ownership for these candidates
      const candidates = Array.from(candidateIds)
      
      const confirmedIds = new Set()
      // Parallel checks with retry
      await Promise.all(candidates.map(async (id) => {
        try {
          const b = await retry(() => client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'batches', args: [id] }))
          if (b && isSameAddress(b[1], currentOwnerFilter)) {
            confirmedIds.add(id)
          } else {
          }
        } catch (e) {
          console.warn(`[server] Failed to verify ownership for batch ${id}:`, e.message)
        }
      }))
      
      ids = ids.filter(id => confirmedIds.has(id))
    }

    // Support pagination
    let idsArray = [...ids]
    // Sort descending (newest first) assuming sequential IDs
    idsArray.sort((a, b) => Number(b) - Number(a))
    
    const total = idsArray.length
    const limit = req.query.limit ? parseInt(req.query.limit) : null
    const page = req.query.page ? parseInt(req.query.page) : 1
    
    if (limit && limit > 0) {
      const start = (page - 1) * limit
      idsArray = idsArray.slice(start, start + limit)
    }

    const vAll = readVerification()
    const results = await Promise.all(idsArray.map(async (id) => {
      let b
      try {
        b = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'batches', args: [id] })
      } catch {
        b = null
      }
      let record
      if (b) {
        record = {
          id: Number(b[0]),
          currentOwner: b[1],
          farmer: b[2],
          distributor: b[3],
          retailer: b[4],
          consumer: b[5],
          cropType: b[6],
          quantityKg: Number(b[7]),
          basePriceINR: b[8]?.toString?.() ?? '0',
          harvestDate: Number(b[9] || 0n),
          metadataCID: b[10] || '',
          createdAt: Number(b[11] || 0n),
          exists: !!b[12],
          minPriceINR: b[13]?.toString?.() ?? '0',
          priceByDistributorINR: b[14]?.toString?.() ?? '0',
          priceByRetailerINR: b[15]?.toString?.() ?? '0',
          boughtByDistributorAt: Number(b[16] || 0n),
          boughtByRetailerAt: Number(b[17] || 0n),
          boughtByConsumerAt: Number(b[18] || 0n),
          verificationStatus: Number(b[19] || 0),
          verificationBy: b[20] || null,
          verificationAt: Number(b[21] || 0n),
          parentId: Number(b[22] || 0n),
          isSplit: !!b[23],
          expiryDate: Number(b[24] || 0n)
        }
        // Fallback: if minPrice is zero but base exists, use base as min
        if ((record.minPriceINR === '0' || record.minPriceINR === 0) && (record.basePriceINR && record.basePriceINR !== '0')) {
          record.minPriceINR = record.basePriceINR.toString()
        }
        // Overlay from BatchRegistered event if tuple seems sparse
        try {
          if (!record.cropType || record.cropType === '' || !record.quantityKg || record.basePriceINR === '0' || !record.harvestDate) {
            const logs = await client.getLogs({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, eventName: 'BatchRegistered', fromBlock: 0n, args: { batchId: id } })
            const last = logs[logs.length - 1]
            if (last) {
              if ((!record.cropType || record.cropType === '') && last.args?.cropType) record.cropType = last.args.cropType
              if ((!record.quantityKg || record.quantityKg === 0) && last.args?.quantityKg) record.quantityKg = Number(last.args.quantityKg)
              if ((record.basePriceINR === '0' || !record.basePriceINR) && last.args?.basePriceINR) record.basePriceINR = String(last.args.basePriceINR)
              if ((!record.harvestDate || record.harvestDate === 0) && last.args?.harvestDate) record.harvestDate = Number(last.args.harvestDate)
              if ((!record.metadataCID || record.metadataCID === '') && last.args?.metadataCID) record.metadataCID = last.args.metadataCID
              if (!record.createdAt && last.blockNumber) {
                try { const blk = await client.getBlock({ blockNumber: last.blockNumber }); record.createdAt = blk?.timestamp ? Number(blk.timestamp) : record.createdAt }
                catch { }
              }
            }
          }
        } catch { }
      } else {
        // Legacy fallback via event log
        const logs = await client.getLogs({
          address: CONTRACT_ADDRESS,
          abi: AGRI_TRUTH_CHAIN_ABI,
          eventName: 'BatchRegistered',
          fromBlock: 0n,
          args: { batchId: id }
        })
        const last = logs[logs.length - 1]
        let createdAt = 0
        if (last?.blockNumber) {
          try {
            const blk = await client.getBlock({ blockNumber: last.blockNumber })
            createdAt = blk?.timestamp ? Number(blk.timestamp) : 0
          } catch { }
        }
        const farmer = last?.args?.farmer || DEFAULT_ADDRESSES.FARMER
        const cropType = last?.args?.cropType || ''
        const quantityKg = Number(last?.args?.quantityKg || 0n)
        const basePriceINR = (last?.args?.basePriceINR || 0n).toString()
        const harvestDate = Number(last?.args?.harvestDate || 0n)
        const metadataCID = last?.args?.metadataCID || ''
        record = {
          id: Number(id),
          currentOwner: farmer,
          farmer,
          distributor: '0x0000000000000000000000000000000000000000',
          retailer: '0x0000000000000000000000000000000000000000',
          consumer: '0x0000000000000000000000000000000000000000',
          cropType,
          quantityKg,
          basePriceINR,
          harvestDate,
          metadataCID,
          createdAt,
          exists: true,
          minPriceINR: '0',
          priceByDistributorINR: '0',
          priceByRetailerINR: '0',
          boughtByDistributorAt: 0,
          boughtByRetailerAt: 0,
          boughtByConsumerAt: 0
        }
        if ((record.minPriceINR === '0' || record.minPriceINR === 0) && (record.basePriceINR && record.basePriceINR !== '0')) {
          record.minPriceINR = record.basePriceINR.toString()
        }
      }

      // Enriched aliases
      const role = record.currentOwner?.toLowerCase?.() === record.farmer?.toLowerCase?.() ? 'farmer'
        : record.currentOwner?.toLowerCase?.() === record.distributor?.toLowerCase?.() ? 'distributor'
          : record.currentOwner?.toLowerCase?.() === record.retailer?.toLowerCase?.() ? 'retailer'
            : record.currentOwner?.toLowerCase?.() === record.consumer?.toLowerCase?.() ? 'consumer'
              : 'unknown'
      // Keep raw epoch seconds in the response; UI can format if needed
      const dates = {
        harvest: record.harvestDate,
        created: record.createdAt,
        boughtByDistributor: record.boughtByDistributorAt,
        boughtByRetailer: record.boughtByRetailerAt,
        boughtByConsumer: record.boughtByConsumerAt
      }
      const prices = {
        baseINR: record.basePriceINR,
        minINR: record.minPriceINR,
        byDistributorINR: record.priceByDistributorINR,
        byRetailerINR: record.priceByRetailerINR
      }

      // Removed enrichment from payments/shipments; rely on direct tuple + BatchRegistered event only

      // Normalize role addresses: if missing or zero, use defaults; avoid accidentally equating consumer to distributor unless set
      if (!record.distributor || record.distributor === '0x0000000000000000000000000000000000000000') record.distributor = DEFAULT_ADDRESSES.DISTRIBUTOR
      if (!record.retailer || record.retailer === '0x0000000000000000000000000000000000000000') record.retailer = DEFAULT_ADDRESSES.RETAILER
      if (!record.consumer || record.consumer === '0x0000000000000000000000000000000000000000') record.consumer = DEFAULT_ADDRESSES.CONSUMER
      let verificationChain = null
      try {
        verificationChain = await getVerificationStatusChain(Number(record.id))
      } catch { }
      return {
        ...record,
        currentHolder: record.currentOwner,
        'current-holder': record.currentOwner,
        current_holder: record.currentOwner,
        currentHolderRole: role,
        verification: verificationChain || vAll[String(record.id)] || { status: 'unverified', by: null, timestamp: null },
        dates,
        prices
      }
    }))
    res.json({ batches: results, total })
  } catch (e) {
    console.error('batches read failed', e)
    res.status(500).json({ error: 'read_failed' })
  }
})

// Read: single batch with shipments & payments
app.get('/api/batch/:id', async (req, res) => {
  try {
    if (!isValidAddress(CONTRACT_ADDRESS)) return res.status(400).json({ error: 'invalid_contract_address', address: CONTRACT_ADDRESS })
    if (account && isSameAddress(CONTRACT_ADDRESS, account.address)) {
      return res.status(400).json({ error: 'address_matches_relayer', address: CONTRACT_ADDRESS })
    }
    const idStr = req.params.id
    if (!/^[0-9]+$/.test(idStr)) return res.status(400).json({ error: 'invalid_id' })
    const id = BigInt(idStr)
    if (!(await hasContractCode())) return res.status(400).json({ error: 'not_a_contract', address: CONTRACT_ADDRESS })
    let b
    try {
      b = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'batches', args: [id] })
    } catch { }
    let batch
    if (b) {
      const exists = b[12]
      if (!exists) return res.status(404).json({ error: 'not_found' })
      batch = {
        id: Number(b[0]),
        currentOwner: b[1],
        farmer: b[2],
        distributor: b[3],
        retailer: b[4],
        consumer: b[5],
        cropType: b[6],
        quantityKg: Number(b[7]),
        basePriceINR: b[8]?.toString?.() ?? '0',
        harvestDate: Number(b[9]),
        metadataCID: b[10],
        createdAt: Number(b[11]),
        minPriceINR: b[13]?.toString?.() ?? '0',
        priceByDistributorINR: b[14]?.toString?.() ?? '0',
        priceByRetailerINR: b[15]?.toString?.() ?? '0',
        boughtByDistributorAt: Number(b[16] || 0n),
        boughtByRetailerAt: Number(b[17] || 0n),
        boughtByConsumerAt: Number(b[18] || 0n),
        verificationStatus: Number(b[19] || 0),
        verificationBy: b[20] || null,
        verificationAt: Number(b[21] || 0n),
        parentId: Number(b[22] || 0n),
        isSplit: !!b[23],
        expiryDate: Number(b[24] || 0n)
      }
      if ((batch.minPriceINR === '0' || batch.minPriceINR === 0) && (batch.basePriceINR && batch.basePriceINR !== '0')) {
        batch.minPriceINR = batch.basePriceINR.toString()
      }
      // Removed slow event-log overlays to speed up response
      // Patch from metadataCID if it contains embedded meta JSON
      try {
        if (typeof batch.metadataCID === 'string' && batch.metadataCID.startsWith('meta:')) {
          const m = JSON.parse(batch.metadataCID.slice(5))
          if (m?.cropType && (!batch.cropType || batch.cropType === '')) batch.cropType = m.cropType
          if (m?.quantityKg && (!batch.quantityKg || batch.quantityKg === 0)) batch.quantityKg = Number(m.quantityKg)
          if (m?.basePriceINR && (batch.basePriceINR === '0' || !batch.basePriceINR)) batch.basePriceINR = String(m.basePriceINR)
          if (m?.harvestDate && (!batch.harvestDate || batch.harvestDate === 0)) batch.harvestDate = Number(m.harvestDate)
          if (m?.minPriceINR && (batch.minPriceINR === '0' || !batch.minPriceINR)) batch.minPriceINR = String(m.minPriceINR)
          if (m?.expiryDate && (!batch.expiryDate || batch.expiryDate === 0)) batch.expiryDate = Number(m.expiryDate)
        }
      } catch { }
    } else {
      // Fast-fail instead of scanning events across the chain
      return res.status(404).json({ error: 'not_found' })
    }
    // Enriched aliases
    const currentHolderRole = batch.currentOwner?.toLowerCase?.() === batch.farmer?.toLowerCase?.() ? 'farmer'
      : batch.currentOwner?.toLowerCase?.() === batch.distributor?.toLowerCase?.() ? 'distributor'
        : batch.currentOwner?.toLowerCase?.() === batch.retailer?.toLowerCase?.() ? 'retailer'
          : batch.currentOwner?.toLowerCase?.() === batch.consumer?.toLowerCase?.() ? 'consumer'
            : 'unknown'
    const dates = {
      harvest: batch.harvestDate,
      created: batch.createdAt,
      boughtByDistributor: batch.boughtByDistributorAt,
      boughtByRetailer: batch.boughtByRetailerAt,
      boughtByConsumer: batch.boughtByConsumerAt
    }
    const prices = {
      baseINR: batch.basePriceINR,
      minINR: batch.minPriceINR,
      byDistributorINR: batch.priceByDistributorINR,
      byRetailerINR: batch.priceByRetailerINR
    }
    const vAll = readVerification()
    let verificationChain = null
    try { verificationChain = await getVerificationStatusChain(Number(batch.id)) } catch { }
    res.json({
      batch: {
        ...batch,
        currentHolder: batch.currentOwner,
        'current-holder': batch.currentOwner,
        current_holder: batch.currentOwner,
        currentHolderRole,
        verification: verificationChain || vAll[String(batch.id)] || { status: 'unverified', by: null, timestamp: null },
        dates,
        prices
      }
    })
  } catch (e) {
    console.error('batch read failed', e)
    res.status(500).json({ error: 'read_failed' })
  }
})

// Zero-loss options for a batch using crop guide + awareness resources
app.get('/api/batch/:id/zero-loss', async (req, res) => {
  try {
    if (!isValidAddress(CONTRACT_ADDRESS)) return res.status(400).json({ error: 'invalid_contract_address' })
    const idStr = req.params.id
    if (!/^[0-9]+$/.test(idStr)) return res.status(400).json({ error: 'invalid_id' })
    const id = BigInt(idStr)
    const code = await client.getBytecode({ address: CONTRACT_ADDRESS })
    if (!code) return res.status(400).json({ error: 'not_a_contract' })

    let b
    try {
      b = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'batches', args: [id] })
    } catch { }
    if (!b || !b[12]) return res.status(404).json({ error: 'not_found' })

    const batch = {
      id: Number(b[0]),
      cropType: b[6],
      quantityKg: Number(b[7] || 0n),
      expiryDate: Number(b[24] || 0n),
      basePriceINR: b[8]?.toString?.() ?? '0',
      minPriceINR: b[13]?.toString?.() ?? '0'
    }

    // Decode expiry/price from metadata if missing
    try {
      if (typeof b[10] === 'string' && b[10].startsWith('meta:')) {
        const m = JSON.parse(b[10].slice(5))
        if (m?.expiryDate && !batch.expiryDate) batch.expiryDate = Number(m.expiryDate)
        if (m?.basePriceINR && (!batch.basePriceINR || batch.basePriceINR === '0')) batch.basePriceINR = String(m.basePriceINR)
        if (m?.minPriceINR && (!batch.minPriceINR || batch.minPriceINR === '0')) batch.minPriceINR = String(m.minPriceINR)
      }
    } catch { }

    const nowSec = Math.floor(Date.now() / 1000)
    const daysRemaining = batch.expiryDate ? Math.ceil((batch.expiryDate - nowSec) / 86400) : null
    const urgency = daysRemaining == null ? 'unknown' : daysRemaining <= 3 ? 'critical' : daysRemaining <= 7 ? 'urgent' : 'normal'

    const guide = await getCropGuideByName(batch.cropType)
    const awareness = await listResources({ crop: batch.cropType })

    const options = []
    if (guide?.zeroLossMeasures?.primary) {
      options.push({ option: 'Flash sale / immediate action', description: guide.zeroLossMeasures.primary, recommendation: urgency })
    }
    if (guide?.zeroLossMeasures?.processingOptions?.length) {
      options.push({ option: 'Processing', description: 'Move to processing unit', processors: guide.zeroLossMeasures.processingOptions, recommendation: 'good' })
    }
    if (guide?.alternateMarkets?.length) {
      const markets = guide.alternateMarkets.map((m) => ({ type: m.marketType, description: m.description, priceRange: m.priceRange, processingTime: m.processingTime }))
      options.push({ option: 'Alternate markets', markets, recommendation: 'good' })
    }
    if (guide?.mnregaPotential?.eligible) {
      options.push({ option: 'MNREGA waste-to-wages', dailyWage: guide.mnregaPotential.dailyWage, wasteConversionRate: guide.mnregaPotential.wasteConversionRate, recommendation: 'conditional' })
    }

    res.json({ ok: true, batch: { id: batch.id, cropType: batch.cropType, daysRemaining, urgency }, guide, options, awareness })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'zero_loss_error' })
  }
})

// Verification: get single or all statuses
app.get('/api/verification-status/:id?', (req, res) => {
  try {
    const all = readVerification()
    const id = req.params.id
    if (id) return res.json({ status: all[String(id)] || null })
    res.json({ all })
  } catch (e) {
    res.status(500).json({ error: 'verification_read_failed' })
  }
})

// Verification: set status (simple auth-less for prototype; secure in production)
app.post('/api/verification-status', (req, res) => {
  (async () => {
    try {
      const { batchId, status, by, verificationMetadataCID, verifiedQuantity } = req.body || {}
      if (!batchId || !/^[0-9]+$/.test(String(batchId))) return res.status(400).json({ error: 'invalid_batch_id' })
      if (!['unverified', 'pending', 'verified'].includes(String(status))) return res.status(400).json({ error: 'invalid_status' })
      // Try on-chain first
      const onchain = await setVerificationStatusChain(String(batchId), String(status), verificationMetadataCID, verifiedQuantity)
      if (onchain?.ok) return res.json({ ok: true, onchain: true, tx: onchain.tx })
      // Fallback to file store
      const entry = { status: String(status), by: by || null, timestamp: Date.now(), verificationMetadataCID, verifiedQuantity }
      writeVerification(String(batchId), entry)
      res.json({ ok: true, onchain: false })
    } catch (e) {
      res.status(500).json({ error: 'verification_write_failed' })
    }
  })()
})

// Helper for robust RPC calls
async function retry(fn, retries = 1, delay = 500) {
  try {
    return await fn();
  } catch (e) {
    if (retries <= 0) throw e;
    await new Promise(r => setTimeout(r, delay));
    return retry(fn, retries - 1, delay * 1.5);
  }
}

// Diagnostics: show chain, rpc, and contract bytecode presence
app.get('/api/chain-info', async (req, res) => {
  try {
    const code = isValidAddress(CONTRACT_ADDRESS) ? await client.getBytecode({ address: CONTRACT_ADDRESS }) : null
    const blockNumber = await client.getBlockNumber().catch(() => null)
    let isRelayerVerifier = null
    try {
      if (account && isValidAddress(CONTRACT_ADDRESS)) {
        isRelayerVerifier = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'verifiers', args: [account.address] })
      }
    } catch { }
    res.json({
      chain: 'arbitrum-sepolia',
      chainId: arbitrumSepolia.id,
      rpcUrl: rpcUrl || null,
      contractAddress: CONTRACT_ADDRESS,
      relayerAddress: account?.address || null,
      addressMatchesRelayer: account ? isSameAddress(CONTRACT_ADDRESS, account.address) : false,
      hasBytecode: !!code,
      blockNumber: blockNumber ? blockNumber.toString() : null,
      isRelayerVerifier: isRelayerVerifier
    })
  } catch (e) {
    res.status(500).json({ error: 'diagnostic_failed', message: e?.message || String(e) })
  }
})

app.post('/api/weather-alert', async (req, res) => {
  try {
    const { message, recipients } = req.body
    const webhookUrl = process.env.N8N_WEBHOOK_SECRET || process.env.WHATSAPP_WEBHOOK_URL

    if (!webhookUrl) {
      console.error('Webhook URL not configured')
      return res.status(500).json({ error: 'Webhook not configured' })
    }

    await axios.post(webhookUrl, {
      type: 'weather_alert',
      message,
      recipients,
      timestamp: new Date().toISOString()
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Weather alert failed', error)
    res.status(500).json({ error: 'Failed to send alert' })
  }
})

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`[server] Port ${PORT} is already in use. Is the server already running?`);
  } else {
    console.error('[server] Server error:', e);
  }
  process.exit(1);
});

// Diagnostics: raw tuple read and event fallback for a batch id
app.get('/api/debug/batch-raw/:id', async (req, res) => {
  try {
    const idStr = req.params.id
    if (!/^[0-9]+$/.test(idStr)) return res.status(400).json({ error: 'invalid_id' })
    const id = BigInt(idStr)
    const code = isValidAddress(CONTRACT_ADDRESS) ? await client.getBytecode({ address: CONTRACT_ADDRESS }) : null
    if (!code) return res.status(400).json({ error: 'not_a_contract', address: CONTRACT_ADDRESS })
    let raw = null, fallback = null
    try {
      const b = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'batches', args: [id] })
      raw = (b || []).map((v) => (typeof v === 'bigint' ? v.toString() : v))
    } catch (e) {
      // ignore, use fallback
    }
    const logs = await client.getLogs({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, eventName: 'BatchRegistered', fromBlock: 0n, args: { batchId: id } })
    const last = logs[logs.length - 1]
    let createdAt = 0
    if (last?.blockNumber) {
      try { const blk = await client.getBlock({ blockNumber: last.blockNumber }); createdAt = blk?.timestamp ? Number(blk.timestamp) : 0 } catch { }
    }
    if (last) {
      fallback = {
        farmer: last.args?.farmer || null,
        cropType: last.args?.cropType || null,
        quantityKg: last.args?.quantityKg ? last.args.quantityKg.toString() : null,
        basePriceINR: last.args?.basePriceINR ? last.args.basePriceINR.toString() : null,
        harvestDate: last.args?.harvestDate ? Number(last.args.harvestDate) : null,
        metadataCID: last.args?.metadataCID || null,
        createdAt
      }
    }
    res.json({ ok: true, raw, fallback })
  } catch (e) {
    res.status(500).json({ error: 'debug_failed', message: e?.message || String(e) })
  }
})

// One-time setup: owner marks relayer as verifier so webhook/confirm can verify payments
app.post('/api/setup-relayer-as-verifier', async (req, res) => {
  try {
    if (!ownerWallet || !ownerAccount) return res.status(500).json({ error: 'owner_not_configured' })
    if (!account) return res.status(500).json({ error: 'relayer_not_configured' })
    if (!isValidAddress(CONTRACT_ADDRESS)) return res.status(400).json({ error: 'invalid_contract_address', address: CONTRACT_ADDRESS })
    const code = await client.getBytecode({ address: CONTRACT_ADDRESS })
    if (!code) return res.status(400).json({ error: 'not_a_contract' })
    const tx = await ownerWallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'setVerifier', args: [account.address, true] })
    await client.waitForTransactionReceipt({ hash: tx })
    res.json({ ok: true, tx })
  } catch (e) {
    console.error('setup-relayer-as-verifier failed', e)
    res.status(500).json({ error: 'setup_failed', message: e?.message || String(e) })
  }
})

// Fallback: confirm payment and transfer via API when webhook cannot reach local server
app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { sessionId } = req.body || {}
    if (!sessionId || !/^(cs_test|cs_).+/.test(sessionId)) return res.status(400).json({ error: 'invalid_session' })
    
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (!session || session.payment_status !== 'paid') return res.status(400).json({ error: 'not_paid' })

    // Use shared logic
    const result = await processCheckoutSession(session)
    if (!result.ok) return res.status(500).json({ error: result.error })

    res.json({ ok: true })
  } catch (e) {
    console.error('confirm-payment failed', e)
    res.status(500).json({ error: 'confirm_failed', message: e?.message || String(e) })
  }
})

// Write: transfer ownership (relayer using verifier permission)
app.post('/api/transfer', async (req, res) => {
  try {
    if (!wallet || !account) return res.status(500).json({ error: 'relayer_not_configured' })
    if (!isValidAddress(CONTRACT_ADDRESS)) return res.status(400).json({ error: 'invalid_contract_address', address: CONTRACT_ADDRESS })
    const { batchId } = req.body || {}
    const toAddress = (req.body?.toAddress && /^0x[0-9a-fA-F]{40}$/.test(req.body.toAddress)) ? req.body.toAddress : DEFAULT_ADDRESSES.DISTRIBUTOR
    if (!batchId || !/^[0-9]+$/.test(String(batchId))) return res.status(400).json({ error: 'invalid_batch_id' })
    if (!isValidAddress(toAddress)) return res.status(400).json({ error: 'invalid_to_address' })
    const code = await client.getBytecode({ address: CONTRACT_ADDRESS })
    if (!code) return res.status(400).json({ error: 'not_a_contract', address: CONTRACT_ADDRESS })
    const tx = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'transferOwnershipByVerifier', args: [BigInt(batchId), toAddress] })
    const receipt = await client.waitForTransactionReceipt({ hash: tx })
    res.json({ ok: true, tx })
  } catch (e) {
    console.error('transfer failed', e)
    res.status(500).json({ error: 'transfer_failed', message: e?.message || String(e) })
  }
})

// Write: add shipment (relayer)
// add-shipment endpoint removed in INR-only model

// Set distributor sale price (accepts priceINR or priceWei)
app.post('/api/set-price-by-distributor', async (req, res) => {
  try {
    if (!wallet || !account) return res.status(500).json({ error: 'relayer_not_configured' })
    if (!isValidAddress(CONTRACT_ADDRESS)) return res.status(400).json({ error: 'invalid_contract_address', address: CONTRACT_ADDRESS })
    const { batchId, priceINR } = req.body || {}
    if (!batchId || !/^[0-9]+$/.test(String(batchId))) return res.status(400).json({ error: 'invalid_batch_id' })
    const code = await client.getBytecode({ address: CONTRACT_ADDRESS })
    if (!code) return res.status(400).json({ error: 'not_a_contract', address: CONTRACT_ADDRESS })
    const inr = BigInt(priceINR ?? 0)
    if (inr <= 0n) return res.status(400).json({ error: 'invalid_price' })
    const tx = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'setPriceByDistributorInr', args: [BigInt(batchId), inr] })
    await client.waitForTransactionReceipt({ hash: tx })
    res.json({ ok: true, tx })
  } catch (e) {
    console.error('set-price-by-distributor failed', e)
    res.status(500).json({ error: 'set_price_failed', message: e?.message || String(e) })
  }
})

// Set retailer sale price (accepts priceINR or priceWei)
app.post('/api/set-price-by-retailer', async (req, res) => {
  try {
    if (!wallet || !account) return res.status(500).json({ error: 'relayer_not_configured' })
    if (!isValidAddress(CONTRACT_ADDRESS)) return res.status(400).json({ error: 'invalid_contract_address', address: CONTRACT_ADDRESS })
    const { batchId, priceINR } = req.body || {}
    if (!batchId || !/^[0-9]+$/.test(String(batchId))) return res.status(400).json({ error: 'invalid_batch_id' })
    const code = await client.getBytecode({ address: CONTRACT_ADDRESS })
    if (!code) return res.status(400).json({ error: 'not_a_contract', address: CONTRACT_ADDRESS })
    const inr = BigInt(priceINR ?? 0)
    if (inr <= 0n) return res.status(400).json({ error: 'invalid_price' })
    const tx = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'setPriceByRetailerInr', args: [BigInt(batchId), inr] })
    await client.waitForTransactionReceipt({ hash: tx })
    res.json({ ok: true, tx })
  } catch (e) {
    console.error('set-price-by-retailer failed', e)
    res.status(500).json({ error: 'set_price_failed', message: e?.message || String(e) })
  }
})

// Worker / Cron Endpoint for Expiry Checks
const checkExpiryHandler = async (req, res) => {
  try {
    console.log('[cron] Checking for expiring batches...')
    if (!isValidAddress(CONTRACT_ADDRESS)) return res.status(500).json({ error: 'contract_not_ready' })
    
    let ids = []
    try {
      ids = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'getAllBatchIds' })
    } catch (e) {
       const logs = await client.getLogs({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, eventName: 'BatchRegistered', fromBlock: 0n })
       ids = logs.map(l => l.args.batchId).filter(id => id != null)
    }

    const now = Math.floor(Date.now() / 1000)
    const ONE_DAY = 24 * 60 * 60
    const alertsSent = []
    const recommendedSchemes = listSchemes().slice(0, 3)

    for (const id of ids) {
      try {
        const b = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'batches', args: [id] })
        const expiryDate = Number(b[24] || 0n)
        const currentOwner = b[1]
        const farmer = b[2]

        if (!expiryDate || expiryDate <= 0) continue
        const timeLeft = expiryDate - now
        if (timeLeft <= 0) continue

        // Check if expiring in next 2 days
        if (timeLeft > 2 * ONE_DAY) continue
        
        const windowDays = Math.ceil(timeLeft / ONE_DAY)

        if (!isSameAddress(currentOwner, farmer)) {
          console.log(`[cron] Batch ${id} skipped: owner ${currentOwner} != farmer ${farmer}`)
          continue
        }

        const sub = await getSubscriptionByFarmer(farmer) || {}

        await sendWhatsAppMessage({
          phone: sub.phone || null,
          farmerAddress: farmer,
          language: sub.language || 'en',
          batchId: id,
          expiryDate,
          windowDays,
          schemes: recommendedSchemes,
          schemeIds: sub.schemeIds || recommendedSchemes.map((s) => s.id)
        })
        alertsSent.push({ batchId: id.toString(), farmer, expiryDate, windowDays, phone: sub.phone || 'n8n-lookup' })
      } catch (e) {
        console.warn(`[cron] Failed to check batch ${id}`, e)
      }
    }
    
    res.json({ ok: true, alertsSent })
  } catch (e) {
    console.error('[cron] failed', e)
    res.status(500).json({ error: 'cron_failed' })
  }
}

app.post('/api/cron/check-expiry', checkExpiryHandler)
app.post('/api/cron/check-expire', checkExpiryHandler)

async function sendWhatsAppMessage({ phone, farmerAddress, language = 'en', batchId, expiryDate, windowDays, schemes = [], schemeIds = [] }) {
  const dateStr = new Date(expiryDate * 1000).toLocaleDateString()
  const webhookUrl = N8N_WEBHOOK_SECRET
  if (!webhookUrl) {
    console.warn('[WHATSAPP] N8N_WEBHOOK_SECRET not set; skipping send')
    return
  }

  const schemePayload = schemes.slice(0, 3).map((s) => ({
    id: s.id,
    name: s.name,
    summary: s.summary,
    applyUrl: s.applyUrl,
    documents: s.documents,
    window: s.window,
  }))

  console.log(`[WHATSAPP] Sending webhook request for Batch #${batchId} (Farmer: ${farmerAddress})`)
    
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone,
        farmerAddress,
        language,
        batchId: batchId.toString(),
        expiryDate,
        expiryDateString: dateStr,
        windowDays,
        schemeIds,
        schemes: schemePayload,
        message: `Batch #${batchId} is expiring on ${dateStr}. Apply for schemes to mitigate loss: ${schemePayload.map(s => s.applyUrl).join(', ')}`
      })
    })
        
    if (!response.ok) {
      console.error(`[WHATSAPP] Webhook failed with status ${response.status}`)
    } else {
      console.log(`[WHATSAPP] Webhook sent successfully`)
    }
  } catch (error) {
    console.error(`[WHATSAPP] Error sending webhook:`, error)
  }
}
