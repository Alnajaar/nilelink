import web3Service from '@shared/services/Web3Service';

export interface PaymentRequest {
    amount: number;
    recipient: string;
    description?: string;
    orderId?: string;
}

export interface PaymentResult {
    success: boolean;
    transactionHash?: string;
    amount?: number;
    timestamp?: number;
    error?: string;
}

export class USDCService {
    // Fixed USDC address on Amoy (Mock for now, replace with real one)
    private USDC_ADDRESS = '0x41E94Eb019C0762f9Bfcf9Fb1E587a5bf67925D3';

    isConnected(): boolean {
        return web3Service.isWalletConnected();
    }

    async connectWallet(): Promise<string> {
        const result = await web3Service.connectWallet();
        if (!result) throw new Error('Failed to connect wallet');
        return result.address;
    }

    async getBalance(): Promise<{ balance: number; symbol: string }> {
        // In production, fetch balance from USDC contract
        return { balance: 1000, symbol: 'USDC' }; // Simulating balance for now
    }

    async transfer(request: PaymentRequest): Promise<PaymentResult> {
        try {
            console.log(`Starting USDC transfer of ${request.amount} to ${request.recipient}`);

            // Format amount for contract (USDC usually has 6 decimals)
            const amountInSmallestUnit = (request.amount * 1000000).toString();

            const txHash = await web3Service.processPayment({
                orderId: request.orderId || `ORD-${Date.now()}`,
                amount: amountInSmallestUnit,
                tokenAddress: this.USDC_ADDRESS
            });

            if (!txHash) throw new Error('Transaction failed or was rejected');

            return {
                success: true,
                transactionHash: txHash,
                amount: request.amount,
                timestamp: Date.now()
            };
        } catch (error: any) {
            console.error('USDC Transfer failed:', error);
            return {
                success: false,
                error: error.message || 'Transaction failed'
            };
        }
    }
}

export const usdcService = new USDCService();
