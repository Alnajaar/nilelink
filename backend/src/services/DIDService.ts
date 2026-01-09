import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { config } from '../config';
import { circuitBreaker } from './CircuitBreakerService';

export interface DIDDocument {
    '@context': string[];
    id: string;
    controller?: string;
    verificationMethod: VerificationMethod[];
    service?: Service[];
    created?: string;
    updated?: string;
}

export interface VerificationMethod {
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase?: string;
    publicKeyJwk?: any;
    blockchainAccountId?: string;
}

export interface Service {
    id: string;
    type: string;
    serviceEndpoint: string | any;
}

export class DIDService {
    private prisma: PrismaClient;
    private provider: ethers.JsonRpcProvider;

    constructor() {
        this.prisma = new PrismaClient();
        this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
    }

    /**
     * Create a new DID for a user
     */
    async createDID(userId: string, walletAddress?: string): Promise<string> {
        return circuitBreaker.execute('did-create', async () => {
            try {
                // Generate a unique DID
                const did = `did:nilelink:${userId}`;

                // Get user's wallet address if not provided
                let blockchainAddress = walletAddress;
                if (!blockchainAddress) {
                    const user = await this.prisma.user.findUnique({
                        where: { id: userId },
                        select: { walletAddress: true }
                    });
                    blockchainAddress = user?.walletAddress || '';
                }

                // Create DID Document
                const didDocument: DIDDocument = {
                    '@context': [
                        'https://www.w3.org/ns/did/v1',
                        'https://w3id.org/security/suites/secp256k1-2019/v1'
                    ],
                    id: did,
                    controller: blockchainAddress ? `did:nilelink:${userId}` : undefined,
                    verificationMethod: [{
                        id: `${did}#key-1`,
                        type: 'EcdsaSecp256k1VerificationKey2019',
                        controller: did,
                        blockchainAccountId: blockchainAddress
                    }],
                    service: [{
                        id: `${did}#service-1`,
                        type: 'NileLinkProfileService',
                        serviceEndpoint: `${config.nodeEnv === 'production' ? 'https' : 'http'}://api.nilelink.app/users/${userId}`
                    }],
                    created: new Date().toISOString()
                };

                // Store DID document
                await this.prisma.systemConfig.upsert({
                    where: { key: `did:${userId}` },
                    update: {
                        value: didDocument as any,
                        description: `DID Document for user ${userId}`
                    },
                    create: {
                        key: `did:${userId}`,
                        value: didDocument as any,
                        description: `DID Document for user ${userId}`
                    }
                });

                logger.info(`Created DID for user ${userId}`, { did });
                return did;

            } catch (error) {
                logger.error('Failed to create DID', { error, userId });
                throw error;
            }
        });
    }

    /**
     * Resolve a DID to its document
     */
    async resolveDID(did: string): Promise<DIDDocument | null> {
        return circuitBreaker.execute('did-resolve', async () => {
            try {
                // Extract user ID from DID
                const userId = did.replace('did:nilelink:', '');

                const didRecord = await this.prisma.systemConfig.findUnique({
                    where: { key: `did:${userId}` }
                });

                if (!didRecord) {
                    return null;
                }

                return didRecord.value as unknown as DIDDocument;

            } catch (error) {
                logger.error('Failed to resolve DID', { error, did });
                throw error;
            }
        });
    }

    /**
     * Update a DID document
     */
    async updateDID(did: string, updates: Partial<DIDDocument>): Promise<void> {
        return circuitBreaker.execute('did-update', async () => {
            try {
                const userId = did.replace('did:nilelink:', '');

                const existingDoc = await this.resolveDID(did);
                if (!existingDoc) {
                    throw new Error(`DID ${did} not found`);
                }

                const updatedDoc: DIDDocument = {
                    ...existingDoc,
                    ...updates,
                    updated: new Date().toISOString()
                };

                await this.prisma.systemConfig.update({
                    where: { key: `did:${userId}` },
                    data: {
                        value: updatedDoc as any
                    }
                });

                logger.info(`Updated DID document for ${did}`);

            } catch (error) {
                logger.error('Failed to update DID', { error, did });
                throw error;
            }
        });
    }

    /**
     * Verify a DID ownership using blockchain
     */
    async verifyDIDOwnership(did: string, challenge: string, signature: string): Promise<boolean> {
        return circuitBreaker.execute('did-verify', async () => {
            try {
                const didDocument = await this.resolveDID(did);
                if (!didDocument) {
                    return false;
                }

                const verificationMethod = didDocument.verificationMethod[0];
                if (!verificationMethod.blockchainAccountId) {
                    return false;
                }

                // Verify signature against the challenge
                const messageHash = ethers.hashMessage(challenge);
                const recoveredAddress = ethers.recoverAddress(messageHash, signature);

                const isValid = recoveredAddress.toLowerCase() === verificationMethod.blockchainAccountId.toLowerCase();

                logger.info(`DID ownership verification`, {
                    did,
                    valid: isValid,
                    expected: verificationMethod.blockchainAccountId,
                    recovered: recoveredAddress
                });

                return isValid;

            } catch (error) {
                logger.error('Failed to verify DID ownership', { error, did });
                return false;
            }
        });
    }

    /**
     * Get verifiable credentials issued to a DID
     */
    async getCredentials(did: string): Promise<any[]> {
        return circuitBreaker.execute('did-credentials', async () => {
            try {
                const userId = did.replace('did:nilelink:', '');

                const credentials = await this.prisma.systemConfig.findMany({
                    where: {
                        key: {
                            startsWith: `vc:${userId}:`
                        }
                    }
                });

                return credentials.map(record => record.value);

            } catch (error) {
                logger.error('Failed to get credentials', { error, did });
                return [];
            }
        });
    }

    /**
     * Issue a verifiable credential to a DID
     */
    async issueCredential(did: string, credential: any): Promise<string> {
        return circuitBreaker.execute('did-issue-credential', async () => {
            try {
                const userId = did.replace('did:nilelink:', '');
                const credentialId = `vc:${userId}:${Date.now()}`;

                // Add issuance metadata
                const verifiableCredential = {
                    '@context': [
                        'https://www.w3.org/2018/credentials/v1',
                        'https://www.w3.org/2018/credentials/examples/v1'
                    ],
                    id: `did:nilelink:vc:${credentialId}`,
                    type: ['VerifiableCredential', ...credential.type],
                    issuer: 'did:nilelink:platform',
                    issuanceDate: new Date().toISOString(),
                    credentialSubject: {
                        id: did,
                        ...credential.credentialSubject
                    },
                    proof: credential.proof || {}
                };

                await this.prisma.systemConfig.create({
                    data: {
                        key: credentialId,
                        value: verifiableCredential,
                        description: `Verifiable Credential for ${did}`
                    }
                });

                logger.info(`Issued verifiable credential`, { did, credentialId });
                return `did:nilelink:vc:${credentialId}`;

            } catch (error) {
                logger.error('Failed to issue credential', { error, did });
                throw error;
            }
        });
    }

    /**
     * Revoke a verifiable credential
     */
    async revokeCredential(credentialId: string): Promise<void> {
        return circuitBreaker.execute('did-revoke-credential', async () => {
            try {
                await this.prisma.systemConfig.update({
                    where: { key: credentialId },
                    data: {
                        value: {
                            revoked: true,
                            revocationDate: new Date().toISOString()
                        }
                    }
                });

                logger.info(`Revoked credential`, { credentialId });

            } catch (error) {
                logger.error('Failed to revoke credential', { error, credentialId });
                throw error;
            }
        });
    }
}
