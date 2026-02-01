#!/usr/bin/env node

/**
 * NileLink Deployment Readiness Validator
 * Comprehensive validation script to ensure all systems are ready for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentValidator {
  constructor() {
    this.results = {
      passed: [],
      warnings: [],
      errors: [],
      critical: []
    };
    this.rootDir = path.resolve(__dirname, '..');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️ ',
      success: '✅',
      warning: '⚠️ ',
      error: '❌',
      critical: '🚨'
    }[type] || 'ℹ️ ';

    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  validateFileExists(filePath, description) {
    const fullPath = path.resolve(this.rootDir, filePath);
    if (fs.existsSync(fullPath)) {
      this.results.passed.push(`${description}: ${filePath}`);
      return true;
    } else {
      this.results.errors.push(`${description} missing: ${filePath}`);
      return false;
    }
  }

  validateDirectoryExists(dirPath, description) {
    const fullPath = path.resolve(this.rootDir, dirPath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      this.results.passed.push(`${description}: ${dirPath}`);
      return true;
    } else {
      this.results.errors.push(`${description} missing: ${dirPath}`);
      return false;
    }
  }

  validateFileContent(filePath, searchStrings, description) {
    try {
      const fullPath = path.resolve(this.rootDir, filePath);
      const content = fs.readFileSync(fullPath, 'utf8');

      let allFound = true;
      searchStrings.forEach(searchString => {
        if (!content.includes(searchString)) {
          allFound = false;
          this.results.errors.push(`${description} - missing content "${searchString}" in ${filePath}`);
        }
      });

      if (allFound) {
        this.results.passed.push(`${description}: ${filePath}`);
      }
      return allFound;
    } catch (error) {
      this.results.errors.push(`${description} - cannot read ${filePath}: ${error.message}`);
      return false;
    }
  }

  validateCommand(command, description) {
    try {
      execSync(command, { cwd: this.rootDir, stdio: 'pipe' });
      this.results.passed.push(`${description}: ${command}`);
      return true;
    } catch (error) {
      this.results.errors.push(`${description} failed: ${command} - ${error.message}`);
      return false;
    }
  }

  validatePOSCoreSystem() {
    this.log('Validating POS Core System...', 'info');

    // Core engine files
    const coreFiles = [
      'web/pos/src/lib/core/POSEngine.ts',
      'web/pos/src/lib/core/EventBus.ts',
      'web/pos/src/lib/core/HAL.ts',
      'web/pos/src/lib/core/ProductInventoryEngine.ts',
      'web/pos/src/lib/core/PricingEngine.ts',
      'web/pos/src/lib/core/TaxEngine.ts',
      'web/pos/src/lib/core/SyncEngine.ts',
      'web/pos/src/lib/core/ComplianceEngine.ts',
      'web/pos/src/lib/core/BusinessTypeResolver.ts',
      'web/pos/src/lib/core/POSKernel.ts'
    ];

    coreFiles.forEach(file => {
      this.validateFileExists(file, 'Core engine file');
    });

    // Check for key exports
    this.validateFileContent('web/pos/src/lib/core/POSKernel.ts', ['export const posKernel'], 'POS Kernel export');
    this.validateFileContent('web/pos/src/lib/core/EventBus.ts', ['export const eventBus'], 'Event Bus export');
    this.validateFileContent('web/pos/src/lib/core/HAL.ts', ['export const hal'], 'HAL export');
  }

  validateAdaptiveUI() {
    this.log('Validating Adaptive UI System...', 'info');

    // Personality components
    const personalityFiles = [
      'web/pos/src/lib/ui/AdaptivePOSPersonality.tsx',
      'web/pos/src/components/personalities/RestaurantHeader.tsx',
      'web/pos/src/components/personalities/RetailHeader.tsx',
      'web/pos/src/components/personalities/SupermarketHeader.tsx',
      'web/pos/src/components/personalities/RestaurantProductGrid.tsx'
    ];

    personalityFiles.forEach(file => {
      this.validateFileExists(file, 'Personality component');
    });

    // Main POS layout
    this.validateFileExists('web/pos/src/components/advanced/AdvancedPOSLayout.tsx', 'Advanced POS Layout');
  }

  validateAISystem() {
    this.log('Validating AI System...', 'info');

    const aiFiles = [
      'web/pos/src/lib/ai/POSAIAssistant.tsx',
      'web/pos/src/components/ai/AIAssistantPanel.tsx'
    ];

    aiFiles.forEach(file => {
      this.validateFileExists(file, 'AI component');
    });

    // Check AI learning data structure
    this.validateFileContent('web/pos/src/lib/ai/POSAIAssistant.tsx', ['learningData'], 'AI learning system');
  }

  validateFeedbackSystem() {
    this.log('Validating Feedback System...', 'info');

    this.validateFileExists('web/pos/src/lib/ui/FeedbackSystem.tsx', 'Feedback system');

    // Check for haptic and audio support
    this.validateFileContent('web/pos/src/lib/ui/FeedbackSystem.tsx', ['vibrate', 'speechSynthesis'], 'Feedback APIs');
  }

  validateBackendSystem() {
    this.log('Validating Backend System...', 'info');

    const backendFiles = [
      'backend/src/app.ts',
      'backend/src/services/BlockchainService.ts',
      'backend/src/services/DatabasePoolService.ts',
      'backend/src/api/routes/auth.ts'
    ];

    backendFiles.forEach(file => {
      this.validateFileExists(file, 'Backend component');
    });
  }

  validateConfiguration() {
    this.log('Validating Configuration...', 'info');

    // Check for environment files
    const envFiles = [
      'backend/.env.example',
      'web/pos/.env.example'
    ];

    envFiles.forEach(file => {
      this.validateFileExists(file, 'Environment configuration');
    });

    // Check package.json files
    const packageFiles = [
      'backend/package.json',
      'web/pos/package.json',
      'web/super-admin/package.json',
      'web/customer/package.json'
    ];

    packageFiles.forEach(file => {
      this.validateFileExists(file, 'Package configuration');
    });
  }

  validateDeploymentScripts() {
    this.log('Validating Deployment Scripts...', 'info');

    const scriptFiles = [
      'docker-compose.yml',
      'Makefile',
      'scripts/start-dev.sh',
      'scripts/deploy-amoy.js'
    ];

    scriptFiles.forEach(file => {
      this.validateFileExists(file, 'Deployment script');
    });
  }

  validateComplianceReadiness() {
    this.log('Validating Compliance Readiness...', 'info');

    // Check for key compliance implementations
    this.validateFileContent('web/pos/src/lib/core/ComplianceEngine.ts', ['GDPR', 'CCPA', 'PCI DSS'], 'Compliance frameworks');
    this.validateFileContent('web/pos/src/lib/core/TaxEngine.ts', ['VAT', 'GST', 'Sales Tax'], 'Tax systems');
  }

  validateWeb3Integration() {
    this.log('Validating Web3 Integration...', 'info');

    this.validateFileExists('backend/src/services/BlockchainService.ts', 'Blockchain service');
    this.validateFileContent('backend/src/services/BlockchainService.ts', ['Web3', 'Ethereum'], 'Web3 integration');
  }

  generateReport() {
    this.log('\n' + '='.repeat(60), 'info');
    this.log('DEPLOYMENT READINESS REPORT', 'info');
    this.log('='.repeat(60), 'info');

    console.log(`\n✅ PASSED: ${this.results.passed.length} checks`);
    this.results.passed.forEach(item => console.log(`   ${item}`));

    if (this.results.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS: ${this.results.warnings.length} issues`);
      this.results.warnings.forEach(item => console.log(`   ${item}`));
    }

    if (this.results.errors.length > 0) {
      console.log(`\n❌ ERRORS: ${this.results.errors.length} issues`);
      this.results.errors.forEach(item => console.log(`   ${item}`));
    }

    if (this.results.critical.length > 0) {
      console.log(`\n🚨 CRITICAL: ${this.results.critical.length} issues`);
      this.results.critical.forEach(item => console.log(`   ${item}`));
    }

    const totalIssues = this.results.errors.length + this.results.critical.length;
    const successRate = ((this.results.passed.length) / (this.results.passed.length + totalIssues) * 100).toFixed(1);

    console.log(`\n📊 SUCCESS RATE: ${successRate}%`);

    if (totalIssues === 0) {
      this.log('\n🎉 DEPLOYMENT READY! All systems validated successfully.', 'success');
      this.log('🚀 Ready for production deployment to NileLink decentralized ecosystem.', 'success');
      return true;
    } else {
      this.log(`\n⚠️  DEPLOYMENT BLOCKED: ${totalIssues} issues must be resolved.`, 'error');
      return false;
    }
  }

  async runValidation() {
    this.log('Starting NileLink Deployment Readiness Validation...', 'info');
    this.log('Validating complete decentralized POS ecosystem...', 'info');

    try {
      // Run all validation checks
      this.validatePOSCoreSystem();
      this.validateAdaptiveUI();
      this.validateAISystem();
      this.validateFeedbackSystem();
      this.validateBackendSystem();
      this.validateConfiguration();
      this.validateDeploymentScripts();
      this.validateComplianceReadiness();
      this.validateWeb3Integration();

      // Additional checks
      this.validateCommand('node --version', 'Node.js availability');
      this.validateCommand('npm --version', 'NPM availability');

      return this.generateReport();

    } catch (error) {
      this.log(`Validation failed with error: ${error.message}`, 'critical');
      return false;
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new DeploymentValidator();
  validator.runValidation().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = DeploymentValidator;