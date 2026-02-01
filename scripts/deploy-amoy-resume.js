const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
    console.log('🚀 Resuming NileLink Protocol deployment to Polygon Amoy Testnet (v2)...');

    const [deployer] = await ethers.getSigners();
    if (!deployer) {
        throw new Error('No deployer account found. Check your PRIVATE_KEY in .env file.');
    }
    console.log('Deploying with account:', deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('Account balance:', ethers.formatEther(balance), 'MATIC');

    const USDC_ADDRESS = process.env.USDC_ADDRESS || '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582';
    const FEE_RECIPIENT = process.env.FEE_RECIPIENT || deployer.address;

    const deploymentInfo = {
        deployer: deployer.address,
        network: 'amoy',
        timestamp: new Date().toISOString(),
        contracts: {
            restaurantRegistry: "0x97F6f067B98F9e9F72024A6079eC3d772Cb0C724",
            orderSettlement: "0x8c77a9d68AF2b6A520e3F399C120a05aC0Bec625",
            currencyExchange: "0x842cb3ef108a6943B4B5Cf183833FE051E260E69",
            fraudDetection: "0xaF3d734b5dcd412ae51A7d212288c8b69BBa48e1"
        }
    };

    try {
        const feeData = await ethers.provider.getFeeData();
        const gasSettings = {
            gasLimit: 5000000,
            maxFeePerGas: feeData.maxFeePerGas ? (feeData.maxFeePerGas * 150n) / 100n : undefined,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? (feeData.maxPriorityFeePerGas * 150n) / 100n : undefined
        };

        const registryAddress = deploymentInfo.contracts.restaurantRegistry;
        const settlementAddress = deploymentInfo.contracts.orderSettlement;

        // 5. Deploy DisputeResolution
        // constructor(address _orderSettlement, address _usdc)
        console.log('\n⚖️ Deploying DisputeResolution...');
        const DisputeResolution = await ethers.getContractFactory('DisputeResolution');
        const disputeResolution = await DisputeResolution.deploy(
            settlementAddress,
            USDC_ADDRESS,
            gasSettings
        );
        await disputeResolution.waitForDeployment();
        const disputeAddress = await disputeResolution.getAddress();
        console.log('DisputeResolution deployed to:', disputeAddress);
        deploymentInfo.contracts.disputeResolution = disputeAddress;

        // 6. Deploy InvestorVault
        // constructor(address _usdc, address _orderSettlement, address _feeRecipient)
        console.log('\n💼 Deploying InvestorVault...');
        const InvestorVault = await ethers.getContractFactory('InvestorVault');
        const investorVault = await InvestorVault.deploy(
            USDC_ADDRESS,
            settlementAddress,
            FEE_RECIPIENT,
            gasSettings
        );
        await investorVault.waitForDeployment();
        const vaultAddress = await investorVault.getAddress();
        console.log('InvestorVault deployed to:', vaultAddress);
        deploymentInfo.contracts.investorVault = vaultAddress;

        // 7. Deploy SupplierCredit
        // constructor(address _usdc)
        console.log('\n🏭 Deploying SupplierCredit...');
        const SupplierCredit = await ethers.getContractFactory('SupplierCredit');
        const supplierCredit = await SupplierCredit.deploy(
            USDC_ADDRESS,
            gasSettings
        );
        await supplierCredit.waitForDeployment();
        const creditAddress = await supplierCredit.getAddress();
        console.log('SupplierCredit deployed to:', creditAddress);
        deploymentInfo.contracts.supplierCredit = creditAddress;

        // Save deployment info
        fs.writeFileSync('./deployment-amoy.json', JSON.stringify(deploymentInfo, null, 2));
        console.log('\n✅ All contracts deployed successfully!');

        // Update backend configurations
        updateBackendConfig(deploymentInfo.contracts, USDC_ADDRESS);

    } catch (error) {
        console.error('\n❌ Resumed deployment failed!');
        console.error('Error:', error.message);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

function updateBackendConfig(contracts, usdcAddress) {
    const envPath = './backend/.env';
    try {
        if (!fs.existsSync(envPath)) {
            console.log('⚠️ Backend .env not found at', envPath);
            return;
        }
        let envContent = fs.readFileSync(envPath, 'utf8');
        const contractMappings = {
            'CONTRACT_RESTAURANT_REGISTRY': contracts.restaurantRegistry,
            'CONTRACT_ORDER_SETTLEMENT': contracts.orderSettlement,
            'CONTRACT_CURRENCY_EXCHANGE': contracts.currencyExchange,
            'CONTRACT_DISPUTE_RESOLUTION': contracts.disputeResolution,
            'CONTRACT_FRAUD_DETECTION': contracts.fraudDetection,
            'CONTRACT_INVESTOR_VAULT': contracts.investorVault,
            'CONTRACT_SUPPLIER_CREDIT': contracts.supplierCredit,
            'CONTRACT_USDC': usdcAddress
        };
        Object.entries(contractMappings).forEach(([key, value]) => {
            const regex = new RegExp(`^${key}=.*`, 'm');
            const newLine = `${key}=${value}`;
            if (envContent.match(regex)) {
                envContent = envContent.replace(regex, newLine);
            } else {
                envContent += `\n${newLine}`;
            }
        });
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Backend .env file updated');
    } catch (error) {
        console.log('⚠️ Failed to update backend configuration:', error.message);
    }
}

main().then(() => process.exit(0)).catch(console.error);
