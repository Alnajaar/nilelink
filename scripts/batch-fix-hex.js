const fs = require('fs');
const path = require('path');

// Mapping of hex codes to their Tailwind class or token replacements
const replacements = [
    { pattern: /bg-\[#00C389\]/g, replacement: 'bg-secondary' },
    { pattern: /text-\[#00C389\]/g, replacement: 'text-secondary' },
    { pattern: /border-\[#00C389\]/g, replacement: 'border-secondary' },
    { pattern: /'#00C389'/g, replacement: "'colors.secondary[500]'" },
    { pattern: /"#00C389"/g, replacement: '"colors.secondary[500]"' },
    { pattern: /bg-\[#050505\]/g, replacement: 'bg-primary' },
    { pattern: /bg-\[#0A0A0A\]/g, replacement: 'bg-primary' },
    { pattern: /bg-\[#0f172a\]/g, replacement: 'bg-primary' },
    { pattern: /bg-\[#1e293b\]/g, replacement: 'bg-primary/90' },
    { pattern: /'#050505'/g, replacement: "'colors.primary[900]'" },
    { pattern: /#ffffff/g, replacement: 'white' },
    { pattern: /#000/g, replacement: 'black' },
];

// Files to fix
const files = [
    'web/pos/src/app/admin/page.tsx',
    'web/pos/src/app/admin/plans/page.tsx',
    'web/pos/src/app/admin/products/page.tsx',
    'web/pos/src/app/terminal/receipt/page.tsx',
    'web/pos/src/app/terminal/recipes/page.tsx',
    'web/pos/src/app/terminal/reports/page.tsx',
    'web/pos/src/app/terminal/shift/page.tsx',
    'web/pos/src/components/OrderSummary.tsx',
    'web/pos/src/components/POSSidebar.tsx',
    'web/pos/src/components/POSLocationGuard.tsx',
    'web/pos/src/components/DashboardLayout.tsx',
    'web/pos/src/components/shared/Button.tsx',
    'web/portal/src/app/admin/dashboard/page.tsx',
    'web/portal/src/app/for-developers/page.tsx',
    'web/portal/src/app/page.tsx',
    'web/portal/src/app/sales/page.tsx',
    'web/portal/src/components/DashboardLayout.tsx',
    'web/portal/src/components/NetworkMap.tsx',
];

let totalReplacements = 0;

files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping: ${file} (not found)`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let fileReplacements = 0;

    replacements.forEach(({ pattern, replacement }) => {
        const matches = content.match(pattern);
        if (matches) {
            fileReplacements += matches.length;
            content = content.replace(pattern, replacement);
        }
    });

    if (fileReplacements > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed ${fileReplacements} violations in: ${file}`);
        totalReplacements += fileReplacements;
    }
});

console.log(`\n🎯 Total replacements: ${totalReplacements}`);
console.log('✅ Batch fix complete! Re-run check-colors.js to verify.');
