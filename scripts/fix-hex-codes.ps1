# Batch replacement script for common hex codes
$files = @(
    "web\pos\src\app\admin\page.tsx",
    "web\pos\src\app\admin\plans\page.tsx",
    "web\pos\src\app\admin\products\page.tsx",
    "web\pos\src\app\terminal\receipt\page.tsx",
    "web\pos\src\app\terminal\shift\page.tsx",
    "web\pos\src\app\terminal\reports\page.tsx",
    "web\pos\src\app\terminal\recipes\page.tsx",
    "web\pos\src\components\OrderSummary.tsx",
    "web\pos\src\components\POSSidebar.tsx"
)

foreach ($file in $files) {
    $path = Join-Path $PWD $file
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        # Replace #00C389 with bg-secondary (Tailwind class)
        $content = $content -replace 'bg-\[#00C389\]', 'bg-secondary'
        $content = $content -replace 'border-\[#00C389\]', 'border-secondary'
        $content = $content -replace "color: '#00C389'", "color: 'var(--color-secondary)'"
        $content = $content -replace "'#00C389'", "'bg-secondary'"  # General fallback
        
        Set-Content $path $content -NoNewline
        Write-Host "✓ Fixed: $file"
    }
}

Write-Host "`n✅ Batch replacement complete!"
