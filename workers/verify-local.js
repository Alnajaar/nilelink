const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuration
const TOKEN_WORKER_URL = 'http://127.0.0.1:8787';
const UPLOAD_WORKER_URL = 'http://127.0.0.1:8788';

// Mock Data
const MOCK_PRIVATE_KEY = '0x0123456789012345678901234567890123456789012345678901234567890123';
const MOCK_ROLE = 'OWNER';

async function main() {
    console.log('🚀 Starting Local Verification...');

    // 1. Setup Wallet
    const wallet = new ethers.Wallet(MOCK_PRIVATE_KEY);
    console.log(`👤 Mock Wallet Address: ${wallet.address}`);

    // 2. Generate Signature
    const timestamp = Date.now();
    const message = `Upload to IPFS at ${timestamp}`;
    const signature = await wallet.signMessage(message);
    console.log('✍️  Signed Message');

    // 3. Request Token
    console.log('\n🔄 Requesting Upload Token...');
    try {
        const tokenResponse = await fetch(`${TOKEN_WORKER_URL}/ipfs/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                walletAddress: wallet.address,
                signature,
                role: MOCK_ROLE,
                message
            })
        });

        if (!tokenResponse.ok) {
            const err = await tokenResponse.text();
            throw new Error(`Token request failed: ${tokenResponse.status} ${err}`);
        }

        const tokenData = await tokenResponse.json();
        console.log('✅ Token Received!');
        const token = tokenData.token;

        // 4. Upload File
        console.log('\n📤 Uploading Test File...');

        // Create a dummy file
        const testFilePath = path.join(__dirname, 'test-upload.txt');
        fs.writeFileSync(testFilePath, 'Hello IPFS from Local Test!');

        const formData = new FormData();
        const fileBlob = new Blob([fs.readFileSync(testFilePath)], { type: 'text/plain' });
        formData.append('file', fileBlob, 'test-upload.txt');
        formData.append('name', 'test-upload.txt');
        formData.append('metadata', JSON.stringify({ type: 'test', local: true }));

        const uploadResponse = await fetch(`${UPLOAD_WORKER_URL}/ipfs/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!uploadResponse.ok) {
            const err = await uploadResponse.text();
            throw new Error(`Upload failed: ${uploadResponse.status} ${err}`);
        }

        const uploadData = await uploadResponse.json();
        console.log('✅ Upload Successful!');
        console.log('📦 Results:', JSON.stringify(uploadData, null, 2));

        // Cleanup
        fs.unlinkSync(testFilePath);

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.message);
        if (error.cause) console.error(error.cause);
    }
}

main();
