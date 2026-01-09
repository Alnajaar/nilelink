# Subscription System - Web3 Extensibility Hooks

This document outlines the architectural hooks and extension points designed into the NileLink subscription system to support future Web3 integrations, NFT-based subscriptions, DAO memberships, and blockchain-based monetization features.

## Overview

The subscription system is built with extensibility in mind, providing clean abstraction layers for payment processing, ownership verification, and benefit delivery. This allows seamless integration with Web3 technologies while maintaining backwards compatibility with Web2 payment flows.

## Core Architecture Hooks

### 1. Payment Processor Abstraction

**Location**: `backend/src/services/SubscriptionPaymentProcessor.ts`

**Current Implementation**:
- Stripe-based payment processing
- Transaction status tracking
- Webhook handling for payment confirmations

**Web3 Extension Points**:
```typescript
// Future Web3 payment processing
async processWeb3Payment(transactionId: string, contractAddress: string, network: string) {
    // Integrate with smart contracts
    // Handle gas fees, transaction signing
    // Update blockchain transaction hashes
}

// NFT-based payment methods
async processNFTPayment(transactionId: string, nftContract: string, tokenId: string) {
    // Transfer NFT as payment
    // Verify NFT ownership
    // Mint subscription NFT receipt
}
```

### 2. Database Schema Extensions

**Location**: `backend/prisma/schema.prisma`

**Current Models**:
- `SubscriptionPlan`: Core plan configuration
- `CustomerSubscription`: User subscriptions
- `SubscriptionTransaction`: Payment tracking
- `Web3SubscriptionContract`: Future Web3 placeholder

**Web3 Extension Models**:
```prisma
// NFT-based subscription plans
model NFTSubscriptionPlan {
    id              String   @id @default(cuid())
    planId          String   // Reference to base plan
    plan            SubscriptionPlan @relation(fields: [planId], references: [id])

    nftContract     String   // ERC-721/ERC-1155 contract address
    network         String   // ethereum, polygon, etc.
    tokenType       NFTType  // ERC721, ERC1155

    supply          Int?     // Limited edition NFTs
    minted          Int      @default(0)

    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
}

enum NFTType {
    ERC721  // Unique NFTs
    ERC1155 // Semi-fungible tokens
}

// DAO membership extensions
model DAOMembership {
    id              String   @id @default(cuid())
    subscriptionId  String
    subscription    CustomerSubscription @relation(fields: [subscriptionId], references: [id])

    daoContract     String   // DAO governance contract
    votingPower     Decimal  // Voting weight from subscription
    proposalAccess  Boolean  @default(true)

    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
}

// Smart contract events
model BlockchainEvent {
    id              String   @id @default(cuid())
    transactionId   String
    transaction     SubscriptionTransaction @relation(fields: [transactionId], references: [id])

    eventType       String   // "PaymentReceived", "NFTMinted", "DAOVoted"
    contractAddress String
    network         String
    blockNumber     Int
    transactionHash String   @unique
    logIndex        Int

    eventData       Json     // Parsed event data
    processedAt     DateTime?

    createdAt       DateTime @default(now())
}
```

### 3. Benefit Delivery System

**Location**: Subscription lifecycle services

**Current Implementation**:
- Static benefit definitions
- Manual benefit validation

**Web3 Extension Points**:
```typescript
// Dynamic benefit delivery via smart contracts
interface Web3BenefitProvider {
    validateAccess(userId: string, benefitId: string): Promise<boolean>;
    deliverBenefit(userId: string, benefitId: string): Promise<void>;
    revokeBenefit(userId: string, benefitId: string): Promise<void>;
}

// NFT-gated benefits
class NFTBenefitProvider implements Web3BenefitProvider {
    async validateAccess(userId: string, benefitId: string): Promise<boolean> {
        // Check NFT ownership on blockchain
        // Verify token hasn't expired
        return await this.checkNFTOwnership(userId, benefitId);
    }

    async deliverBenefit(userId: string, benefitId: string): Promise<void> {
        // Mint access NFT
        // Grant smart contract permissions
        await this.mintAccessToken(userId, benefitId);
    }
}

// DAO voting rights
class DAOBenefitProvider implements Web3BenefitProvider {
    async deliverBenefit(userId: string, benefitId: string): Promise<void> {
        // Grant DAO membership
        // Assign voting power
        // Update governance contract
        await this.grantDAOMembership(userId, benefitId);
    }
}
```

## Future Web3 Features

### 1. NFT-Based Subscriptions

**Use Cases**:
- Limited edition subscription NFTs
- Tradable subscription rights
- Collectible subscription tiers

