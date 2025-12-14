
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrumSepolia } from 'viem/chains'
import { AGRI_TRUTH_CHAIN_ABI } from './src/contract.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '.env') })

async function main() {
    const ADDR = process.env.AGRI_TRUTH_CHAIN_ADDRESS
    const RPC = process.env.ARB_SEPOLIA_RPC_URL
    const KEY = process.env.RELAYER_PRIVATE_KEY

    if (!ADDR || !RPC || !KEY) {
        console.error('Missing env vars')
        return
    }

    const account = privateKeyToAccount(KEY.startsWith('0x') ? KEY : '0x' + KEY)
    const client = createPublicClient({ chain: arbitrumSepolia, transport: http(RPC) })
    const wallet = createWalletClient({ account, chain: arbitrumSepolia, transport: http(RPC) })

    console.log('Relayer:', account.address)

    // 1. Check verifier status
    const isVerifier = await client.readContract({
        address: ADDR,
        abi: AGRI_TRUTH_CHAIN_ABI,
        functionName: 'verifiers',
        args: [account.address]
    })
    console.log('Is Verifier:', isVerifier)

    if (!isVerifier) {
        console.error('Relayer is not a verifier! Cannot split.')
        return
    }

    // 2. Find a batch to split (e.g. batch 1)
    // You might need to change this ID to a valid batch ID that has quantity > 1
    const BATCH_ID = 1n 
    const SPLIT_QTY = 1n
    const NEW_OWNER = '0x2222222222222222222222222222222222222222' // Distributor default

    try {
        const batch = await client.readContract({
            address: ADDR,
            abi: AGRI_TRUTH_CHAIN_ABI,
            functionName: 'batches',
            args: [BATCH_ID]
        })
        console.log('Batch:', batch)
        
        if (batch[7] <= SPLIT_QTY) {
             console.error(`Batch quantity ${batch[7]} is not enough to split ${SPLIT_QTY}`)
             return
        }

        console.log(`Attempting to split batch ${BATCH_ID} by ${SPLIT_QTY}...`)
        const hash = await wallet.writeContract({
            address: ADDR,
            abi: AGRI_TRUTH_CHAIN_ABI,
            functionName: 'splitBatchByVerifier',
            args: [BATCH_ID, SPLIT_QTY, NEW_OWNER]
        })
        console.log('Tx Hash:', hash)
        const receipt = await client.waitForTransactionReceipt({ hash })
        console.log('Receipt status:', receipt.status)

    } catch (e) {
        console.error('Split failed:', e)
    }
}

main()
