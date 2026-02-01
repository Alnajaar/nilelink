/**
 * Deployment Address Loader
 * Loads contract addresses based on environment
 */

const fs = require('fs');
const path = require('path');

class DeploymentLoader {
    constructor() {
        this.deployments = {};
        this.loadAllDeployments();
    }

    loadAllDeployments() {
        const deploymentDir = path.join(__dirname, '..', 'deployments');

        try {
            const files = fs.readdirSync(deploymentDir);

            files.forEach(file => {
                if (file.endsWith('.json')) {
                    const env = file.replace('.json', '');
                    const filePath = path.join(deploymentDir, file);
                    this.deployments[env] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                }
            });
        } catch (error) {
            console.warn('Could not load deployment files:', error.message);
        }
    }

    getAddresses(network = process.env.NETWORK || 'local') {
        return this.deployments[network] || this.deployments.local || {};
    }

    updateAddress(network, contractName, address) {
        if (!this.deployments[network]) {
            this.deployments[network] = {};
        }

        this.deployments[network][contractName] = address;

        // Save to file
        const deploymentDir = path.join(__dirname, '..', 'deployments');
        const filePath = path.join(deploymentDir, `${network}.json`);

        try {
            fs.writeFileSync(filePath, JSON.stringify(this.deployments[network], null, 2));
            console.log(`✅ Updated ${contractName} address for ${network}: ${address}`);
        } catch (error) {
            console.error(`❌ Failed to save deployment for ${network}:`, error.message);
        }
    }
}

// Export singleton instance
const deploymentLoader = new DeploymentLoader();

module.exports = deploymentLoader;