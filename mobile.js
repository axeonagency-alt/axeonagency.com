/**
 * AXEON AGENCY — PREMIUM MOBILE JS
 *
 * Key improvements for buttery-smooth mobile experience:
 * 1. Kill Lenis on mobile (causes jitter/stutter on touch devices)
 * 2. Kill heavy GSAP scrub ScrollTrigger parallax on mobile
 * 3. Transparent navbar — no black header flash
 * 4. Fix AI section absolute→flow layout so wave doesn't touch paragraph
 * 5. All scroll listeners use { passive: true } for 60fps scrolling
 * 6. requestAnimationFrame-debounced scroll handler
 */

document.addEventListener("DOMContentLoaded", () => {

  /* ── MOBILE DETECTION ──────────────────────────────────── */
  const isMobile = () => window.innerWidth <= 991;
  const isTouch  = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  /* ═══════════════════════════════════════════════════════════
     1. KILL LENIS SMOOTH SCROLL ON MOBILE
        Lenis smooth scroll uses JS-driven scrolling which
        bypasses the browser's native momentum — this is the
        #1 cause of jitter & lag on mobile devices.
        We destroy it and restore native scroll.
  ═══════════════════════════════════════════════════════════ */
  if (isMobile() || isTouch()) {
    // Give the main script a moment to initialise Lenis, then destroy it
    const killLenis = () => {
      try {
        // Access lenis instance from window scope (set by main script)
        if (window.lenis) {
          window.lenis.destroy();
          window.lenis = null;
        }

        // Remove lenis classes from html element
        document.documentElement.classList.remove('lenis', 'lenis-smooth');
        document.documentElement.style.removeProperty('height');

        // Remove the Lenis RAF loop override if possible
        // (Lenis overrides scroll events — removing the class restores native)
        document.body.classList.remove('lenis-smooth');

      } catch (e) {
        // Silent fail — Lenis may not exist
      }
    };

    // Run immediately and after a short delay to catch late init
    killLenis();
    setTimeout(killLenis, 100);
    setTimeout(killLenis, 500);
  }

  /* ═══════════════════════════════════════════════════════════
     2. KILL / SIMPLIFY HEAVY GSAP SCRUB ANIMATIONS ON MOBILE
        Parallax scrub animations (scrub: true) recalculate
        layout on every frame while scrolling — on mobile this
        causes dropped frames. We remove these on mobile.
  ═══════════════════════════════════════════════════════════ */
  if (isMobile() && window.ScrollTrigger) {
    // Give GSAP a moment to register its animations, then kill the heavy ones
    setTimeout(() => {
      try {
        ScrollTrigger.getAll().forEach(trigger => {
          // Kill the scrub (parallax) triggers — they're too expensive on mobile
          if (trigger.vars && trigger.vars.scrub) {
            // Instead of killing entirely, just remove the scrub
            // by refreshing with no-scrub settings. Simplest: just kill it.
            trigger.kill();
          }
        });

        // Kill hero parallax specifically (the container drift animation)
        // which was: gsap.to('#hero-section .container', { y: -120, scrub: true })
        // This creates a repaint-heavy layer every scroll frame on mobile
        const heroContainer = document.querySelector('#hero-section .container');
        if (heroContainer) {
          gsap.set(heroContainer, { y: 0, clearProps: 'y' });
        }

        // Refresh ScrollTrigger so remaining triggers recalculate correctly
        ScrollTrigger.refresh();
      } catch (e) {
        // GSAP may not be loaded — safe to ignore
      }
    }, 200);
  }

  /* ═══════════════════════════════════════════════════════════
     3. AI SECTION — FIX ABSOLUTE → FLOW LAYOUT ON MOBILE
        The desktop layout uses position:absolute for the heading
        and description. On mobile we convert to normal flow.
        We do this in JS to override inline styles (which CSS
        selectors targeting [style*="..."] can sometimes miss).
  ═══════════════════════════════════════════════════════════ */
  if (isMobile()) {
    const aiSection = document.getElementById('ai-section');
    if (aiSection) {
      const applyAiSectionMobileLayout = () => {
        // Find the heading container (top-left on desktop)
        // It's a direct child div with position:absolute and top in its style
        const children = Array.from(aiSection.children);

        // Sort children: SVG wave background stays, others go to flow
        children.forEach(child => {
          const style = child.getAttribute('style') || '';
          const isWaveBg = style.includes('z-index: 1') && style.includes('pointer-events: none');
          const isHeading = style.includes('top: 8vh') || style.includes('top:8vh');
          const isPara = style.includes('bottom: 8vh') || style.includes('bottom:8vh');

          if (isWaveBg) {
            // Keep wave as absolute background, just ensure it stays layered properly
            child.style.position = 'absolute';
            child.style.top = '0';
            child.style.left = '0';
            child.style.width = '100%';
            child.style.height = '100%';
            child.style.zIndex = '1';
            child.style.pointerEvents = 'none';
          } else if (isHeading) {
            child.style.position = 'relative';
            child.style.top = 'auto';
            child.style.left = 'auto';
            child.style.maxWidth = '100%';
            child.style.width = '100%';
            child.style.padding = '0 6vw';
            child.style.zIndex = '2';
            child.style.marginBottom = '3rem';
            // Move to beginning of ai-section flow (after SVG)
            aiSection.appendChild(child);
          } else if (isPara) {
            child.style.position = 'relative';
            child.style.bottom = 'auto';
            child.style.right = 'auto';
            child.style.maxWidth = '100%';
            child.style.width = '100%';
            child.style.textAlign = 'left';
            child.style.padding = '0 6vw';
            child.style.zIndex = '2';
            child.style.marginTop = '0';
            aiSection.appendChild(child);
          }
        });

        // Override the ai-section container styles
        aiSection.style.display = 'flex';
        aiSection.style.flexDirection = 'column';
        aiSection.style.alignItems = 'flex-start';
        aiSection.style.justifyContent = 'flex-start';
        aiSection.style.minHeight = 'auto';
        aiSection.style.padding = '12vh 0 10vh';
      };

      applyAiSectionMobileLayout();
    }
  }

  /* ═══════════════════════════════════════════════════════════
     4. NAVIGATION SETUP
  ═══════════════════════════════════════════════════════════ */
  const navbar            = document.querySelector('.navbar');
  const navLinksContainer = document.querySelector('.nav-links');

  if (navbar && navLinksContainer) {

    /* Dynamic Logo Swap */
    const navLogo = document.querySelector('.nav-logo');
    if (navLogo && !navLogo.querySelector('.nav-logo-text-container')) {
      const originalText = navLogo.textContent.trim() || 'axeon.';

      navLogo.style.position = 'relative';
      navLogo.style.display  = 'inline-flex';
      navLogo.style.alignItems = 'center';

      let html = `<span class="nav-logo-text-container" style="display: inline-flex;">`;
      originalText.split('').forEach((char, i) => {
        html += `<span class="nav-logo-char" style="transition: opacity 0.2s ease ${i * 0.05}s, transform 0.2s ease ${i * 0.05}s; display: inline-block; opacity: 1; transform: translateY(0);">${char === ' ' ? '&nbsp;' : char}</span>`;
      });
      html += `</span>`;
      html += `<img src="logo.png" alt="Axeon Logo" class="nav-logo-img" style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); height: 7.5rem; width: auto; opacity: 0; transition: opacity 0.4s ease 0.3s; pointer-events: none; object-fit: contain;">`;
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

    /* Menu state */
    let menuOpen = false;
    let savedScrollY = 0;

    function openMenu() {
      menuOpen = true;
      savedScrollY = window.scrollY;

      hamburger.classList.add('active');
      navLinksContainer.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');

      /* Lock body scroll but preserve position */
      document.body.style.position = 'fixed';
      document.body.style.top      = `-${savedScrollY}px`;
      document.body.style.width    = '100%';
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      menuOpen = false;

      hamburger.classList.remove('active');
      navLinksContainer.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');

      /* Restore scroll position */
      document.body.style.position = '';
      document.body.style.top      = '';
      document.body.style.width    = '';
      document.body.style.overflow = '';
      window.scrollTo(0, savedScrollY);
    }

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      menuOpen ? closeMenu() : openMenu();
    });

    hamburger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        menuOpen ? closeMenu() : openMenu();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuOpen) closeMenu();
    });

    navLinksContainer.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('click', (e) => {
      if (menuOpen && !navbar.contains(e.target)) closeMenu();
    });

    /* ── NAVBAR SCROLL EFFECT ─────────────────────────────
       Transparent by default — only becomes solid after 80px.
       No black flash on load.
    ────────────────────────────────────────────────────── */
    let lastScrollY = 0;
    let ticking     = false;

    // Ensure navbar starts fully transparent
    navbar.style.backgroundColor = 'transparent';
    navbar.style.background      = 'transparent';

    function updateNavbar() {
      const currentScrollY = window.scrollY;
      const scrollDelta    = currentScrollY - lastScrollY;

      const logoChars = document.querySelectorAll('.nav-logo-char');
      const logoImg   = document.querySelector('.nav-logo-img');

      if (currentScrollY > 80) {
        navbar.classList.add('solid');
        logoChars.forEach(char => {
          char.style.opacity   = '0';
          char.style.transform = 'translateY(-10px)';
        });
        if (logoImg) {
          logoImg.style.opacity       = '1';
          logoImg.style.pointerEvents = 'auto';
        }
      } else {
        navbar.classList.remove('solid');
        // When at top, ensure no stray background
        if (!menuOpen) {
          navbar.style.background = 'transparent';
        }
        logoChars.forEach(char => {
          char.style.opacity   = '1';
          char.style.transform = 'translateY(0)';
        });
        if (logoImg) {
          logoImg.style.opacity       = '0';
          logoImg.style.pointerEvents = 'none';
        }
      }

      /* Hide on scroll-down > 200px, show on scroll-up */
      if (currentScrollY > 200) {
        if (scrollDelta > 5 && !menuOpen) {
          navbar.style.transform  = 'translateY(-100%)';
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

    // Run once on load to set correct initial state
    updateNavbar();
  }

  /* ═══════════════════════════════════════════════════════════
     5. SMOOTH ANCHOR SCROLL (iOS polyfill)
  ═══════════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ═══════════════════════════════════════════════════════════
     6. LAZY IMAGE LOADING
  ═══════════════════════════════════════════════════════════ */
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img   = entry.target;
          img.src     = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    lazyImages.forEach(img => imageObserver.observe(img));
  }

  /* ═══════════════════════════════════════════════════════════
     7. TOUCH RIPPLE EFFECT ON BUTTONS
  ═══════════════════════════════════════════════════════════ */
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

    if (!document.getElementById('axeon-ripple-style')) {
      const style       = document.createElement('style');
      style.id          = 'axeon-ripple-style';
      style.textContent = `
        @keyframes axeon-ripple {
          to { transform: scale(4); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     8. ACTIVE LINK HIGHLIGHTING
  ═══════════════════════════════════════════════════════════ */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href && currentPath.includes(href.replace('.html', ''))) {
      link.style.opacity    = '1';
      link.style.fontWeight = '800';
    }
  });

  /* ═══════════════════════════════════════════════════════════
     9. SCROLL PROGRESS INDICATOR
        (Only on article/content pages — lightweight rAF version)
  ═══════════════════════════════════════════════════════════ */
  if (document.querySelector('article, .blog-content, .page-content')) {
    const progressBar    = document.createElement('div');
    progressBar.id       = 'scroll-progress';
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
      const scrollTop  = window.scrollY;
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = `${Math.min(scrolled, 100)}%`;
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════
     10. PREVENT DOUBLE-TAP ZOOM ON BUTTONS
  ═══════════════════════════════════════════════════════════ */
  let lastTouchEnd = 0;
  document.querySelectorAll('.btn, button, .nav-link').forEach(el => {
    el.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd < 300) e.preventDefault();
      lastTouchEnd = now;
    }, { passive: false });
  });

  /* ═══════════════════════════════════════════════════════════
     11. VIEWPORT HEIGHT FIX (iOS Safari 100vh bug)
         Uses both --vh custom property and svh fallback.
  ═══════════════════════════════════════════════════════════ */
  function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  setVH();
  window.addEventListener('resize', setVH, { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(setVH, 300);
  });

  /* ═══════════════════════════════════════════════════════════
     12. SERVE SECTION — optimised mobile version
         The desktop version uses letter-by-letter scrub which
         is expensive. On mobile, fade the whole section in.
  ═══════════════════════════════════════════════════════════ */
  if (isMobile() && window.gsap && window.ScrollTrigger) {
    setTimeout(() => {
      try {
        const serveLetters = document.querySelectorAll('#serve-reveal-text .scroll-letter');
        if (serveLetters.length > 0) {
          // Kill the existing scrub-based per-letter reveal
          ScrollTrigger.getAll().forEach(t => {
            if (t.trigger && t.trigger.id === 'who-we-serve') t.kill();
          });

          // Replace with a simple, performant opacity transition
          // Set all letters visible at once when section enters viewport
          const serveSection = document.getElementById('who-we-serve');
          if (serveSection) {
            const observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  // Fade all letters in over 0.6s — one GPU operation, not thousands
                  gsap.to(serveLetters, {
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.004,
                    ease: 'power2.out'
                  });
                  observer.disconnect();
                }
              });
            }, { threshold: 0.15 });

            observer.observe(serveSection);
          }
        }
      } catch(e) {
        // Safe fail
      }
    }, 300);
  }

});
