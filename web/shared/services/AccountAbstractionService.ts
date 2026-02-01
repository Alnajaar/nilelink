/**
 * Account Abstraction Service (ERC-4337)
 * Orchestrates Smart Contract Wallets, Paymasters, and UserOperations
 * 
 * DESIGN PRINCIPLES:
 * 1. Invisible Web3: No gas, no signatures, no "wallets" for the user.
 * 2. Deterministic: SCW address is linked to the Firebase UID.
 * 3. Gasless: All operations are sponsored by the NileLink Paymaster.
 */

import { ethers } from 'ethers';
import web3Service from './Web3Service';

// Biconomy/Safe SDK types (Mocked for environment where libs aren't pre-installed)
// In a real environment, we would import from '@biconomy/account' or '@safe-global/protocol-kit'
interface UserOperation {
    sender: string;
    nonce: bigint;
    initCode: string;
    callData: string;
    callGasLimit: bigint;
    verificationGasLimit: bigint;
    preVerificationGas: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    paymasterAndData: string;
    signature: string;
}

export interface SmartWalletConfig {
    userId: string;
    firebaseUid: string;
    ownerAddress: string; // The EOA that controls the SCW
}

export class AccountAbstractionService {
    private smartWalletAddress: string | null = null;
    private isInitializing: boolean = false;

    /**
     * Get or Create Smart Wallet address for a user
     * Deterministically derived from Firebase UID
     */
    async getSmartWalletAddress(firebaseUid: string): Promise<string> {
        // In a production Biconomy setup, we'd use BiconomySmartAccountV2.getAccountAddress()
        // For NileLink, we simulate the deterministic derivation
        const salt = ethers.id(`nilelink-scw-v1-${firebaseUid}`);
        const address = ethers.getCreate2Address(
            '0x0000000000000000000000000000000000000000', // Mock Factory
            salt,
            ethers.keccak256('0x') // Mock Init Code
        );
        this.smartWalletAddress = address;
        return address;
    }

    /**
     * Silent Provisioning: Initialize the SCW in the background
     * Triggered on Firebase Login/Register
     */
    async provisionWallet(config: SmartWalletConfig): Promise<{ address: string; status: 'NEW' | 'EXISTING' }> {
        console.log(`[AA] Provisioning invisible wallet for ${config.firebaseUid}...`);

        try {
            const address = await this.getSmartWalletAddress(config.firebaseUid);

            // Check if wallet exists in our Prisma DB via API
            let response;
            try {
                response = await fetch(`/api/auth/wallet?address=${address}`);
            } catch (fetchError: any) {
                if (fetchError.name === 'AbortError') {
                    console.warn('[AA] Provisioning check aborted (likely navigation/fast-refresh)');
                    return { address, status: 'EXISTING' }; // Fallback to avoid crash
                }
                throw fetchError;
            }

            if (!response.ok && response.status !== 404) {
                console.error(`[AA] Wallet check failed with status ${response.status}`);
                return { address, status: 'EXISTING' }; // Fail-safe
            }

            const data = await response.json().catch(() => ({ exists: false }));

            if (data.exists) {
                return { address, status: 'EXISTING' };
            }

            // If new, register the mapping in NileLink Backend
            await fetch('/api/auth/wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: config.userId,
                    firebaseUid: config.firebaseUid,
                    smartWalletAddress: address,
                    ownerAddress: config.ownerAddress
                })
            }).catch(e => console.error('[AA] Silent registration failed:', e));

            return { address, status: 'NEW' };
        } catch (error) {
            console.error('[AA] Provisioning flow interrupted:', error);
            // Return dummy success to prevent blocker if backend fails
            return { address: '', status: 'EXISTING' };
        }
    }

    /**
     * Execute Gasless Transaction
     * Orchestrates the UserOperation and Paymaster signature
     */
    async execute(target: string, data: string, value: bigint = BigInt(0)): Promise<string | null> {
        console.log(`[AA] Executing gasless call to ${target}...`);

        if (!this.smartWalletAddress) {
            throw new Error('Smart Wallet not initialized');
        }

        try {
            // 1. Build UserOperation (In reality, use Biconomy SDK buildUserOp)
            // 2. Sponsor via Paymaster (In reality, use Biconomy Paymaster service)
            // 3. Send to Bundler

            // We simulate the API call to our backend which handles the Bundler/Paymaster logic
            const response = await fetch('/api/web3/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: this.smartWalletAddress,
                    target,
                    data: data,
                    value: value.toString(),
                    operation: 'CALL'
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log(`[AA] Transaction Successful: ${result.txHash}`);
                return result.txHash;
            } else {
                throw new Error(result.error || 'UserOperation execution failed');
            }
        } catch (error) {
            console.error('[AA] Execution failed:', error);
            return null;
        }
    }

    /**
     * Helper to wrap contract calls into SCW execution
     */
    async callContract(contractAddress: string, abi: any, method: string, args: any[]): Promise<string | null> {
        const iface = new ethers.Interface(abi);
        const encodedData = iface.encodeFunctionData(method, args);
        return this.execute(contractAddress, encodedData);
    }
}

// Singleton instance
export const aaService = new AccountAbstractionService();
export default aaService;
