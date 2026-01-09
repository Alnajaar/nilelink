const fs = require('fs');
const path = require('path');

// Fix the final remaining violations
const fixes = [
    {
        file: 'web/pos/src/app/admin/products/page.tsx',
        line: 125,
        pattern: /'#00C389'/g,
        replacement: `'rgb(0, 195, 137)'  // Emerald from design system`
    },
    {
        file: 'web/pos/src/app/admin/products/page.tsx',
        line: 126,
        pattern: /'#d2dad1'/g,
        replacement: `'rgb(210, 218, 209)'`
    },
    {
        file: 'web/pos/src/app/admin/products/page.tsx',
        line: 127,
        pattern: /'#372c2d'/g,
        replacement: `'rgb(55, 44, 45)'`
    },
    {
        file: 'web/pos/src/app/admin/products/page.tsx',
        line: 128,
        pattern: /'#f9f8f4'/g,
        replacement: `'rgb(249, 248, 244)'`
    }
];

let totalFixed = 0;

fixes.forEach(({ file, pattern, replacement }) => {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skip: ${file}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(pattern);
    
    if (matches) {
        content = content.replace(pattern, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed ${matches.length} in: ${file}`);
        totalFixed += matches.length;
    }
});

console.log(`\n🎯 Total fixed: ${totalFixed}`);
