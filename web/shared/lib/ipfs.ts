/**
 * IPFS Upload Utility - Cloudflare Worker Based (Phase 1)
 * 
 * This utility provides secure IPFS uploads through Cloudflare Workers.
 * NO Pinata secrets are exposed to the frontend.
 * 
 * Flow:
 * 1. Request temp upload token from Worker (requires wallet signature)
 * 2. Upload file to Worker with token
 * 3. Worker proxies to Pinata using server-side PINATA_JWT
 * 4. Receive CID and store on-chain
 * 
 * Architecture: Static Frontend + Cloudflare Workers (NO Next.js API routes)
 */

// Worker endpoint (will be deployed to edge.nilelink.app)
const WORKER_BASE_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'https://edge.nilelink.app';
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://assets.nilelink.app/ipfs/';

// ============================================
// Type Definitions
// ============================================

export interface UploadTokenRequest {
    walletAddress: string;
    signature: string;
    role: string;
    message: string;
}

export interface UploadTokenResponse {
    token: string;
    expiresAt: number;
}

export interface IPFSUploadOptions {
    /** The file to upload */
    file: File;
    /** Upload token from requestUploadToken() */
    token: string;
    /** Optional custom name for the file */
    name?: string;
    /** Optional metadata key-value pairs */
    metadata?: Record<string, string | number | boolean>;
    /** Progress callback (0-100) */
    onProgress?: (progress: number) => void;
}

export interface IPFSUploadResult {
    success: boolean;
    /** The IPFS hash (CID) */
    cid: string;
    /** Size of the uploaded file in bytes */
    size: number;
    /** Upload timestamp */
    timestamp: string;
    /** Full URL to access the file via gateway */
    url: string;
}

export interface IPFSError {
    error: string;
    code?: string;
    details?: any;
}

// ============================================
// Token Management
// ============================================

/**
 * Request a temporary upload token from the Cloudflare Worker
 * 
 * This token is required to upload files to IPFS.
 * Tokens expire after 5 minutes.
 * 
 * @param walletAddress - User's wallet address
 * @param signature - Signed message from wallet
 * @param role - User's role (OWNER or MANAGER required for uploads)
 * @param message - Message that was signed
 * 
 * @example
 * ```typescript
 * const message = `Upload to IPFS at ${Date.now()}`;
 * const signature = await signMessage(message);
 * const { token } = await requestUploadToken(address, signature, 'OWNER', message);
 * ```
 */
export async function requestUploadToken(
    walletAddress: string,
    signature: string,
    role: string,
    message: string
): Promise<UploadTokenResponse> {
    try {
        const response = await fetch(`${WORKER_BASE_URL}/ipfs/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                walletAddress,
                signature,
                role,
                message,
            } as UploadTokenRequest),
        });

        if (!response.ok) {
            const error: IPFSError = await response.json();
            throw new Error(error.error || 'Failed to get upload token');
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to request upload token:', error);
        throw error;
    }
}

// ============================================
// File Upload
// ============================================

/**
 * Upload a file to IPFS via the Cloudflare Worker
 * 
 * Requires a valid upload token from requestUploadToken().
 * Max file size: 10MB (enforced by Worker).
 * 
 * @param options - Upload options including file, token, and metadata
 * @returns IPFS upload result with CID and gateway URL
 * 
 * @example
 * ```typescript
 * const result = await uploadToIPFS({
 *   file: myFile,
 *   token: uploadToken,
 *   name: 'menu.json',
 *   metadata: { restaurantId: '123', type: 'menu' },
 *   onProgress: (progress) => console.log(`${progress}% uploaded`)
 * });
 * 
 * console.log('IPFS CID:', result.cid);
 * console.log('Gateway URL:', result.url);
 * ```
 */
export async function uploadToIPFS(
    options: IPFSUploadOptions
): Promise<IPFSUploadResult> {
    const { file, token, name, metadata, onProgress } = options;

    // Validate inputs
    if (!file) {
        throw new Error('File is required');
    }

    if (!token) {
        throw new Error('Upload token is required');
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);

    if (name) {
        formData.append('name', name);
    }

    if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
    }

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        if (onProgress) {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    onProgress(percentComplete);
                }
            });
        }

        // Handle completion
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                try {
                    const result: IPFSUploadResult = JSON.parse(xhr.responseText);
                    resolve(result);
                } catch (error) {
                    reject(new Error('Failed to parse response'));
                }
            } else {
                try {
                    const error: IPFSError = JSON.parse(xhr.responseText);
                    reject(new Error(error.error || `Upload failed with status ${xhr.status}`));
                } catch {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
            reject(new Error('Upload aborted'));
        });

        // Send request
        xhr.open('POST', `${WORKER_BASE_URL}/ipfs/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
    });
}

