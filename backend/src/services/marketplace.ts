import { prisma } from './DatabasePoolService';
import { EventStore } from '../EventStore';
import { EscrowManager } from '../EscrowManager';
import { MarketplaceService } from '../MarketplaceService';
import { TrustService } from '../TrustService';

// Initialize core dependencies
export const eventStore = new EventStore(prisma);
export const escrowManager = new EscrowManager(prisma, eventStore);

// Initialize marketplace services
export const marketplaceService = new MarketplaceService(prisma, eventStore, escrowManager);
export const trustService = new TrustService(prisma, eventStore, escrowManager);
