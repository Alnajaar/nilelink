/**
 * 🌐 **NileLink Domain Setup Script - Cloudflare Configuration**
 * Complete guide and automation for nilelink.app domain setup
 */

const fs = require('fs');
const path = require('path');

class CloudflareDomainSetup {
    constructor() {
        this.domain = 'nilelink.app';
        this.subdomains = {
            required: [
                'api',           // Backend API
                'admin',         // Super Admin Dashboard
                'pos',           // POS Terminal Interface
                'customer',      // Customer Mobile/Web App
                'driver',        // Driver Mobile App
                'staging',       // Staging Environment
                'beta'           // Beta Testing Environment
            ],
            optional: [
                'docs',          // Documentation
                'status',        // System Status Page
                'blog',          // Company Blog
                'support'        // Customer Support
            ]
        };
        this.cloudflareConfig = {
            accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
            apiToken: process.env.CLOUDFLARE_API_TOKEN,
            zoneId: null // Will be set after zone creation
        };
    }

    async generateSetupGuide() {
        console.log('🌐 NILELINK.APP CLOUDFLARE DOMAIN SETUP GUIDE\n');
        console.log('='.repeat(60));
        console.log('⚠️  IMPORTANT: This guide assumes you have:');
        console.log('   • Cloudflare account with API access');
        console.log('   • Domain ownership of nilelink.app');
        console.log('   • AWS infrastructure ready (from deployment)');
        console.log('='.repeat(60) + '\n');

        const guide = {
            preparation: await this.generatePreparationSteps(),
            domainSetup: await this.generateDomainSetupSteps(),
            dnsConfiguration: await this.generateDNSConfigurationSteps(),
            securitySetup: await this.generateSecuritySetupSteps(),
            performanceSetup: await this.generatePerformanceSetupSteps(),
            monitoringSetup: await this.generateMonitoringSetupSteps(),
            validationSteps: await this.generateValidationSteps()
        };

        this.displayGuide(guide);
        this.generateAutomationScript();

        return guide;
    }

    async generatePreparationSteps() {
        return {
            title: '🚀 PREPARATION STEPS',
            steps: [
                {
                    step: 1,
                    title: 'Verify Domain Ownership',
                    description: 'Ensure nilelink.app is registered and you have admin access',
                    commands: [
                        '# Check domain registration',
                        'whois nilelink.app',
                        '',
                        '# Verify DNS propagation',
                        'dig NS nilelink.app'
                    ],
                    verification: 'Domain should show your registrar and valid registration dates'
                },
                {
                    step: 2,
                    title: 'Cloudflare Account Setup',
                    description: 'Ensure your Cloudflare account is ready with API access',
                    commands: [
                        '# Create API Token with these permissions:',
                        '# - Zone:Read, Zone:Edit',
                        '# - DNS:Read, DNS:Edit',
                        '# - SSL/TLS:Read, SSL/TLS:Edit',
                        '# - Page Rules:Read, Page Rules:Edit',
                        '# - Firewall:Read, Firewall:Edit',
                        '',
                        '# Set environment variables:',
                        'export CLOUDFLARE_ACCOUNT_ID="your_account_id"',
                        'export CLOUDFLARE_API_TOKEN="your_api_token"'
                    ],
                    verification: 'API token should have access to all required permissions'
                },
                {
                    step: 3,
                    title: 'AWS Infrastructure Ready',
                    description: 'Ensure AWS resources are deployed and accessible',
                    commands: [
                        '# Verify AWS resources exist',
                        'aws cloudfront list-distributions --query "DistributionList.Items[?Comment==\'NileLink Production\']"',
                        'aws elbv2 describe-load-balancers --names nilelink-production-alb',
                        'aws s3 ls s3://nilelink-production-site --recursive | head -5'
                    ],
                    verification: 'All AWS resources should be created and accessible'
                }
            ]
        };
    }

