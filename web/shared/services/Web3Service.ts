/**
 * Web3 Service Layer
 * Decentralized service layer for direct smart contract interactions
 * Replaces all centralized API calls with on-chain operations
 */

import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';

// Contract ABIs
import NileLinkProtocolABI from '../../supplier/src/lib/abis/NileLinkProtocol.json';
import RestaurantRegistryABI from '../../supplier/src/lib/abis/RestaurantRegistry.json';
import OrderSettlementABI from '../../supplier/src/lib/abis/OrderSettlement.json';
import DeliveryCoordinatorABI from '../../supplier/src/lib/abis/DeliveryCoordinator.json';
import SupplyChainABI from '../../supplier/src/lib/abis/SupplyChain.json';
import CurrencyExchangeABI from '../../supplier/src/lib/abis/CurrencyExchange.json';
import FraudDetectionABI from '../../supplier/src/lib/abis/FraudDetection.json';

// Contract addresses (to be updated after deployment)
const CONTRACT_ADDRESSES = {
    NileLinkProtocol: process.env.NEXT_PUBLIC_NILELINK_PROTOCOL_ADDRESS || process.env.NEXT_PUBLIC_NILELINK_PROTOCOL || '0x0000000000000000000000000000000000000000',
    RestaurantRegistry: process.env.NEXT_PUBLIC_RESTAURANT_REGISTRY_ADDRESS || process.env.NEXT_PUBLIC_RESTAURANT_REGISTRY || '0x0000000000000000000000000000000000000000',
    OrderSettlement: process.env.NEXT_PUBLIC_ORDER_SETTLEMENT_ADDRESS || process.env.NEXT_PUBLIC_ORDER_SETTLEMENT || '0x0000000000000000000000000000000000000000',
    DeliveryCoordinator: process.env.NEXT_PUBLIC_DELIVERY_COORDINATOR_ADDRESS || process.env.NEXT_PUBLIC_DELIVERY_COORDINATOR || '0x0000000000000000000000000000000000000000',
    SupplyChain: process.env.NEXT_PUBLIC_SUPPLY_CHAIN_ADDRESS || process.env.NEXT_PUBLIC_SUPPLY_CHAIN || '0x0000000000000000000000000000000000000000',
    CurrencyExchange: process.env.NEXT_PUBLIC_CURRENCY_EXCHANGE_ADDRESS || process.env.NEXT_PUBLIC_CURRENCY_EXCHANGE || '0x0000000000000000000000000000000000000000',
    FraudDetection: process.env.NEXT_PUBLIC_FRAUD_DETECTION_ADDRESS || process.env.NEXT_PUBLIC_FRAUD_DETECTION || '0x0000000000000000000000000000000000000000',
};

// Network configuration
const NETWORKS = {
    polygon: {
        chainId: 137,
        name: 'Polygon',
        rpcUrl: 'https://polygon-rpc.com',
        blockExplorer: 'https://polygonscan.com',
    },
    amoy: {
        chainId: 80002,
        name: 'Polygon Amoy',
        rpcUrl: 'https://rpc-amoy.polygon.technology',
        blockExplorer: 'https://amoy.polygonscan.com',
    },
};

export interface Web3Error {
    code: string;
    message: string;
    data?: any;
}

export interface WalletAuth {
    address: string;
    signature: string;
    message: string;
    chainId: number;
}

export class Web3Service {
    public provider: ethers.BrowserProvider | null = null;
    private signer: ethers.JsonRpcSigner | null = null;
    private contracts: Record<string, ethers.Contract> = {};
    private currentNetwork: string;

    constructor() {
        // Initialize based on Chain ID
        const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
        this.currentNetwork = chainId === '137' ? 'polygon' : 'amoy';
        this.initializeWeb3();
    }

    /**
     * Initialize Web3 provider and contracts
     */
    private async initializeWeb3() {
        if (typeof window !== 'undefined' && !window.ethereum) {
            // Only log on client when we actually expect an injection
            console.warn('Web3 not available - running in offline mode');
            return;
        }
        if (typeof window === 'undefined') return;

        try {
            this.provider = new ethers.BrowserProvider(window.ethereum);

            // Initialize contracts
            await this.initializeContracts();
        } catch (error) {
            console.error('Failed to initialize Web3:', error);
        }
    }

