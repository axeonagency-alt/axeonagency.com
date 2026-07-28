import os
import re
import glob

# HTML files to process
html_files = glob.glob('*.html')
if 'index.html' in html_files:
    html_files.remove('index.html')

contact_dock_html = """
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
"""

nav_logo_css = """    .nav-logo {
      font-family: 'Inter Display', var(--font-body);
      font-size: 4.5rem;
      font-weight: 400;
      text-decoration: none;
      color: inherit;
      letter-spacing: -0.02em;
      transition: opacity 0.3s ease;
    }"""

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update .nav-logo CSS
    # Use regex to find the .nav-logo block. It usually looks like:
    # .nav-logo { ... }
    nav_logo_pattern = re.compile(r'\.nav-logo\s*\{[^}]*\}', re.DOTALL)
    if nav_logo_pattern.search(content):
        content = nav_logo_pattern.sub(nav_logo_css, content)

    # 2. Add premium-features.css if missing
    if 'premium-features.css' not in content:
        # Find </head> and insert before
        content = content.replace('</head>', '  <link rel="stylesheet" href="premium-features.css">\n</head>')

    # 3. Add mobile.css if missing
    if 'mobile.css' not in content:
        content = content.replace('</head>', '  <link rel="stylesheet" href="mobile.css">\n</head>')

    # 4. Insert Contact Dock before </body> if missing
    if 'minimal-contact-dock' not in content:
        content = content.replace('</body>', f'{contact_dock_html}\n  <script src="mobile.js?v=2"></script>\n</body>')
    else:
        # if contact-dock exists, make sure mobile.js is linked properly
        if 'mobile.js?v=2' not in content and 'mobile.js' in content:
            content = content.replace('mobile.js', 'mobile.js?v=2')
        elif 'mobile.js' not in content:
            content = content.replace('</body>', '  <script src="mobile.js?v=2"></script>\n</body>')

    # 5. Fix Footer Spacing
    # Look for: style="display: flex; gap: 4rem; justify-content: flex-end;"
    content = content.replace('gap: 4rem; justify-content: flex-end;', 'gap: 3rem; justify-content: flex-end;')
    # Look for: style="display: flex; flex-direction: column; gap: 1rem;"
    content = content.replace('flex-direction: column; gap: 1rem;', 'flex-direction: column; gap: 0.5rem;')

    # 6. Standardize navbar logo text if it's different
    # Wait, some pages might have a different text inside <a class="nav-logo">
    nav_text_pattern = re.compile(r'<a[^>]*class="nav-logo"[^>]*>.*?</a>', re.DOTALL)
    # We will replace it with <a href="/" class="nav-logo">axeon.</a>
    content = nav_text_pattern.sub('<a href="/" class="nav-logo">axeon.</a>', content)

    # 7. Unify Google Fonts import
    # Replace any Google fonts link containing League Spartan or perfectly nineties etc
    # with the robust one from index.html
    # Actually, to be safe, we just make sure Inter Display is present.
    if 'Inter Display' not in content:
        inter_fonts = """    @font-face { font-family: 'Inter Display'; src: url('https://framerusercontent.com/assets/qITWJ2WdG0wrgQPDb8lvnYnTXDg.woff2') format('woff2'); font-display: swap; font-style: normal; font-weight: 700; }
    @font-face { font-family: 'Inter Display'; src: url('https://framerusercontent.com/assets/PfdOpgzFf7N2Uye9JX7xRKYTgSc.woff2') format('woff2'); font-display: swap; font-style: normal; font-weight: 600; }
    @font-face { font-family: 'Inter Display'; src: url('https://framerusercontent.com/assets/8yoV9pUxquX7VD7ZXlNYKQmkmk.woff2') format('woff2'); font-display: swap; font-style: normal; font-weight: 500; }"""
        # insert right after <style>
        content = content.replace('<style>', f'<style>\n{inter_fonts}')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"Processed {len(html_files)} files successfully.")
