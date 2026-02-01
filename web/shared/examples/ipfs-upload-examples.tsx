/**
 * Example: How to Use IPFS Upload in Your Components
 * 
 * This file demonstrates the secure IPFS upload implementation
 * using the server-side API route.
 */

import { useIPFSUpload } from '@/hooks/useIPFSUpload';
import { uploadToIPFS, uploadJSONToIPFS } from '@/lib/ipfs';

// ============================================
// Example 1: Using the React Hook (Recommended)
// ============================================

export function FileUploadComponent() {
    const { upload, isUploading, progress, error, result } = useIPFSUpload();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const result = await upload({
                file,
                name: `restaurant-menu-${Date.now()}.jpg`,
                metadata: {
                    restaurantId: '12345',
                    type: 'menu',
                    uploadedAt: Date.now(),
                },
            });

            console.log('✅ Upload successful!');
            console.log('IPFS Hash:', result.ipfsHash);
            console.log('Gateway URL:', result.url);
            console.log('File Size:', result.pinSize, 'bytes');

            // You can now save the IPFS hash to your database
            // or use the gateway URL to display the file
        } catch (err) {
            console.error('❌ Upload failed:', err);
        }
    };

    return (
        <div className="upload-container">
            <input
                type="file"
                onChange={handleFileChange}
                disabled={isUploading}
                accept="image/*"
            />

            {isUploading && (
                <div className="progress-bar">
                    <div style={{ width: `${progress}%` }} />
                    <span>{progress}% uploaded</span>
                </div>
            )}

            {error && (
                <div className="error-message">
                    ❌ Error: {error}
                </div>
            )}

            {result && (
                <div className="success-message">
                    ✅ Upload successful!
                    <p>IPFS Hash: {result.ipfsHash}</p>
                    <img src={result.url} alt="Uploaded file" />
                </div>
            )}
        </div>
    );
}

// ============================================
// Example 2: Upload JSON Data (Menu, Orders, etc.)
// ============================================

export async function uploadRestaurantMenu(menuData: any) {
    try {
        const result = await uploadJSONToIPFS(
            menuData,
            'restaurant-menu.json',
            {
                restaurantId: menuData.restaurantId,
                version: menuData.version,
                type: 'menu',
            }
        );

        console.log('Menu uploaded to IPFS:', result.url);
        return result.ipfsHash; // Save this to blockchain
    } catch (error) {
        console.error('Failed to upload menu:', error);
        throw error;
    }
}

// ============================================
// Example 3: Upload Order Receipt
// ============================================

export async function uploadOrderReceipt(orderData: any) {
    const receipt = {
        orderId: orderData.id,
        items: orderData.items,
        total: orderData.total,
        timestamp: Date.now(),
        restaurant: orderData.restaurant,
        customer: orderData.customer,
    };

    try {
        const result = await uploadJSONToIPFS(
            receipt,
            `receipt-${orderData.id}.json`,
            {
                orderId: orderData.id,
                type: 'receipt',
            }
        );

        return result.ipfsHash;
    } catch (error) {
        console.error('Failed to upload receipt:', error);
        throw error;
    }
}

// ============================================
// Example 4: Upload Restaurant Logo/Images
// ============================================

export function RestaurantLogoUpload({ restaurantId }: { restaurantId: string }) {
    const { upload, isUploading, progress, result } = useIPFSUpload();

    const handleLogoUpload = async (file: File) => {
        const result = await upload({
            file,
            name: `restaurant-logo-${restaurantId}.${file.name.split('.').pop()}`,
            metadata: {
                restaurantId,
                type: 'logo',
            },
        });

        // Save the IPFS hash to your database
        await fetch('/api/restaurants/update-logo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                restaurantId,
                logoIpfsHash: result.ipfsHash,
                logoUrl: result.url,
            }),
        });
    };

    return (
        <div>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                }}
                disabled={isUploading}
            />

            {isUploading && <p>Uploading: {progress}%</p>}
            {result && <img src={result.url} alt="Restaurant logo" />}
        </div>
    );
}

// ============================================
// Example 5: Direct API Call (without hook)
// ============================================

export async function uploadProductImage(file: File, productId: string) {
    try {
        const result = await uploadToIPFS({
            file,
            name: `product-${productId}.jpg`,
            metadata: {
                productId,
                type: 'product-image',
            },
            onProgress: (progress) => {
                console.log(`Upload progress: ${progress}%`);
            },
        });

        return result;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}

// ============================================
// Example 6: Drag & Drop Upload
// ============================================

export function DragDropUpload() {
    const { upload, isUploading, progress, result } = useIPFSUpload();
    const [isDragging, setIsDragging] = React.useState(false);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (!file) return;

        await upload({ file });
    };

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
                border: isDragging ? '2px dashed blue' : '2px dashed gray',
                padding: '2rem',
            }}
        >
            {isUploading ? (
                <p>Uploading: {progress}%</p>
            ) : (
                <p>Drag & drop a file here</p>
            )}

            {result && (
                <div>
                    <p>✅ Uploaded!</p>
                    <a href={result.url} target="_blank" rel="noopener noreferrer">
                        View on IPFS
                    </a>
                </div>
            )}
        </div>
    );
}
