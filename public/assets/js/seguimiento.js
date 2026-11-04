(() => {
  'use strict';

  const form = document.querySelector('[data-tracking-form]');
  if (!form) return;

  const input = form.querySelector('input[name="codigo"]');

  if (input) {
    input.addEventListener('input', () => {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      input.value = input.value.toUpperCase().replace(/\s+/g, '');
      if (start !== null && end !== null) input.setSelectionRange(start, end);
    });
  }
})();
