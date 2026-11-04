(() => {
  'use strict';

  const panels = Array.from(document.querySelectorAll('[data-admin-panel]'));
  const tabs = Array.from(document.querySelectorAll('[data-admin-tab]'));
  if (!panels.length || !tabs.length) return;

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const toast = (message) => window.chShowToast?.(message);

  const normalize = (value) =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  function reloadSoon(message) {
    toast(message);
    window.setTimeout(() => window.location.reload(), 850);
  }

  /* ----------------------------------------
     Pestañas
  ---------------------------------------- */
  function setTab(name, { focus = false } = {}) {
    const target = panels.find((panel) => panel.getAttribute('data-admin-panel') === name) ? name : 'reparaciones';

    tabs.forEach((tab) => {
      const active = tab.getAttribute('data-admin-tab') === target;
      tab.setAttribute('aria-selected', String(active));
      tab.setAttribute('tabindex', active ? '0' : '-1');
      tab.classList.toggle('bg-primary', active);
      tab.classList.toggle('text-on-primary', active);
      tab.classList.toggle('shadow-clinic', active);
      tab.classList.toggle('text-on-surface-variant', !active);
      tab.classList.toggle('hover:bg-surface-container', !active);
      if (active && focus) tab.focus();
    });

    panels.forEach((panel) => {
      panel.classList.toggle('hidden', panel.getAttribute('data-admin-panel') !== target);
    });

    const url = new URL(window.location.href);
    url.hash = target;
    window.history.replaceState({}, '', url);
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setTab(tab.getAttribute('data-admin-tab')));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const index = tabs.indexOf(tab);
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      setTab(tabs[next].getAttribute('data-admin-tab'), { focus: true });
    });
  });

  const initialTab = window.location.hash.replace('#', '');
  setTab(initialTab === 'productos' ? 'productos' : 'reparaciones');

  /* ----------------------------------------
     Filtros de reparaciones
  ---------------------------------------- */
  const repairSearch = $('[data-repair-search]');
  const repairStatus = $('[data-repair-status-filter]');
  const repairRows = $$('[data-repair-row]');
  const repairsCount = $('#repairs-count');
  const repairsEmpty = $('#repairs-empty');

  function filterRepairs() {
    const query = normalize(repairSearch?.value);
    const status = repairStatus?.value || 'todos';
    let visible = 0;

    repairRows.forEach((row) => {
      const matchesQuery = !query || normalize(row.getAttribute('data-search')).includes(query);
      const matchesStatus = status === 'todos' || row.getAttribute('data-status') === status;
      const show = matchesQuery && matchesStatus;
      row.classList.toggle('hidden', !show);
      if (show) visible += 1;
    });

    if (repairsCount) repairsCount.textContent = String(visible);
    if (repairsEmpty) repairsEmpty.classList.toggle('hidden', visible > 0);
  }

  repairSearch?.addEventListener('input', filterRepairs);
  repairStatus?.addEventListener('change', filterRepairs);

  /* ----------------------------------------
     Filtros de productos
  ---------------------------------------- */
  const productSearch = $('[data-admin-product-search]');
  const productCategory = $('[data-admin-product-category]');
  const productCards = $$('[data-admin-product]');
  const productsEmpty = $('#products-admin-empty');

  function filterProducts() {
    const query = normalize(productSearch?.value);
    const category = productCategory?.value || 'todas';
    let visible = 0;

    productCards.forEach((card) => {
      const matchesQuery = !query || normalize(card.getAttribute('data-search')).includes(query);
      const matchesCategory = category === 'todas' || card.getAttribute('data-category') === category;
      const show = matchesQuery && matchesCategory;
      card.classList.toggle('hidden', !show);
      if (show) visible += 1;
    });

    if (productsEmpty) productsEmpty.classList.toggle('hidden', visible > 0);
  }

  productSearch?.addEventListener('input', filterProducts);
  productCategory?.addEventListener('change', filterProducts);

  /* ----------------------------------------
     Actualizar estado de reparación
  ---------------------------------------- */
  const statusDialog = $('#status-dialog');
  const statusForm = $('#status-form');
  const statusCode = $('#status-code');
  const statusSelect = $('#status-select');
  const statusNote = $('#status-note');
  const statusSummary = $('#status-summary');
  const statusError = $('#status-error');
  const statusSubmit = $('[data-status-submit]');

  function openStatusDialog(button) {
    if (!statusDialog || !statusForm) return;

    const code = button.getAttribute('data-code') || '';
    const current = button.getAttribute('data-status') || 'RECIBIDO';
    const device = button.getAttribute('data-device') || 'Equipo';

    if (statusCode) statusCode.textContent = code;
    if (statusSelect) statusSelect.value = current;
    if (statusNote) statusNote.value = '';
    if (statusError) {
      statusError.textContent = '';
      statusError.classList.add('hidden');
    }
    if (statusSummary) {
      const label = statusSelect?.selectedOptions?.[0]?.textContent || current;
      statusSummary.textContent = `${device} · Estado actual: ${label}`;
    }

    statusForm.dataset.code = code;
    statusDialog.showModal();
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-open-status]');
    if (button) openStatusDialog(button);
  });

  statusSelect?.addEventListener('change', () => {
    if (!statusSummary) return;
    const device = statusSummary.textContent?.split(' · ')[0] || 'Equipo';
    const label = statusSelect.selectedOptions?.[0]?.textContent || statusSelect.value;
    statusSummary.textContent = `${device} · Nuevo estado: ${label}`;
  });

  statusForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!statusForm || !statusSelect) return;

    const code = statusForm.dataset.code || '';
    const estado = statusSelect.value;
    const nota = statusNote?.value.trim() || '';

    if (!code || !estado) return;

    if (statusError) {
      statusError.textContent = '';
      statusError.classList.add('hidden');
    }
    if (statusSubmit) statusSubmit.disabled = true;

    try {
      const response = await fetch(`/api/admin/repairs/${encodeURIComponent(code)}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, nota })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data.error || 'No se pudo actualizar el estado.');

      statusDialog?.close();
      reloadSoon('Estado actualizado correctamente.');
    } catch (error) {
      if (statusError) {
        statusError.textContent = error.message;
        statusError.classList.remove('hidden');
      }
    } finally {
      if (statusSubmit) statusSubmit.disabled = false;
    }
  });

  /* ----------------------------------------
     Productos (CRUD)
  ---------------------------------------- */
  const productDataElement = document.getElementById('admin-products-data');
  let adminProducts = [];
  try {
    adminProducts = JSON.parse(productDataElement?.textContent || '[]');
  } catch {
    adminProducts = [];
  }

  const productDialog = $('#product-dialog');
  const productForm = $('#product-form');
  const productDialogTitle = $('#product-dialog-title');
  const productError = $('#product-error');
  const productSubmit = $('[data-product-submit]');
  const imageInput = $('[data-image-input]');
  const imagePreview = $('#pf-image-preview');
  const placeholder = '/assets/img/productos/placeholder.svg';

  const field = (id) => document.getElementById(id);

  function updateImagePreview() {
    if (!imagePreview) return;
    const source = imageInput?.value.trim() || placeholder;
    imagePreview.src = source;
  }

  imageInput?.addEventListener('input', updateImagePreview);

  if (imagePreview) {
    imagePreview.addEventListener('error', () => {
      imagePreview.src = placeholder;
    });
  }

  function openProductDialog(product = null) {
    if (!productDialog || !productForm) return;

    productForm.reset();
    if (productError) {
      productError.textContent = '';
      productError.classList.add('hidden');
    }

    field('pf-id').value = product ? String(product.id) : '';
    field('pf-nombre').value = product?.nombre || '';
    field('pf-slug').value = product?.slug || '';
    field('pf-categoria').value = product?.categoria || 'Audio';
    field('pf-descripcion').value = product?.descripcion || '';
    field('pf-precio').value = product ? String(product.precio) : '';
    field('pf-stock').value = product ? String(product.stock) : '0';
    field('pf-imagen').value = product?.imagen || '';
    field('pf-destacado').checked = Boolean(product?.destacado);
    field('pf-activo').checked = product ? Boolean(product.activo) : true;

    if (productDialogTitle) productDialogTitle.textContent = product ? 'Editar producto' : 'Nuevo producto';
    updateImagePreview();
    productDialog.showModal();
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-open-product]')) {
      openProductDialog();
      return;
    }

    const editButton = event.target.closest('[data-edit-product]');
    if (editButton) {
      const id = Number(editButton.getAttribute('data-edit-product'));
      const product = adminProducts.find((item) => Number(item.id) === id);
      if (product) openProductDialog(product);
    }
  });

  productForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!productForm) return;

    const id = field('pf-id').value;
    const precio = Number(field('pf-precio').value);
    const stock = Number(field('pf-stock').value);

    if (productError) {
      productError.textContent = '';
      productError.classList.add('hidden');
    }

    if (!Number.isFinite(precio) || precio < 0 || !Number.isFinite(stock) || stock < 0) {
      if (productError) {
        productError.textContent = 'El precio y el stock deben ser números mayores o iguales a 0.';
        productError.classList.remove('hidden');
      }
      return;
    }

    const payload = {
      nombre: field('pf-nombre').value.trim(),
      slug: field('pf-slug').value.trim(),
      categoria: field('pf-categoria').value.trim(),
      descripcion: field('pf-descripcion').value.trim(),
      precio: Math.round(precio),
      stock: Math.round(stock),
      imagen: field('pf-imagen').value.trim(),
      destacado: field('pf-destacado').checked,
      activo: field('pf-activo').checked
    };

    const endpoint = id ? `/api/admin/products/${encodeURIComponent(id)}` : '/api/admin/products';
    const method = id ? 'PUT' : 'POST';

    if (productSubmit) productSubmit.disabled = true;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const fieldErrors = data.fields ? Object.values(data.fields).join(' ') : '';
        throw new Error(fieldErrors || data.error || 'No se pudo guardar el producto.');
      }

      productDialog?.close();
      reloadSoon(id ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
    } catch (error) {
      if (productError) {
        productError.textContent = error.message;
        productError.classList.remove('hidden');
      }
    } finally {
      if (productSubmit) productSubmit.disabled = false;
    }
  });

  /* ----------------------------------------
     Desactivar producto
  ---------------------------------------- */
  const deleteDialog = $('#delete-dialog');
  const deleteName = $('#delete-name');
  const confirmDelete = $('[data-confirm-delete]');
  let deleteTarget = null;

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-delete-product]');
    if (!button) return;

    deleteTarget = button.getAttribute('data-delete-product');
    if (deleteName) deleteName.textContent = button.getAttribute('data-name') || 'este producto';
    deleteDialog?.showModal();
  });

  confirmDelete?.addEventListener('click', async () => {
    if (!deleteTarget) return;

    confirmDelete.disabled = true;

    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(deleteTarget)}`, {
        method: 'DELETE'
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data.error || 'No se pudo desactivar el producto.');

      deleteDialog?.close();
      reloadSoon(data.message || 'Producto desactivado.');
    } catch (error) {
      toast(error.message);
    } finally {
      confirmDelete.disabled = false;
      deleteTarget = null;
    }
  });
})();
