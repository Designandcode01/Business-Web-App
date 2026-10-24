(function () {
  'use strict';

  // Set copyright year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open', !isOpen);
    });
    // Close on nav link click (mobile)
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      });
    });
  }

  // Contact form validation & submit
  const form = document.getElementById('contact-form');
  if (form) {
    const status = form.querySelector('.form-status');

    const setError = (field, message) => {
      const input = form.elements[field];
      const errEl = form.querySelector(`[data-error-for="${field}"]`);
      if (errEl) errEl.textContent = message || '';
      if (input) {
        if (message) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
      }
    };

    const validators = {
      name: v => v.trim().length >= 2 ? '' : 'Please enter your name (at least 2 characters).',
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
      message: v => v.trim().length >= 10 ? '' : 'Please enter a message (at least 10 characters).'
    };

    const validateField = (fieldName) => {
      const input = form.elements[fieldName];
      if (!input || !validators[fieldName]) return true;
      const msg = validators[fieldName](input.value);
      setError(fieldName, msg);
      return !msg;
    };

    ['name', 'email', 'message'].forEach(field => {
      const input = form.elements[field];
      if (input) {
        input.addEventListener('blur', () => validateField(field));
        input.addEventListener('input', () => {
          if (input.getAttribute('aria-invalid') === 'true') validateField(field);
        });
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Honeypot check
      if (form.elements.website && form.elements.website.value) {
        return; // silently drop
      }

      let valid = true;
      ['name', 'email', 'message'].forEach(field => {
        if (!validateField(field)) valid = false;
      });

      if (!valid) {
        status.textContent = 'Please fix the highlighted fields.';
        status.className = 'form-status error';
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Simulated submission — replace with real fetch() to your backend/endpoint
      status.textContent = 'Sending…';
      status.className = 'form-status';

      const data = new FormData(form);
      fetch(form.action && form.action !== '#' ? form.action : '/api/contact', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json().catch(() => ({}));
        })
        .then(() => {
          status.textContent = 'Thanks — your message has been sent. We\'ll be in touch soon.';
          status.className = 'form-status success';
          form.reset();
        })
        .catch(() => {
          // Fallback message when no backend is wired up yet
          status.textContent = 'Thanks — your message has been recorded. (Demo mode: connect a backend endpoint to enable live submission.)';
          status.className = 'form-status success';
          form.reset();
        });
    });
  }
})();