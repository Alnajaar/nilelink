import { NextRequest, NextResponse } from 'next/server';

/**
 * Secure IPFS Upload API Route
 * 
 * This endpoint handles file uploads to Pinata IPFS using server-side credentials.
 * The PINATA_JWT is kept secure on the server and never exposed to the client.
 * 
 * @route POST /api/ipfs/upload
 */
export async function POST(request: NextRequest) {
    try {
        // Verify that PINATA_JWT is configured
        const pinataJWT = process.env.PINATA_JWT;

        if (!pinataJWT || pinataJWT === 'your_new_regenerated_jwt_token_here') {
            console.error('PINATA_JWT not configured');
            return NextResponse.json(
                { error: 'IPFS service not configured' },
                { status: 500 }
            );
        }

        // Get the file from the request
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Optional metadata
        const name = formData.get('name') as string || file.name;
        const keyvalues = formData.get('keyvalues') as string;

        // Prepare the form data for Pinata
        const pinataFormData = new FormData();
        pinataFormData.append('file', file);

        // Add metadata
        const metadata = JSON.stringify({
            name,
            keyvalues: keyvalues ? JSON.parse(keyvalues) : {},
        });
        pinataFormData.append('pinataMetadata', metadata);

        // Upload to Pinata
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${pinataJWT}`,
            },
            body: pinataFormData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Pinata upload failed:', errorData);
            return NextResponse.json(
                { error: 'Failed to upload to IPFS', details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Return the IPFS hash (CID) and full gateway URL
        const ipfsGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

        return NextResponse.json({
            success: true,
            ipfsHash: data.IpfsHash,
            pinSize: data.PinSize,
            timestamp: data.Timestamp,
            url: `${ipfsGateway}${data.IpfsHash}`,
        });

    } catch (error) {
        console.error('IPFS upload error:', error);
        return NextResponse.json(
            { error: 'Internal server error during IPFS upload' },
            { status: 500 }
        );
    }
}

/**
 * Health check endpoint
 */
export async function GET() {
    const isConfigured = process.env.PINATA_JWT &&
        process.env.PINATA_JWT !== 'your_new_regenerated_jwt_token_here';

    return NextResponse.json({
        status: isConfigured ? 'ready' : 'not_configured',
        message: isConfigured
            ? 'IPFS upload service is ready'
            : 'PINATA_JWT environment variable not configured',
    });
}