    /**
     * Initialize contract instances
     */
    private async initializeContracts() {
        if (!this.provider) return;

        // Use provider (read-only) by default to avoid eager wallet prompt
        const runner = this.signer || this.provider;

        // Initialize contracts only if address is provided
        const initContract = (name: string, abi: any) => {
            const address = CONTRACT_ADDRESSES[name as keyof typeof CONTRACT_ADDRESSES];
            if (address && address !== '0x0000000000000000000000000000000000000000') {
                this.contracts[name] = new ethers.Contract(address, abi, runner);
            } else {
                console.warn(`Contract ${name} address missing - functionality will be limited`);
            }
        };

        initContract('NileLinkProtocol', NileLinkProtocolABI);
        initContract('RestaurantRegistry', RestaurantRegistryABI);
        initContract('OrderSettlement', OrderSettlementABI);
        initContract('DeliveryCoordinator', DeliveryCoordinatorABI);
        initContract('SupplyChain', SupplyChainABI);
        initContract('CurrencyExchange', CurrencyExchangeABI);
        initContract('FraudDetection', FraudDetectionABI);
    }

    /**
     * Connect wallet
     */
    async connectWallet(): Promise<{ address: string; chainId: number } | null> {
        if (!this.provider) {
            throw new Error('Web3 provider not available');
        }

        try {
            await this.provider.send('eth_requestAccounts', []);
            const signer = await this.provider.getSigner();
            const address = await signer.getAddress();
            const network = await this.provider.getNetwork();
            const chainId = Number(network.chainId);

            this.signer = signer;
            await this.initializeContracts();

            return { address, chainId };
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            return null;
        }
    }

    /**
     * Get current chain ID
     */
    async getChainId(): Promise<number> {
        if (!this.provider) return 137; // Default
        try {
            const network = await this.provider.getNetwork();
            return Number(network.chainId);
        } catch {
            return 137;
        }
    }

    /**
     * Sign-In with Ethereum authentication
     */
    async authenticateWithSIWE(): Promise<WalletAuth | null> {
        if (!this.provider || !this.signer) {
            throw new Error('Wallet not connected');
        }

        try {
            const address = await this.signer.getAddress();
            const network = await this.provider.getNetwork();
            const chainId = Number(network.chainId);

            // Create SIWE message
            const message = new SiweMessage({
                domain: window.location.host,
                address,
                statement: 'Sign in to NileLink with Ethereum',
                uri: window.location.origin,
                version: '1',
                chainId,
                nonce: Math.random().toString(36).substring(2),
                issuedAt: new Date().toISOString(),
                expirationTime: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
            });

            const messageString = message.toMessage();
            const signature = await this.signer.signMessage(messageString);

            return {
                address,
                signature,
                message: messageString,
                chainId,
            };
        } catch (error) {
            console.error('SIWE authentication failed:', error);
            return null;
        }
    }

    /**
     * Sign a message with the connected wallet
     */
    async signMessage(message: string): Promise<string> {
        if (!this.signer) {
            throw new Error('Wallet not connected');
        }
        return await this.signer.signMessage(message);
    }

    /**
     * Switch to correct network
     */
    async switchToNetwork(networkName: keyof typeof NETWORKS): Promise<boolean> {
        if (!this.provider) return false;

        const network = NETWORKS[networkName];

        try {
            await this.provider.send('wallet_switchEthereumChain', [
                { chainId: `0x${network.chainId.toString(16)}` },
            ]);
            this.currentNetwork = networkName;
            return true;
        } catch (error: any) {
            // If network doesn't exist, add it
            if (error.code === 4902) {
                try {
                    await this.provider.send('wallet_addEthereumChain', [
                        {
                            chainId: `0x${network.chainId.toString(16)}`,
                            chainName: network.name,
                            rpcUrls: [network.rpcUrl],
                            blockExplorerUrls: [network.blockExplorer],
                            nativeCurrency: {
                                name: 'MATIC',
                                symbol: 'MATIC',
                                decimals: 18,
                            },
                        },
                    ]);
                    this.currentNetwork = networkName;
                    return true;
                } catch (addError) {
                    console.error('Failed to add network:', addError);
                    return false;
                }
            }
            console.error('Failed to switch network:', error);
            return false;
        }
    }

    /**
     * Get user restaurants
     */
    async getUserRestaurants(userAddress: string): Promise<any[]> {
        if (!this.contracts.RestaurantRegistry) {
            throw new Error('RestaurantRegistry contract not initialized');
        }

        try {
            // This would call the contract to get restaurants owned by the user
            // Implementation depends on actual contract interface
            const restaurants = await this.contracts.RestaurantRegistry.getRestaurantsByOwner(userAddress);
            return restaurants;
        } catch (error) {
            console.error('Failed to get user restaurants:', error);
            return [];
        }
    }

