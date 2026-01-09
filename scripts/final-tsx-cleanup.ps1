# Final Hex Code Cleanup Script
# Target the remaining 8 TSX violations

$fixes = @{
    'web\pos\src\app\admin\products\page.tsx'     = @(
        @{ pattern = "'#d2dad1'"; replacement = "'bg-neutral'" },
        @{ pattern = "'#372c2d'"; replacement = "'bg-primary'" },
        @{ pattern = "'#f9f8f4'"; replacement = "'bg-white'" }
    )
    'web\pos\src\components\shared\Button.tsx'    = @(
        @{ pattern = '#0b2b21'; replacement = 'var(--color-primary)' },
        @{ pattern = '#c1cec0'; replacement = 'var(--color-neutral)' }
    )
    'web\portal\src\app\admin\dashboard\page.tsx' = @(
        @{ pattern = '#0f172a'; replacement = 'var(--color-primary)' }
    )
    'web\portal\src\app\for-developers\page.tsx'  = @(
        @{ pattern = '#0e1117'; replacement = 'var(--color-primary)' },
        @{ pattern = '#161b22'; replacement = 'var(--color-primary)' }
    )
    'web\portal\src\app\page.tsx'                 = @(
        @{ pattern = '#842'; replacement = 'red-800' }
    )
    'web\portal\src\components\NetworkMap.tsx'    = @(
        @{ pattern = '#3b82f6'; replacement = 'blue-500' },
        @{ pattern = '#fbbf24'; replacement = 'amber-400' },
        @{ pattern = '#ef4444'; replacement = 'red-500' }
    )
}

foreach ($file in $fixes.Keys) {
    $path = Join-Path $PWD $file
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        foreach ($fix in $fixes[$file]) {
            $content = $content -replace [regex]::Escape($fix.pattern), $fix.replacement
        }
        Set-Content $path $content -NoNewline
        Write-Host "✓ Fixed: $file"
    }
    else {
        Write-Host "⚠ Not found: $file"
    }
}

Write-Host "`n✅ Final cleanup complete!"