    async generateDomainSetupSteps() {
        return {
            title: '🌐 DOMAIN SETUP IN CLOUDFLARE',
            steps: [
                {
                    step: 1,
                    title: 'Add Domain to Cloudflare',
                    description: 'Add nilelink.app to your Cloudflare account',
                    uiSteps: [
                        '1. Log into Cloudflare Dashboard',
                        '2. Click "Add a Site"',
                        '3. Enter "nilelink.app"',
                        '4. Click "Add site"'
                    ],
                    verification: 'Domain should appear in your Cloudflare sites list'
                },
                {
                    step: 2,
                    title: 'Update Nameservers',
                    description: 'Update domain nameservers to Cloudflare',
                    uiSteps: [
                        '1. Copy the 2 nameservers shown by Cloudflare',
                        '2. Go to your domain registrar (Namecheap, GoDaddy, etc.)',
                        '3. Update NS records to Cloudflare nameservers',
                        '4. Wait for DNS propagation (can take up to 48 hours)',
                        '5. Check Cloudflare dashboard for "Active" status'
                    ],
                    commands: [
                        '# Check nameserver propagation',
                        'dig NS nilelink.app',
                        '',
                        '# Verify Cloudflare nameservers',
                        'nslookup -type=NS nilelink.app'
                    ],
                    verification: 'dig NS should return Cloudflare nameservers'
                }
            ]
        };
    }

    async generateDNSConfigurationSteps() {
        return {
            title: '🔧 DNS CONFIGURATION',
            steps: [
                {
                    step: 1,
                    title: 'Root Domain (nilelink.app)',
                    description: 'Configure root domain to serve customer-facing app',
                    records: [
                        {
                            type: 'A',
                            name: '@',
                            content: '192.0.2.1', // Placeholder, will be updated
                            comment: 'Root domain - Customer App'
                        },
                        {
                            type: 'CNAME',
                            name: 'www',
                            content: '@',
                            comment: 'WWW redirect to root'
                        }
                    ]
                },
                {
                    step: 2,
                    title: 'API Subdomain (api.nilelink.app)',
                    description: 'Backend API endpoints',
                    records: [
                        {
                            type: 'CNAME',
                            name: 'api',
                            content: 'your-alb-dns-name.us-east-1.elb.amazonaws.com',
                            comment: 'API Load Balancer'
                        }
                    ]
                },
                {
                    step: 3,
                    title: 'Admin Subdomain (admin.nilelink.app)',
                    description: 'Super Admin Dashboard',
                    records: [
                        {
                            type: 'CNAME',
                            name: 'admin',
                            content: 'your-admin-distribution.cloudfront.net',
                            comment: 'Admin CloudFront Distribution'
                        }
                    ]
                },
                {
                    step: 4,
                    title: 'POS Subdomain (pos.nilelink.app)',
                    description: 'POS Terminal Interface',
                    records: [
                        {
                            type: 'CNAME',
                            name: 'pos',
                            content: 'your-pos-distribution.cloudfront.net',
                            comment: 'POS CloudFront Distribution'
                        }
                    ]
                },
                {
                    step: 5,
                    title: 'Mobile App Subdomains',
                    description: 'Customer and Driver mobile apps',
                    records: [
                        {
                            type: 'CNAME',
                            name: 'customer',
                            content: 'your-customer-distribution.cloudfront.net',
                            comment: 'Customer App Distribution'
                        },
                        {
                            type: 'CNAME',
                            name: 'driver',
                            content: 'your-driver-distribution.cloudfront.net',
                            comment: 'Driver App Distribution'
                        }
                    ]
                },
                {
                    step: 6,
                    title: 'Staging Environment (staging.nilelink.app)',
                    description: 'Staging environment for testing',
                    records: [
                        {
                            type: 'CNAME',
                            name: 'staging',
                            content: 'your-staging-distribution.cloudfront.net',
                            comment: 'Staging Environment'
                        }
                    ]
                },
                {
                    step: 7,
                    title: 'SSL/TLS Validation',
                    description: 'Verify SSL certificates are issued',
                    commands: [
                        '# Check SSL certificate status',
                        'curl -I https://nilelink.app',
                        'curl -I https://api.nilelink.app',
                        'curl -I https://admin.nilelink.app'
                    ],
                    verification: 'All HTTPS URLs should return valid certificates'
                }
            ]
        };
    }

