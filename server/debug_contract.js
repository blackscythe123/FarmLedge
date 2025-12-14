
import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { AGRI_TRUTH_CHAIN_ABI } from './src/contract.js'
import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

async function main() {
    const ADDR = process.env.AGRI_TRUTH_CHAIN_ADDRESS
    const RPC = process.env.ARB_SEPOLIA_RPC_URL

    console.log('Address:', ADDR)
    console.log('RPC:', RPC)

    if (!ADDR || !RPC) {
        console.error('Missing env vars')
        return
    }

    const client = createPublicClient({
        chain: arbitrumSepolia,
        transport: http(RPC)
    })

    try {
        const code = await client.getBytecode({ address: ADDR })
        console.log('Code exists:', !!code)
        if (!code) {
            console.error('ERROR: No code at address!')
            return
        }
    } catch (e) {
        console.error('Error checking code:', e)
    }

    // Test 1: Full ABI
    try {
        console.log('Attempting to read batch 1 with FULL ABI...')
        const b = await client.readContract({
            address: ADDR,
            abi: AGRI_TRUTH_CHAIN_ABI,
            functionName: 'batches',
            args: [1n]
        })
        console.log('Success with FULL ABI:', b)
    } catch (e) {
        console.error('FULL ABI READ FAILED:', e.message)
    }

    // Test 2: Legacy ABI
    try {
        console.log('Attempting to read batch 1 with LEGACY ABI (no split fields)...')
        const LEGACY_ABI = [{
            type: "function", name: "batches", stateMutability: "view", inputs: [{ name: "", type: "uint256" }],
            outputs: [
                { name: "id", type: "uint256" },
                { name: "currentOwner", type: "address" },
                { name: "farmer", type: "address" },
                { name: "distributor", type: "address" },
                { name: "retailer", type: "address" },
                { name: "consumer", type: "address" },
                { name: "cropType", type: "string" },
                { name: "quantityKg", type: "uint256" },
                { name: "basePriceINR", type: "uint256" },
                { name: "harvestDate", type: "uint64" },
                { name: "metadataCID", type: "string" },
                { name: "createdAt", type: "uint256" },
                { name: "exists", type: "bool" },
                { name: "minPriceINR", type: "uint256" },
                { name: "priceByDistributorINR", type: "uint256" },
                { name: "priceByRetailerINR", type: "uint256" },
                { name: "boughtByDistributorAt", type: "uint256" },
                { name: "boughtByRetailerAt", type: "uint256" },
                { name: "boughtByConsumerAt", type: "uint256" },
                { name: "verificationStatus", type: "uint8" },
                { name: "verificationBy", type: "address" },
                { name: "verificationAt", type: "uint256" }
            ]
        }]

        const b = await client.readContract({
            address: ADDR,
            abi: LEGACY_ABI,
            functionName: 'batches',
            args: [1n]
        })
        console.log('Success with LEGACY ABI:', b)
    } catch (e) {
        console.error('LEGACY ABI READ FAILED:', e.message)
    }
}

main()
