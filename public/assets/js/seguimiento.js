(() => {
  'use strict';

  /* ----------------------------------------
     Confirmación de ticket creado
  ---------------------------------------- */
  const ticketDialog = document.getElementById('ticket-created-dialog');

  if (ticketDialog) {
    const cleanUrl = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete('nuevo');
      window.history.replaceState({}, '', url);
    };

    ticketDialog.addEventListener('close', cleanUrl);
    ticketDialog.querySelector('[data-close-ticket-dialog]')?.addEventListener('click', () => {
      ticketDialog.close();
    });

    ticketDialog.showModal();
  }

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
