const fs = require('fs');
const path = require('path');

const CONTRACTS_DIR = path.join(__dirname, '../artifacts/contracts');
const APPS = ['pos', 'customer', 'supplier'];
const DEST_BASE = path.join(__dirname, '../web');

const CORE_CONTRACTS = [
    'NileLinkProtocol',
    'core/OrderSettlement',
    'core/RestaurantRegistry',
    'core/CurrencyExchange',
    'core/DisputeResolution',
    'core/FraudDetection',
    'core/InvestorVault',
    'core/SupplierCredit',
    'core/SupplierRegistry',
    'core/DeliveryCoordinator',
    'core/ProofOfDelivery',
    'core/SupplyChain',
    'security/AISecurityOrchestrator',
    'security/CoreAIOracle'
];

function syncAbis() {
    console.log('🔄 Syncing ABIs to web apps...');

    CORE_CONTRACTS.forEach(contractPath => {
        const contractName = path.basename(contractPath);
        const artifactPath = path.join(CONTRACTS_DIR, `${contractPath}.sol/${contractName}.json`);

        if (!fs.existsSync(artifactPath)) {
            console.warn(`⚠️ Artifact not found: ${artifactPath}`);
            return;
        }

        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        const abiOnly = JSON.stringify(artifact.abi, null, 2);

        APPS.forEach(app => {
            const destDir = path.join(DEST_BASE, app, 'src/lib/abis');
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            const destPath = path.join(destDir, `${contractName}.json`);
            fs.writeFileSync(destPath, abiOnly);
            console.log(`✅ Copied ${contractName} ABI to ${app}`);
        });
    });

    console.log('✨ ABI synchronization complete!');
}

syncAbis();