    /**
     * Create an order on-chain
     */
    async createOrder(orderData: {
        restaurantId: string;
        items: any[];
        totalAmount: string;
        deliveryAddress?: string;
    }): Promise<string | null> {
        if (!this.contracts.OrderSettlement || !this.signer) {
            throw new Error('OrderSettlement contract not initialized');
        }

        try {
            // Convert order data to contract format
            const orderId = ethers.keccak256(
                ethers.toUtf8Bytes(`${Date.now()}-${await this.signer.getAddress()}`)
            );

            // Call contract method to create order
            const tx = await this.contracts.OrderSettlement.createOrder(
                orderId,
                orderData.restaurantId,
                orderData.totalAmount,
                orderData.deliveryAddress || '',
                // Additional parameters based on contract interface
            );

            await tx.wait();
            return orderId;
        } catch (error) {
            console.error('Failed to create order:', error);
            return null;
        }
    }

    /**
     * Get exchange rates from contract
     */
    async getExchangeRates(): Promise<Record<string, number>> {
        if (!this.contracts.CurrencyExchange) {
            throw new Error('CurrencyExchange contract not initialized');
        }

        try {
            // Implementation depends on contract interface
            const rates = await this.contracts.CurrencyExchange.getRates();
            return rates;
        } catch (error) {
            console.error('Failed to get exchange rates:', error);
            return {};
        }
    }

