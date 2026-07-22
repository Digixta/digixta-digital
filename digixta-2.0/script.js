/* =========================================================
   DIGIXTA — interactions
   Vanilla JS, no dependencies.
   Modules: nav scroll state, mobile menu, active-link tracking,
   scroll reveal, stat counters, process line fill, magnetic
   buttons, FAQ disclosure, contact form validation.
   ========================================================= */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Nav: background state on scroll
  --------------------------------------------------------- */
  const nav = document.getElementById('nav');
  const onNavScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 12);
  };
  onNavScroll();
  window.addEventListener('scroll', onNavScroll, { passive: true });

  /* ---------------------------------------------------------
     Mobile menu toggle
  --------------------------------------------------------- */
  const navToggle  = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  const closeMobileMenu = () => {
    if (!navToggle || !mobileMenu) return;
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      mobileMenu.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    $$('[data-nav-mobile]', mobileMenu).forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

  /* ---------------------------------------------------------
     Active nav link tracking (desktop + mobile)
  --------------------------------------------------------- */
  const sections = $$('main section[id]');
  const navLinks = $$('[data-nav]');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const setActive = (id) => {
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    };

    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  /* ---------------------------------------------------------
     Scroll reveal (fade-up + blur-in), staggered by DOM order
     within a shared parent.
  --------------------------------------------------------- */
  const revealEls = $$('.reveal');

  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('in-view'));
    } else {
      const groups = new Map();
      revealEls.forEach((el) => {
        const parent = el.parentElement;
        if (!groups.has(parent)) groups.set(parent, []);
        groups.get(parent).push(el);
      });

      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const siblings = groups.get(el.parentElement) || [el];
            const index = siblings.indexOf(el);
            const delay = Math.min(index, 5) * 90; // cap stagger so long lists don't crawl
            window.setTimeout(() => el.classList.add('in-view'), delay);
            observer.unobserve(el);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );

      revealEls.forEach((el) => revealObserver.observe(el));
    }
  }

  /* ---------------------------------------------------------
     Stat counters — count up once, when visible
  --------------------------------------------------------- */
  const statNums = $$('.stat-num');

  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count || '0');
    const suffix = el.dataset.suffix || '';

    if (reduceMotion || target <= 0) {
      el.textContent = target + suffix;
      return;
    }

    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (statNums.length && 'IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    statNums.forEach((el) => statObserver.observe(el));
  } else {
    statNums.forEach(animateCount);
  }

  /* ---------------------------------------------------------
     Process timeline — fill the connecting line as the
     section scrolls through the viewport, and mark each
     step "in-view" as it's reached.
  --------------------------------------------------------- */
  const processTrack = $('.process-track');
  const processFill  = document.getElementById('processFill');
  const processSteps = $$('.process-step');

  if (processTrack && processFill) {
    const updateProcessFill = () => {
      const rect = processTrack.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const total = rect.height;
      // progress = how much of the track has scrolled past the viewport's 60% line
      const raw = (viewportH * 0.6 - rect.top) / total;
      const progress = Math.max(0, Math.min(1, raw));
      processFill.style.height = `${progress * 100}%`;
    };

    updateProcessFill();
    window.addEventListener('scroll', () => requestAnimationFrame(updateProcessFill), { passive: true });
    window.addEventListener('resize', updateProcessFill);
  }

  if (processSteps.length && 'IntersectionObserver' in window) {
    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
      },
      { threshold: 0.5 }
    );
    processSteps.forEach((step) => stepObserver.observe(step));
  }

  /* ---------------------------------------------------------
     Magnetic buttons — subtle pull toward the cursor,
     desktop pointer only.
  --------------------------------------------------------- */
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (isFinePointer && !reduceMotion) {
    $$('.magnetic').forEach((btn) => {
      let raf = null;

      const onMove = (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
        });
      };

      const onLeave = () => {
        if (raf) cancelAnimationFrame(raf);
        btn.style.transform = 'translate(0, 0)';
      };

      btn.addEventListener('mousemove', onMove);
      btn.addEventListener('mouseleave', onLeave);
    });
  }

  /* ---------------------------------------------------------
     FAQ — inline progressive disclosure (not a generic
     accordion card: single shared list, one open at a time)
  --------------------------------------------------------- */
  const faqItems = $$('.faq-item');

  faqItems.forEach((item) => {
    const btn = $('.faq-q', item);
    if (!btn) return;

    btn.addEventListener('click', () => {
      const alreadyOpen = item.classList.contains('open');

      faqItems.forEach((other) => {
        other.classList.remove('open');
        $('.faq-q', other)?.setAttribute('aria-expanded', 'false');
      });

      if (!alreadyOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------------------------------------------------------
     Contact form — inline validation, no window.alert(),
     no real backend: shows a clear inline status and offers
     the WhatsApp/email fallback either way.
  --------------------------------------------------------- */
  const form = document.getElementById('contactForm');

  if (form) {
    const status = document.getElementById('formStatus');
    const submitLabel = document.getElementById('submitLabel');

    const setError = (field, message) => {
      const wrapper = field.closest('.field');
      const errorEl = form.querySelector(`[data-error-for="${field.name}"]`);
      if (wrapper) wrapper.classList.toggle('invalid', Boolean(message));
      if (errorEl) errorEl.textContent = message || '';
    };

    const validators = {
      name: (v) => (v.trim().length < 2 ? 'Enter your name.' : ''),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address.'),
      message: (v) => (v.trim().length < 10 ? 'Tell us a little more — at least 10 characters.' : ''),
    };

    Object.keys(validators).forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      field.addEventListener('blur', () => setError(field, validators[name](field.value)));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let firstInvalid = null;
      Object.keys(validators).forEach((name) => {
        const field = form.elements[name];
        if (!field) return;
        const message = validators[name](field.value);
        setError(field, message);
        if (message && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        if (status) {
          status.textContent = 'Please fix the highlighted fields.';
          status.style.color = '#B4432F';
        }
        return;
      }

      if (submitLabel) submitLabel.textContent = 'Sending…';
      form.querySelector('.btn-submit')?.setAttribute('disabled', 'true');

      // No backend is wired up to this file — simulate the send and
      // point the person to a channel that actually reaches us.
      window.setTimeout(() => {
        if (submitLabel) submitLabel.textContent = 'Message sent';
        if (status) {
          status.style.color = '';
          status.textContent = "Thanks — we'll reply within a few hours. In a hurry? Message us on WhatsApp instead.";
        }
        form.reset();
        form.querySelectorAll('.field').forEach((f) => f.classList.remove('invalid'));
      }, 700);
    });
  }

})();