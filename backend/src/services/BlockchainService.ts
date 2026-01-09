import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { logger } from '../utils/logger';

// Import local JSONs directly (resolveJsonModule is on)
// Note: Artifacts are conditionally imported to allow backend to start without compiled contracts
let OrderSettlementArtifact: any = null;
let NileLinkProtocolArtifact: any = null;

try {
    OrderSettlementArtifact = require('../../../artifacts/contracts/core/OrderSettlement.sol/OrderSettlement.json');
    NileLinkProtocolArtifact = require('../../../artifacts/contracts/NileLinkProtocol.sol/NileLinkProtocol.json');
} catch (error) {
    logger.warn('[Blockchain] Contract artifacts not found. Blockchain features will be disabled.', { error: (error as Error).message });
}

export class BlockchainService {
    private provider: ethers.JsonRpcProvider;
    private prisma: PrismaClient;
    private orderSettlement?: ethers.Contract;
    private isListening: boolean = false;
    private isOfflineMode: boolean = false;
    private retryQueue: Map<string, { attempt: number; lastAttempt: Date; data: any }> = new Map();
    private gasPriceCache: { price: bigint; timestamp: number } | null = null;

    // Check if blockchain connection is available
    private async checkConnection(): Promise<boolean> {
        try {
            await this.provider.getBlockNumber();
            return true;
        } catch (error) {
            return false;
        }
    }

    constructor() {
        this.prisma = new PrismaClient();

        // Use a robust provider setup with fallback for development
        const rpcUrl = config.blockchain.rpcUrl;

        try {
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            logger.info(`[Blockchain] Initialized provider with RPC URL: ${rpcUrl}`);

            // Test connection immediately
            this.checkConnection().then(isConnected => {
                if (!isConnected) {
                    logger.warn('[Blockchain] Initial connection test failed, entering offline mode');
                    this.isOfflineMode = true;
                }
            }).catch(error => {
                logger.warn('[Blockchain] Connection test failed, entering offline mode', { error });
                this.isOfflineMode = true;
            });
        } catch (error) {
            logger.warn(`[Blockchain] Failed to initialize provider with ${rpcUrl}, entering offline mode`, { error });
            this.isOfflineMode = true;
            // Create a minimal provider for offline mode
            this.provider = new ethers.JsonRpcProvider('http://invalid-url-that-wont-connect.com');
        }

        // Initialize Contracts
        const settlementAddress = config.blockchain.contractAddresses.orderSettlement;
        if (settlementAddress && ethers.isAddress(settlementAddress) && OrderSettlementArtifact) {
            try {
                this.orderSettlement = new ethers.Contract(
                    settlementAddress,
                    OrderSettlementArtifact.abi,
                    this.provider
                );
                logger.info('[Blockchain] OrderSettlement contract initialized successfully');
            } catch (error) {
                logger.error('[Blockchain] Failed to initialize OrderSettlement contract', { error });
            }
        } else {
            logger.warn('[Blockchain] OrderSettlement contract address missing, invalid, or artifacts not available. Blockchain features disabled.');
        }

        // Note: NileLinkProtocol contract initialization removed - not in current contract addresses
    }

