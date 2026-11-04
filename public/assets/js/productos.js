(() => {
  'use strict';

  const dataElement = document.getElementById('productos-data');
  if (!dataElement) return;

  let products = [];
  try {
    products = JSON.parse(dataElement.textContent || '[]');
  } catch {
    products = [];
  }

  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const searchInput = document.querySelector('[data-product-search]');
  const clearSearch = document.querySelector('[data-clear-search]');
  const categoryButtons = Array.from(document.querySelectorAll('[data-category-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-product-card]'));
  const grid = document.getElementById('productos-grid');
  const emptyState = document.getElementById('productos-vacio');
  const countLabel = document.getElementById('resultado-count');
  const resetButtons = Array.from(document.querySelectorAll('[data-reset-filters]'));
  const dialog = document.getElementById('producto-dialog');

  const baseTitle = document.title;
  const placeholder = '/assets/img/productos/placeholder.svg';
  const categories = categoryButtons.map((button) => button.getAttribute('data-category-filter'));
  const params = new URLSearchParams(window.location.search);

  let state = {
    q: params.get('q') || '',
    categoria: categories.includes(params.get('categoria')) ? params.get('categoria') : 'todas'
  };
  let lastTrigger = null;
  let skipCloseUrlSync = false;

  const normalize = (value) =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  function syncUrl() {
    const url = new URL(window.location.href);
    if (state.q.trim()) url.searchParams.set('q', state.q.trim());
    else url.searchParams.delete('q');

    if (state.categoria !== 'todas') url.searchParams.set('categoria', state.categoria);
    else url.searchParams.delete('categoria');

    window.history.replaceState({}, '', url);
  }

  function applyFilters({ sync = false } = {}) {
    const query = normalize(state.q);
    let visible = 0;

    cards.forEach((card) => {
      const category = card.getAttribute('data-category') || '';
      const searchText = normalize(card.getAttribute('data-search'));
      const matchesCategory = state.categoria === 'todas' || category === state.categoria;
      const matchesQuery = !query || searchText.includes(query);
      const show = matchesCategory && matchesQuery;

      card.classList.toggle('hidden', !show);
      if (show) visible += 1;
    });

    if (countLabel) countLabel.textContent = String(visible);
    if (emptyState) emptyState.classList.toggle('hidden', visible > 0);
    if (grid) grid.classList.toggle('hidden', visible === 0);

    categoryButtons.forEach((button) => {
      const active = button.getAttribute('data-category-filter') === state.categoria;
      button.classList.toggle('chip-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const hasFilters = Boolean(query) || state.categoria !== 'todas';
    resetButtons.forEach((button) => button.classList.toggle('hidden', !hasFilters));
    if (resetButtons[0]) resetButtons[0].classList.toggle('inline-flex', hasFilters);
    if (clearSearch) clearSearch.classList.toggle('hidden', !searchInput || !searchInput.value);

    if (sync) syncUrl();
  }

  function readFiltersFromUrl() {
    const next = new URLSearchParams(window.location.search);
    state.q = next.get('q') || '';
    state.categoria = categories.includes(next.get('categoria')) ? next.get('categoria') : 'todas';
    if (searchInput) searchInput.value = state.q;
    applyFilters();
  }

  function fillDialog(product) {
    if (!dialog || !product) return;

    const image = document.getElementById('producto-imagen');
    const category = document.getElementById('producto-categoria');
    const title = document.getElementById('producto-titulo');
    const description = document.getElementById('producto-descripcion');
    const price = document.getElementById('producto-precio');

    if (image) {
      image.onerror = () => {
        image.onerror = null;
        image.src = placeholder;
      };
      image.src = product.imagen || placeholder;
      image.alt = product.nombre;
    }
    if (category) category.textContent = product.categoria;
    if (title) title.textContent = product.nombre;
    if (description) description.textContent = product.descripcion;
    if (price) price.textContent = product.precioTexto;
  }

  function openProduct(slug, { push = true, trigger = null } = {}) {
    const product = bySlug.get(slug);
    if (!product || !dialog) return false;

    lastTrigger = trigger || document.activeElement;
    fillDialog(product);

    if (!dialog.open) dialog.showModal();
    document.title = `${product.nombre} | Cellphone Hospital`;

    if (push) {
      const url = new URL(window.location.href);
      url.searchParams.set('producto', product.slug);
      window.history.pushState({ producto: product.slug }, '', url);
    }

    return true;
  }

  if (searchInput) {
    searchInput.value = state.q;

    searchInput.addEventListener('input', () => {
      state.q = searchInput.value;
      applyFilters({ sync: true });
    });

    searchInput.addEventListener('search', () => {
      state.q = searchInput.value;
      applyFilters({ sync: true });
    });
  }

  if (clearSearch) {
    clearSearch.addEventListener('click', () => {
      if (!searchInput) return;
      searchInput.value = '';
      state.q = '';
      applyFilters({ sync: true });
      searchInput.focus();
    });
  }

  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.getAttribute('data-category-filter') || 'todas';
      state.categoria = state.categoria === value && value !== 'todas' ? 'todas' : value;
      applyFilters({ sync: true });

      if (state.categoria === 'todas' && searchInput) {
        searchInput.focus({ preventScroll: true });
      }
    });
  });

  resetButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state = { q: '', categoria: 'todas' };
      if (searchInput) searchInput.value = '';
      applyFilters({ sync: true });
      if (searchInput) searchInput.focus({ preventScroll: true });
    });
  });

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-product-open]');
    if (!trigger) return;

    event.preventDefault();
    const slug = trigger.getAttribute('data-product-open') || '';
    const opened = openProduct(slug, { push: true, trigger });

    if (!opened) window.location.href = trigger.getAttribute('href') || '/productos';
  });

  if (dialog) {
    dialog.addEventListener('close', () => {
      if (skipCloseUrlSync) {
        skipCloseUrlSync = false;
      } else {
        const url = new URL(window.location.href);
        if (url.searchParams.has('producto')) {
          url.searchParams.delete('producto');
          window.history.replaceState({}, '', url);
        }
      }

      document.title = baseTitle;

      if (lastTrigger && typeof lastTrigger.focus === 'function' && lastTrigger.isConnected) {
        lastTrigger.focus({ preventScroll: true });
      }
      lastTrigger = null;
    });
  }

  window.addEventListener('popstate', () => {
    readFiltersFromUrl();

    const currentParams = new URLSearchParams(window.location.search);
    const slug = currentParams.get('producto');

    if (slug) {
      openProduct(slug, { push: false });
    } else if (dialog && dialog.open) {
      skipCloseUrlSync = true;
      dialog.close();
    }
  });

  applyFilters();

  const initialSlug = params.get('producto');
  if (initialSlug) {
    if (!openProduct(initialSlug, { push: false })) {
      const url = new URL(window.location.href);
      url.searchParams.delete('producto');
      window.history.replaceState({}, '', url);
      window.chShowToast?.('El producto solicitado ya no está disponible.');
    }
  }
})();
