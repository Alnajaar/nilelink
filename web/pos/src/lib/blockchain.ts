import { ethers } from 'ethers';
import NileLinkProtocolArtifact from './abis/NileLinkProtocol.json';

// Define the window.ethereum type for TypeScript
declare global {
    interface Window {
        ethereum?: any;
    }
}

// Configuration - Load from deployment info or env vars
let PROTOCOL_ADDRESS: string;
let USDC_ADDRESS: string;

try {
    const deployment = require('../../../deployment-local.json');
    PROTOCOL_ADDRESS = deployment.contracts.nileLinkProtocol;
    USDC_ADDRESS = deployment.contracts.mockUSDC;
} catch {
    // Fallback to env vars
    PROTOCOL_ADDRESS = process.env.NEXT_PUBLIC_NILELINK_PROTOCOL_ADDRESS || '0x0000000000000000000000000000000000000000';
    USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x0000000000000000000000000000000000000000';
}

export class BlockchainClient {
    private provider: ethers.BrowserProvider | null = null;
    private signer: ethers.JsonRpcSigner | null = null;
    private protocolContract: ethers.Contract | null = null;
    private usdcContract: ethers.Contract | null = null;
    private connectedAddress: string | null = null;
    private isConnected: boolean = false;

    constructor() {
        if (typeof window !== 'undefined' && window.ethereum) {
            this.provider = new ethers.BrowserProvider(window.ethereum);

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length === 0) {
                    this.disconnect();
                } else {
                    this.connectedAddress = accounts[0];
                }
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }

    async connectWallet(): Promise<string> {
        if (!this.provider) throw new Error("No crypto wallet found. Please install MetaMask.");

        try {
            // Request account access
            const accounts = await this.provider.send("eth_requestAccounts", []);
            this.signer = await this.provider.getSigner();
            this.connectedAddress = accounts[0];
            this.isConnected = true;

            // Switch to localhost network for development
            await this.ensureCorrectNetwork();

            // Initialize contracts with signer
            await this.initializeContracts();

            return accounts[0];
        } catch (error: any) {
            this.isConnected = false;
            throw new Error(error.message || "Failed to connect wallet");
        }
    }

    disconnect(): void {
        this.signer = null;
        this.protocolContract = null;
        this.usdcContract = null;
        this.connectedAddress = null;
        this.isConnected = false;
    }

    getConnectedAddress(): string | null {
        return this.connectedAddress;
    }

    isWalletConnected(): boolean {
        return this.isConnected;
    }

    private async ensureCorrectNetwork(): Promise<void> {
        if (!this.provider) return;

        const network = await this.provider.getNetwork();
        const targetChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 80002);

        if (Number(network.chainId) !== targetChainId) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: `0x${targetChainId.toString(16)}` }],
                });
            } catch (switchError: any) {
                // If network doesn't exist, add it
                if (switchError.code === 4902) {
                    if (targetChainId === 80002) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0x13882', // 80002
                                chainName: 'Polygon Amoy Testnet',
                                rpcUrls: ['https://polygon-amoy.g.alchemy.com/v2/cpZnu19BVqFOEeVPFwV8r'],
                                nativeCurrency: {
                                    name: 'POL',
                                    symbol: 'POL',
                                    decimals: 18,
                                },
                                blockExplorerUrls: ['https://amoy.polygonscan.com/'],
                            }],
                        });
                    } else if (targetChainId === 1337) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0x539',
                                chainName: 'NileLink Local',
                                rpcUrls: ['http://localhost:8545'],
                                nativeCurrency: {
                                    name: 'ETH',
                                    symbol: 'ETH',
                                    decimals: 18,
                                },
                            }],
                        });
                    }
                } else {
                    throw new Error(`Failed to switch to network ${targetChainId}`);
                }
            }
        }
    }

    private async initializeContracts(): Promise<void> {
        if (!this.signer) return;

        // Check if contract addresses are available
        if (PROTOCOL_ADDRESS === '0x0000000000000000000000000000000000000000') {
            throw new Error("Protocol contract not deployed. Please run local deployment first.");
        }

        this.protocolContract = new ethers.Contract(
            PROTOCOL_ADDRESS,
            NileLinkProtocolArtifact.abi,
            this.signer
        );

        // Verify contract exists
        try {
            await this.protocolContract.getAddress();
        } catch (error) {
            throw new Error("Protocol contract not accessible. Please check deployment.");
        }
    }

    async payOrder(orderId: string, restaurantAddress: string, amount: number): Promise<string> {
        if (!this.protocolContract || !this.signer) throw new Error("Wallet not connected");

        // Convert amount to USDC units (6 decimals)
        const amountUsd6 = ethers.parseUnits(amount.toString(), 6);

        // Generate bytes16 orderId from the string.
        // If orderId is "order-123...", we need to hash it or truncate.
        // We will use a consistent hash based ID for the protocol.
        // For simplicity in this implementation, we assume orderId is compatible or we hash it.
        // Let's create a bytes16 hash of the orderId string.
        const orderIdBytes = ethers.hexlify(ethers.id(orderId).slice(0, 34)); // 0x + 32 chars = 16 bytes? No.
        // id returns 32 bytes (64 hex chars). We need 16 bytes.
        // We'll take the first 16 bytes of the hash.
        const orderIdBytes16 = ethers.dataSlice(ethers.id(orderId), 0, 16);

        const customerAddress = await this.signer.getAddress();

        try {
            // Call the Smart Contract
            // PaymentMethod.CRYPTO is enum index 2 (based on Solidity)
            // function createAndPayOrder(bytes16, address, address, uint256, uint8)
            const tx = await this.protocolContract.createAndPayOrder(
                orderIdBytes16,
                restaurantAddress,
                customerAddress,
                amountUsd6,
                2 // PaymentMethod.CRYPTO
            );

            console.log("Transaction sent:", tx.hash);

            // Wait for confirmation
            const receipt = await tx.wait();
            console.log("Transaction confirmed:", receipt.hash);

            return receipt.hash;
        } catch (error: any) {
            console.error("Payment failed:", error);
            throw new Error(error.reason || error.message || "Payment verification failed on-chain");
        }
    }
}

export const blockchainClient = new BlockchainClient();
