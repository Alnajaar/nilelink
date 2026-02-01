#!/usr/bin/env node

/**
 * Deploy Subgraph Script
 *
 * This script deploys the NileLink subgraph to The Graph hosted service.
 * Run this after deploying contracts to mainnet/testnet.
 *
 * Prerequisites:
 * 1. Deploy contracts and get addresses
 * 2. Update subgraph.yaml with real addresses
 * 3. Install Graph CLI: npm install -g @graphprotocol/graph-cli
 * 4. Authenticate: graph auth --product hosted-service <access-token>
 * 5. Create subgraph: graph create --node https://api.thegraph.com/deploy/ <github-username>/nilelink-<network>
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const NETWORK = process.env.NETWORK || 'matic';
const SUBGRAPH_NAME = `nilelink-${NETWORK}`;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'nilelink';

// Contract addresses (update these after deployment)
const CONTRACT_ADDRESSES = {
  // Update these with actual deployed addresses
  NileLinkProtocol: process.env.NILELINK_PROTOCOL_ADDRESS || "0x0000000000000000000000000000000000000000",
  RestaurantRegistry: process.env.RESTAURANT_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000",
  OrderSettlement: process.env.ORDER_SETTLEMENT_ADDRESS || "0x0000000000000000000000000000000000000000",
  DeliveryCoordinator: process.env.DELIVERY_COORDINATOR_ADDRESS || "0x0000000000000000000000000000000000000000",
  ProofOfDelivery: process.env.PROOF_OF_DELIVERY_ADDRESS || "0x0000000000000000000000000000000000000000",
  SupplierRegistry: process.env.SUPPLIER_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000",
  SupplyChain: process.env.SUPPLY_CHAIN_ADDRESS || "0x0000000000000000000000000000000000000000",
  CurrencyExchange: process.env.CURRENCY_EXCHANGE_ADDRESS || "0x0000000000000000000000000000000000000000",
  DisputeResolution: process.env.DISPUTE_RESOLUTION_ADDRESS || "0x0000000000000000000000000000000000000000",
  FraudDetection: process.env.FRAUD_DETECTION_ADDRESS || "0x0000000000000000000000000000000000000000",
  InvestorVault: process.env.INVESTOR_VAULT_ADDRESS || "0x0000000000000000000000000000000000000000",
  SupplierCredit: process.env.SUPPLIER_CREDIT_ADDRESS || "0x0000000000000000000000000000000000000000",
};

function updateSubgraphYaml() {
  console.log('🔄 Updating subgraph.yaml with contract addresses...');

  const subgraphPath = path.join(__dirname, '..', 'subgraph', 'subgraph.yaml');
  let yamlContent = fs.readFileSync(subgraphPath, 'utf8');

  // Replace placeholder addresses with actual addresses
  Object.entries(CONTRACT_ADDRESSES).forEach(([contractName, address]) => {
    const placeholder = `"0x...placeholder"`;
    const replacement = `"${address}"`;

    // Only replace if it's not the zero address
    if (address !== "0x0000000000000000000000000000000000000000") {
      yamlContent = yamlContent.replace(
        new RegExp(`name: ${contractName}[^}]+address: "${placeholder}"`, 'g'),
        `name: ${contractName}
    network: ${NETWORK}
    source:
      address: "${replacement}"`
      );
    }
  });

  fs.writeFileSync(subgraphPath, yamlContent);
  console.log('✅ subgraph.yaml updated with contract addresses');
}

function validateSubgraph() {
  console.log('🔍 Validating subgraph configuration...');

  try {
    execSync('cd subgraph && graph codegen', { stdio: 'inherit' });
    console.log('✅ Subgraph code generation successful');
  } catch (error) {
    console.error('❌ Subgraph code generation failed:', error.message);
    process.exit(1);
  }

  try {
    execSync('cd subgraph && graph build', { stdio: 'inherit' });
    console.log('✅ Subgraph build successful');
  } catch (error) {
    console.error('❌ Subgraph build failed:', error.message);
    process.exit(1);
  }
}

function deploySubgraph() {
  console.log(`🚀 Deploying subgraph to The Graph hosted service...`);
  console.log(`   Subgraph: ${GITHUB_USERNAME}/${SUBGRAPH_NAME}`);
  console.log(`   Network: ${NETWORK}`);

  try {
    execSync(`cd subgraph && graph deploy --node https://api.thegraph.com/deploy/ --ipfs https://api.thegraph.com/ipfs/ ${GITHUB_USERNAME}/${SUBGRAPH_NAME}`, {
      stdio: 'inherit'
    });
    console.log('✅ Subgraph deployment successful!');
  } catch (error) {
    console.error('❌ Subgraph deployment failed:', error.message);
    process.exit(1);
  }
}

function testQueries() {
  console.log('🧪 Testing GraphQL queries...');

  // This would test basic queries against the deployed subgraph
  // For now, just log that manual testing is needed
  console.log('📋 Manual testing required:');
  console.log('   1. Visit The Graph Explorer');
  console.log('   2. Find your subgraph');
  console.log('   3. Test basic queries like:');
  console.log('      query { orders(first: 5) { id customer restaurant amount } }');
  console.log('   4. Verify data is being indexed correctly');
}

function main() {
  console.log('🎯 Starting NileLink Subgraph Deployment\n');

  // Check if required environment variables are set
  const requiredEnvVars = Object.keys(CONTRACT_ADDRESSES).map(key => `${key.toUpperCase()}_ADDRESS`);
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.log('⚠️  Warning: Contract addresses not provided via environment variables');
    console.log('   Missing:', missingVars.join(', '));
    console.log('   Using placeholder addresses for validation only\n');
  }

  try {
    updateSubgraphYaml();
    validateSubgraph();
    deploySubgraph();
    testQueries();

    console.log('\n🎉 Subgraph deployment completed successfully!');
    console.log('📊 Monitor your subgraph at: https://thegraph.com/explorer');
    console.log('🔗 GraphQL endpoint will be available after indexing completes');

  } catch (error) {
    console.error('\n💥 Subgraph deployment failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { updateSubgraphYaml, validateSubgraph, deploySubgraph, testQueries };