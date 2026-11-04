(() => {
  'use strict';

  const form = document.querySelector('[data-repair-form]');
  if (!form) return;

  const dateInput = form.querySelector('[data-min-date]');
  const description = form.querySelector('#descripcion');
  const charCount = form.querySelector('[data-char-count]');
  const serviceSelect = form.querySelector('[data-service-select]');

  if (dateInput) {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    if (!dateInput.min || dateInput.min < today) dateInput.min = today;
    if (dateInput.value && dateInput.value < today) dateInput.value = '';
  }

  if (description && charCount) {
    const updateCount = () => {
      charCount.textContent = String(description.value.length);
    };
    updateCount();
    description.addEventListener('input', updateCount);
  }

  if (serviceSelect) {
    const requested = new URLSearchParams(window.location.search).get('servicio');
    if (requested && !serviceSelect.value) {
      const normalized = requested.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const option = Array.from(serviceSelect.options).find((item) => {
        const value = item.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        return value === normalized || (value && normalized.includes(value));
      });
      if (option) serviceSelect.value = option.value;
    }
  }

  const OTHER_VALUE = 'Otro';

  function bindConditionalDetail(selectSelector, wrapSelector, inputSelector) {
    const select = form.querySelector(selectSelector);
    const wrap = form.querySelector(wrapSelector);
    const input = form.querySelector(inputSelector);
    if (!select || !wrap || !input) return;

    const sync = () => {
      const active = select.value === OTHER_VALUE;
      wrap.classList.toggle('hidden', !active);
      input.required = active;
    };

    select.addEventListener('change', sync);
    sync();
  }

  bindConditionalDetail('[data-service-select]', '[data-service-detail-wrap]', '[data-service-detail]');
  bindConditionalDetail('#problema', '[data-problem-detail-wrap]', '[data-problem-detail]');

  const firstInvalid = form.querySelector('[aria-invalid="true"]');
  if (firstInvalid) {
    firstInvalid.focus({ preventScroll: true });
    const top = firstInvalid.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: 'smooth' });
  }
})();
