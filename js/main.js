/* ============================================================
   THE LAUREL ROOM — Main JavaScript
   Modern interactions & micro-animations (2026)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------
     1. SCROLL REVEAL (enhanced)
     Supports: .reveal, .reveal-left, .reveal-right, .reveal-scale
     All receive .reveal--visible when entering the viewport.
     -------------------------------------------------------- */
  const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  const reveals = document.querySelectorAll(revealSelectors);

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => revealObserver.observe(el));


  /* --------------------------------------------------------
     2. NAVIGATION — Scroll Effect
     -------------------------------------------------------- */
  const nav = document.querySelector('.nav');

  if (nav) {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // If on inner page (page-header), start scrolled
    if (document.querySelector('.page-header')) {
      nav.classList.add('nav--scrolled');
    }
  }


  /* --------------------------------------------------------
     3. MOBILE NAVIGATION TOGGLE
     -------------------------------------------------------- */
  const navToggle = document.querySelector('.nav__toggle');
  const navMenu = document.querySelector('.nav__menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('nav__toggle--active');
      navMenu.classList.toggle('nav__menu--open');
      document.body.style.overflow = navMenu.classList.contains('nav__menu--open') ? 'hidden' : '';
    });

    // Close menu on link click
    navMenu.querySelectorAll('.nav__link, .nav__cta').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('nav__toggle--active');
        navMenu.classList.remove('nav__menu--open');
        document.body.style.overflow = '';
      });
    });
  }


  /* --------------------------------------------------------
     4. LIGHTBOX
     -------------------------------------------------------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox?.querySelector('img');
  const lightboxClose = lightbox?.querySelector('.lightbox__close');

  document.querySelectorAll('[data-lightbox]').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.lightbox || item.querySelector('img')?.src;
      if (src && lightbox && lightboxImg) {
        lightboxImg.src = src;
        lightbox.classList.add('lightbox--open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (lightbox) {
    const closeLightbox = () => {
      lightbox.classList.remove('lightbox--open');
      document.body.style.overflow = '';
    };

    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }


  /* --------------------------------------------------------
     5. FORM HANDLING (Web3Forms)
     -------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'SENDING...';
      submitBtn.disabled = true;

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
          // Show success state
          contactForm.innerHTML = `
            <div style="text-align: center; padding: 3rem 0;">
              <h3 style="margin-bottom: 0.5rem;">Thank You</h3>
              <p class="text-gray">We've received your inquiry and will be in touch within 24 hours.</p>
            </div>
          `;
        } else {
          throw new Error('Form submission failed');
        }
      } catch {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        alert('Something went wrong. Please try again or email us directly at hello@thelaurelroom.ca');
      }
    });
  }


  /* --------------------------------------------------------
     6. SMOOTH SCROLL FOR ANCHOR LINKS
     -------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* --------------------------------------------------------
     7. ACTIVE NAV LINK
     -------------------------------------------------------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('nav__link--active');
    }
  });


  /* ==========================================================
     NEW MODERN ENHANCEMENTS
     ========================================================== */


  /* --------------------------------------------------------
     8. LAZY IMAGE FADE-IN
     Adds .loaded class to lazy images once they finish loading.
     -------------------------------------------------------- */
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
    }
  });


  /* --------------------------------------------------------
     9. PARALLAX EFFECT ON HERO
     Subtle scale + translateY driven by scroll position.
     -------------------------------------------------------- */
  const heroImg = document.querySelector('.hero__bg img');

  if (heroImg) {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const heroHeight = window.innerHeight;
          if (scrolled < heroHeight) {
            heroImg.style.transform =
              `scale(${1 + scrolled * 0.0003}) translateY(${scrolled * 0.3}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }


  /* --------------------------------------------------------
     10. COUNTER ANIMATION FOR STATS
     Animates [data-count] elements when they scroll into view.
     Supports data-prefix and data-suffix attributes.
     -------------------------------------------------------- */
  const animateCounters = () => {
    document.querySelectorAll('[data-count]').forEach(el => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = parseInt(el.dataset.count);
            const prefix = el.dataset.prefix || '';
            const suffix = el.dataset.suffix || '';
            let current = 0;
            const increment = target / 40;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
            }, 30);
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(el);
    });
  };

  animateCounters();


  /* --------------------------------------------------------
     11. SCROLL PROGRESS INDICATOR
     Thin saffron bar fixed at the very top of the viewport.
     -------------------------------------------------------- */
  const progressBar = document.createElement('div');
  progressBar.style.cssText =
    'position:fixed;top:0;left:0;height:2px;background:var(--saffron);' +
    'z-index:9999;transition:width 0.1s linear;width:0;pointer-events:none;';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = scrollPercent + '%';
  }, { passive: true });


  /* --------------------------------------------------------
     12. STAGGERED CHILDREN ANIMATION
     Container with .stagger-children reveals its direct
     children one by one with an 80 ms offset each.
     -------------------------------------------------------- */
  document.querySelectorAll('.stagger-children').forEach(container => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const children = entry.target.children;
          Array.from(children).forEach((child, i) => {
            child.style.transitionDelay = `${i * 0.08}s`;
            child.classList.add('reveal--visible');
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(container);
  });


  /* --------------------------------------------------------
     13. MAGNETIC BUTTON EFFECT
     Subtle cursor-following shift on CTA buttons.
     -------------------------------------------------------- */
  document.querySelectorAll('.btn--brass, .btn--plum').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translateY(-3px) translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });


  /* --------------------------------------------------------
     14. HERO TITLE SHIMMER
     Adds .text-shimmer to the hero heading for a CSS-driven
     gradient animation (defined in the stylesheet).
     -------------------------------------------------------- */
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    heroTitle.classList.add('text-shimmer');
  }


  /* --------------------------------------------------------
     15. CURRENT YEAR IN FOOTER
     Replaces any "© YYYY" with the actual current year.
     -------------------------------------------------------- */
  document.querySelectorAll('.footer__bottom span').forEach(el => {
    el.innerHTML = el.innerHTML.replace(/© \d{4}/, `© ${new Date().getFullYear()}`);
  });


  /* --------------------------------------------------------
     16. STICKY CTA VISIBILITY
     Shows the sticky CTA only after scrolling past the hero.
     -------------------------------------------------------- */
  const stickyCta = document.querySelector('.sticky-cta');

  if (stickyCta) {
    stickyCta.style.opacity = '0';
    stickyCta.style.transform = 'translateY(100%)';
    stickyCta.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    window.addEventListener('scroll', () => {
      if (window.scrollY > window.innerHeight * 0.8) {
        stickyCta.style.opacity = '1';
        stickyCta.style.transform = 'translateY(0)';
      } else {
        stickyCta.style.opacity = '0';
        stickyCta.style.transform = 'translateY(100%)';
      }
    }, { passive: true });
  }

});
