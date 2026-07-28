$oldDock = @"
  <!-- Floating Contact Dock (Minimal & Elegant) -->
  <div class="contact-dock">
    <div class="contact-links">
      <a href="https://wa.me/1234567890" target="_blank" class="contact-icon" title="WhatsApp">WA</a>
      <a href="https://t.me/axeonagency" target="_blank" class="contact-icon" title="Telegram">TG</a>
      <a href="mailto:hello@axeonagency.com" class="contact-icon" title="Email">EM</a>
    </div>
    <div class="contact-trigger">
      <svg class="star-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"/>
      </svg>
      <span>Direct Chat</span>
    </div>
  </div>
"@

$newDock = @"
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

$files = Get-ChildItem -Filter *.html
$count = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    if ($content.Contains($oldDock)) {
        $content = $content.Replace($oldDock, $newDock)
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $count++
    }
}
Write-Host "Updated $count files"
