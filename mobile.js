document.addEventListener("DOMContentLoaded", () => {
  // --- URGENT ENCODING REPAIR ---
  // Replaces the broken special characters across the site so you DO NOT have to re-upload HTML files.
  function fixEncodingMojibake(node) {
      if (node.nodeType === 3) { // Node.TEXT_NODE
          let text = node.nodeValue;
          let original = text;
          text = text.replace(/â†—/g, '↗');
          text = text.replace(/â€”/g, '—');
          text = text.replace(/âœ¦/g, '✦');
          text = text.replace(/LumiÃ¨re/g, 'Lumière');
          text = text.replace(/CafÃ©/g, 'Café');
          text = text.replace(/â€¢/g, '•');
          text = text.replace(/â€™/g, "'");
          if (text !== original) {
              node.nodeValue = text;
          }
      } else if (node.nodeType === 1) { // Node.ELEMENT_NODE
          node.childNodes.forEach(fixEncodingMojibake);
      }
  }
  fixEncodingMojibake(document.body);
  // ---------------------------------

  const navbar = document.querySelector('.navbar');
  const navLinksContainer = document.querySelector('.nav-links');
  
  if (navbar && navLinksContainer) {
    // --- MOBILE NAVIGATION FIX ---
    // If inline scripts erased the mobile menu items, we inject them back dynamically.
    if (window.innerWidth <= 991) {
        const links = navLinksContainer.querySelectorAll('.nav-link:not(.btn)');
        links.forEach(link => {
           let href = (link.getAttribute('href') || '').toLowerCase();
           if (href.includes('about')) link.innerHTML = 'About';
           else if (href.includes('faq')) link.innerHTML = 'FAQs';
           else if (href.includes('work')) link.innerHTML = 'Work';
           else if (href.includes('blog')) link.innerHTML = 'Blog';
        });
    }
    // ---------------------------------

    // Create the hamburger menu div (using a completely bare div to fix the white dot issue)
    const hamburger = document.createElement('div');
    hamburger.classList.add('mobile-menu-btn');
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    
    // Insert the hamburger before the navLinks
    navbar.insertBefore(hamburger, navLinksContainer);
    
    // Toggle active classes on click
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburger.classList.toggle('active');
      navLinksContainer.classList.toggle('active');
      
      // Toggle body scrolling when menu is open
      if (navLinksContainer.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Close menu when clicking a link inside it
    const allLinks = navLinksContainer.querySelectorAll('.nav-link');
    allLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinksContainer.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
});
