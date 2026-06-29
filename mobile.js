document.addEventListener("DOMContentLoaded", () => {
  // Only execute logic if on tablet/mobile screen (optional, but good for performance)
  // We'll let CSS handle visibility, but we need to inject the button.

  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelector('.nav-links');
  
  if (navbar && navLinks) {
    // Create the hamburger menu button
    const hamburger = document.createElement('button');
    hamburger.classList.add('mobile-menu-btn');
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    
    // Insert the hamburger before the navLinks
    navbar.insertBefore(hamburger, navLinks);
    
    // Toggle active classes on click
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      
      // Toggle body scrolling when menu is open
      if (navLinks.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Close menu when clicking a link inside it
    const links = navLinks.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
});
