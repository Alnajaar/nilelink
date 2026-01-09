const fs = require('fs');
const path = require('path');

// Configuration
const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build', 'coverage', '.turbo', '.wrangler'];
const IGNORE_FILES = ['package-lock.json', 'check-colors.js', 'colors.ts', 'gradients.ts', 'tailwind.config.shared.js', 'design-tokens.js', 'globals.shared.css'];
const SCAN_ROOTS = ['web/portal/src', 'web/pos/src', 'web/shared/components']; // Focus on source code

// Regex for Hex Codes (strict)
const HEX_REGEX = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;

// Allow-list for specific hex codes if absolutely necessary (e.g. black/white if not in tokens yet)
const ALLOWED_HEX = [
    // '#FFFFFF', // Uncomment if we decide to allow pure white literals
    // '#000000'
];

function scanDirectory(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                scanDirectory(filePath, fileList);
            }
        } else {
            if (!IGNORE_FILES.includes(file) && /\.(tsx|ts|jsx|js|css)$/.test(file)) {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

let violationCount = 0;

console.log('🔍 Starting Zero-Error Design Scan...');
console.log('----------------------------------------');

SCAN_ROOTS.forEach(root => {
    // Check if root exists
    if (!fs.existsSync(root)) {
        // console.warn(`⚠️  Directory not found: ${root}`);
        return;
    }

    const files = scanDirectory(root);

    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        let match;
        const fileViolations = [];

        while ((match = HEX_REGEX.exec(content)) !== null) {
            const hex = match[0];
            if (!ALLOWED_HEX.includes(hex)) {
                // Get line number
                const line = content.substring(0, match.index).split('\n').length;
                fileViolations.push({ line, hex });
            }
        }

        if (fileViolations.length > 0) {
            console.log(`\n❌ VIOLATIONS in ${file}:`);
            fileViolations.forEach(v => {
                console.log(`   Line ${v.line}: ${v.hex}`);
                violationCount++;
            });
        }
    });
});

console.log('\n----------------------------------------');
if (violationCount > 0) {
    console.error(`🚨 FAILED: Found ${violationCount} forbidden hex codes.`);
    console.error('   Please replace these with design system tokens (e.g., colors.primary[900]).');
    process.exit(1);
} else {
    console.log('✅ PASS: No forbidden hex codes found. Design System is 100% compliant.');
}
