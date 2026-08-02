/* ============================================================
   THE LAUREL ROOM — main.js (v3)
   Small on purpose. Five modules, no scroll theatrics:
   nav, preset switcher, FAQ, forms, wizard. Content never
   depends on this file to be visible.
   ============================================================ */

(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------
     Navigation — mobile overlay with focus containment
     -------------------------------------------------------- */
  const initNav = () => {
    const nav = document.querySelector('[data-nav]');
    if (!nav) return;
    const toggle = nav.querySelector('[data-nav-toggle]');
    const menu = nav.querySelector('[data-nav-menu]');
    if (!toggle || !menu) return;

    const setOpen = open => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('nav__mobile--open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          menu.querySelector('a')?.focus();
        }));
      } else {
        toggle.focus();
      }
    };

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab') return;
      const focusables = [...menu.querySelectorAll('a'), toggle];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      } else if (!focusables.includes(document.activeElement)) {
        e.preventDefault(); first.focus();
      }
    });
  };

  /* --------------------------------------------------------
     Preset switcher — recolors any [data-preset] scope
     -------------------------------------------------------- */
  const initPresetSwitch = () => {
    document.querySelectorAll('[data-preset-switch]').forEach(group => {
      const scope = document.querySelector(group.dataset.presetSwitch);
      if (!scope) return;
      const buttons = group.querySelectorAll('button[data-p]');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
          scope.dataset.preset = btn.dataset.p;
        });
      });
    });
  };

  /* --------------------------------------------------------
     FAQ — animated disclosure
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
     Sticky mobile CTA — hide when the footer is visible
     -------------------------------------------------------- */
  const initStickyCta = () => {
    const bar = document.querySelector('.sticky-cta');
    if (!bar) return;
    document.body.classList.add('has-sticky');
    const footer = document.querySelector('.footer');
    if (!footer) return;
    new IntersectionObserver(entries => {
      bar.classList.toggle('sticky-cta--hide', entries[0].isIntersecting);
    }, { rootMargin: '60px' }).observe(footer);
  };

  /* --------------------------------------------------------
     Year stamps
     -------------------------------------------------------- */
  const initYear = () => {
    document.querySelectorAll('[data-year]').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  };

  /* --------------------------------------------------------
     Founding Families capture — fetch submit, honest success
     panel with a WhatsApp share (no counters, no gimmicks)
     -------------------------------------------------------- */
  const initCapture = () => {
    document.querySelectorAll('form[data-capture]').forEach(form => {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Saving…';
        try {
          const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(Object.fromEntries(new FormData(form)))
          });
          if (!(await res.json()).success) throw new Error('failed');
          const share = encodeURIComponent(
            'A boutique event venue for 50–125 guests is coming to Brampton — bring your own caterer, opening 2027. Founding families book first: https://thelaurelroom.ca'
          );
          const done = document.createElement('div');
          done.className = 'capture-done';
          done.innerHTML = `
            <h3>You&rsquo;re on the founding list.</h3>
            <p>One email when tours open. If someone in your family plans the parties, they&rsquo;ll want to know about this:</p>
            <div class="share">
              <a class="btn" href="https://wa.me/?text=${share}" target="_blank" rel="noopener">Share on WhatsApp</a>
              <a class="linkline" href="https://instagram.com/thelaurelroom" target="_blank" rel="noopener">Follow the build</a>
            </div>`;
          form.replaceWith(done);
        } catch {
          btn.disabled = false;
          btn.textContent = 'Save my spot';
          let err = form.querySelector('.plan__error');
          if (!err) {
            err = document.createElement('p');
            err.className = 'plan__error plan__error--show';
            form.append(err);
          }
          err.classList.add('plan__error--show');
          err.textContent = 'That didn’t go through. Try again, or email hello@thelaurelroom.ca.';
        }
      });
    });
  };

  /* --------------------------------------------------------
     Plan wizard (#plan-form) — same contract as v2
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

    const fmtDate = value => {
      if (!value) return '';
      const d = new Date(`${value}T12:00:00`);
      if (Number.isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    const rateIndexFor = value => {
      if (!value) return -1;
      const day = new Date(`${value}T12:00:00`).getDay();
      if (day === 6) return 2;
      if (day === 5 || day === 0) return 1;
      return 0;
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

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validateStep()) return;
      if (form.querySelector('input[name="botcheck"]')?.checked) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      const data = Object.fromEntries(new FormData(form));
      delete data.botcheck;

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        });
        if (!(await res.json()).success) throw new Error('submit failed');
        const panel = document.createElement('div');
        panel.className = 'plan-success';
        panel.innerHTML = `
          <h3>Got it.</h3>
          <p>We&rsquo;ll get back to you within 24 hours &mdash; usually faster.
          If it&rsquo;s urgent, call or text <a class="linkline linkline--plain" href="tel:6472861161">647-286-1161</a>.</p>`;
        form.replaceWith(panel);
        panel.closest('.plan')?.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      } catch {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send inquiry';
        showError('That didn’t go through. Try again, or email hello@thelaurelroom.ca directly.');
      }
    });
  };

  /* --------------------------------------------------------
     Boot — isolated so one failure can't take down the rest
     -------------------------------------------------------- */
  const boot = () => {
    [initNav, initPresetSwitch, initFaq, initStickyCta, initYear, initCapture, initPlanFlow]
      .forEach(fn => {
        try { fn(); } catch (err) { console.warn('module failed:', fn.name, err); }
      });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
