import mongoose from 'mongoose'
import { SchemeSubscription } from '../models/schemeSubscription.js'

const schemes = [
  {
    id: 'pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    summary: 'Seasonal crop insurance with low farmer premium and quick claim settlement.',
    status: 'active',
    window: 'Apply before sowing (Kharif/Rabi)',
    applyUrl: 'https://pmfby.gov.in/',
    benefits: [
      'Premium: 1.5% (Rabi), 2% (Kharif)',
      'Covers drought, flood, hail, cyclone, pest/disease',
      'Yield-based claims with remote sensing support',
      'CSC/bank-assisted enrollment'
    ],
    documents: ['Aadhaar', 'Land record/lease proof', 'Recent crop photo (optional)'],
    reminders: [30, 14, 7, 1],
    contact: 'CSC / Bank / pmfby.gov.in'
  },
  {
    id: 'pmkisan',
    name: 'PM-KISAN Income Support',
    summary: '₹6000 per year paid in three installments directly to farmer bank accounts.',
    status: 'active',
    window: 'Enroll anytime; next installment every 4 months',
    applyUrl: 'https://pmkisan.gov.in/',
    benefits: [
      '₹2000 per installment, 3x per year',
      'Direct bank transfer (DBT)',
      'eKYC and land verification required'
    ],
    documents: ['Aadhaar', 'Bank passbook', 'Land record/lease proof'],
    reminders: [30, 14, 7, 1],
    contact: 'CSC / pmkisan.gov.in'
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    summary: 'Low-interest working capital for seeds, inputs, and expenses with insurance cover.',
    status: 'active',
    window: 'Apply via bank/CSC; annual renewal advised',
    applyUrl: 'https://www.myscheme.gov.in/schemes/kcc',
    benefits: [
      'Credit at ~4% with interest subvention',
      'Flexible withdrawal/repayment aligned to harvest',
      'Covers allied activities (dairy, fishery)',
      'Personal accident insurance bundled'
    ],
    documents: ['Aadhaar', 'Bank passbook', 'Land record/lease proof', 'Photo'],
    reminders: [30, 14, 7],
    contact: 'Nearest bank / CSC'
  },
  {
    id: 'soil-health',
    name: 'Soil Health Card',
    summary: 'Free soil testing and nutrient recommendations for balanced fertilizer use.',
    status: 'active',
    window: 'Sample before sowing; follow 2-year test cycle',
    applyUrl: 'https://soilhealth.dac.gov.in/',
    benefits: [
      'Free soil sample testing',
      'NPK, pH, micronutrient status with crop advice',
      'Reduces input cost via balanced fertilization'
    ],
    documents: ['Aadhaar', 'Land record/lease proof'],
    reminders: [60, 30, 7],
    contact: 'Krishi Vigyan Kendra / soilhealth.dac.gov.in'
  },
  {
    id: 'enam',
    name: 'e-NAM Market Linkage',
    summary: 'Online mandi access for transparent bidding and better price discovery.',
    status: 'active',
    window: 'Register anytime; trade during mandi timings',
    applyUrl: 'https://enam.gov.in/',
    benefits: [
      'Access to multiple buyers beyond local mandi',
      'Transparent e-bidding and e-payment',
      'Quality assaying support (select mandis)',
      'Logistics partners for inter-mandi movement'
    ],
    documents: ['Aadhaar', 'Bank account', 'Produce details', 'Mandi license (where required)'],
    reminders: [],
    contact: 'enam.gov.in / Mandi helpdesk'
  },
  {
    id: 'pmfme',
    name: 'PM-FME (Micro Food Processing)',
    summary: 'Credit-linked subsidy for on-farm processing, storage, and value addition.',
    status: 'active',
    window: 'Apply year-round; faster during state drives',
    applyUrl: 'https://mofpi.gov.in/pmfme',
    benefits: [
      '35% credit-linked capital subsidy (up to ₹10 lakh cap)',
      'Support for FPOs/SHGs/individual micro units',
      'Branding, marketing, and training assistance'
    ],
    documents: ['Aadhaar', 'Business plan', 'Bank details', 'FSSAI (for processing units)'],
    reminders: [45, 30, 14],
    contact: 'State Nodal Agencies / mofpi.gov.in'
  }
]

// Fallback in-memory store when Mongo is unavailable
const subscriptions = new Map()

const mongoReady = () => mongoose.connection?.readyState === 1

function listSchemes() {
  return schemes
}

async function upsertSubscription({ farmerId, farmerAddress, phone, language, schemeIds = [] }) {
  const key = farmerAddress?.toLowerCase?.() || farmerId || phone
  if (!key || !phone) return { ok: false, error: 'phone_required' }

  const normalizedAddress = farmerAddress ? farmerAddress.toLowerCase() : undefined
  const payload = {
    farmerId: farmerId || key,
    farmerAddress: normalizedAddress,
    phone,
    language: language || 'en',
    schemeIds: schemeIds.length ? schemeIds : schemes.map((s) => s.id),
    updatedAt: new Date().toISOString(),
  }

  if (mongoReady()) {
    const filter = normalizedAddress ? { farmerAddress: normalizedAddress } : { phone }
    const sub = await SchemeSubscription.findOneAndUpdate(filter, payload, { new: true, upsert: true, setDefaultsOnInsert: true }).lean()
    return { ok: true, subscription: sub }
  }

  // Fallback in-memory
  const existing = subscriptions.get(key) || {}
  const record = { ...existing, ...payload }
  subscriptions.set(key, record)
  return { ok: true, subscription: record }
}

async function getSubscriptions() {
  if (mongoReady()) {
    return SchemeSubscription.find({}).lean()
  }
  return Array.from(subscriptions.values())
}

async function getSubscriptionByFarmer(farmerAddress) {
  if (!farmerAddress) return null
  const addr = farmerAddress.toLowerCase()
  if (mongoReady()) {
    const sub = await SchemeSubscription.findOne({ farmerAddress: addr }).lean()
    if (sub) return sub
  }
  return subscriptions.get(addr) || null
}

async function triggerSchemeTest(farmerIdOrPhone) {
  const all = await getSubscriptions()
  const matches = farmerIdOrPhone ? all.filter((s) => s.farmerId === farmerIdOrPhone || s.phone === farmerIdOrPhone) : all
  const payload = matches.map((m) => ({ to: m.phone, schemeIds: m.schemeIds, farmerAddress: m.farmerAddress }))
  console.log('[schemes] test notify', payload)
  return { sent: payload.length }
}

export { listSchemes, upsertSubscription, getSubscriptions, getSubscriptionByFarmer, triggerSchemeTest }
