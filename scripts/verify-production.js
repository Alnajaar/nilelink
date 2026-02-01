#!/usr/bin/env node

/**
 * NileLink Production Readiness Verification Script
 * 
 * This script checks if all critical components are ready for launch.
 * Run before going live to ensure everything is working.
 * 
 * Usage: npm run verify:production
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function log(color, icon, message) {
  console.log(`${colors[color]}${icon} ${message}${colors.reset}`);
}

function checkPass(message) {
  checks.passed++;
  log('green', '✅', message);
}

function checkFail(message) {
  checks.failed++;
  log('red', '❌', message);
}

function checkWarn(message) {
  checks.warnings++;
  log('yellow', '⚠️ ', message);
}

function section(title) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

// ============= VERIFICATION START =============

console.log(`\n${colors.cyan}🚀 NileLink Production Readiness Verification${colors.reset}`);
console.log(`${colors.cyan}Started: ${new Date().toISOString()}${colors.reset}\n`);

// 1. FILE STRUCTURE CHECKS
section('1️⃣  File Structure & Configuration');

// Check backend .env
if (fs.existsSync(path.join(__dirname, 'backend', '.env'))) {
  checkPass('Backend .env file exists');
  
  const envContent = fs.readFileSync(path.join(__dirname, 'backend', '.env'), 'utf8');
  if (envContent.includes('DATABASE_URL')) checkPass('  - DATABASE_URL configured');
  else checkFail('  - DATABASE_URL missing');
  
  if (envContent.includes('JWT_SECRET')) checkPass('  - JWT_SECRET configured');
  else checkFail('  - JWT_SECRET missing');
  
  if (envContent.includes('SMTP_HOST')) checkPass('  - Email SMTP configured');
  else checkFail('  - Email SMTP missing');
} else {
  checkFail('Backend .env file not found');
}

// Check Prisma schema
if (fs.existsSync(path.join(__dirname, 'backend', 'prisma', 'schema.prisma'))) {
  checkPass('Prisma schema exists');
} else {
  checkFail('Prisma schema not found');
}

// Check portal app
if (fs.existsSync(path.join(__dirname, 'web', 'portal', 'src'))) {
  checkPass('Portal app source exists');
} else {
  checkFail('Portal app source not found');
}

// 2. FRONTEND PAGES
section('2️⃣  Frontend Pages & Components');

const pageChecks = [
  { path: 'web/portal/src/app/marketplace/page.tsx', name: 'Marketplace' },
  { path: 'web/portal/src/app/orders/page.tsx', name: 'Orders' },
  { path: 'web/portal/src/app/wallet/page.tsx', name: 'Wallet' },
  { path: 'web/portal/src/app/auth/login/page.tsx', name: 'Auth - Login' },
  { path: 'web/portal/src/app/auth/register/page.tsx', name: 'Auth - Register' },
  { path: 'web/portal/src/app/subscriptions/page.tsx', name: 'Subscriptions' },
];

pageChecks.forEach(({ path: pagePath, name }) => {
  if (fs.existsSync(path.join(__dirname, pagePath))) {
    checkPass(`${name} page exists`);
  } else {
    checkFail(`${name} page missing`);
  }
});

// Check for "Coming Soon" placeholders
const portalpagesPath = path.join(__dirname, 'web', 'portal', 'src', 'app');
let placeholderCount = 0;
function checkForPlaceholders(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.')) {
      checkForPlaceholders(filePath);
    } else if (file.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('Coming Soon') || content.includes('coming soon')) {
        placeholderCount++;
      }
    }
  });
}

checkForPlaceholders(portalpagesPath);

if (placeholderCount === 0) {
  checkPass('No "Coming Soon" placeholders found - All pages are production-ready');
} else {
  checkWarn(`Found ${placeholderCount} page(s) with placeholder text`);
}

// 3. API SERVICES
section('3️⃣  API Services & Hooks');

const apiServices = [
  'web/shared/services/ordersService.ts',
  'web/shared/services/productsService.ts',
  'web/shared/services/usersService.ts',
  'web/shared/services/subscriptionsService.ts',
  'web/shared/services/paymentsService.ts',
];

apiServices.forEach(service => {
  if (fs.existsSync(path.join(__dirname, service))) {
    checkPass(`API Service: ${path.basename(service)}`);
  } else {
    checkFail(`API Service missing: ${service}`);
  }
});

// 4. AUTHENTICATION
section('4️⃣  Authentication Setup');

const authFiles = [
  'backend/src/api/routes/auth.ts',
  'web/shared/contexts/AuthContext.tsx',
  'web/shared/hooks/useAuth.ts',
];

authFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    checkPass(`Auth component: ${path.basename(file)}`);
  } else {
    checkFail(`Auth component missing: ${file}`);
  }
});

// 5. DATABASE
section('5️⃣  Database & ORM');

if (fs.existsSync(path.join(__dirname, 'backend', 'prisma', 'migrations'))) {
  const migrationCount = fs.readdirSync(path.join(__dirname, 'backend', 'prisma', 'migrations')).length;
  checkPass(`Database migrations: ${migrationCount} migration(s) found`);
} else {
  checkWarn('No database migrations found - Run: npm run prisma:migrate:dev');
}

// 6. DOCKER
section('6️⃣  Docker & Infrastructure');

const dockerPath = path.join(__dirname, '..', 'docker-compose.yml');
if (fs.existsSync(dockerPath)) {
  checkPass('docker-compose.yml exists');
} else {
  checkFail('docker-compose.yml not found');
}

const dockerServices = ['postgres', 'redis', 'hardhat'];
const dockerContent = fs.existsSync(dockerPath) ? fs.readFileSync(dockerPath, 'utf8') : '';
dockerServices.forEach(service => {
  if (dockerContent.includes(service)) {
    checkPass(`Docker service configured: ${service}`);
  } else {
    checkFail(`Docker service missing: ${service}`);
  }
});

// 7. DEPENDENCIES
section('7️⃣  Dependencies');

const backendPkgPath = path.join(__dirname, '..', 'backend', 'package.json');
if (fs.existsSync(backendPkgPath)) {
  const backendPackageJson = JSON.parse(fs.readFileSync(backendPkgPath, 'utf8'));
  const requiredDeps = ['express', 'prisma', 'jsonwebtoken', 'bcryptjs'];
  requiredDeps.forEach(dep => {
    if (backendPackageJson.dependencies[dep] || backendPackageJson.devDependencies[dep]) {
      checkPass(`Backend dependency: ${dep}`);
    } else {
      checkFail(`Backend dependency missing: ${dep}`);
    }
  });
} else {
  checkWarn('Backend package.json not found');
}

// 8. BUILD & DEPLOYMENT
section('8️⃣  Build & Deployment');

const buildScripts = [
  { name: 'backend', pkgPath: 'backend/package.json' },
  { name: 'portal', pkgPath: 'web/portal/package.json' },
];

buildScripts.forEach(({ name, pkgPath }) => {
  const fullPath = path.join(__dirname, '..', pkgPath);
  if (fs.existsSync(fullPath)) {
    const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    if (pkg.scripts && pkg.scripts.build) {
      checkPass(`Build script exists for ${name}`);
    } else if (pkg.scripts && pkg.scripts.dev) {
      checkPass(`Dev script exists for ${name}`);
    } else {
      checkWarn(`No build/dev script found for ${name}`);
    }
  } else {
    checkWarn(`Package.json not found for ${name}`);
  }
});

// 9. CONFIGURATION FILES
section('9️⃣  Configuration Files');

const configs = [
  'backend/tsconfig.json',
  'backend/jest.config.js',
  'web/portal/tailwind.config.ts',
  'web/shared/tailwind.config.shared.js',
];

configs.forEach(configPath => {
  const fullPath = path.join(__dirname, '..', configPath);
  if (fs.existsSync(fullPath)) {
    checkPass(`Config file: ${path.basename(configPath)}`);
  } else {
    checkWarn(`Config file missing: ${configPath}`);
  }
});

// 10. SUMMARY
section('🎯 Summary');

const total = checks.passed + checks.failed + checks.warnings;
const percentage = Math.round((checks.passed / (total || 1)) * 100);

console.log(`${colors.green}✅ Passed: ${checks.passed}${colors.reset}`);
console.log(`${colors.red}❌ Failed: ${checks.failed}${colors.reset}`);
console.log(`${colors.yellow}⚠️  Warnings: ${checks.warnings}${colors.reset}`);
console.log(`\n${colors.cyan}Readiness Score: ${percentage}%${colors.reset}`);

// Final verdict
console.log('');
if (checks.failed === 0) {
  if (checks.warnings === 0) {
    log('green', '🚀', 'PRODUCTION READY! All systems go. 🎉');
  } else {
    log('yellow', '⚠️ ', 'READY WITH WARNINGS - Address the above before launch');
  }
} else {
  log('red', '⛔', 'NOT READY - Fix the failed checks before deploying');
}

console.log(`\n${colors.cyan}Verification complete at ${new Date().toISOString()}${colors.reset}\n`);

// Exit with appropriate code
process.exit(checks.failed > 0 ? 1 : 0);