    // Fault Tolerance: Sync Missed Events
    public async syncMissedEvents() {
        if (this.isOfflineMode) {
            logger.info('[Blockchain] Skipping sync - offline mode enabled');
            return;
        }

        if (!this.orderSettlement) {
            logger.info('[Blockchain] Skipping sync - contract not initialized');
            return;
        }

        logger.info('[Blockchain] Starting missed event synchronization...');

        try {
            // Note: Database sync tracking disabled due to missing systemConfig model
            // In production, this would track the last synced block
            const startBlock = 0; // Start from beginning for development
            const currentBlock = await this.provider.getBlockNumber();

            if (startBlock >= currentBlock) {
                logger.info('[Blockchain] Already synced to tip.');
                return;
            }

            logger.info(`[Blockchain] Syncing from block ${startBlock} to ${currentBlock} (development mode - limited functionality)`);

            // For development, we'll skip the full event sync to avoid database issues
            // In production, this would query and process blockchain events
            logger.info('[Blockchain] Event sync disabled in development mode (database models not available)');

        } catch (error) {
            logger.error('[Blockchain] Sync failed', { error });
            // If sync fails due to connection issues, enter offline mode
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
                logger.warn('[Blockchain] Connection failed during sync, entering offline mode');
                this.isOfflineMode = true;
            }
        }
    }

    public async startListener() {
        if (this.isListening) return;
        if (!this.orderSettlement) {
            logger.warn('[Blockchain] Cannot start listener: Contract not initialized.');
            return;
        }

        logger.info('Starting Blockchain Listener Service...');
        this.isListening = true;

        // Perform Sync on Startup
        await this.syncMissedEvents();

        try {
            // Note: Event listening disabled for production RPC providers that don't support eth_newFilter
            // In production, use WebSocket providers or polling mechanisms instead
            logger.info('Blockchain event listening disabled for HTTP RPC provider - use WebSocket for real-time events');

            // Alternative: Implement polling mechanism for production
            // this.startPollingForEvents();

        } catch (error) {
            logger.error('Failed to initialize blockchain listener', { error });
            this.isListening = false;
        }
    }

    public async handlePaymentReceived(
        orderIdBytes: string,
        payer: string,
        amountUsd6: bigint,
        timestamp: bigint,
        event: ethers.EventLog
    ) {
        const txHash = event.transactionHash;
        const orderIdStr = ethers.decodeBytes32String(ethers.zeroPadValue(orderIdBytes, 32)).replace(/\0/g, '');

        logger.info(`[Blockchain] Payment received for Order ${orderIdStr} (development mode - database operations disabled)`, {
            txHash,
            amount: amountUsd6.toString(),
            payer
        });

        // Note: Database operations disabled due to missing models in current schema
        // In production, this would update order status and create payment records
    }

    private async handlePaymentSettled(
        orderIdBytes: string,
        restaurant: string,
        gross: bigint,
        fee: bigint,
        net: bigint,
        timestamp: bigint,
        event: ethers.EventLog
    ) {
        const txHash = event.transactionHash;
        logger.info(`[Blockchain] Settlement finalized for ${restaurant} (development mode - database operations disabled)`, {
            txHash,
            gross: gross.toString(),
            fee: fee.toString(),
            net: net.toString()
        });

        // Note: Database operations disabled due to missing models in current schema
        // In production, this would update settlement records
    }

    private async handlePaymentRefunded(orderIdBytes: string, to: string, amount: bigint, timestamp: bigint, event: ethers.EventLog) {
        logger.info(`[Blockchain] Refund processed`, { txHash: event.transactionHash });
        // Update Order status to REFUNDED
    }

    // Orphaned Payments Handling
    public async storeOrphanedPayment(
        orderIdStr: string,
        payer: string,
        amount: bigint,
        txHash: string,
        reason: string = 'Order not found'
    ): Promise<void> {
        logger.warn(`[Blockchain] Orphaned payment detected: ${txHash} (development mode - storage disabled)`, {
            orderIdStr,
            payer,
            amount: amount.toString(),
            reason
        });

        // Note: Database storage disabled due to missing systemConfig model
        // In production, this would store orphaned payments for manual review
    }

    public async getOrphanedPayments(): Promise<any[]> {
        logger.info('[Blockchain] Retrieving orphaned payments (development mode - returning empty array)');
        // Note: Database retrieval disabled due to missing systemConfig model
        return [];
    }

    // Transaction Retry Logic
    public async retryFailedTransaction(txHash: string, maxRetries: number = 3): Promise<boolean> {
        const retryKey = `retry_${txHash}`;
        const existingRetry = this.retryQueue.get(retryKey);

        if (existingRetry && existingRetry.attempt >= maxRetries) {
            logger.warn(`[Blockchain] Max retries exceeded for transaction: ${txHash}`);
            return false;
        }

        const attempt = existingRetry ? existingRetry.attempt + 1 : 1;
        const now = new Date();

        // Exponential backoff: 1min, 5min, 15min
        const delays = [60, 300, 900];
        const delaySeconds = delays[attempt - 1] || 900;

        this.retryQueue.set(retryKey, {
            attempt,
            lastAttempt: now,
            data: { txHash, delaySeconds }
        });

        logger.info(`[Blockchain] Queued retry ${attempt}/${maxRetries} for transaction: ${txHash}, delay: ${delaySeconds}s`);

        // In production, use a job queue (Bull) instead of setTimeout
        setTimeout(async () => {
            try {
                await this.processRetry(txHash, attempt);
            } catch (error) {
                logger.error(`[Blockchain] Retry ${attempt} failed for ${txHash}`, { error });
            }
        }, delaySeconds * 1000);

        return true;
    }

    private async processRetry(txHash: string, attempt: number): Promise<void> {
        // Check transaction status and retry logic here
        // This would involve re-checking the blockchain state and updating DB accordingly
        logger.info(`[Blockchain] Processing retry ${attempt} for transaction: ${txHash}`);

        // Remove from retry queue on success
        this.retryQueue.delete(`retry_${txHash}`);
    }

    // Gas Optimization
    public async getOptimizedGasPrice(): Promise<bigint> {
        const now = Date.now();

        // Cache gas price for 30 seconds
        if (this.gasPriceCache && (now - this.gasPriceCache.timestamp) < 30000) {
            return this.gasPriceCache.price;
        }

        try {
            const feeData = await this.provider.getFeeData();

            // Use EIP-1559 if available, otherwise legacy gas price
            let gasPrice: bigint;
            if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
                // EIP-1559: Add base fee + priority fee
                gasPrice = feeData.maxFeePerGas + feeData.maxPriorityFeePerGas;
            } else {
                gasPrice = feeData.gasPrice || BigInt(20000000000); // 20 gwei fallback
            }

            // Apply 20% buffer for faster inclusion
            gasPrice = gasPrice * BigInt(120) / BigInt(100);

            this.gasPriceCache = { price: gasPrice, timestamp: now };

            logger.debug(`[Blockchain] Optimized gas price: ${gasPrice.toString()} wei`);
            return gasPrice;

        } catch (error) {
            logger.error('[Blockchain] Failed to get gas price', { error });
            return BigInt(50000000000); // 50 gwei fallback
        }
    }

    public async estimateGasCost(tx: any): Promise<{ gasLimit: bigint; totalCost: bigint }> {
        try {
            const gasLimit = await this.provider.estimateGas(tx);
            const gasPrice = await this.getOptimizedGasPrice();
            const totalCost = gasLimit * gasPrice;

            return { gasLimit, totalCost };
        } catch (error) {
            logger.error('[Blockchain] Failed to estimate gas cost', { error });
            return { gasLimit: BigInt(21000), totalCost: BigInt(0) };
        }
    }

    // Transaction Monitoring and Alerts
    public async monitorTransaction(txHash: string, timeoutMinutes: number = 30): Promise<void> {
        try {
            const startTime = Date.now();
            const timeoutMs = timeoutMinutes * 60 * 1000;

            const checkTransaction = async (): Promise<void> => {
                try {
                    const receipt = await this.provider.getTransactionReceipt(txHash);

                    if (receipt) {
                        if (receipt.status === 1) {
                            logger.info(`[Blockchain] Transaction confirmed: ${txHash}`, {
                                blockNumber: receipt.blockNumber,
                                gasUsed: receipt.gasUsed?.toString(),
                                confirmations: await this.getConfirmations(txHash)
                            });
                            return;
                        } else {
                            logger.error(`[Blockchain] Transaction failed: ${txHash}`);
                            await this.sendAlert('TRANSACTION_FAILED', { txHash, receipt });
                            return;
                        }
                    }

                    // Check timeout
                    if (Date.now() - startTime > timeoutMs) {
                        logger.error(`[Blockchain] Transaction timeout: ${txHash}`);
                        await this.sendAlert('TRANSACTION_TIMEOUT', { txHash, timeoutMinutes });
                        return;
                    }

                    // Continue monitoring
                    setTimeout(checkTransaction, 10000); // Check every 10 seconds
                } catch (error) {
                    logger.error(`[Blockchain] Error monitoring transaction ${txHash}`, { error });
                    setTimeout(checkTransaction, 30000); // Retry after 30 seconds on error
                }
            };

            checkTransaction();
        } catch (error) {
            logger.error(`[Blockchain] Failed to start transaction monitoring for ${txHash}`, { error });
        }
    }

    private async getConfirmations(txHash: string): Promise<number> {
        try {
            const receipt = await this.provider.getTransactionReceipt(txHash);
            if (!receipt) return 0;

            const currentBlock = await this.provider.getBlockNumber();
            return currentBlock - receipt.blockNumber;
        } catch {
            return 0;
        }
    }

    private async sendAlert(type: string, data: any): Promise<void> {
        try {
            logger.warn(`[Blockchain] ALERT: ${type}`, data);

            // In production, integrate with alerting service (PagerDuty, Slack, etc.)
            // For now, just log and potentially send email

            // TODO: Implement actual alert sending
            // await emailService.sendAlert(type, data);
            // await notificationService.sendAlert(type, data);

        } catch (error) {
            logger.error(`[Blockchain] Failed to send alert: ${type}`, { error, data });
        }
    }

    // Health check method
    public async getHealthStatus(): Promise<{
        isHealthy: boolean;
        isOfflineMode: boolean;
        lastBlock?: number;
        pendingRetries: number;
        orphanedPayments: number;
    }> {
        if (this.isOfflineMode) {
            return {
                isHealthy: true, // Service is healthy, just offline
                isOfflineMode: true,
                pendingRetries: this.retryQueue.size,
                orphanedPayments: 0
            };
        }

        try {
            const lastBlock = await this.provider.getBlockNumber();
            const orphanedPayments = (await this.getOrphanedPayments()).length;

            return {
                isHealthy: !!this.orderSettlement && this.isListening,
                isOfflineMode: false,
                lastBlock,
                pendingRetries: this.retryQueue.size,
                orphanedPayments
            };
        } catch (error) {
            logger.error('[Blockchain] Health check failed', { error });
            return {
                isHealthy: false,
                isOfflineMode: false,
                pendingRetries: this.retryQueue.size,
                orphanedPayments: 0
            };
        }
    }
}
