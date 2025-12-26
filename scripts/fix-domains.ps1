$files = Get-ChildItem -Path . -Recurse -Include *.ts, *.tsx, *.js, *.json, *.md, *.prisma, *.sql, Dockerfile*
foreach ($file in $files) {
    $content = Get-Content $file.FullName
    if ($content -match 'nilelink\.com') {
        Write-Host "Updating $($file.FullName)"
        $content = $content -replace 'nilelink\.com', 'nilelink\.app'
        $content | Set-Content $file.FullName
    }
}
