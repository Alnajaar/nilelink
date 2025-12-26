import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface Config {
    nodeEnv: string;
    port: number;
    corsOrigins: string[];
    database: {
        url: string;
    };
    redis: {
        url: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    magic: {
        secretKey: string;
    };
    blockchain: {
        rpcUrl: string;
        contractAddresses: {
            restaurantRegistry: string;
            orderSettlement: string;
            currencyExchange: string;
            disputeResolution: string;
            fraudDetection: string;
            investorVault: string;
            supplierCredit: string;
            usdc: string;
        };
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
}

function getCorsOrigins(): string[] {
    const origins = process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001';
    return origins.split(',');
}

export const config: Config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    corsOrigins: getCorsOrigins(),

    database: {
        url: process.env.DATABASE_URL || '',
    },

    redis: {
        url: process.env.REDIS_URL || '',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },

    magic: {
        secretKey: process.env.MAGIC_SECRET_KEY || '',
    },

    blockchain: {
        rpcUrl: process.env.POLYGON_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
        contractAddresses: {
            restaurantRegistry: process.env.CONTRACT_RESTAURANT_REGISTRY || '',
            orderSettlement: process.env.CONTRACT_ORDER_SETTLEMENT || '',
            currencyExchange: process.env.CONTRACT_CURRENCY_EXCHANGE || '',
            disputeResolution: process.env.CONTRACT_DISPUTE_RESOLUTION || '',
            fraudDetection: process.env.CONTRACT_FRAUD_DETECTION || '',
            investorVault: process.env.CONTRACT_INVESTOR_VAULT || '',
            supplierCredit: process.env.CONTRACT_SUPPLIER_CREDIT || '',
            usdc: process.env.CONTRACT_USDC || '',
        },
    },

    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
    },
};