// scripts/deploy.js
const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying NileLink Protocol contracts to localhost...');

  const [deployer, feeRecipient, governance] = await ethers.getSigners();

  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', (await ethers.provider.getBalance(deployer.address)).toString());

  console.log('\n📄 Deploying USDC Mock Token...');
  const USDC = await ethers.getContractFactory('MockUSDC');
  const usdc = await USDC.deploy('USD Coin', 'USDC', 6);
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log('USDC Mock Token deployed to:', usdcAddress);

  console.log('\n🔗 Deploying NileLink Protocol...');
  const NileLinkProtocol = await ethers.getContractFactory('NileLinkProtocol');
  const protocol = await NileLinkProtocol.deploy(usdcAddress, feeRecipient.address);
  await protocol.waitForDeployment();
  const protocolAddress = await protocol.getAddress();
  console.log('NileLink Protocol deployed to:', protocolAddress);

  const addresses = await protocol.getContractAddresses();
  console.log('\n📋 Deployed Contract Addresses:');
  console.log('RestaurantRegistry:', addresses.restaurantRegistry);
  console.log('OrderSettlement:', addresses.orderSettlement);
  console.log('CurrencyExchange:', addresses.currencyExchange);
  console.log('DisputeResolution:', addresses.disputeResolution);
  console.log('FraudDetection:', addresses.fraudDetection);
  console.log('InvestorVault:', addresses.investorVault);
  console.log('SupplierCredit:', addresses.supplierCredit);
  console.log('USDC:', addresses.usdc);
  console.log('Fee Recipient:', addresses.feeRecipient);

  console.log('\n⚙️ Setting up governance...');
  await protocol.setGovernance(governance.address, true);
  console.log('Governance address added:', governance.address);

  console.log('\n🏗️ Deploying individual contracts for direct interaction...');

  const RestaurantRegistry = await ethers.getContractFactory('RestaurantRegistry');
  const restaurantRegistry = await RestaurantRegistry.deploy();
  await restaurantRegistry.waitForDeployment();
  const restaurantRegistryAddress = await restaurantRegistry.getAddress();
  console.log('RestaurantRegistry deployed to:', restaurantRegistryAddress);

  const OrderSettlement = await ethers.getContractFactory('OrderSettlement');
  const orderSettlement = await OrderSettlement.deploy(
    restaurantRegistryAddress,
    usdcAddress,
    feeRecipient.address
  );
  await orderSettlement.waitForDeployment();
  const orderSettlementAddress = await orderSettlement.getAddress();
  console.log('OrderSettlement deployed to:', orderSettlementAddress);

  const CurrencyExchange = await ethers.getContractFactory('CurrencyExchange');
  const currencyExchange = await CurrencyExchange.deploy();
  await currencyExchange.waitForDeployment();
  const currencyExchangeAddress = await currencyExchange.getAddress();
  console.log('CurrencyExchange deployed to:', currencyExchangeAddress);

  const DisputeResolution = await ethers.getContractFactory('DisputeResolution');
  const disputeResolution = await DisputeResolution.deploy(orderSettlementAddress, usdcAddress);
  await disputeResolution.waitForDeployment();
  const disputeResolutionAddress = await disputeResolution.getAddress();
  console.log('DisputeResolution deployed to:', disputeResolutionAddress);

  const FraudDetection = await ethers.getContractFactory('FraudDetection');
  const fraudDetection = await FraudDetection.deploy();
  await fraudDetection.waitForDeployment();
  const fraudDetectionAddress = await fraudDetection.getAddress();
  console.log('FraudDetection deployed to:', fraudDetectionAddress);

  const InvestorVault = await ethers.getContractFactory('InvestorVault');
  const investorVault = await InvestorVault.deploy(usdcAddress, orderSettlementAddress, feeRecipient.address);
  await investorVault.waitForDeployment();
  const investorVaultAddress = await investorVault.getAddress();
  console.log('InvestorVault deployed to:', investorVaultAddress);

  const SupplierCredit = await ethers.getContractFactory('SupplierCredit');
  const supplierCredit = await SupplierCredit.deploy(usdcAddress);
  await supplierCredit.waitForDeployment();
  const supplierCreditAddress = await supplierCredit.getAddress();
  console.log('SupplierCredit deployed to:', supplierCreditAddress);

  const deploymentInfo = {
    protocol: protocolAddress,
    usdc: usdcAddress,
    restaurantRegistry: restaurantRegistryAddress,
    orderSettlement: orderSettlementAddress,
    currencyExchange: currencyExchangeAddress,
    disputeResolution: disputeResolutionAddress,
    fraudDetection: fraudDetectionAddress,
    investorVault: investorVaultAddress,
    supplierCredit: supplierCreditAddress,
    feeRecipient: feeRecipient.address,
    governance: governance.address,
    deployer: deployer.address,
    network: 'localhost',
    blockNumber: await ethers.provider.getBlockNumber()
  };

  console.log('\n💾 Saving deployment information...');
  const fs = require('fs');
  fs.writeFileSync('./deployment-localhost.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('Deployment info saved to deployment-localhost.json');

  console.log('\n✅ Deployment complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
