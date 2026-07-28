$files = Get-ChildItem -Filter *.html | Where-Object { $_.Name -ne 'index.html' }

$contactDockHtml = @"
  <!-- Minimalist Floating Contact -->
  <div class="minimal-contact-dock">
    <div class="contact-links">
      <a href="https://wa.me/916375266681" target="_blank" rel="noopener noreferrer" class="minimal-link">WhatsApp</a>
      <a href="https://t.me/axeonagency" target="_blank" rel="noopener noreferrer" class="minimal-link">Telegram</a>
      <a href="mailto:hello@axeonagency.com" class="minimal-link">Email</a>
    </div>
    <div class="contact-trigger">
      <span class="trigger-text">Direct Chat</span>
      <div class="spinning-symbol">&#10022;</div>
    </div>
  </div>
"@

$navLogoCss = @"
    .nav-logo {
      font-family: 'Inter Display', var(--font-body);
      font-size: 4.5rem;
      font-weight: 400;
      text-decoration: none;
      color: inherit;
      letter-spacing: -0.02em;
      transition: opacity 0.3s ease;
    }
"@

$interFonts = @"
    @font-face { font-family: 'Inter Display'; src: url('https://framerusercontent.com/assets/qITWJ2WdG0wrgQPDb8lvnYnTXDg.woff2') format('woff2'); font-display: swap; font-style: normal; font-weight: 700; }
    @font-face { font-family: 'Inter Display'; src: url('https://framerusercontent.com/assets/PfdOpgzFf7N2Uye9JX7xRKYTgSc.woff2') format('woff2'); font-display: swap; font-style: normal; font-weight: 600; }
    @font-face { font-family: 'Inter Display'; src: url('https://framerusercontent.com/assets/8yoV9pUxquX7VD7ZXlNYKQmkmk.woff2') format('woff2'); font-display: swap; font-style: normal; font-weight: 500; }
"@

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw

    # 1. Update .nav-logo CSS
    $content = $content -replace '\.nav-logo\s*\{[^}]*\}', $navLogoCss

    # 2. Add premium-features.css
    if ($content -notmatch 'premium-features\.css') {
        $content = $content -replace '</head>', "  <link rel=`"stylesheet`" href=`"premium-features.css`">`n</head>"
    }

    # 3. Add mobile.css
    if ($content -notmatch 'mobile\.css') {
        $content = $content -replace '</head>', "  <link rel=`"stylesheet`" href=`"mobile.css`">`n</head>"
    }

    # 4. Insert Contact Dock
    if ($content -notmatch 'minimal-contact-dock') {
        $content = $content -replace '</body>', "$contactDockHtml`n  <script src=`"mobile.js?v=2`"></script>`n</body>"
    } else {
        if ($content -match 'mobile\.js' -and $content -notmatch 'mobile\.js\?v=2') {
            $content = $content -replace 'mobile\.js', 'mobile.js?v=2'
        } elseif ($content -notmatch 'mobile\.js') {
            $content = $content -replace '</body>', "  <script src=`"mobile.js?v=2`"></script>`n</body>"
        }
    }

    # 5. Fix Footer Spacing
    $content = $content.Replace('gap: 4rem; justify-content: flex-end;', 'gap: 3rem; justify-content: flex-end;')
    $content = $content.Replace('flex-direction: column; gap: 1rem;', 'flex-direction: column; gap: 0.5rem;')

    # 6. Standardize navbar logo text
    $content = $content -replace '<a[^>]*class="nav-logo"[^>]*>.*?</a>', '<a href="/" class="nav-logo">axeon.</a>'

    # 7. Unify Google Fonts import
    if ($content -notmatch 'Inter Display') {
        $content = $content -replace '<style>', "<style>`n$interFonts"
    }

    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Output "Processed files successfully."
