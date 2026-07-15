/**
 * AXEON AGENCY — PREMIUM MOBILE JS
 * Handles navigation, scroll effects, touch interactions,
 * and polished micro-interactions for mobile.
 */

document.addEventListener("DOMContentLoaded", () => {

  /* ── 1. ENCODING REPAIR ─────────────────────────────────── */
  function fixEncodingMojibake(node) {
    if (node.nodeType === 3) {
      let text = node.nodeValue;
      let original = text;
      text = text.replace(/â†—/g, '↗');
      text = text.replace(/â€"/g, '—');
      text = text.replace(/âœ¦/g, '✦');
      text = text.replace(/LumiÃ¨re/g, 'Lumière');
      text = text.replace(/CafÃ©/g, 'Café');
      text = text.replace(/â€¢/g, '•');
      text = text.replace(/â€™/g, "'");
      if (text !== original) node.nodeValue = text;
    } else if (node.nodeType === 1) {
      node.childNodes.forEach(fixEncodingMojibake);
    }
  }
  fixEncodingMojibake(document.body);

  /* ── 2. MOBILE DETECTION ────────────────────────────────── */
  const isMobile = () => window.innerWidth <= 991;
  const isTouch  = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  /* ── 3. NAVIGATION SETUP ────────────────────────────────── */
  const navbar           = document.querySelector('.navbar');
  const navLinksContainer = document.querySelector('.nav-links');

  if (navbar && navLinksContainer) {

    /* Dynamic Logo Swap Setup */
    const navLogo = document.querySelector('.nav-logo');
    if (navLogo && !navLogo.querySelector('.nav-logo-text-container')) {
      const originalText = navLogo.textContent.trim() || 'axeon.';
      
      navLogo.style.position = 'relative';
      navLogo.style.display = 'inline-flex';
      navLogo.style.alignItems = 'center';
      
      let html = `<span class="nav-logo-text-container" style="display: inline-flex;">`;
      originalText.split('').forEach((char, i) => {
        html += `<span class="nav-logo-char" style="transition: opacity 0.2s ease ${i * 0.05}s, transform 0.2s ease ${i * 0.05}s; display: inline-block; opacity: 1; transform: translateY(0);">${char === ' ' ? '&nbsp;' : char}</span>`;
      });
      html += `</span>`;
      
      html += `<img src="logo.png" alt="Axeon Logo" class="nav-logo-img" style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); height: 4.5rem; width: auto; opacity: 0; transition: opacity 0.4s ease 0.3s; pointer-events: none; object-fit: contain;">`;
      
      navLogo.innerHTML = html;
    }

    /* Fix link labels if they were stripped */
    if (isMobile()) {
      const links = navLinksContainer.querySelectorAll('.nav-link:not(.btn)');
      links.forEach(link => {
        const href = (link.getAttribute('href') || '').toLowerCase();
        if (!link.textContent.trim()) {
          if (href.includes('about'))   link.innerHTML = 'About';
          else if (href.includes('faq'))  link.innerHTML = 'FAQs';
          else if (href.includes('work')) link.innerHTML = 'Work';
          else if (href.includes('blog')) link.innerHTML = 'Blog';
        }
      });
    }

    /* Create hamburger button */
    const hamburger = document.createElement('div');
    hamburger.classList.add('mobile-menu-btn');
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    hamburger.setAttribute('role', 'button');
    hamburger.setAttribute('tabindex', '0');
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    navbar.insertBefore(hamburger, navLinksContainer);

    /* Menu open/close state */
    let menuOpen = false;
    let scrollY  = 0;

    function openMenu() {
      menuOpen = true;
      scrollY  = window.scrollY;

      hamburger.classList.add('active');
      navLinksContainer.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');

      /* Lock body scroll but preserve position */
      document.body.style.position   = 'fixed';
      document.body.style.top        = `-${scrollY}px`;
      document.body.style.width      = '100%';
      document.body.style.overflow   = 'hidden';
    }

    function closeMenu() {
      menuOpen = false;

      hamburger.classList.remove('active');
      navLinksContainer.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');

      /* Restore scroll position precisely */
      document.body.style.position = '';
      document.body.style.top      = '';
      document.body.style.width    = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    }

    /* Toggle on click */
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      menuOpen ? closeMenu() : openMenu();
    });

    /* Keyboard support */
    hamburger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        menuOpen ? closeMenu() : openMenu();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuOpen) closeMenu();
    });

    /* Close on nav link click */
    navLinksContainer.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });

    /* Close on outside click */
    document.addEventListener('click', (e) => {
      if (menuOpen && !navbar.contains(e.target)) closeMenu();
    });

    /* ── 4. NAVBAR SCROLL EFFECT ─────────────────────────── */
    let lastScrollY  = 0;
    let ticking      = false;

    function updateNavbar() {
      const currentScrollY = window.scrollY;
      const scrollDelta    = currentScrollY - lastScrollY;

      /* Add "solid" class when scrolled past 80px */
      const logoChars = document.querySelectorAll('.nav-logo-char');
      const logoImg = document.querySelector('.nav-logo-img');
      
      if (currentScrollY > 80) {
        navbar.classList.add('solid');
        logoChars.forEach(char => {
          char.style.opacity = '0';
          char.style.transform = 'translateY(-10px)';
        });
        if (logoImg) {
          logoImg.style.opacity = '1';
          logoImg.style.pointerEvents = 'auto';
        }
      } else {
        navbar.classList.remove('solid');
        logoChars.forEach(char => {
          char.style.opacity = '1';
          char.style.transform = 'translateY(0)';
        });
        if (logoImg) {
          logoImg.style.opacity = '0';
          logoImg.style.pointerEvents = 'none';
        }
      }

      /* Hide navbar on scroll down (> 200px from top), show on scroll up */
      if (currentScrollY > 200) {
        if (scrollDelta > 5 && !menuOpen) {
          navbar.style.transform = 'translateY(-100%)';
          navbar.style.transition = 'transform 0.4s cubic-bezier(0.77, 0, 0.175, 1)';
        } else if (scrollDelta < -5) {
          navbar.style.transform = 'translateY(0)';
        }
      } else {
        navbar.style.transform = 'translateY(0)';
      }

      lastScrollY = currentScrollY;
      ticking     = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── 5. SMOOTH MOBILE SCROLL ────────────────────────────── */
  /* Polyfill smooth scroll for anchor links on iOS */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── 6. LAZY IMAGE LOADING ──────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    lazyImages.forEach(img => imageObserver.observe(img));
  }

  /* ── 7. TOUCH RIPPLE EFFECT ON BUTTONS ──────────────────── */
  if (isTouch()) {
    document.querySelectorAll('.btn, .nav-link, .premium-dock-item').forEach(el => {
      el.addEventListener('touchstart', function(e) {
        const touch  = e.touches[0];
        const rect   = this.getBoundingClientRect();
        const x      = touch.clientX - rect.left;
        const y      = touch.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          animation: axeon-ripple 0.5s linear;
          background: rgba(255,255,255,0.18);
          width: 100px; height: 100px;
          margin-left: ${x - 50}px;
          margin-top: ${y - 50}px;
          pointer-events: none;
          z-index: 1;
        `;

        const currentPosition = getComputedStyle(this).position;
        if (currentPosition === 'static') this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
      }, { passive: true });
    });

    /* Inject ripple keyframes once */
    if (!document.getElementById('axeon-ripple-style')) {
      const style = document.createElement('style');
      style.id    = 'axeon-ripple-style';
      style.textContent = `
        @keyframes axeon-ripple {
          to { transform: scale(4); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /* ── 8. ACTIVE LINK HIGHLIGHTING ───────────────────────── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href && currentPath.includes(href.replace('.html', ''))) {
      link.style.opacity = '1';
      link.style.fontWeight = '800';
    }
  });

  /* ── 9. SCROLL PROGRESS INDICATOR ──────────────────────── */
  if (document.querySelector('article, .blog-content, .page-content')) {
    const progressBar = document.createElement('div');
    progressBar.id    = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed; top: 0; left: 0;
      width: 0%; height: 2px;
      background: var(--accent-color, #9b59f6);
      z-index: 9999;
      transition: width 0.1s linear;
      pointer-events: none;
    `;
    document.body.prepend(progressBar);

    window.addEventListener('scroll', () => {
      const scrollTop    = window.scrollY;
      const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = `${Math.min(scrolled, 100)}%`;
    }, { passive: true });
  }

  /* ── 10. PREVENT DOUBLE-TAP ZOOM ON BUTTONS ────────────── */
  let lastTouchEnd = 0;
  document.querySelectorAll('.btn, button, .nav-link').forEach(el => {
    el.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd < 300) e.preventDefault();
      lastTouchEnd = now;
    }, { passive: false });
  });

  /* ── 11. VIEWPORT HEIGHT FIX (iOS Safari 100vh bug) ────── */
  function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  setVH();
  window.addEventListener('resize', setVH, { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(setVH, 300);
  });

  /* ── 12. PERFORMANCE: Passive scroll listeners everywhere ── */
  /* Already applied above with { passive: true }. */
  /* This catches any stray scroll event bindings added by page JS */
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'touchmove' || type === 'touchstart') {
      if (typeof options === 'boolean') options = { capture: options, passive: true };
      else if (!options) options = { passive: true };
      else if (options.passive === undefined) options.passive = true;
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

});