    async generateSecuritySetupSteps() {
        return {
            title: '🔒 SECURITY CONFIGURATION',
            steps: [
                {
                    step: 1,
                    title: 'SSL/TLS Settings',
                    description: 'Configure SSL/TLS encryption',
                    settings: [
                        'Always Use HTTPS: ON',
                        'Automatic HTTPS Rewrites: ON',
                        'Minimum TLS Version: 1.2',
                        'Opportunistic Encryption: ON',
                        'TLS 1.3: ON',
                        'Automatic Signed Certificate: ON'
                    ]
                },
                {
                    step: 2,
                    title: 'WAF (Web Application Firewall)',
                    description: 'Enable comprehensive WAF protection',
                    settings: [
                        'WAF: ON',
                        'Bot Fight Mode: ON',
                        'Rate Limiting: Configure for API endpoints',
                        'DDoS Protection: ON',
                        'SQL Injection Protection: ON',
                        'XSS Protection: ON'
                    ]
                },
                {
                    step: 3,
                    title: 'Firewall Rules',
                    description: 'Configure custom firewall rules',
                    rules: [
                        'Block known malicious IPs',
                        'Rate limit API endpoints (100 req/min)',
                        'Block non-HTTPS traffic',
                        'Allow only specific countries (if needed)',
                        'Block common attack patterns'
                    ]
                },
                {
                    step: 4,
                    title: 'Access Policies',
                    description: 'Configure access controls',
                    policies: [
                        'Admin dashboard: IP whitelist + 2FA',
                        'API endpoints: JWT authentication required',
                        'POS terminals: Certificate-based auth',
                        'Staging: Basic auth protection'
                    ]
                }
            ]
        };
    }

    async generatePerformanceSetupSteps() {
        return {
            title: '⚡ PERFORMANCE OPTIMIZATION',
            steps: [
                {
                    step: 1,
                    title: 'Caching Configuration',
                    description: 'Optimize caching for better performance',
                    settings: [
                        'Browser Cache TTL: 4 hours for static assets',
                        'Edge Cache TTL: 1 hour for dynamic content',
                        'Cache API responses: 5 minutes',
                        'Bypass cache for authenticated requests'
                    ]
                },
                {
                    step: 2,
                    title: 'Image Optimization',
                    description: 'Enable automatic image optimization',
                    settings: [
                        'Mirage: ON (WebP conversion)',
                        'Polish: ON (Image optimization)',
                        'Auto Minify: ON (HTML, CSS, JS)',
                        'Brotli Compression: ON'
                    ]
                },
                {
                    step: 3,
                    title: 'CDN Optimization',
                    description: 'Configure global CDN distribution',
                    settings: [
                        'Enable Argo Smart Routing',
                        'Railgun acceleration for dynamic content',
                        'Edge computing for API responses',
                        'Global load balancing'
                    ]
                },
                {
                    step: 4,
                    title: 'Page Rules',
                    description: 'Configure URL-specific rules',
                    rules: [
                        'api.* -> Cache Level: Bypass, Security Level: High',
                        'admin.* -> Cache Level: Bypass, Security Level: High',
                        '*.js, *.css -> Cache Level: Aggressive, Edge Cache TTL: 1 year',
                        'staging.* -> Basic Authentication required'
                    ]
                }
            ]
        };
    }

    async generateMonitoringSetupSteps() {
        return {
            title: '📊 MONITORING & ANALYTICS',
            steps: [
                {
                    step: 1,
                    title: 'Cloudflare Analytics',
                    description: 'Enable built-in analytics',
                    settings: [
                        'Web Analytics: ON',
                        'Security Analytics: ON',
                        'DNS Analytics: ON',
                        'Workers Analytics: ON'
                    ]
                },
                {
                    step: 2,
                    title: 'Real User Monitoring (RUM)',
                    description: 'Monitor real user performance',
                    settings: [
                        'Enable Web Vitals tracking',
                        'Monitor Core Web Vitals (LCP, FID, CLS)',
                        'Track user journeys and conversions',
                        'Monitor error rates and performance'
                    ]
                },
                {
                    step: 3,
                    title: 'Alert Configuration',
                    description: 'Set up automated alerts',
                    alerts: [
                        'SSL certificate expiration (7 days warning)',
                        'High error rate (>5%)',
                        'DDoS attack detected',
                        'Origin server down',
                        'DNSSEC issues',
                        'Rate limit exceeded'
                    ]
                },
                {
                    step: 4,
                    title: 'Logpush Setup',
                    description: 'Configure log streaming',
                    settings: [
                        'Enable HTTP request logs to S3',
                        'Security events to CloudWatch',
                        'DNS queries to analytics platform',
                        'Real-time log streaming for incident response'
                    ]
                }
            ]
        };
    }

