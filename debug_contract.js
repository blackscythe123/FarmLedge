
import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { AGRI_TRUTH_CHAIN_ABI, AGRI_TRUTH_CHAIN_ADDRESS } from './server/src/contract.js'
import dotenv from 'dotenv'

dotenv.config({ path: './server/.env' })

const client = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(process.env.ARB_SEPOLIA_RPC_URL)
})

async function main() {
    console.log('Address:', AGRI_TRUTH_CHAIN_ADDRESS)
    console.log('RPC:', process.env.ARB_SEPOLIA_RPC_URL)

    try {
        const code = await client.getBytecode({ address: AGRI_TRUTH_CHAIN_ADDRESS })
        console.log('Code exists:', !!code)
        if (!code) {
            console.error('ERROR: No code at address!')
            return
        }
    } catch (e) {
        console.error('Error checking code:', e)
    }

    try {
        console.log('Attempting to read batch 1...')
        const b = await client.readContract({
            address: AGRI_TRUTH_CHAIN_ADDRESS,
            abi: AGRI_TRUTH_CHAIN_ABI,
            functionName: 'batches',
            args: [1n]
        })
        console.log('Success:', b)
    } catch (e) {
        console.error('READ FAILED:')
        console.error(e)
    }
}

main()
