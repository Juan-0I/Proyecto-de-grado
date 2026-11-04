/**
 * Prueba de humo del MVP con Playwright Core.
 *
 * Requisitos:
 *  - Servidor activo: npm start
 *  - Chrome o Edge instalado en el sistema
 *
 * Uso:
 *  npm run test:smoke
 *  BASE_URL=http://localhost:3000 npm run test:smoke
 */

const fs = require('fs');
const { chromium } = require('playwright-core');

const BASE = process.env.BASE_URL || 'http://localhost:3000';

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  `${process.env.LOCALAPPDATA || ''}/Google/Chrome/Application/chrome.exe`,
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].filter(Boolean);

function findBrowser() {
  const found = CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    console.error('No se encontró Chrome ni Edge. Define CHROME_PATH con la ruta del ejecutable.');
    process.exit(2);
  }
  return found;
}

let passed = 0;
const failures = [];

function check(condition, message) {
  if (condition) {
    passed += 1;
    console.log(`  OK   ${message}`);
  } else {
    failures.push(message);
    console.log(`  FAIL ${message}`);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: findBrowser() });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'es-CO' });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  console.log(`\nPrueba de humo contra ${BASE}\n`);

  console.log('1. Página de inicio');
  const home = await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  check(home && home.status() === 200, 'La página de inicio responde 200');
  check((await page.title()).includes('Cellphone Hospital'), 'El título de la página es correcto');
  check((await page.locator('h1').count()) === 1, 'Hay exactamente un H1');
  await page.setViewportSize({ width: 390, height: 844 });
  check(await page.locator('#menu-toggle').isVisible(), 'El botón del menú móvil está presente');
  await page.setViewportSize({ width: 1280, height: 900 });

  console.log('\n2. Responsive sin desborde horizontal');
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    }));
    check(metrics.scrollWidth <= metrics.clientWidth + 1, `Sin desborde horizontal a ${width}px`);
  }

  console.log('\n3. Catálogo, filtros y estado vacío');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(BASE + '/productos', { waitUntil: 'networkidle' });
  check((await page.locator('[data-product-card]:visible').count()) === 12, 'Se muestran 12 productos activos');
  await page.click('[data-category-filter="Audio"]');
  check((await page.locator('[data-product-card]:visible').count()) === 3, 'El filtro Audio muestra 3 productos');
  await page.fill('[data-product-search]', 'zzzz');
  check(await page.locator('#productos-vacio').isVisible(), 'Aparece el estado vacío al buscar sin resultados');
  const emptyText = (await page.locator('#productos-vacio h2').textContent()).trim();
  check(emptyText === 'Ups! No hay más productos con esos filtros.', 'El texto del estado vacío es el solicitado');
  await page.click('#productos-vacio [data-reset-filters]');
  check((await page.locator('[data-product-card]:visible').count()) === 12, 'Limpiar filtros restaura los 12 productos');

  console.log('\n4. Modal de producto y enlace directo');
  await page.click('[data-product-open]');
  check(await page.locator('#producto-dialog').evaluate((dialog) => dialog.open), 'El modal de producto se abre');
  check(new URL(page.url()).searchParams.has('producto'), 'La URL incluye el parámetro producto');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  check(!(await page.locator('#producto-dialog').evaluate((dialog) => dialog.open)), 'El modal se cierra con Escape');
  await page.goto(BASE + '/productos?producto=smartwatch', { waitUntil: 'networkidle' });
  check(await page.locator('#producto-dialog').evaluate((dialog) => dialog.open), 'El enlace directo abre el modal');
  check((await page.locator('#producto-titulo').textContent()).trim() === 'Smartwatch Deportivo', 'El modal muestra el producto correcto');

  console.log('\n5. Seguimiento de ticket');
  await page.goto(BASE + '/seguimiento?codigo=CH-98234', { waitUntil: 'networkidle' });
  const trackingText = await page.locator('main').innerText();
  check(trackingText.includes('CH-98234'), 'Se muestra el código del ticket');
  check(trackingText.includes('En revisión'), 'Se muestra el estado En revisión');
  check((await page.locator('#historial-ticket').count()) === 1, 'Se muestra el historial de la reparación');
  await page.goto(BASE + '/seguimiento?codigo=CH-00000', { waitUntil: 'networkidle' });
  check((await page.locator('main').innerText()).includes('No encontramos el ticket'), 'Un ticket inexistente muestra el mensaje de error');

  console.log('\n6. Formulario de agendamiento');
  await page.goto(BASE + '/agendar?servicio=Pantallas', { waitUntil: 'networkidle' });
  check((await page.locator('#servicio').inputValue()) === 'Pantallas', 'El servicio se preselecciona desde la URL');
  await page.fill('#descripcion', 'Prueba de contador');
  check((await page.locator('[data-char-count]').textContent()).trim() === '18', 'El contador de caracteres funciona');
  check((await page.locator('[data-min-date]').getAttribute('min')).length === 10, 'La fecha mínima está configurada');

  console.log('\n7. Panel administrativo');
  await page.goto(BASE + '/admin', { waitUntil: 'networkidle' });
  check(await page.locator('#password').isVisible(), 'El formulario de acceso es visible');
  await page.fill('#password', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  check((await page.locator('#panel-reparaciones').count()) === 1, 'El panel se muestra tras iniciar sesión');
  check((await page.locator('[data-repair-row]:visible').count()) >= 4, 'Se listan al menos 4 reparaciones demo');
  await page.click('[data-admin-tab="productos"]');
  check(await page.locator('#panel-productos').isVisible(), 'La pestaña Productos se activa');
  check((await page.locator('[data-admin-product]:visible').count()) >= 12, 'Se listan al menos 12 productos en el panel');
  await page.click('[data-open-product]');
  check(await page.locator('#product-dialog').evaluate((dialog) => dialog.open), 'El diálogo de nuevo producto se abre');
  await page.click('#product-dialog [data-dialog-close]');
  await page.click('[data-admin-tab="reparaciones"]');
  await page.locator('[data-open-status]').first().click();
  check(await page.locator('#status-dialog').evaluate((dialog) => dialog.open), 'El diálogo de estado se abre');
  await page.click('#status-dialog [data-dialog-close]');
  await page.fill('[data-repair-search]', 'zzzz');
  check(await page.locator('#repairs-empty').isVisible(), 'La búsqueda sin resultados muestra el estado vacío');

  console.log('\n8. Menú móvil e impresión');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.click('#menu-toggle');
  check(await page.locator('#menu-movil').isVisible(), 'El menú móvil se abre');
  await page.locator('main h1').click({ position: { x: 20, y: 20 } });
  await page.waitForTimeout(150);
  check(!(await page.locator('#menu-movil').isVisible()), 'El menú móvil se cierra al hacer clic fuera');

  await page.goto(BASE + '/seguimiento?codigo=CH-98234', { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  const printState = await page.evaluate(() => {
    const visible = (selector) => {
      const element = document.querySelector(selector);
      return Boolean(element && getComputedStyle(element).display !== 'none' && element.getBoundingClientRect().height > 0);
    };
    return {
      header: visible('header'),
      footer: visible('footer'),
      search: visible('[data-ticket-search]'),
      aside: visible('[data-ticket-aside]'),
      note: visible('.print-only')
    };
  });
  check(!printState.header && !printState.footer, 'La impresión oculta encabezado y pie');
  check(!printState.search && !printState.aside, 'La impresión oculta buscador y panel lateral');
  check(printState.note, 'La impresión incluye la nota de demostración');
  await page.emulateMedia({ media: 'screen' });

  console.log('\n9. Errores de consola');
  check(consoleErrors.length === 0, `Sin errores de consola${consoleErrors.length ? `: ${consoleErrors.join(' | ')}` : ''}`);

  await browser.close();

  console.log(`\nResultado: ${passed} comprobaciones correctas, ${failures.length} fallos.`);
  if (failures.length) {
    console.log('\nFallos:');
    failures.forEach((failure) => console.log(` - ${failure}`));
    process.exit(1);
  }
  console.log('Prueba de humo superada.\n');
})().catch((error) => {
  console.error('\nLa prueba de humo no pudo ejecutarse:', error.message);
  process.exit(2);
});
