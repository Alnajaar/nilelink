import { getPublicClient, getWalletClient } from '@wagmi/core'
import { config } from './wagmi'
import { parseEther, parseUnits, dataSlice, id } from 'viem'
import NileLinkProtocolAbi from './abis/NileLinkProtocol.json'

// Configuration - Load from env vars only for production
const PROTOCOL_ADDRESS = process.env.NEXT_PUBLIC_NILELINK_PROTOCOL_ADDRESS || '0x0000000000000000000000000000000000000000'
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x0000000000000000000000000000000000000000'

export class BlockchainClient {
    async payOrder(orderId: string, restaurantAddress: string, amount: number): Promise<string> {
        try {
            const walletClient = await getWalletClient(config)
            if (!walletClient) throw new Error("No wallet connected")

            // Convert amount to USDC units (6 decimals)
            const amountUsd6 = parseUnits(amount.toString(), 6)

            // Generate bytes16 orderId from the string
            const orderIdBytes16 = dataSlice(id(orderId), 0, 16) as `0x${string}`

            const [address] = await walletClient.getAddresses()

            // Call the Smart Contract
            // PaymentMethod.CRYPTO is enum index 2 (based on Solidity)
            // function createAndPayOrder(bytes16, address, address, uint256, uint8)
            const { request } = await getPublicClient(config).simulateContract({
                address: PROTOCOL_ADDRESS as `0x${string}`,
                abi: NileLinkProtocolAbi.abi,
                functionName: 'createAndPayOrder',
                args: [
                    orderIdBytes16,
                    restaurantAddress as `0x${string}`,
                    address,
                    amountUsd6,
                    2 // PaymentMethod.CRYPTO
                ],
                account: address,
            })

            const hash = await walletClient.writeContract(request)
            console.log("Transaction sent:", hash)

            // Wait for confirmation
            const publicClient = getPublicClient(config)
            const receipt = await publicClient.waitForTransactionReceipt({ hash })
            console.log("Transaction confirmed:", receipt.transactionHash)

            return receipt.transactionHash
        } catch (error: any) {
            console.error("Payment failed:", error)
            throw new Error(error.reason || error.message || "Payment verification failed on-chain")
        }
    }

    // Legacy methods for backward compatibility - these should be replaced with wagmi hooks
    async connectWallet(): Promise<string> {
        throw new Error("Use wagmi hooks for wallet connection")
    }

    disconnect(): void {
        // Handled by wagmi
    }

    getConnectedAddress(): string | null {
        throw new Error("Use wagmi useAccount hook")
    }

    isWalletConnected(): boolean {
        throw new Error("Use wagmi useAccount hook")
    }
}

export const blockchainClient = new BlockchainClient()
