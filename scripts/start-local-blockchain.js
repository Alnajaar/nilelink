#!/usr/bin/env node

/**
 * Local Blockchain Startup Helper
 *
 * This script helps developers start a local Hardhat blockchain network
 * for development purposes. It checks if Hardhat is available and starts
 * the local node if needed.
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const HARDHAT_CONFIG_PATH = path.join(__dirname, '..', 'hardhat.config.js');

console.log('🔗 NileLink Local Blockchain Helper');
console.log('=====================================\n');

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';
if (!isDevelopment) {
    console.log('ℹ️  Production mode detected. Using configured RPC endpoints.');
    console.log('   Set NODE_ENV=development to use local blockchain.\n');
    process.exit(0);
}

// Check if Hardhat config exists
if (!fs.existsSync(HARDHAT_CONFIG_PATH)) {
    console.log('❌ Hardhat configuration not found.');
    console.log('   Please ensure Hardhat is properly set up.\n');
    console.log('   To install Hardhat:');
    console.log('   npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers\n');
    process.exit(1);
}

// Check if Hardhat is installed
exec('npx hardhat --version', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ Hardhat not found. Please install it:');
        console.log('   npm install --save-dev hardhat\n');
        console.log('   Alternative: Use testnet RPC (already configured)');
        console.log('   The app will automatically fall back to testnet if local node is unavailable.\n');
        process.exit(1);
    }

    console.log('✅ Hardhat found:', stdout.trim());

    // Check if local node is already running
    console.log('\n🔍 Checking if local blockchain is already running...');

    const net = require('net');
    const client = net.createConnection({ port: 8545, host: 'localhost' });

    client.on('connect', () => {
        console.log('✅ Local blockchain already running on port 8545');
        console.log('   No action needed.\n');
        client.end();
        process.exit(0);
    });

    client.on('error', () => {
        console.log('ℹ️  Local blockchain not running. Starting...');

        // Start Hardhat node
        console.log('🚀 Starting Hardhat local node...\n');

        const hardhatProcess = spawn('npx', ['hardhat', 'node'], {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });

        hardhatProcess.on('close', (code) => {
            if (code === 0) {
                console.log('\n✅ Hardhat node stopped successfully.');
            } else {
                console.log(`\n❌ Hardhat node exited with code ${code}`);
            }
        });

        // Give it a moment to start
        setTimeout(() => {
            console.log('\n💡 Tips:');
            console.log('   - Keep this terminal open to keep the blockchain running');
            console.log('   - Deploy contracts: npx hardhat run scripts/deploy.js --network localhost');
            console.log('   - The app will automatically connect once the node is ready');
            console.log('   - Press Ctrl+C to stop the blockchain\n');
        }, 3000);
    });
});