/**
 * IPFS Token Issuer - Cloudflare Worker
 * 
 * This Worker issues temporary upload tokens for authenticated users.
 * 
 * Security Features:
 * - Wallet signature validation
 * - Role-based authorization (OWNER/MANAGER only)
 * - Rate limiting per wallet address
 * - Token expiration (5 minutes)
 */

import { sign, verify } from '@tsndr/cloudflare-worker-jwt';
import { ethers } from 'ethers';

// Types
interface Env {
    JWT_SECRET: string;
    RPC_URL: string;
    RESTAURANT_REGISTRY_ADDRESS: string;
    RATE_LIMITER: DurableObjectNamespace;
}

interface TokenRequest {
    walletAddress: string;
    signature: string;
    role: string;
    message: string;
}

interface TokenResponse {
    token: string;
    expiresAt: number;
}

interface ErrorResponse {
    error: string;
    code?: string;
}

// Constants
const TOKEN_EXPIRY_MINUTES = 5;
const ALLOWED_ROLES = ['OWNER', 'MANAGER', 'RESTAURANT_OWNER'];

// CORS headers
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Main Worker Handler
 */
export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS });
        }

        const url = new URL(request.url);

        // Route: POST /ipfs/token - Issue upload token
        if (url.pathname === '/ipfs/token' && request.method === 'POST') {
            return handleTokenRequest(request, env);
        }

        // Route: GET /ipfs/status - Health check
        if (url.pathname === '/ipfs/status' && request.method === 'GET') {
            return jsonResponse({
                healthy: true,
                service: 'ipfs-token-issuer',
                message: 'Token issuer is operational',
            });
        }

        // 404 for unknown routes
        return jsonResponse(
            { error: 'Not found', code: 'ROUTE_NOT_FOUND' },
            404
        );
    },
};

/**
 * Handle token request
 */
async function handleTokenRequest(request: Request, env: Env): Promise<Response> {
    try {
        // Parse request body
        const body: TokenRequest = await request.json();
        const { walletAddress, signature, role, message } = body;

        // Validate inputs
        if (!walletAddress || !signature || !role || !message) {
            return jsonResponse(
                { error: 'Missing required fields', code: 'INVALID_REQUEST' },
                400
            );
        }

        // Step 1: Validate wallet signature
        const isValidSignature = await validateSignature(message, signature, walletAddress);
        if (!isValidSignature) {
            return jsonResponse(
                { error: 'Invalid signature', code: 'INVALID_SIGNATURE' },
                401
            );
        }

        // Step 2: Validate role
        if (!ALLOWED_ROLES.includes(role.toUpperCase())) {
            return jsonResponse(
                { error: 'Insufficient permissions. Only OWNER and MANAGER can upload.', code: 'INSUFFICIENT_PERMISSIONS' },
                403
            );
        }

        // Step 3: Check rate limits
        const isAllowed = await checkRateLimit(walletAddress, env);
        if (!isAllowed) {
            return jsonResponse(
                { error: 'Rate limit exceeded. Maximum 10 uploads per hour.', code: 'RATE_LIMIT_EXCEEDED' },
                429
            );
        }

        // Step 4: Generate JWT token
        const expiresAt = Date.now() + (TOKEN_EXPIRY_MINUTES * 60 * 1000);
        const token = await sign(
            {
                walletAddress,
                role,
                exp: Math.floor(expiresAt / 1000),
            },
            env.JWT_SECRET
        );

        // Step 5: Return token
        const response: TokenResponse = {
            token,
            expiresAt,
        };

        return jsonResponse(response, 200);
    } catch (error) {
        console.error('Token request error:', error);
        return jsonResponse(
            { error: 'Internal server error', code: 'INTERNAL_ERROR' },
            500
        );
    }
}

/**
 * Validate wallet signature
 */
async function validateSignature(
    message: string,
    signature: string,
    expectedAddress: string
): Promise<boolean> {
    try {
        // Recover address from signature
        const recoveredAddress = ethers.verifyMessage(message, signature);

        // Compare addresses (case-insensitive)
        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
        console.error('Signature validation error:', error);
        return false;
    }
}

/**
 * Check rate limit for wallet address
 * 
 * Uses Cloudflare Durable Objects for distributed rate limiting
 */
async function checkRateLimit(walletAddress: string, env: Env): Promise<boolean> {
    try {
        // Get Durable Object instance for this wallet
        const id = env.RATE_LIMITER.idFromName(walletAddress);
        const stub = env.RATE_LIMITER.get(id);

        // Check if upload is allowed
        const response = await stub.fetch('https://rate-limit/check');
        const result = await response.json() as { allowed: boolean };

        return result.allowed;
    } catch (error) {
        console.error('Rate limit check error:', error);
        // Fail open - allow upload if rate limiter is down
        return true;
    }
}

/**
 * Helper: Create JSON response
 */
function jsonResponse(data: any, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
        },
    });
}

/**
 * Durable Object: Rate Limiter
 * 
 * Tracks upload count per wallet address per hour
 */
export class RateLimiter {
    private state: DurableObjectState;
    private uploadCount: number = 0;
    private windowStart: number = 0;

    constructor(state: DurableObjectState) {
        this.state = state;
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        // Check if upload is allowed
        if (url.pathname === '/check') {
            const allowed = await this.checkLimit();
            return new Response(JSON.stringify({ allowed }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response('Not found', { status: 404 });
    }

    private async checkLimit(): Promise<boolean> {
        const now = Date.now();
        const ONE_HOUR = 60 * 60 * 1000;
        const MAX_UPLOADS_PER_HOUR = 10;

        // Load state
        const stored = await this.state.storage.get<{ count: number; start: number }>('rateLimit');

        if (stored) {
            this.uploadCount = stored.count;
            this.windowStart = stored.start;
        }

        // Reset window if expired
        if (now - this.windowStart > ONE_HOUR) {
            this.uploadCount = 0;
            this.windowStart = now;
        }

        // Check limit
        if (this.uploadCount >= MAX_UPLOADS_PER_HOUR) {
            return false;
        }

        // Increment counter
        this.uploadCount++;
        await this.state.storage.put('rateLimit', {
            count: this.uploadCount,
            start: this.windowStart,
        });

        return true;
    }
}
