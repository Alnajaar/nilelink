import { useState, useCallback } from 'react';
import {
    requestUploadToken,
    uploadToIPFS,
    uploadJSONToIPFS,
    IPFSUploadOptions,
    IPFSUploadResult
} from '../lib/ipfs';

export interface UseIPFSUploadState {
    /** Whether an upload is in progress */
    isUploading: boolean;
    /** Upload progress (0-100) */
    progress: number;
    /** Error message if upload failed */
    error: string | null;
    /** Result of the last successful upload */
    result: IPFSUploadResult | null;
    /** Whether currently requesting upload token */
    isRequestingToken: boolean;
}

export interface UseIPFSUploadOptions {
    /** Wallet address for authentication */
    walletAddress?: string;
    /** Function to sign messages with wallet */
    signMessage?: (message: string) => Promise<string>;
    /** User's role (OWNER, MANAGER, etc.) */
    role?: string;
}

export interface UseIPFSUploadReturn extends UseIPFSUploadState {
    /** Upload a file to IPFS */
    upload: (file: File, metadata?: Record<string, string | number | boolean>) => Promise<IPFSUploadResult>;
    /** Upload JSON data to IPFS */
    uploadJSON: (data: any, fileName?: string, metadata?: Record<string, string | number | boolean>) => Promise<IPFSUploadResult>;
    /** Reset the upload state */
    reset: () => void;
}

/**
 * React hook for uploading files to IPFS via Cloudflare Workers
 * 
 * This hook handles the entire upload flow:
 * 1. Request upload token (wallet signature required)
 * 2. Upload file with token
 * 3. Return CID for on-chain storage
 * 
 * @param options - Configuration including wallet address and sign function
 * 
 * @example
 * ```tsx
 * import { useAccount, useSignMessage } from 'wagmi';
 * 
 * function MyComponent() {
 *   const { address } = useAccount();
 *   const { signMessageAsync } = useSignMessage();
 *   const { role } = useAuth(); // Your role from context
 * 
 *   const { upload, isUploading, progress, error, result } = useIPFSUpload({
 *     walletAddress: address,
 *     signMessage: signMessageAsync,
 *     role
 *   });
 * 
 *   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 *     const file = e.target.files?.[0];
 *     if (!file) return;
 * 
 *     try {
 *       const result = await upload(file, {
 *         type: 'menu',
 *         restaurantId: '123'
 *       });
 *       
 *       console.log('Uploaded to IPFS:', result.cid);
 *       // Store CID on-chain here
 *     } catch (err) {
 *       console.error('Upload failed:', err);
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       <input type="file" onChange={handleFileChange} disabled={isUploading} />
 *       {isUploading && <p>Uploading: {progress}%</p>}
 *       {error && <p>Error: {error}</p>}
 *       {result && <p>Success! CID: {result.cid}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useIPFSUpload(options: UseIPFSUploadOptions = {}): UseIPFSUploadReturn {
    const { walletAddress, signMessage, role } = options;

    const [state, setState] = useState<UseIPFSUploadState>({
        isUploading: false,
        progress: 0,
        error: null,
        result: null,
        isRequestingToken: false,
    });

    /**
     * Upload a file to IPFS
     */
    const upload = useCallback(
        async (file: File, metadata?: Record<string, string | number | boolean>) => {
            // Validate prerequisites
            if (!walletAddress) {
                throw new Error('Wallet address is required for IPFS upload');
            }

            if (!signMessage) {
                throw new Error('Sign message function is required for IPFS upload');
            }

            if (!role) {
                throw new Error('User role is required for IPFS upload');
            }

            // Reset state
            setState({
                isUploading: false,
                progress: 0,
                error: null,
                result: null,
                isRequestingToken: true,
            });

            try {
                // Step 1: Request upload token
                const message = `Upload to IPFS at ${Date.now()}`;
                const signature = await signMessage(message);

                const { token } = await requestUploadToken(
                    walletAddress,
                    signature,
                    role,
                    message
                );

                // Step 2: Upload file
                setState((prev) => ({
                    ...prev,
                    isRequestingToken: false,
                    isUploading: true,
                }));

                const result = await uploadToIPFS({
                    file,
                    token,
                    name: file.name,
                    metadata,
                    onProgress: (progress) => {
                        setState((prev) => ({ ...prev, progress }));
                    },
                });

                // Step 3: Success
                setState({
                    isUploading: false,
                    isRequestingToken: false,
                    progress: 100,
                    error: null,
                    result,
                });

                return result;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Upload failed';

                setState({
                    isUploading: false,
                    isRequestingToken: false,
                    progress: 0,
                    error: errorMessage,
                    result: null,
                });

                throw error;
            }
        },
        [walletAddress, signMessage, role]
    );

    /**
     * Upload JSON data to IPFS
     */
    const uploadJSON = useCallback(
        async (
            data: any,
            fileName: string = 'data.json',
            metadata?: Record<string, string | number | boolean>
        ) => {
            // Validate prerequisites
            if (!walletAddress) {
                throw new Error('Wallet address is required for IPFS upload');
            }

            if (!signMessage) {
                throw new Error('Sign message function is required for IPFS upload');
            }

            if (!role) {
                throw new Error('User role is required for IPFS upload');
            }

            // Reset state
            setState({
                isUploading: false,
                progress: 0,
                error: null,
                result: null,
                isRequestingToken: true,
            });

            try {
                // Step 1: Request upload token
                const message = `Upload to IPFS at ${Date.now()}`;
                const signature = await signMessage(message);

                const { token } = await requestUploadToken(
                    walletAddress,
                    signature,
                    role,
                    message
                );

                // Step 2: Upload JSON
                setState((prev) => ({
                    ...prev,
                    isRequestingToken: false,
                    isUploading: true,
                }));

                const result = await uploadJSONToIPFS(data, token, fileName, metadata);

                // Step 3: Success
                setState({
                    isUploading: false,
                    isRequestingToken: false,
                    progress: 100,
                    error: null,
                    result,
                });

                return result;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Upload failed';

                setState({
                    isUploading: false,
                    isRequestingToken: false,
                    progress: 0,
                    error: errorMessage,
                    result: null,
                });

                throw error;
            }
        },
        [walletAddress, signMessage, role]
    );

    /**
     * Reset upload state
     */
    const reset = useCallback(() => {
        setState({
            isUploading: false,
            progress: 0,
            error: null,
            result: null,
            isRequestingToken: false,
        });
    }, []);

    return {
        ...state,
        upload,
        uploadJSON,
        reset,
    };
}