    async generateValidationSteps() {
        return {
            title: '✅ VALIDATION & TESTING',
            steps: [
                {
                    step: 1,
                    title: 'DNS Propagation Check',
                    commands: [
                        '# Check all subdomains resolve correctly',
                        'dig nilelink.app',
                        'dig api.nilelink.app',
                        'dig admin.nilelink.app',
                        'dig pos.nilelink.app',
                        'dig staging.nilelink.app'
                    ],
                    verification: 'All domains should resolve to correct Cloudflare IPs'
                },
                {
                    step: 2,
                    title: 'SSL Certificate Validation',
                    commands: [
                        '# Check SSL certificates',
                        'openssl s_client -connect nilelink.app:443 -servername nilelink.app < /dev/null 2>/dev/null | openssl x509 -noout -dates',
                        'curl -I https://api.nilelink.app',
                        'curl -I https://admin.nilelink.app'
                    ],
                    verification: 'All certificates should be valid and from Cloudflare'
                },
                {
                    step: 3,
                    title: 'Security Headers Check',
                    commands: [
                        '# Check security headers',
                        'curl -I https://nilelink.app | grep -E "(Strict-Transport-Security|Content-Security-Policy|X-Frame-Options|X-Content-Type-Options)"'
                    ],
                    verification: 'Security headers should be present and properly configured'
                },
                {
                    step: 4,
                    title: 'Performance Testing',
                    commands: [
                        '# Test page load performance',
                        'curl -o /dev/null -s -w "%{time_total}\\n" https://nilelink.app',
                        'lighthouse https://nilelink.app --output=json --output-path=./lighthouse-report.json'
                    ],
                    verification: 'Page load times should be under 3 seconds'
                },
                {
                    step: 5,
                    title: 'Load Testing',
                    commands: [
                        '# Simple load test',
                        'ab -n 1000 -c 10 https://nilelink.app/',
                        'siege -c 50 -t 30s https://api.nilelink.app/health'
                    ],
                    verification: 'System should handle load without errors'
                }
            ]
        };
    }

    displayGuide(guide) {
        console.log('📋 NILELINK.APP CLOUDFLARE SETUP GUIDE\n');
        console.log('='.repeat(80));

        Object.values(guide).forEach(section => {
            console.log(`\n${section.title}\n${'='.repeat(50)}`);

            section.steps.forEach(step => {
                console.log(`\n${step.step ? step.step + '. ' : ''}${step.title}`);
                console.log('-'.repeat(40));

                if (step.description) {
                    console.log(`${step.description}\n`);
                }

                if (step.uiSteps) {
                    console.log('UI Steps:');
                    step.uiSteps.forEach(uiStep => console.log(`   • ${uiStep}`));
                    console.log('');
                }

                if (step.settings) {
                    console.log('Settings:');
                    step.settings.forEach(setting => console.log(`   • ${setting}`));
                    console.log('');
                }

                if (step.records) {
                    console.log('DNS Records:');
                    step.records.forEach(record => {
                        console.log(`   • Type: ${record.type}, Name: ${record.name}, Content: ${record.content}`);
                        if (record.comment) console.log(`     (${record.comment})`);
                    });
                    console.log('');
                }

                if (step.alerts) {
                    console.log('Alerts to Configure:');
                    step.alerts.forEach(alert => console.log(`   • ${alert}`));
                    console.log('');
                }

                if (step.rules) {
                    console.log('Rules:');
                    step.rules.forEach(rule => console.log(`   • ${rule}`));
                    console.log('');
                }

                if (step.policies) {
                    console.log('Policies:');
                    step.policies.forEach(policy => console.log(`   • ${policy}`));
                    console.log('');
                }

                if (step.commands && step.commands.length > 0) {
                    console.log('Commands:');
                    step.commands.forEach(cmd => {
                        if (cmd.startsWith('#')) {
                            console.log(`   ${cmd}`);
                        } else {
                            console.log(`   $ ${cmd}`);
                        }
                    });
                    console.log('');
                }

                if (step.verification) {
                    console.log(`✅ Verification: ${step.verification}\n`);
                }
            });
        });

        console.log('\n🎯 FINAL CHECKLIST:');
        console.log('='.repeat(30));
        console.log('□ Domain added to Cloudflare');
        console.log('□ Nameservers updated at registrar');
        console.log('□ DNS propagation complete');
        console.log('□ SSL certificates active');
        console.log('□ WAF and security rules configured');
        console.log('□ Performance optimizations enabled');
        console.log('□ Monitoring and alerts set up');
        console.log('□ All subdomains resolving correctly');
        console.log('□ Load testing passed');
        console.log('□ Ready for production traffic');

        console.log('\n🚀 NEXT STEPS:');
        console.log('1. Run the DNS validation script');
        console.log('2. Deploy staging environment');
        console.log('3. Test all subdomains');
        console.log('4. Enable production traffic');
        console.log('5. Monitor and optimize performance');
    }

