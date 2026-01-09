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
        host: string;
        port: number;
        password?: string;
        database: number;
        clusterOptions?: any;
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
        perMin: number;
    };
    ai: {
        serviceUrl: string;
        requestTimeout: number;
        modelVersion: string;
        openaiApiKey: string;
    };
    storage: {
        uploadPath: string;
        maxFileSize: number;
    };
    logging: {
        level: string;
        apmServiceUrl: string;
    };
    tracing: {
        headerName: string;
    };
    encryption: {
        eventEncryptionKey: string;
        integrityKey: string;
        dataEncryptionKey: string;
        keyRotationInterval: number;
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
        url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/nilelink_dev',
    },

    redis: {
        url: process.env.REDIS_URL || '',
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
        database: parseInt(process.env.REDIS_DB || '0', 10),
        clusterOptions: process.env.REDIS_CLUSTER ? {
            enableReadyCheck: false,
            clusterRetryDelay: 100,
            redisOptions: {
                password: process.env.REDIS_PASSWORD
            }
        } : undefined,
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
        perMin: parseInt(process.env.RATE_LIMIT_PER_MIN || '1000', 10), // Internal services limit
    },

    ai: {
        serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
        requestTimeout: parseInt(process.env.AI_REQUEST_TIMEOUT || '30000', 10), // 30s default
        modelVersion: process.env.AI_MODEL_VERSION || 'v1.0.0',
        openaiApiKey: process.env.OPENAI_API_KEY || '',
    },

    storage: {
        uploadPath: process.env.UPLOAD_PATH || './uploads',
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
    },

    logging: {
        level: process.env.LOG_LEVEL || 'info',
        apmServiceUrl: process.env.APM_SERVICE_URL || '',
    },

    tracing: {
        headerName: process.env.TRACE_HEADER_NAME || 'x-trace-id',
    },

    encryption: {
        eventEncryptionKey: process.env.EVENT_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', // 64 hex chars = 32 bytes
        integrityKey: process.env.INTEGRITY_KEY || 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210', // 64 hex chars = 32 bytes
        dataEncryptionKey: process.env.DATA_ENCRYPTION_KEY || 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', // 64 hex chars = 32 bytes
        keyRotationInterval: parseInt(process.env.KEY_ROTATION_INTERVAL || '2592000000', 10), // 30 days in ms
    },
};