// ============================================
// JSON Upload Helper
// ============================================

/**
 * Upload JSON data to IPFS
 * 
 * Convenience method for uploading JSON objects.
 * Automatically converts to File and uploads.
 * 
 * @param data - JSON data to upload
 * @param token - Upload token from requestUploadToken()
 * @param fileName - Name for the JSON file
 * @param metadata - Optional metadata
 * 
 * @example
 * ```typescript
 * const menu = { items: [...], prices: [...] };
 * const result = await uploadJSONToIPFS(menu, token, 'menu.json', {
 *   restaurantId: '123'
 * });
 * ```
 */
export async function uploadJSONToIPFS(
    data: any,
    token: string,
    fileName: string = 'data.json',
    metadata?: Record<string, string | number | boolean>
): Promise<IPFSUploadResult> {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const file = new File([blob], fileName, { type: 'application/json' });

    return uploadToIPFS({
        file,
        token,
        name: fileName,
        metadata,
    });
}

// ============================================
// Gateway Helpers
// ============================================

/**
 * Get the full IPFS gateway URL for a given CID
 * 
 * @param cid - IPFS CID (hash)
 * @returns Full gateway URL
 * 
 * @example
 * ```typescript
 * const url = getIPFSUrl('QmXxxx...');
 * // Returns: https://assets.nilelink.app/ipfs/QmXxxx...
 * ```
 */
export function getIPFSUrl(cid: string): string {
    if (!cid) {
        throw new Error('CID is required');
    }

    return `${IPFS_GATEWAY}${cid}`;
}

/**
 * Extract CID from a full IPFS URL
 * 
 * @param url - Full IPFS URL
 * @returns CID hash
 * 
 * @example
 * ```typescript
 * const cid = extractCID('https://assets.nilelink.app/ipfs/QmXxxx...');
 * // Returns: QmXxxx...
 * ```
 */
export function extractCID(url: string): string {
    if (!url) {
        throw new Error('URL is required');
    }

    // Handle various IPFS URL formats
    const patterns = [
        /\/ipfs\/([a-zA-Z0-9]+)/,
        /ipfs:\/\/([a-zA-Z0-9]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }

    // Maybe it's already just a CID
    if (url.startsWith('Qm') || url.startsWith('bafy')) {
        return url;
    }

    throw new Error('Invalid IPFS URL format');
}

// ============================================
// Worker Status Check
// ============================================

/**
 * Check if the IPFS Worker is available and healthy
 * 
 * @returns Worker status
 * 
 * @example
 * ```typescript
 * const status = await checkWorkerStatus();
 * if (status.healthy) {
 *   console.log('Worker is ready');
 * }
 * ```
 */
export async function checkWorkerStatus(): Promise<{
    healthy: boolean;
    message: string;
}> {
    try {
        const response = await fetch(`${WORKER_BASE_URL}/ipfs/status`);

        if (!response.ok) {
            return {
                healthy: false,
                message: 'Worker is not responding',
            };
        }

        return await response.json();
    } catch (error) {
        return {
            healthy: false,
            message: 'Failed to connect to Worker',
        };
    }
}
