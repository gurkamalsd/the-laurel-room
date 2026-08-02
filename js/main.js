/* ============================================================
   THE LAUREL ROOM — main.js
   One file, no dependencies. Every module bails out quietly
   if its markup isn't on the page.
   ============================================================ */

(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------
     Button label roll — wraps .btn[data-text] content in
     stacked spans so CSS can roll the label on hover.
     -------------------------------------------------------- */
  const initButtons = () => {
    document.querySelectorAll('.btn[data-text]').forEach(btn => {
      if (btn.querySelector('.btn__label')) return;
      const text = btn.dataset.text;
      btn.textContent = '';
      const label = document.createElement('span');
      label.className = 'btn__label';
      const a = document.createElement('span');
      const b = document.createElement('span');
      a.textContent = text;
      b.textContent = text;
      b.setAttribute('aria-hidden', 'true');
      label.append(a, b);
      btn.append(label);
    });
  };

  /* --------------------------------------------------------
     Scroll reveals — [data-reveal], [data-reveal-stagger]
     -------------------------------------------------------- */
  const initReveals = () => {
    document.querySelectorAll('[data-reveal-stagger]').forEach(parent => {
      Array.from(parent.children).forEach((child, i) => {
        child.setAttribute('data-reveal', '');
        child.style.transitionDelay = `${Math.min(i * 0.09, 0.63)}s`;
      });
    });

    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => io.observe(el));
  };

  /* --------------------------------------------------------
     Word-split headings — [data-split]
     Preserves inline <em> styling while staggering words.
     -------------------------------------------------------- */
  const initSplits = () => {
    const heads = document.querySelectorAll('[data-split]');
    if (!heads.length) return;

    const splitInto = (node, target, state) => {
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              target.append(document.createTextNode(' '));
              return;
            }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.textContent = part;
            inner.style.transitionDelay = `${state.i * 0.055}s`;
            state.i += 1;
            w.append(inner);
            target.append(w);
          });
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const clone = child.cloneNode(false);
          splitInto(child, clone, state);
          target.append(clone);
        }
      });
    };

    heads.forEach(head => {
      if (prefersReduced) { head.classList.add('is-in'); return; }
      const frag = document.createDocumentFragment();
      const holder = document.createElement('span');
      splitInto(head, holder, { i: 0 });
      frag.append(...holder.childNodes);
      head.textContent = '';
      head.append(frag);
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    heads.forEach(head => io.observe(head));
  };

  /* --------------------------------------------------------
     Navigation — scrolled state + mobile menu
     -------------------------------------------------------- */
  const initNav = () => {
    const nav = document.querySelector('[data-nav]');
    if (!nav) return;

    const onScroll = () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const toggle = nav.querySelector('[data-nav-toggle]');
    const menu = nav.querySelector('[data-nav-menu]');
    if (!toggle || !menu) return;

    const setOpen = open => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('nav__mobile--open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
    });
  };

  /* --------------------------------------------------------
     Parallax — [data-parallax] (container of an img, or an img)
     -------------------------------------------------------- */
  const initParallax = () => {
    if (prefersReduced) return;
    const els = document.querySelectorAll('[data-parallax]');
    if (!els.length) return;

    const items = Array.from(els).map(el => ({
      el,
      img: el.tagName === 'IMG' ? el : el.querySelector('img'),
      speed: el.dataset.parallax === 'soft' ? 0.035 : 0.07
    })).filter(item => item.img);

    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      items.forEach(({ el, img, speed }) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -80 || rect.top > vh + 80) return;
        const delta = rect.top + rect.height / 2 - vh / 2;
        img.style.transform = `translate3d(0, ${(-delta * speed).toFixed(1)}px, 0) scale(1.08)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  };

  /* --------------------------------------------------------
     Counters — [data-count] with data-prefix / data-suffix
     -------------------------------------------------------- */
  const initCounters = () => {
    const els = document.querySelectorAll('[data-count]');
    if (!els.length) return;

    const run = el => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      if (prefersReduced) {
        el.textContent = prefix + target.toLocaleString() + suffix;
        return;
      }
      const dur = 1100;
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          run(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    els.forEach(el => io.observe(el));
  };

  /* --------------------------------------------------------
     Lightbox — [data-lightbox] openers + #lightbox dialog
     -------------------------------------------------------- */
  const initLightbox = () => {
    const box = document.getElementById('lightbox');
    if (!box) return;
    const img = box.querySelector('img');
    const closeBtn = box.querySelector('.lightbox__close');
    let lastFocus = null;

    const open = (src, alt) => {
      img.src = src;
      img.alt = alt || 'Enlarged venue photo';
      box.classList.add('lightbox--open');
      document.body.style.overflow = 'hidden';
      lastFocus = document.activeElement;
      closeBtn.focus();
    };
    const close = () => {
      box.classList.remove('lightbox--open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };

    document.querySelectorAll('[data-lightbox]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        const src = el.dataset.lightbox || el.querySelector('img')?.src;
        if (src) open(src, el.querySelector('img')?.alt);
      });
      el.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && el.tagName !== 'A' && el.tagName !== 'BUTTON') {
          e.preventDefault();
          el.click();
        }
      });
    });

    closeBtn.addEventListener('click', close);
    box.addEventListener('click', e => { if (e.target === box) close(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && box.classList.contains('lightbox--open')) close();
    });
  };

  /* --------------------------------------------------------
     FAQ — [data-faq] wrapper, .faq__q buttons, animated height
     -------------------------------------------------------- */
  const initFaq = () => {
    document.querySelectorAll('[data-faq]').forEach(wrap => {
      wrap.querySelectorAll('.faq__q').forEach(btn => {
        const panel = btn.parentElement.querySelector('.faq__a');
        if (!panel) return;

        btn.setAttribute('aria-expanded', 'false');
        panel.style.height = '0px';

        btn.addEventListener('click', () => {
          const isOpen = btn.getAttribute('aria-expanded') === 'true';

          wrap.querySelectorAll('.faq__q[aria-expanded="true"]').forEach(other => {
            if (other === btn) return;
            const otherPanel = other.parentElement.querySelector('.faq__a');
            other.setAttribute('aria-expanded', 'false');
            otherPanel.style.height = `${otherPanel.scrollHeight}px`;
            requestAnimationFrame(() => { otherPanel.style.height = '0px'; });
          });

          btn.setAttribute('aria-expanded', String(!isOpen));
          if (isOpen) {
            panel.style.height = `${panel.scrollHeight}px`;
            requestAnimationFrame(() => { panel.style.height = '0px'; });
          } else {
            panel.style.height = `${panel.scrollHeight}px`;
            panel.addEventListener('transitionend', function onEnd(e) {
              if (e.propertyName !== 'height') return;
              if (btn.getAttribute('aria-expanded') === 'true') panel.style.height = 'auto';
              panel.removeEventListener('transitionend', onEnd);
            });
          }
        });
      });
    });
  };

  /* --------------------------------------------------------
     Filters — [data-filter-group] with [data-filter] buttons
     and [data-filter-item][data-tags] targets on the page.
     -------------------------------------------------------- */
  const initFilters = () => {
    document.querySelectorAll('[data-filter-group]').forEach(group => {
      const buttons = group.querySelectorAll('[data-filter]');
      const items = document.querySelectorAll('[data-filter-item]');
      if (!buttons.length || !items.length) return;

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.dataset.filter;
          buttons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
          items.forEach(item => {
            const tags = (item.dataset.tags || '').split(/\s+/);
            item.hidden = key !== 'all' && !tags.includes(key);
          });
        });
      });
    });
  };

  /* --------------------------------------------------------
     Sticky mobile CTA
     -------------------------------------------------------- */
  const initStickyCta = () => {
    const bar = document.querySelector('.sticky-cta');
    if (!bar) return;
    const onScroll = () => {
      bar.classList.toggle('sticky-cta--show', window.scrollY > window.innerHeight * 0.7);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  /* --------------------------------------------------------
     Footer year
     -------------------------------------------------------- */
  const initYear = () => {
    document.querySelectorAll('[data-year]').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  };

  /* --------------------------------------------------------
     Plan flow — guided inquiry wizard (#plan-form)
     -------------------------------------------------------- */
  const initPlanFlow = () => {
    const form = document.getElementById('plan-form');
    if (!form) return;

    const steps = Array.from(form.querySelectorAll('[data-step]'));
    const dots = Array.from(form.querySelectorAll('[data-step-dot]'));
    const prevBtn = form.querySelector('[data-plan-prev]');
    const nextBtn = form.querySelector('[data-plan-next]');
    const submitBtn = form.querySelector('[data-plan-submit]');
    const errorEl = form.querySelector('.plan__error');
    const summary = document.querySelector('[data-plan-summary]');
    let current = 0;

    const showError = msg => {
      if (!errorEl) return;
      errorEl.textContent = msg;
      errorEl.classList.add('plan__error--show');
    };
    const clearError = () => errorEl && errorEl.classList.remove('plan__error--show');

    const render = () => {
      steps.forEach((step, i) => { step.hidden = i !== current; });
      dots.forEach((dot, i) => {
        dot.toggleAttribute('data-active', i === current);
        dot.toggleAttribute('data-done', i < current);
      });
      if (prevBtn) prevBtn.hidden = current === 0;
      if (nextBtn) nextBtn.hidden = current === steps.length - 1;
      if (submitBtn) submitBtn.hidden = current !== steps.length - 1;
      clearError();
    };

    const validateStep = () => {
      const step = steps[current];
      const radios = step.querySelectorAll('input[type="radio"][required]');
      if (radios.length) {
        const name = radios[0].name;
        if (!form.querySelector(`input[name="${name}"]:checked`)) {
          showError('Pick one to keep going.');
          return false;
        }
      }
      const fields = step.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]), textarea, select');
      for (const field of fields) {
        if (!field.checkValidity()) {
          field.reportValidity();
          return false;
        }
      }
      return true;
    };

    prevBtn?.addEventListener('click', () => {
      if (current > 0) { current -= 1; render(); }
    });
    nextBtn?.addEventListener('click', () => {
      if (!validateStep()) return;
      if (current < steps.length - 1) { current += 1; render(); }
      form.closest('.plan')?.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    });

    /* --- summary + estimate --- */
    const fmtDate = value => {
      if (!value) return '';
      const d = new Date(`${value}T12:00:00`);
      if (Number.isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    const rateIndexFor = value => {
      if (!value) return -1;
      const day = new Date(`${value}T12:00:00`).getDay();
      if (day === 6) return 2;               // Saturday
      if (day === 5 || day === 0) return 1;  // Friday & Sunday
      return 0;                              // Mon–Thu
    };

    const updateSummary = () => {
      if (!summary) return;
      const val = name => form.querySelector(`input[name="${name}"]:checked`)?.value
        || form.querySelector(`select[name="${name}"]`)?.value
        || '';

      const set = (key, text) => {
        const dd = summary.querySelector(`[data-summary="${key}"]`);
        if (dd) dd.textContent = text;
      };

      set('event_type', val('event_type'));
      const dateVal = form.querySelector('input[name="preferred_date"]')?.value || '';
      const flexible = form.querySelector('input[name="date_flexible"]')?.checked;
      set('date', dateVal ? fmtDate(dateVal) + (flexible ? ' (flexible)' : '') : (flexible ? 'Flexible' : ''));
      set('guest_count', val('guest_count') ? `${val('guest_count')} guests` : '');
      set('package', val('package'));
      const preset = val('design_preset');
      set('design_preset', preset === 'No preference' ? '' : preset);

      const estimateEl = summary.querySelector('[data-estimate]');
      if (estimateEl) {
        const pkg = form.querySelector('input[name="package"]:checked');
        const rates = pkg?.dataset.rates?.split(',').map(Number);
        if (rates && rates.length === 3) {
          const idx = rateIndexFor(dateVal);
          estimateEl.textContent = idx >= 0
            ? `$${rates[idx].toLocaleString()}`
            : `$${rates[0].toLocaleString()}–$${rates[2].toLocaleString()}`;
        } else if (pkg) {
          estimateEl.textContent = 'We’ll talk it through';
        } else {
          estimateEl.textContent = '';
        }
      }
    };

    form.addEventListener('change', updateSummary);
    form.addEventListener('input', e => {
      if (e.target.name === 'preferred_date') updateSummary();
    });

    /* --- preselect package from ?package= --- */
    const pkgParam = new URLSearchParams(location.search).get('package');
    if (pkgParam) {
      const map = { space: 'The Space', styled: 'The Styled Experience', full: 'The Full Celebration' };
      const target = map[pkgParam.toLowerCase()];
      if (target) {
        const radio = Array.from(form.querySelectorAll('input[name="package"]'))
          .find(r => r.value === target);
        if (radio) radio.checked = true;
      }
    }
    updateSummary();
    render();

    /* --- submit --- */
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validateStep()) return;
      if (form.querySelector('input[name="botcheck"]')?.checked) return;

      submitBtn.disabled = true;
      const rollLabel = submitBtn.querySelector('.btn__label span');
      if (rollLabel) rollLabel.textContent = 'Sending…';

      const data = Object.fromEntries(new FormData(form));
      delete data.botcheck;

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!result.success) throw new Error('submit failed');

        const panel = document.createElement('div');
        panel.className = 'plan-success';
        panel.innerHTML = `
          <h3>Got it.</h3>
          <p>We’ll get back to you within 24 hours — usually faster.
          If it’s urgent, call or text <a href="tel:6472861161" class="text-brass">647-286-1161</a>.</p>`;
        form.replaceWith(panel);
        panel.closest('.plan')?.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      } catch {
        submitBtn.disabled = false;
        if (rollLabel) rollLabel.textContent = 'Send inquiry';
        showError('That didn’t go through. Try again, or email hello@thelaurelroom.ca directly.');
      }
    });
  };

  /* --------------------------------------------------------
     Boot
     -------------------------------------------------------- */
  const boot = () => {
    initButtons();
    initReveals();
    initSplits();
    initNav();
    initParallax();
    initCounters();
    initLightbox();
    initFaq();
    initFilters();
    initStickyCta();
    initYear();
    initPlanFlow();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