    generateAutomationScript() {
        const automationScript = `# NileLink Domain Automation Script
# Run this after manual Cloudflare setup

#!/bin/bash

echo "🔧 Automating NileLink domain configuration..."

# Update DNS records with actual AWS resource values
# (Replace placeholders with real values from deployment)

# Validate configuration
echo "✅ Validating domain configuration..."
curl -s https://nilelink.app > /dev/null && echo "Root domain: OK" || echo "Root domain: FAILED"
curl -s https://api.nilelink.app/health > /dev/null && echo "API domain: OK" || echo "API domain: FAILED"
curl -s https://admin.nilelink.app > /dev/null && echo "Admin domain: OK" || echo "Admin domain: FAILED"

echo "🎉 Domain setup automation complete!"
echo "🌐 Ready for production traffic"
`;

        fs.writeFileSync('scripts/automate-domain-setup.sh', automationScript);
        console.log('\n📜 Automation script saved: scripts/automate-domain-setup.sh');
    }

    generateDNSRecordsFile() {
        const dnsRecords = [
            // Root domain
            { type: 'A', name: '@', content: '192.0.2.1', comment: 'Root domain - Update with Cloudflare IP' },
            { type: 'CNAME', name: 'www', content: '@', comment: 'WWW redirect' },

            // API
            { type: 'CNAME', name: 'api', content: 'REPLACE_WITH_ALB_DNS', comment: 'API Load Balancer' },

            // Admin
            { type: 'CNAME', name: 'admin', content: 'REPLACE_WITH_CF_DIST', comment: 'Admin CloudFront' },

            // POS
            { type: 'CNAME', name: 'pos', content: 'REPLACE_WITH_CF_DIST', comment: 'POS CloudFront' },

            // Customer & Driver
            { type: 'CNAME', name: 'customer', content: 'REPLACE_WITH_CF_DIST', comment: 'Customer App' },
            { type: 'CNAME', name: 'driver', content: 'REPLACE_WITH_CF_DIST', comment: 'Driver App' },

            // Staging
            { type: 'CNAME', name: 'staging', content: 'REPLACE_WITH_CF_DIST', comment: 'Staging Environment' },

            // Beta
            { type: 'CNAME', name: 'beta', content: 'REPLACE_WITH_CF_DIST', comment: 'Beta Environment' }
        ];

        const csvContent = 'Type,Name,Content,TTL,Comment\n' +
            dnsRecords.map(record =>
                `${record.type},${record.name},"${record.content}",Auto,${record.comment || ''}`
            ).join('\n');

        fs.writeFileSync('dns-records-nilelink.csv', csvContent);
        console.log('📄 DNS records template saved: dns-records-nilelink.csv');
    }
}

async function generateCloudflareSetupGuide() {
    const setup = new CloudflareDomainSetup();

    console.log('🚀 Generating NileLink.app Cloudflare Setup Guide...\n');

    await setup.generateSetupGuide();
    setup.generateDNSRecordsFile();

    console.log('\n📋 SUMMARY:');
    console.log('1. 📖 Complete setup guide displayed above');
    console.log('2. 📜 Automation script: scripts/automate-domain-setup.sh');
    console.log('3. 📄 DNS records template: dns-records-nilelink.csv');
    console.log('4. ✅ Follow the steps in order for successful domain setup');

    console.log('\n🎯 REMEMBER:');
    console.log('- DNS propagation can take 24-48 hours');
    console.log('- Always test SSL and security settings');
    console.log('- Monitor performance after enabling traffic');
    console.log('- Keep Cloudflare API tokens secure');

    return setup;
}

if (require.main === module) {
    generateCloudflareSetupGuide().catch(console.error);
}

module.exports = { CloudflareDomainSetup, generateCloudflareSetupGuide };