    /**
     * Protocol Emergency: Pause all transactions
     */
    async emergencyPause(): Promise<string | null> {
        if (!this.contracts.NileLinkProtocol || !this.signer) {
            throw new Error('NileLinkProtocol contract not initialized or wallet not connected');
        }

        try {
            const tx = await this.contracts.NileLinkProtocol.emergencyPause();
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (error) {
            console.error('Failed to execute emergency pause:', error);
            return null;
        }
    }

    /**
     * Protocol Emergency: Unpause transactions
     */
    async emergencyUnpause(): Promise<string | null> {
        if (!this.contracts.NileLinkProtocol || !this.signer) {
            throw new Error('NileLinkProtocol contract not initialized or wallet not connected');
        }

        try {
            const tx = await this.contracts.NileLinkProtocol.emergencyUnpause();
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (error) {
            console.error('Failed to execute emergency unpause:', error);
            return null;
        }
    }

    /**
     * Add an inventory item to the on-chain Supply Chain
     */
    async addInventoryItemOnChain(
        itemId: string,
        supplier: string,
        name: string,
        category: string,
        reorderPoint: number,
        unitCost: number,
        currency: string = 'USD',
        tokenId: number = 0,
        metadataCid: string = ""
    ): Promise<string | null> {
        if (!this.contracts.SupplyChain || !this.signer) {
            console.warn('[WEB3] SupplyChain not available - skipping on-chain anchor');
            return null;
        }

        try {
            // Convert to bytes16 and other protocol types
            // NileLink uses bytes16 for IDs. We hash the string ID to ensure compatibility.
            const idBytes = ethers.zeroPadValue(ethers.keccak256(ethers.toUtf8Bytes(itemId)).slice(0, 34), 16);
            const currencyBytes = ethers.encodeBytes32String(currency).slice(0, 8); // bytes3 is 3 bytes, so 0x123456

            const tx = await this.contracts.SupplyChain.addInventoryItem(
                idBytes,
                supplier,
                name,
                category,
                reorderPoint,
                BigInt(Math.floor(unitCost * 1000000)), // convert to USD6
                currencyBytes.slice(0, 8), // Ensure it's 3 bytes (0x + 6 chars)
                BigInt(tokenId),
                metadataCid
            );

            const receipt = await tx.wait();
            return receipt.hash;
        } catch (error) {
            console.error('Failed to anchor inventory item:', error);
            return null;
        }
    }

    /**
     * Anchor a batch of events to the blockchain via FraudDetection contract
     * @param subject The branch or device ID being anchored
     * @param cid The IPFS CID for the event batch
     * @returns Transaction hash or null
     */
    async anchorEventBatch(subject: string, cid: string): Promise<string | null> {
        if (!this.contracts.FraudDetection || !this.signer) {
            throw new Error('FraudDetection contract not initialized or wallet not connected');
        }

        try {
            // Step 1: Convert branchId/deviceId to bytes32 subject
            // In NileLink, subjects are often address-mapped bytes32
            const subjectBytes = ethers.isAddress(subject)
                ? ethers.zeroPadValue(subject, 32)
                : ethers.keccak256(ethers.toUtf8Bytes(subject));

            // Step 2: Convert CID to bytes32 detailsHash
            // Using keccak256 for now, or we could use multi-hash parsing if needed
            const detailsHash = ethers.keccak256(ethers.toUtf8Bytes(cid));

            // Step 3: Call flagAnomaly (used as a decentralized audit log)
            // subject, anomalyType (EVENT_BATCH_ANCHOR), severity (1 for normal audit), detailsHash
            const tx = await this.contracts.FraudDetection.flagAnomaly(
                subjectBytes,
                ethers.keccak256(ethers.toUtf8Bytes('EVENT_BATCH_ANCHOR')),
                1, // Normal priority audit trail
                detailsHash
            );

            const receipt = await tx.wait();
            return receipt.hash;
        } catch (error) {
            console.error('Failed to anchor event batch:', error);
            return null;
        }
    }

    /**
     * Get Decentralized Security Thresholds
     * These rules are governed on-chain and impact the SecurityOrchestrator logic.
     */
    async getSecurityThresholds(): Promise<{
        lockdownThreshold: number;
        visionWeight: number;
        fraudWeight: number;
        trustMultiplier: number;
    }> {
        // Fallback defaults if contract call fails or not initialized
        const defaults = {
            lockdownThreshold: 85,
            visionWeight: 40,
            fraudWeight: 30,
            trustMultiplier: 10
        };

        if (!this.contracts.FraudDetection) return defaults;

        try {
            // In a production environment, these would be separate getter functions or a struct in the contract
            // For this implementation, we simulate fetching these governed values
            const config = await this.contracts.FraudDetection.getSystemConfig();

            return {
                lockdownThreshold: Number(config.lockdownThreshold) || defaults.lockdownThreshold,
                visionWeight: Number(config.visionWeight) || defaults.visionWeight,
                fraudWeight: Number(config.fraudWeight) || defaults.fraudWeight,
                trustMultiplier: Number(config.trustMultiplier) || defaults.trustMultiplier
            };
        } catch (error) {
            console.warn('Failed to fetch on-chain thresholds, using local defaults:', error);
            return defaults;
        }
    }

    /**
     * Process payment on-chain
     */
    async processPayment(paymentData: {
        orderId: string;
        amount: string;
        tokenAddress: string;
    }): Promise<string | null> {
        if (!this.contracts.OrderSettlement || !this.signer) {
            throw new Error('OrderSettlement contract not initialized');
        }

        try {
            const tx = await this.contracts.OrderSettlement.processPayment(
                paymentData.orderId,
                paymentData.amount,
                paymentData.tokenAddress
            );

            const receipt = await tx.wait();
            return receipt.hash;
        } catch (error) {
            console.error('Failed to process payment:', error);
            return null;
        }
    }

    /**
     * Pick up an order for delivery (Decentralized status update)
     */
    async pickUpOrder(orderId: string): Promise<string | null> {
        if (!this.contracts.DeliveryCoordinator || !this.signer) {
            console.warn(`[DECENTRALIZED] DeliveryCoordinator not deployed. Mocking pick-up for order ${orderId}`);
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return `0xmock_pickup_tx_${Date.now()}`;
        }

        try {
            const tx = await this.contracts.DeliveryCoordinator.pickUpOrder(orderId);
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (error) {
            console.error('Failed to pick up order on-chain:', error);
            return null;
        }
    }

    /**
     * Complete a delivery (Decentralized status update)
     */
    async completeDelivery(orderId: string, proofHash?: string): Promise<string | null> {
        if (!this.contracts.DeliveryCoordinator || !this.signer) {
            console.warn(`[DECENTRALIZED] DeliveryCoordinator not deployed. Mocking completion for order ${orderId}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return `0xmock_delivery_tx_${Date.now()}`;
        }

        try {
            const tx = await this.contracts.DeliveryCoordinator.completeDelivery(
                orderId,
                proofHash || ethers.keccak256(ethers.toUtf8Bytes(`PO-DELIVERY-${orderId}-${Date.now()}`))
            );
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (error) {
            console.error('Failed to complete delivery on-chain:', error);
            return null;
        }
    }

    /**
     * Get transaction status
     */
    async getTransactionStatus(txHash: string): Promise<any> {
        if (!this.provider) return null;

        try {
            const receipt = await this.provider.getTransactionReceipt(txHash);
            return receipt;
        } catch (error) {
            console.error('Failed to get transaction status:', error);
            return null;
        }
    }

    /**
     * Listen to contract events
     */
    onOrderCreated(callback: (orderId: string, restaurantId: string, customer: string) => void): void {
        if (!this.contracts.OrderSettlement) return;

        this.contracts.OrderSettlement.on('OrderCreated', callback);
    }

    onPaymentReceived(callback: (orderId: string, amount: string, customer: string) => void): void {
        if (!this.contracts.OrderSettlement) return;

        this.contracts.OrderSettlement.on('PaymentReceived', callback);
    }

    /**
     * Clean up event listeners
     */
    removeAllListeners(): void {
        Object.values(this.contracts).forEach(contract => {
            if (contract && contract.removeAllListeners) {
                contract.removeAllListeners();
            }
        });
    }

    /**
     * Get current network
     */
    getCurrentNetwork(): string {
        return this.currentNetwork;
    }

    /**
     * Check if wallet is connected
     */
    isWalletConnected(): boolean {
        return !!this.signer;
    }

    /**
     * Get user on-chain role
     */
    async getUserRole(address: string): Promise<string> {
        try {
            if (this.contracts.RestaurantRegistry) {
                const isOwner = await this.contracts.RestaurantRegistry.isRestaurantOwner(address);
                if (isOwner) return 'OWNER';
            }

            if (this.contracts.DeliveryCoordinator) {
                const isDriver = await this.contracts.DeliveryCoordinator.isDriver(address);
                if (isDriver) return 'DRIVER';
            }

            if (this.contracts.SupplyChain) {
                const isSupplier = await this.contracts.SupplyChain.isSupplier(address);
                if (isSupplier) return 'SUPPLIER';
            }

            // Default to CUSTOMER if no other role found
            return 'CUSTOMER';
        } catch (error) {
            console.warn('Failed to fetch on-chain role, defaulting to CUSTOMER:', error);
            return 'CUSTOMER';
        }
    }

    /**
     * Get connected wallet address
     */
    async getWalletAddress(): Promise<string | null> {
        if (!this.signer) return null;
        try {
            return await this.signer.getAddress();
        } catch (error) {
            return null;
        }
    }
    /**
     * Withdraw funds from the platform
     * Currently maps to InvestorVault for investors.
     * Suppliers and Drivers are paid automatically via OrderSettlement.settle().
     */
    async withdrawFunds(amount: string, contractType: 'INVESTOR' | 'SUPPLIER' = 'INVESTOR', targetAddress?: string): Promise<string | null> {
        if (!this.signer) {
            throw new Error('Wallet not connected');
        }

        try {
            let tx;
            if (contractType === 'INVESTOR') {
                // lazy load investor vault or assume it's initialized if needed
                // For now, consistent with other methods, we'd need to ensure it's in contracts.
                // Checking if we have InvestorVault available (it wasn't in the original initialize list)
                // If not, we fall back to a simulation or error.
                // Ideally, we should add InvestorVault to the contract list.
                console.warn('InvestorVault interaction to be implemented - requiring ABI');
                return null;
            } else {
                // For suppliers, if we had a pull model. 
                // Since we moved to auto-push, this might just be a "sweep" function.
                return null;
            }
        } catch (error) {
            console.error('Failed to withdraw funds:', error);
            return null;
        }
    }
}

// Create singleton instance
const web3Service = new Web3Service();

export default web3Service;

// Export individual functions for easier importing
export const connectWallet = () => web3Service.connectWallet();
export const authenticateWithSIWE = () => web3Service.authenticateWithSIWE();
export const switchToNetwork = (network: keyof typeof NETWORKS) => web3Service.switchToNetwork(network);
export const getUserRestaurants = (address: string) => web3Service.getUserRestaurants(address);
export const createOrder = (data: any) => web3Service.createOrder(data);
export const getExchangeRates = () => web3Service.getExchangeRates();
export const processPayment = (data: any) => web3Service.processPayment(data);
export const getTransactionStatus = (txHash: string) => web3Service.getTransactionStatus(txHash);
export const getUserRole = (address: string) => web3Service.getUserRole(address);
export const getWalletAddress = () => web3Service.getWalletAddress();
export const withdrawFunds = (amount: string, type: 'INVESTOR' | 'SUPPLIER', target?: string) => web3Service.withdrawFunds(amount, type, target);