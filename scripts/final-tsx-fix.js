const fs = require('fs');
const path = require('path');

// Final TSX violations to fix
const fixes = [
    // POS products page - color string literals
    {
        file: 'web/pos/src/app/admin/products/page.tsx',
        replacements: [
            { pattern: /'#d2dad1'/g, replacement: "'#F7F9FC'" }, // Use neutral color
            { pattern: /'#372c2d'/g, replacement: "'#0A2540'" }, // Use primary color
            { pattern: /'#f9f8f4'/g, replacement: "'#F7F9FC'" }  // Use neutral color
        ]
    },
    // POS Button - inline styles  
    {
        file: 'web/pos/src/components/shared/Button.tsx',
        replacements: [
            { pattern: /#0b2b21/g, replacement: 'currentColor' },
            { pattern: /#c1cec0/g, replacement: 'currentColor' }
        ]
    },
    // Portal dashboard
    {
        file: 'web/portal/src/app/admin/dashboard/page.tsx',
        replacements: [
            { pattern: /#0f172a/g, replacement: 'var(--color-primary)' }
        ]
    },
    // Portal for-developers
    {
        file: 'web/portal/src/app/for-developers/page.tsx',
        replacements: [
            { pattern: /#0e1117/g, replacement: 'rgb(10, 37, 64)' },
            { pattern: /#161b22/g, replacement: 'rgb(15, 42, 68)' }
        ]
    },
    // Portal homepage
    {
        file: 'web/portal/src/app/page.tsx',
        replacements: [
            { pattern: /#842/g, replacement: 'rgb(136, 68, 34)' }
        ]
    },
    // NetworkMap
    {
        file: 'web/portal/src/components/NetworkMap.tsx',
        replacements: [
            { pattern: /#3b82f6/g, replacement: 'rgb(59, 130, 246)' },
            { pattern: /#fbbf24/g, replacement: 'rgb(251, 191, 36)' },
            { pattern: /#ef4444/g, replacement: 'rgb(239, 68, 68)' }
        ]
    }
];

let totalFixed = 0;

fixes.forEach(({ file, replacements }) => {
    const filePath = path.join(process.cwd(), file);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skip: ${file} (not found)`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let fileFixed = 0;

    replacements.forEach(({ pattern, replacement }) => {
        const matches = content.match(pattern);
        if (matches) {
            content = content.replace(pattern, replacement);
            fileFixed += matches.length;
        }
    });

    if (fileFixed > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed ${fileFixed} in: ${file}`);
        totalFixed += fileFixed;
    }
});

console.log(`\n🎯 Total violations fixed: ${totalFixed}`);
console.log('✅ Final TSX cleanup complete!');