**Implementation**:
```typescript
class NFTSubscriptionManager {
    async createNFTSubscription(planId: string, metadata: NFTMetadata) {
        // Deploy or use existing NFT contract
        // Set up subscription parameters on-chain
        // Create metadata for NFT minting
    }

    async mintSubscriptionNFT(subscriptionId: string) {
        // Mint NFT representing subscription
        // Include expiration, benefits in metadata
        // Transfer to subscriber wallet
    }

    async transferSubscriptionNFT(from: string, to: string, tokenId: string) {
        // Handle NFT transfers
        // Update subscription ownership
        // Transfer associated benefits
    }
}
```

### 2. DAO Integration

**Use Cases**:
- Restaurant governance DAOs
- Community-driven menu decisions
- Revenue sharing governance

**Implementation**:
```typescript
class DAOIntegrationManager {
    async createSubscriptionDAO(planId: string, config: DAOConfig) {
        // Deploy DAO governance contract
        // Set up voting parameters
        // Initialize with subscription holders
    }

    async addSubscriberToDAO(subscriptionId: string) {
        // Grant DAO membership
        // Assign voting tokens based on subscription tier
        // Set up governance permissions
    }

    async handleGovernanceVote(subscriptionId: string, proposalId: string, vote: Vote) {
        // Cast vote on behalf of subscriber
        // Update voting power calculations
        // Record governance participation
    }
}
```

### 3. Smart Contract Revenue Sharing

**Use Cases**:
- Automatic revenue distribution
- Transparent fee structures
- Programmatic payouts

**Implementation**:
```typescript
class RevenueSharingManager {
    async setupRevenueSharing(planId: string, splitConfig: SplitConfig) {
        // Deploy revenue sharing contract
        // Configure payment splits
        // Set up automated distributions
    }

    async processRevenueDistribution(subscriptionId: string, amount: number) {
        // Calculate splits (platform, vendor, referrers)
        // Execute smart contract distribution
        // Record transparent transactions
    }
}
```

### 4. Cross-Chain Subscriptions

**Use Cases**:
- Multi-network NFT subscriptions
- Cross-chain benefit access
- Global payment flexibility

**Implementation**:
```typescript
class CrossChainManager {
    async setupCrossChainSubscription(planId: string, networks: string[]) {
        // Deploy contracts across networks
        // Set up cross-chain messaging
        // Configure bridge integrations
    }

    async syncSubscriptionStatus(subscriptionId: string, targetNetwork: string) {
        // Sync subscription state across chains
        // Update cross-chain NFT ownership
        // Maintain consistent benefit access
    }
}
```

## Integration Points

### API Extensions

**New Endpoints for Web3 Features**:
```
POST /api/subscriptions/web3/setup-nft-plan
POST /api/subscriptions/web3/mint-subscription-nft
GET  /api/subscriptions/web3/nft-status/:subscriptionId
POST /api/subscriptions/web3/dao-vote
GET  /api/subscriptions/web3/dao-proposals
```

### Frontend Extensions

**Web3 Wallet Integration**:
```typescript
// Wallet connection for NFT subscriptions
const connectWallet = async () => {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    // Verify NFT ownership
    // Enable Web3 subscription features
};

// NFT minting flow
const mintSubscriptionNFT = async (subscriptionId: string) => {
    // Sign transaction
    // Mint NFT receipt
    // Update subscription status
};
```

### Event-Driven Architecture

**Blockchain Event Processing**:
```typescript
class BlockchainEventProcessor {
    async processEvent(event: BlockchainEvent) {
        switch (event.eventType) {
            case 'SubscriptionPayment':
                await this.handlePaymentEvent(event);
                break;
            case 'NFTTransfer':
                await this.handleNFTTransfer(event);
                break;
            case 'DAOVote':
                await this.handleDAOVote(event);
                break;
        }
    }
}
```

## Migration Strategy

### Phase 1: Foundation (Current)
- Web2 subscription system operational
- Database schema supports Web3 extensions
- API structure allows for Web3 endpoints

### Phase 2: Hybrid Integration
- Add NFT minting for premium subscriptions
- Implement basic DAO voting
- Enable cross-chain payments

### Phase 3: Full Web3
- Complete migration to smart contracts
- Decentralized governance
- Tokenized economy features

## Security Considerations

### Smart Contract Audits
- All Web3 contracts require professional audit
- Bug bounty programs for critical contracts
- Formal verification for financial logic

### Oracle Dependencies
- Use decentralized oracles for price feeds
- Implement fallback mechanisms
- Monitor oracle reliability

### Key Management
- Secure private key storage
- Multi-signature requirements
- Hardware security modules (HSMs)

## Monitoring & Analytics

### Web3 Metrics
- Gas usage tracking
- Transaction success rates
- Cross-chain sync status
- NFT trading volumes

### Business Metrics
- Subscription conversion rates
- NFT premium uptake
- DAO participation levels
- Revenue attribution accuracy

## Conclusion

The subscription system is architected with Web3 extensibility as a core principle, providing the foundation for NFT subscriptions, DAO integrations, and decentralized monetization while maintaining full backwards compatibility with existing Web2 payment flows.