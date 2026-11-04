(() => {
  'use strict';

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  /* ----------------------------------------
     Toasts
  ---------------------------------------- */
  let toastTimer = null;

  function getToast() {
    let toast = $('#toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    return toast;
  }

  function showToast(message, duration = 3200) {
    const toast = getToast();
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), duration);
  }

  window.chShowToast = showToast;

  /* ----------------------------------------
     Menú móvil
  ---------------------------------------- */
  const menuToggle = $('#menu-toggle');
  const mobileMenu = $('[data-mobile-menu]');
  const menuIcon = $('[data-menu-icon]');

  function setMenu(open) {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    mobileMenu.classList.toggle('hidden', !open);
    if (menuIcon) menuIcon.textContent = open ? 'close' : 'menu';
    document.body.classList.toggle('overflow-hidden', open);
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      setMenu(mobileMenu.classList.contains('hidden'));
    });

    mobileMenu.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('click', (event) => {
      if (mobileMenu.classList.contains('hidden')) return;
      if (event.target.closest('#menu-toggle') || event.target.closest('[data-mobile-menu]')) return;
      setMenu(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        setMenu(false);
        menuToggle.focus();
      }
    });

    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const handleDesktop = (event) => {
      if (event.matches) setMenu(false);
    };
    if (typeof desktopQuery.addEventListener === 'function') {
      desktopQuery.addEventListener('change', handleDesktop);
    }
  }

  /* ----------------------------------------
     Diálogos nativos
  ---------------------------------------- */
  $$('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!inside) dialog.close();
    });
  });

  document.addEventListener('click', (event) => {
    const closer = event.target.closest('[data-dialog-close]');
    if (!closer) return;

    const dialog = closer.closest('dialog');
    if (dialog && dialog.open) dialog.close();
  });

  /* ----------------------------------------
     Copiar códigos de ticket
  ---------------------------------------- */
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Continúa con el método alternativo.
    }

    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const success = document.execCommand('copy');
      document.body.removeChild(area);
      return success;
    } catch {
      return false;
    }
  }

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy-code]');
    if (!button) return;

    const code = button.getAttribute('data-copy-code') || '';
    const copied = await copyText(code);
    showToast(copied ? `Ticket ${code} copiado al portapapeles.` : `No se pudo copiar. El ticket es ${code}.`);
  });

  /* ----------------------------------------
     Imprimir comprobante
  ---------------------------------------- */
  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-print-ticket]')) return;
    window.print();
  });

  /* ----------------------------------------
     Mostrar / ocultar contraseña
  ---------------------------------------- */
  $$('[data-password-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const wrapper = button.closest('.relative');
      const input = wrapper ? $('input', wrapper) : null;
      if (!input) return;

      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      button.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
      const icon = $('[data-password-icon]', button);
      if (icon) icon.textContent = visible ? 'visibility' : 'visibility_off';
    });
  });

  /* ----------------------------------------
     Inputs de ticket en mayúsculas
  ---------------------------------------- */
  $$('input[name="codigo"]').forEach((input) => {
    input.addEventListener('input', () => {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      input.value = input.value.toUpperCase();
      if (start !== null && end !== null) input.setSelectionRange(start, end);
    });
  });

  /* ----------------------------------------
     Envío con estado de carga (formularios públicos)
  ---------------------------------------- */
  $$('form[data-repair-form]').forEach((form) => {
    form.addEventListener('submit', () => {
      if (!form.checkValidity()) return;
      const button = $('[data-submit-repair]', form);
      const label = $('[data-submit-label]', form);
      if (button) {
        button.disabled = true;
        button.classList.add('opacity-70');
      }
      if (label) label.textContent = 'Enviando…';
    });
  });
})();
