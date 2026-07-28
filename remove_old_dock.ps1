$files = Get-ChildItem -Filter *.html | Where-Object { $_.Name -ne 'index.html' }

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw

    # Remove the old premium-floating-dock block
    $content = $content -replace '(?s)<!-- Premium Floating Contact Dock -->\s*<div class="premium-floating-dock">.*?</div>\s*(?=<!-- Floating Contact Dock)', ''
    
    # Just in case there are some without the comment
    $content = $content -replace '(?s)<div class="premium-floating-dock">.*?</div>\s*(?=<!-- Floating Contact Dock)', ''

    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Output "Removed old dock successfully."
