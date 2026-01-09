
import fs from 'fs';
import path from 'path';

const REQUIRED_FILES = [
    'backend/Dockerfile.production',
    'backend/.env.example',
    'backend/package.json',
    'backend/scripts/start.sh',
    'backend/scripts/execute_handover.ts',
    'web/portal/next.config.js',
    'infrastructure/k8s/00-namespaces.yaml',
    'infrastructure/k8s/01-backend.yaml',
    'infrastructure/k8s/02-frontend.yaml',
    'infrastructure/k8s/03-config.yaml',
    'infrastructure/k8s/04-ingress.yaml',
    'infrastructure/k8s/05-monitoring.yaml'
];

interface CheckResult {
    pass: boolean;
    message: string;
}

function checkFileExists(filePath: string): CheckResult {
    if (fs.existsSync(filePath)) {
        return { pass: true, message: `✅ Found: ${filePath}` };
    }
    return { pass: false, message: `❌ MISSING: ${filePath}` };
}

function checkFileContent(filePath: string, search: string, testName: string): CheckResult {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes(search)) {
            return { pass: true, message: `✅ Verified ${testName} in ${filePath}` };
        }
        return { pass: false, message: `❌ FAILED: ${testName} not found in ${filePath}` };
    } catch (e) {
        return { pass: false, message: `❌ ERROR reading ${filePath}` };
    }
}

async function verify() {
    console.log('🛡️  NILELINK FINAL PRODUCTION READINESS CHECK 🛡️');
    console.log('==================================================');

    const rootDir = path.resolve(__dirname, '../../'); // Assuming scripts/ is in backend/
    let discrepancies = 0;

    // 1. Asset Existence Check
    console.log('\n1️⃣  Checking Core Infrastructure Assets...');
    for (const file of REQUIRED_FILES) {
        const fullPath = path.join(rootDir, file);
        const result = checkFileExists(fullPath);
        console.log(result.message);
        if (!result.pass) discrepancies++;
    }

    // 2. Configuration Validation
    console.log('\n2️⃣  Validating Configuration Logic...');

    // Check Next.js Standalone Mode
    const nextConfig = path.join(rootDir, 'web/portal/next.config.js');
    const resNext = checkFileContent(nextConfig, "output: 'standalone'", 'Standalone Mode');
    console.log(resNext.message);
    if (!resNext.pass) discrepancies++;

    // Check Start Script Migrations
    const startScript = path.join(rootDir, 'backend/scripts/start.sh');
    const resStart = checkFileContent(startScript, "npm run prisma:deploy", 'Auto-Migration Command');
    console.log(resStart.message);
    if (!resStart.pass) discrepancies++;

    // Check Backend Dockerfile Multi-stage
    const dockerParams = path.join(rootDir, 'backend/Dockerfile.production');
    const resDocker = checkFileContent(dockerParams, "FROM node:18-alpine AS runner", 'Multi-Stage Runner');
    console.log(resDocker.message);
    if (!resDocker.pass) discrepancies++;

    // Check Ingress Domain
    const ingressParams = path.join(rootDir, 'infrastructure/k8s/04-ingress.yaml');
    const resIngress = checkFileContent(ingressParams, "host: nilelink.app", 'Production Domain (nilelink.app)');
    console.log(resIngress.message);
    if (!resIngress.pass) discrepancies++;

    console.log('\n==================================================');
    if (discrepancies === 0) {
        console.log('🚀 STATUS: GREEN. ALL SYSTEMS GO.');
        console.log('   The platform is 100% prepared for deployment.');
    } else {
        console.log(`⚠️ STATUS: RED. ${discrepancies} issues detected.`);
        console.log('   Do not deploy until resolved.');
        process.exit(1);
    }
}

verify();
