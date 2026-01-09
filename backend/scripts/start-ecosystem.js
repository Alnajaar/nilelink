const { spawn } = require('child_process');
const path = require('path');

/**
 * Orchestration script to start both Backend and AI Service concurrently
 */

const backendDir = path.resolve(__dirname, '..');
const aiServiceDir = path.resolve(__dirname, '../../ai-service');

console.log('🚀 Starting NileLink Ecosystem...');

// 1. Start AI Service (Python FastAPI)
const aiService = spawn('uvicorn', ['app:app', '--host', '0.0.0.0', '--port', '8000'], {
    cwd: aiServiceDir,
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, PYTHONPATH: aiServiceDir }
});

aiService.on('error', (err) => {
    console.error('❌ Failed to start AI Service. Ensure Python and uvicorn are installed.');
    console.error(err);
});

// 2. Start Backend (Node.js/TS)
const backend = spawn('npm', ['run', 'dev'], {
    cwd: backendDir,
    shell: true,
    stdio: 'inherit'
});

backend.on('error', (err) => {
    console.error('❌ Failed to start Backend.');
    console.error(err);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down ecosystem...');
    aiService.kill();
    backend.kill();
    process.exit();
});
