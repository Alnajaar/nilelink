import { ethers } from 'ethers';
import crypto from 'crypto';
import { prisma } from './DatabasePoolService';
import { logger } from '../utils/logger';

interface WalletConnection {
    id: string;
    userId: string;
    address: string;
    chainId: number;
    isActive: boolean;
    connectedAt: Date;
    lastUsedAt: Date;
    sessionId?: string;
}

interface WalletChallenge {
    id: string;
    address: string;
    message: string;
    nonce: string;
    expiresAt: Date;
    used: boolean;
}

interface WalletVerification {
    valid: boolean;
    address?: string;
    userId?: string;
    error?: string;
}

export class WalletService {
    private static instance: WalletService;
    private provider: ethers.JsonRpcProvider | null = null;

    private constructor() {
        this.initializeProvider();
    }

    static getInstance(): WalletService {
        if (!WalletService.instance) {
            WalletService.instance = new WalletService();
        }
        return WalletService.instance;
    }

    private initializeProvider(): void {
        try {
            // Use the same RPC URL as the rest of the application
            const rpcUrl = process.env.POLYGON_RPC_URL || 'https://rpc-mumbai.maticvigil.com';
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
        } catch (error) {
            logger.error('Failed to initialize Ethereum provider:', error);
        }
    }

    /**
     * Generate a unique nonce for wallet authentication
     */
    private generateNonce(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Create a wallet authentication challenge
     */
    async createWalletChallenge(address: string, userId?: string): Promise<{
        success: boolean;
        challenge?: WalletChallenge;
        message?: string;
        error?: string;
    }> {
        try {
            // Validate Ethereum address
            if (!ethers.isAddress(address)) {
                return { success: false, error: 'Invalid Ethereum address' };
            }

            const nonce = this.generateNonce();
            const timestamp = Date.now();
            const message = `NileLink Protocol Authentication\n\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${timestamp}\n\nPlease sign this message to authenticate with NileLink.`;

            // Check for existing unused challenges and mark them as expired
            await prisma.walletChallenge.updateMany({
                where: {
                    address: address.toLowerCase(),
                    used: false,
                    expiresAt: { lt: new Date() }
                },
                data: { used: true }
            });

            // Create new challenge
            const challenge = await prisma.walletChallenge.create({
                data: {
                    address: address.toLowerCase(),
                    message,
                    nonce,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
                    used: false,
                    userId // Link to user if provided
                }
            });

            logger.info(`Wallet challenge created for address ${address}`);

            return {
                success: true,
                challenge: {
                    id: challenge.id,
                    address: challenge.address,
                    message: challenge.message,
                    nonce: challenge.nonce,
                    expiresAt: challenge.expiresAt,
                    used: challenge.used
                },
                message
            };

        } catch (error) {
            logger.error('Failed to create wallet challenge:', error);
            return { success: false, error: 'Failed to create authentication challenge' };
        }
    }

    /**
     * Verify a wallet signature against a challenge
     */
    async verifyWalletSignature(
        address: string,
        signature: string,
        challengeId?: string
    ): Promise<WalletVerification> {
        try {
            // Validate Ethereum address
            if (!ethers.isAddress(address)) {
                return { valid: false, error: 'Invalid Ethereum address' };
            }

            // Find the challenge
            let challenge;
            if (challengeId) {
                challenge = await prisma.walletChallenge.findUnique({
                    where: { id: challengeId }
                });
            } else {
                // Find most recent unused challenge for this address
                challenge = await prisma.walletChallenge.findFirst({
                    where: {
                        address: address.toLowerCase(),
                        used: false,
                        expiresAt: { gt: new Date() }
                    },
                    orderBy: { createdAt: 'desc' }
                });
            }

            if (!challenge) {
                return { valid: false, error: 'No valid authentication challenge found' };
            }

            if (challenge.used) {
                return { valid: false, error: 'Challenge has already been used' };
            }

            if (new Date() > challenge.expiresAt) {
                // Mark as used to prevent reuse
                await prisma.walletChallenge.update({
                    where: { id: challenge.id },
                    data: { used: true }
                });
                return { valid: false, error: 'Challenge has expired' };
            }

            // Verify the signature
            try {
                const messageHash = ethers.hashMessage(challenge.message);
                const recoveredAddress = ethers.recoverAddress(messageHash, signature);

                if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
                    return { valid: false, error: 'Signature verification failed' };
                }
            } catch (signatureError) {
                logger.warn('Signature verification failed:', signatureError);
                return { valid: false, error: 'Invalid signature format' };
            }

            // Mark challenge as used
            await prisma.walletChallenge.update({
                where: { id: challenge.id },
                data: { used: true }
            });

            // Check if address is already connected to a user
            const existingConnection = await prisma.walletConnection.findFirst({
                where: {
                    address: address.toLowerCase(),
                    isActive: true
                }
            });

            const userId = existingConnection?.userId || challenge.userId;

            logger.info(`Wallet signature verified for address ${address}, user ${userId || 'unknown'}`);

            return {
                valid: true,
                address: address.toLowerCase(),
                userId: userId || undefined
            };

        } catch (error) {
            logger.error('Wallet signature verification failed:', error);
            return { valid: false, error: 'Signature verification failed' };
        }
    }

