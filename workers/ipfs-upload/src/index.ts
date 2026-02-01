/**
 * IPFS Upload Proxy - Cloudflare Worker
 * 
 * This Worker proxies file uploads to Pinata IPFS.
 * 
 * Security Features:
 * - Token validation (from token issuer)
 * - File size limits (10MB max)
 * - File type validation
 * - Pinata JWT kept server-side only
 */

import { verify } from '@tsndr/cloudflare-worker-jwt';

// Types
interface Env {
    PINATA_JWT: string;
    JWT_SECRET: string;
    MAX_FILE_SIZE: string; // in bytes, e.g. "10485760" for 10MB
}

interface UploadResponse {
    success: true;
    cid: string;
    size: number;
    timestamp: string;
    url: string;
}

interface ErrorResponse {
    success: false;
    error: string;
    code?: string;
}

// Constants
const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const IPFS_GATEWAY = 'https://assets.nilelink.app/ipfs/';
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/json',
    'application/pdf',
    'text/plain',
];

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

        // Route: POST /ipfs/upload - Upload file
        if (url.pathname === '/ipfs/upload' && request.method === 'POST') {
            return handleUpload(request, env);
        }

        // Route: GET /ipfs/status - Health check
        if (url.pathname === '/ipfs/status' && request.method === 'GET') {
            return jsonResponse({
                healthy: true,
                service: 'ipfs-upload-proxy',
                message: 'Upload proxy is operational',
            });
        }

        // 404 for unknown routes
        return jsonResponse(
            { success: false, error: 'Not found', code: 'ROUTE_NOT_FOUND' },
            404
        );
    },
};

/**
 * Handle file upload
 */
async function handleUpload(request: Request, env: Env): Promise<Response> {
    try {
        // Step 1: Validate token
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return jsonResponse(
                { success: false, error: 'Missing or invalid authorization header', code: 'INVALID_AUTH' },
                401
            );
        }

        const token = authHeader.substring(7); // Remove 'Bearer '
        const tokenPayload = await validateToken(token, env.JWT_SECRET);
        if (!tokenPayload) {
            return jsonResponse(
                { success: false, error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
                401
            );
        }

        // Step 2: Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return jsonResponse(
                { success: false, error: 'No file provided', code: 'NO_FILE' },
                400
            );
        }

        // Step 3: Validate file
        const validation = validateFile(file, env);
        if (!validation.valid) {
            return jsonResponse(
                { success: false, error: validation.error!, code: validation.code },
                400
            );
        }

        // Step 4: Prepare metadata
        const name = formData.get('name') as string || file.name;
        const metadataStr = formData.get('metadata') as string;
        let metadata: Record<string, any> = {};

        if (metadataStr) {
            try {
                metadata = JSON.parse(metadataStr);
            } catch (error) {
                console.warn('Invalid metadata JSON, using empty object');
            }
        }

        // Add uploader info to metadata
        metadata.uploadedBy = tokenPayload.walletAddress;
        metadata.uploaderRole = tokenPayload.role;
        metadata.uploadTimestamp = Date.now();

        // Step 5: Upload to Pinata
        const pinataFormData = new FormData();
        pinataFormData.append('file', file);
        pinataFormData.append('pinataMetadata', JSON.stringify({ name, keyvalues: metadata }));

        const pinataResponse = await fetch(PINATA_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.PINATA_JWT}`,
            },
            body: pinataFormData,
        });

        if (!pinataResponse.ok) {
            const errorData = await pinataResponse.text();
            console.error('Pinata upload failed:', errorData);
            return jsonResponse(
                { success: false, error: 'Failed to upload to IPFS', code: 'PINATA_ERROR' },
                500
            );
        }

        const pinataData = await pinataResponse.json() as {
            IpfsHash: string;
            PinSize: number;
            Timestamp: string;
        };

        // Step 6: Return success response
        const response: UploadResponse = {
            success: true,
            cid: pinataData.IpfsHash,
            size: pinataData.PinSize,
            timestamp: pinataData.Timestamp,
            url: `${IPFS_GATEWAY}${pinataData.IpfsHash}`,
        };

        return jsonResponse(response, 200);
    } catch (error) {
        console.error('Upload error:', error);
        return jsonResponse(
            { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
            500
        );
    }
}

/**
 * Validate JWT token
 */
async function validateToken(token: string, secret: string): Promise<any | null> {
    try {
        const isValid = await verify(token, secret);
        if (!isValid) {
            return null;
        }

        // Decode token to get payload
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const payload = JSON.parse(atob(parts[1]));

        // Check expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }

        return payload;
    } catch (error) {
        console.error('Token validation error:', error);
        return null;
    }
}

/**
 * Validate file size and type
 */
function validateFile(
    file: File,
    env: Env
): { valid: boolean; error?: string; code?: string } {
    // Check file size
    const maxSize = parseInt(env.MAX_FILE_SIZE || String(DEFAULT_MAX_FILE_SIZE));
    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`,
            code: 'FILE_TOO_LARGE',
        };
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: `File type not allowed: ${file.type}`,
            code: 'INVALID_FILE_TYPE',
        };
    }

    return { valid: true };
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
