/* ==========================================================================
   FISHING LANDING - INTERACTIVITY & ASYNC VIDEO CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     1. ASYNCHRONOUS VIDEO LOADING & FADE-IN CONTROLLER
     -------------------------------------------------------------------------- */
  
  /**
   * Loads a video asynchronously over a background image.
   * When the video can play, it triggers .play() and fades in opacity to 1.
   * @param {string} videoId - Element ID of the video
   */
  function initAsyncVideo(videoId) {
    const video = document.getElementById(videoId);
    if (!video) return;

    // Helper function to activate video visibility
    const activateVideo = () => {
      if (!video.classList.contains('video-loaded')) {
        video.play().then(() => {
          video.classList.add('video-loaded');
        }).catch(err => {
          console.warn(`Autoplay restriction or error for ${videoId}:`, err);
          // Retry on user interaction if blocked by browser autoplay policy
          const playOnTouch = () => {
            video.play();
            video.classList.add('video-loaded');
            document.removeEventListener('touchstart', playOnTouch);
            document.removeEventListener('click', playOnTouch);
          };
          document.addEventListener('touchstart', playOnTouch, { once: true });
          document.addEventListener('click', playOnTouch, { once: true });
        });
      }
    };

    // Event Listeners for smooth async loading
    if (video.readyState >= 3) {
      // Already cached or ready
      activateVideo();
    } else {
      video.addEventListener('canplaythrough', activateVideo, { once: true });
      video.addEventListener('loadeddata', activateVideo, { once: true });
      video.addEventListener('playing', activateVideo, { once: true });
    }

    // Force load trigger
    video.load();

    // Safety fallback: if event doesn't fire within 4 seconds, force attempt play
    setTimeout(() => {
      activateVideo();
    }, 4000);
  }

  // Initialize both async video overlays
  initAsyncVideo('heroVideo');
  initAsyncVideo('footerVideo');


  /* --------------------------------------------------------------------------
     2. CUSTOM DYNAMIC CURSOR (AWWARDS STYLE)
     -------------------------------------------------------------------------- */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  if (cursorDot && cursorRing && window.innerWidth > 768) {
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let initialized = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!initialized) {
        ringX = mouseX;
        ringY = mouseY;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
        initialized = true;
      }

      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth Lerp loop for cursor ring
    function renderCursor() {
      if (initialized) {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;

        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
      }

      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Hover state scaling on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .tab-item, .feature-card, input');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hovered'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hovered'));
    });
  }


  /* --------------------------------------------------------------------------
     3. PESQUEIROS INTERACTIVE TABS SWITCHER
     -------------------------------------------------------------------------- */
  const tabItems = document.querySelectorAll('.tab-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');

      // Update active tab button
      tabItems.forEach(tab => tab.classList.remove('active'));
      item.classList.add('active');

      // Update active tab content pane
      tabPanes.forEach(pane => {
        if (pane.id === targetTab) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });


  /* --------------------------------------------------------------------------
     4. NAVBAR SCROLL EFFECT & ACTIVE LINK HIGHLIGHTING
     -------------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section, footer');

  window.addEventListener('scroll', () => {
    // Glassmorphism navbar state
    if (window.scrollY > 50) {
      navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
      navbar.style.background = 'rgba(38, 48, 36, 0.95)';
    } else {
      navbar.style.boxShadow = 'none';
      navbar.style.background = 'rgba(58, 70, 55, 0.85)';
    }

    // ScrollSpy active link
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });


  /* --------------------------------------------------------------------------
     5. MOBILE MENU DRAWER TOGGLE
     -------------------------------------------------------------------------- */
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      mobileToggle.innerHTML = isOpen 
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>'
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
    });

    // Close menu when clicking links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }


  /* --------------------------------------------------------------------------
     6. PARALLAX EFFECT FOR HERO SECTION
     -------------------------------------------------------------------------- */
  const heroContent = document.querySelector('.hero-content');
  const heroBgImage = document.getElementById('heroBgImage');
  const heroVideo = document.getElementById('heroVideo');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    if (scrollPos <= window.innerHeight) {
      if (heroContent) {
        heroContent.style.transform = `translateY(${scrollPos * 0.25}px)`;
        heroContent.style.opacity = 1 - (scrollPos / (window.innerHeight * 0.8));
      }
      if (heroBgImage) {
        heroBgImage.style.transform = `scale(${1 + scrollPos * 0.0004})`;
      }
      if (heroVideo) {
        heroVideo.style.transform = `scale(${1 + scrollPos * 0.0004})`;
      }
    }
  });

});