    /**
     * Connect a wallet to a user account
     */
    async connectWalletToUser(
        userId: string,
        address: string,
        chainId: number = 1,
        sessionId?: string
    ): Promise<{ success: boolean; connection?: WalletConnection; error?: string }> {
        try {
            // Check if this address is already connected to another user
            const existingConnection = await prisma.walletConnection.findFirst({
                where: {
                    address: address.toLowerCase(),
                    isActive: true,
                    userId: { not: userId }
                }
            });

            if (existingConnection) {
                return {
                    success: false,
                    error: 'This wallet address is already connected to another account'
                };
            }

            // Deactivate any existing connections for this user
            await prisma.walletConnection.updateMany({
                where: { userId, isActive: true },
                data: { isActive: false }
            });

            // Create new connection
            const connection = await prisma.walletConnection.create({
                data: {
                    userId,
                    address: address.toLowerCase(),
                    chainId,
                    isActive: true,
                    sessionId,
                    lastUsedAt: new Date()
                }
            });

            // Update user's wallet address
            await prisma.user.update({
                where: { id: userId },
                data: { walletAddress: address.toLowerCase() }
            });

            logger.info(`Wallet ${address} connected to user ${userId}`);

            return {
                success: true,
                connection: {
                    id: connection.id,
                    userId: connection.userId,
                    address: connection.address,
                    chainId: connection.chainId,
                    isActive: connection.isActive,
                    connectedAt: connection.connectedAt,
                    lastUsedAt: connection.lastUsedAt,
                    sessionId: connection.sessionId || undefined
                }
            };

        } catch (error) {
            logger.error('Failed to connect wallet to user:', error);
            return { success: false, error: 'Failed to connect wallet' };
        }
    }

    /**
     * Disconnect a wallet from a user
     */
    async disconnectWallet(userId: string, address: string): Promise<{ success: boolean; error?: string }> {
        try {
            const result = await prisma.walletConnection.updateMany({
                where: {
                    userId,
                    address: address.toLowerCase(),
                    isActive: true
                },
                data: { isActive: false }
            });

            if (result.count === 0) {
                return { success: false, error: 'Wallet connection not found' };
            }

            // Update user's wallet address if it matches
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { walletAddress: true }
            });

            if (user?.walletAddress === address.toLowerCase()) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { walletAddress: null }
                });
            }

            logger.info(`Wallet ${address} disconnected from user ${userId}`);

            return { success: true };

        } catch (error) {
            logger.error('Failed to disconnect wallet:', error);
            return { success: false, error: 'Failed to disconnect wallet' };
        }
    }

    /**
     * Get user's active wallet connections
     */
    async getUserWalletConnections(userId: string): Promise<WalletConnection[]> {
        try {
            const connections = await prisma.walletConnection.findMany({
                where: {
                    userId,
                    isActive: true
                },
                orderBy: { connectedAt: 'desc' }
            });

            return connections.map(conn => ({
                id: conn.id,
                userId: conn.userId,
                address: conn.address,
                chainId: conn.chainId,
                isActive: conn.isActive,
                connectedAt: conn.connectedAt,
                lastUsedAt: conn.lastUsedAt,
                sessionId: conn.sessionId || undefined
            }));

        } catch (error) {
            logger.error('Failed to get user wallet connections:', error);
            return [];
        }
    }

    /**
     * Update last used timestamp for a wallet connection
     */
    async updateWalletLastUsed(address: string): Promise<void> {
        try {
            await prisma.walletConnection.updateMany({
                where: {
                    address: address.toLowerCase(),
                    isActive: true
                },
                data: { lastUsedAt: new Date() }
            });
        } catch (error) {
            logger.error('Failed to update wallet last used:', error);
        }
    }

    /**
     * Check if a wallet address is verified and active
     */
    async isWalletVerified(address: string, userId?: string): Promise<boolean> {
        try {
            const connection = await prisma.walletConnection.findFirst({
                where: {
                    address: address.toLowerCase(),
                    isActive: true,
                    ...(userId && { userId })
                }
            });

            return !!connection;
        } catch (error) {
            logger.error('Failed to check wallet verification:', error);
            return false;
        }
    }

    /**
     * Get wallet address for a user
     */
    async getUserWalletAddress(userId: string): Promise<string | null> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { walletAddress: true }
            });

            return user?.walletAddress || null;
        } catch (error) {
            logger.error('Failed to get user wallet address:', error);
            return null;
        }
    }

    /**
     * Clean up expired challenges (should be run periodically)
     */
    async cleanupExpiredChallenges(): Promise<number> {
        try {
            const result = await prisma.walletChallenge.deleteMany({
                where: {
                    OR: [
                        { expiresAt: { lt: new Date() } },
                        { used: true }
                    ]
                }
            });

            if (result.count > 0) {
                logger.info(`Cleaned up ${result.count} expired wallet challenges`);
            }

            return result.count;
        } catch (error) {
            logger.error('Failed to cleanup expired challenges:', error);
            return 0;
        }
    }

    /**
     * Validate on-chain transaction (for payments, etc.)
     */
    async validateTransaction(txHash: string, expectedAddress?: string): Promise<{
        valid: boolean;
        from?: string;
        to?: string;
        value?: string;
        error?: string;
    }> {
        try {
            if (!this.provider) {
                return { valid: false, error: 'Blockchain provider not available' };
            }

            const tx = await this.provider.getTransaction(txHash);
            if (!tx) {
                return { valid: false, error: 'Transaction not found' };
            }

            if (expectedAddress && tx.from.toLowerCase() !== expectedAddress.toLowerCase()) {
                return { valid: false, error: 'Transaction sender mismatch' };
            }

            return {
                valid: true,
                from: tx.from,
                to: tx.to ?? undefined,
                value: tx.value.toString()
            };

        } catch (error) {
            logger.error('Transaction validation failed:', error);
            return { valid: false, error: 'Transaction validation failed' };
        }
    }
}

export const walletService = WalletService.getInstance();
