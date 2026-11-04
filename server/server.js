require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const compression = require('compression');
const multer = require('multer');
const { imageSize } = require('image-size');

const { db, initDb } = require('./db');
const { seedDatabase } = require('./seed');
const {
  REPAIR_STATUSES,
  REPAIR_TIMELINE,
  PROBLEMAS,
  DIAGNOSIS,
  OTHER,
  FRANJAS,
  CATEGORIAS,
  getStatusInfo,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatInputDate,
  todayISO,
  nowISO,
  slugify
} = require('./constants');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const BASE_URL = (process.env.BASE_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');
const ASSET_VERSION = process.env.ASSET_VERSION || require('../package.json').version;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_DEMO_HINT = !process.env.ADMIN_PASSWORD;
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'productos');
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MIN_IMAGE = { width: 800, height: 600 };
const MAX_IMAGE = { width: 4000, height: 3000 };

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 }
});

function detectImageType(buffer) {
  if (!buffer || buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';

  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.subarray(0, 8).equals(pngSignature)) return 'png';

  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'webp';
  }

  return null;
}

const business = {
  name: 'Cellphone Hospital',
  tagline: 'Tecnología con corazón colombiano',
  phone: '+57 321 7635196',
  phoneRaw: '573217635196',
  email: 'hola@cellhospital.co',
  address: 'Cl. 4 #6-75, Plaza Comercial La Campana, Local 102',
  city: 'San Francisco de Sales, Cundinamarca',
  hours: 'Lunes a domingo: 8:30 a.m. a 9:30 p.m.',
  facebookName: 'Cell Phone Hospital | San Francisco',
  facebookUrl: 'https://www.facebook.com/p/Cell-Phone-Hospital-61557347480288/',
  mapQuery: 'Cl. 4 #6-75, San Francisco de Sales, Cundinamarca, Colombia',
  linksActive: process.env.ENLACES_ACTIVOS === 'true',
  mapEmbed:
    'https://www.google.com/maps?q=' +
    encodeURIComponent('Cl. 4 #6-75, San Francisco de Sales, Cundinamarca, Colombia') +
    '&z=16&output=embed'
};

const sessions = new Map();
const SESSION_COOKIE = 'ch_admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(
  express.static(path.join(__dirname, '..', 'public'), {
    maxAge: '1h',
    etag: true
  })
);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

app.use((req, res, next) => {
  res.locals.business = business;
  res.locals.currentPath = req.path;
  const canonicalQuery =
    req.path === '/productos' && typeof req.query.producto === 'string' && req.query.producto
      ? `?producto=${encodeURIComponent(req.query.producto)}`
      : '';
  res.locals.baseUrl = BASE_URL;
  res.locals.canonicalUrl = `${BASE_URL}${req.path}${canonicalQuery}`;
  res.locals.assetVersion = ASSET_VERSION;
  res.locals.year = new Date().getFullYear();
  res.locals.pageTitle = 'Cellphone Hospital | Tecnología con corazón colombiano';
  res.locals.pageDescription =
    'Reparación de celulares, computadores y tablets en San Francisco de Sales, Cundinamarca. Catálogo, servicios técnicos y seguimiento de reparaciones.';
  res.locals.linksActive = business.linksActive;
  res.locals.formatCurrency = formatCurrency;
  res.locals.formatDate = formatDate;
  res.locals.formatDateTime = formatDateTime;
  res.locals.formatInputDate = formatInputDate;
  res.locals.getStatusInfo = getStatusInfo;
  res.locals.REPAIR_TIMELINE = REPAIR_TIMELINE;
  res.locals.REPAIR_STATUSES = REPAIR_STATUSES;
  res.locals.PROBLEMAS = PROBLEMAS;
  res.locals.DIAGNOSIS = DIAGNOSIS;
  res.locals.OTHER = OTHER;
  res.locals.FRANJAS = FRANJAS;
  res.locals.CATEGORIAS = CATEGORIAS;
  res.locals.today = todayISO();
  next();
});

function parseCookies(header = '') {
  return header.split(';').reduce((accumulator, part) => {
    const index = part.indexOf('=');
    if (index === -1) return accumulator;

    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!key) return accumulator;

    try {
      accumulator[key] = decodeURIComponent(value);
    } catch {
      accumulator[key] = value;
    }
    return accumulator;
  }, {});
}

function safeEqual(first, second) {
  const a = Buffer.from(String(first));
  const b = Buffer.from(String(second));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

function getSessionToken(req) {
  return parseCookies(req.headers.cookie || '')[SESSION_COOKIE];
}

function isAuthed(req) {
  const token = getSessionToken(req);
  if (!token) return false;

  const expiresAt = sessions.get(token);
  if (!expiresAt) return false;

  if (Date.now() > expiresAt) {
    sessions.delete(token);
    return false;
  }

  return true;
}

function setSessionCookie(res, token, maxAgeSeconds) {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Strict',
    `Max-Age=${maxAgeSeconds}`
  ];

  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }

  res.setHeader('Set-Cookie', parts.join('; '));
}

function requireAdmin(req, res, next) {
  if (isAuthed(req)) return next();

  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'No autorizado. Inicia sesión de nuevo.' });
  }

  return res.redirect('/admin');
}

function trim(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

function toInteger(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function toBoolean(value) {
  return value === true || value === 1 || value === '1' || value === 'true' || value === 'on';
}

function getActiveServiceNames() {
  return db
    .prepare('SELECT nombre FROM services WHERE activo = 1 ORDER BY id ASC')
    .all()
    .map((service) => service.nombre);
}

function validateRepair(body = {}) {
  const values = {
    nombre: trim(body.nombre, 80),
    telefono: trim(body.telefono, 20),
    email: trim(body.email, 120),
    dispositivo: trim(body.dispositivo, 80),
    servicio: trim(body.servicio, 60),
    servicio_detalle: trim(body.servicio_detalle, 80),
    problema: trim(body.problema, 60),
    problema_detalle: trim(body.problema_detalle, 80),
    descripcion: trim(body.descripcion, 600),
    fecha_preferida: trim(body.fecha_preferida, 10),
    franja: trim(body.franja, 20)
  };

  const errors = {};
  const services = [...getActiveServiceNames(), DIAGNOSIS, OTHER];

  if (values.nombre.length < 2) {
    errors.nombre = 'Escribe tu nombre completo.';
  }

  const digits = values.telefono.replace(/\D/g, '');
  if (digits.length < 7 || values.telefono.length > 20) {
    errors.telefono = 'Escribe un teléfono válido (mínimo 7 dígitos).';
  }

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) {
    errors.email = 'Escribe un correo válido o déjalo vacío.';
  }

  if (values.dispositivo.length < 2) {
    errors.dispositivo = 'Indica la marca y el modelo del equipo.';
  }

  if (!services.includes(values.servicio)) {
    errors.servicio = 'Selecciona un servicio válido.';
  } else if (values.servicio === OTHER) {
    if (values.servicio_detalle.length < 3) {
      errors.servicio_detalle = 'Especifica el servicio que necesitas (mínimo 3 caracteres).';
    }
  } else {
    values.servicio_detalle = '';
  }

  if (!PROBLEMAS.includes(values.problema)) {
    errors.problema = 'Selecciona el tipo de problema.';
  } else if (values.problema === OTHER) {
    if (values.problema_detalle.length < 3) {
      errors.problema_detalle = 'Describe el problema (mínimo 3 caracteres).';
    }
  } else {
    values.problema_detalle = '';
  }

  if (values.fecha_preferida) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.fecha_preferida)) {
      errors.fecha_preferida = 'Selecciona una fecha válida.';
    } else if (values.fecha_preferida < todayISO()) {
      errors.fecha_preferida = 'La fecha no puede ser anterior a hoy.';
    }
  }

  if (values.franja && !FRANJAS.includes(values.franja)) {
    errors.franja = 'Selecciona una franja horaria válida.';
  }

  return { values, errors };
}

function validateProduct(body = {}) {
  const values = {
    nombre: trim(body.nombre, 120),
    slug: trim(body.slug, 80),
    categoria: trim(body.categoria, 50),
    descripcion: trim(body.descripcion, 600),
    precio: toInteger(body.precio),
    stock: toInteger(body.stock),
    imagen: trim(body.imagen, 300) || '/assets/img/productos/placeholder.svg',
    destacado: toBoolean(body.destacado) ? 1 : 0,
    activo: body.activo === undefined ? 1 : toBoolean(body.activo) ? 1 : 0
  };

  const errors = {};

  if (values.nombre.length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres.';
  }

  if (values.categoria.length < 2) {
    errors.categoria = 'Indica una categoría.';
  }

  if (values.descripcion.length < 5) {
    errors.descripcion = 'La descripción debe tener al menos 5 caracteres.';
  }

  if (values.precio === null || values.precio < 0) {
    errors.precio = 'El precio debe ser un número entero mayor o igual a 0.';
  }

  if (values.stock === null || values.stock < 0) {
    errors.stock = 'El stock debe ser un número entero mayor o igual a 0.';
  }

  if (!/^(\/(assets|uploads)\/|https?:\/\/)/.test(values.imagen)) {
    errors.imagen = 'La imagen debe iniciar con /assets/, /uploads/ o ser una URL http(s).';
  }

  return { values, errors };
}

function uniqueSlug(base, excludeId = null) {
  const baseSlug = slugify(base) || 'producto';
  let candidate = baseSlug;
  let counter = 2;

  while (true) {
    const row = excludeId
      ? db.prepare('SELECT id FROM products WHERE slug = ? AND id <> ?').get(candidate, excludeId)
      : db.prepare('SELECT id FROM products WHERE slug = ?').get(candidate);

    if (!row) return candidate;
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

function findProduct(idOrSlug, { includeInactive = false } = {}) {
  const value = String(idOrSlug || '');
  const activeFilter = includeInactive ? '' : ' AND activo = 1';
  const bySlug = db.prepare(`SELECT * FROM products WHERE slug = ?${activeFilter}`).get(value);
  if (bySlug) return bySlug;

  const numeric = toInteger(value);
  if (numeric === null) return null;

  return db.prepare(`SELECT * FROM products WHERE id = ?${activeFilter}`).get(numeric) || null;
}

function getRepairByCode(codigo) {
  return db.prepare('SELECT * FROM repairs WHERE codigo = ?').get(String(codigo || '').toUpperCase()) || null;
}

function getRepairHistory(repairId) {
  return db
    .prepare('SELECT * FROM repair_history WHERE repair_id = ? ORDER BY creado_en ASC, id ASC')
    .all(repairId);
}

function generateTicketCode() {
  let code = '';

  do {
    code = `CH-${Math.floor(10000 + Math.random() * 90000)}`;
  } while (db.prepare('SELECT 1 FROM repairs WHERE codigo = ?').get(code));

  return code;
}

function composeChoice(value, detail) {
  return value === OTHER && detail ? `${OTHER}: ${detail}` : value;
}

function createRepair(values) {
  const codigo = generateTicketCode();
  const created = nowISO();

  const result = db
    .prepare(
      `INSERT INTO repairs
        (codigo, nombre, telefono, email, dispositivo, servicio, problema, descripcion,
         fecha_preferida, franja, estado, creado_en, actualizado_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'RECIBIDO', ?, ?)`
    )
    .run(
      codigo,
      values.nombre,
      values.telefono,
      values.email || null,
      values.dispositivo,
      composeChoice(values.servicio, values.servicio_detalle),
      composeChoice(values.problema, values.problema_detalle),
      values.descripcion || null,
      values.fecha_preferida || null,
      values.franja || null,
      created,
      created
    );

  const repairId = Number(result.lastInsertRowid);
  db.prepare(
    'INSERT INTO repair_history (repair_id, estado, nota, creado_en) VALUES (?, ?, ?, ?)'
  ).run(repairId, 'RECIBIDO', 'Solicitud registrada desde el sitio web.', created);

  return getRepairByCode(codigo);
}

function publicRepair(repair) {
  if (!repair) return null;

  return {
    codigo: repair.codigo,
    nombre: repair.nombre,
    dispositivo: repair.dispositivo,
    servicio: repair.servicio,
    problema: repair.problema,
    descripcion: repair.descripcion,
    fecha_preferida: repair.fecha_preferida,
    franja: repair.franja,
    estado: repair.estado,
    estado_label: getStatusInfo(repair.estado).label,
    creado_en: repair.creado_en,
    actualizado_en: repair.actualizado_en
  };
}

// El stock es un dato interno del panel: al público solo se le informa
// si el producto está disponible, nunca la cantidad exacta.
function publicProduct(product) {
  if (!product) return null;

  return {
    id: product.id,
    slug: product.slug,
    nombre: product.nombre,
    categoria: product.categoria,
    descripcion: product.descripcion,
    precio: product.precio,
    precio_texto: formatCurrency(product.precio),
    imagen: product.imagen,
    destacado: Boolean(product.destacado)
  };
}

/* ----------------------------------------
   Páginas públicas
---------------------------------------- */

app.get('/', (req, res) => {
  const products = db
    .prepare('SELECT * FROM products WHERE activo = 1 ORDER BY destacado DESC, id ASC LIMIT 4')
    .all();
  const services = db
    .prepare('SELECT * FROM services WHERE activo = 1 ORDER BY id ASC')
    .all();

  res.render('index', {
    pageTitle: 'Cellphone Hospital | Tecnología con corazón colombiano',
    pageDescription:
      'Reparación de celulares, computadoras y tablets en San Francisco de Sales. Catálogo de productos, servicios técnicos y seguimiento de reparaciones.',
    products,
    services
  });
});

app.get('/productos', (req, res) => {
  const products = db
    .prepare('SELECT * FROM products WHERE activo = 1 ORDER BY destacado DESC, id ASC')
    .all();
  const categories = Array.from(new Set(products.map((product) => product.categoria)));
  const openProductSlug = typeof req.query.producto === 'string' ? req.query.producto : '';

  res.render('productos', {
    pageTitle: 'Productos y accesorios | Cellphone Hospital',
    pageDescription:
      'Catálogo de productos de tecnología y accesorios disponibles en Cellphone Hospital, San Francisco de Sales.',
    products,
    categories,
    openProductSlug
  });
});

app.get('/agendar', (req, res) => {
  const services = db
    .prepare('SELECT * FROM services WHERE activo = 1 ORDER BY id ASC')
    .all();

  res.render('agendar', {
    pageTitle: 'Agendar reparación | Cellphone Hospital',
    pageDescription:
      'Registra una solicitud de diagnóstico para tu celular, computador o tablet. Te contactaremos para confirmar la cita.',
    services,
    errors: {},
    old: {},
    formError: null
  });
});

app.post('/agendar', (req, res, next) => {
  try {
    const { values, errors } = validateRepair(req.body);
    const services = db
      .prepare('SELECT * FROM services WHERE activo = 1 ORDER BY id ASC')
      .all();

    if (Object.keys(errors).length > 0) {
      return res.status(422).render('agendar', {
        pageTitle: 'Agendar reparación | Cellphone Hospital',
        pageDescription:
          'Registra una solicitud de diagnóstico para tu celular, computador o tablet. Te contactaremos para confirmar la cita.',
        services,
        errors,
        old: values,
        formError: 'Revisa los campos marcados antes de enviar la solicitud.'
      });
    }

    const repair = createRepair(values);
    return res.redirect(`/seguimiento?codigo=${encodeURIComponent(repair.codigo)}&nuevo=1`);
  } catch (error) {
    return next(error);
  }
});

app.get('/seguimiento', (req, res, next) => {
  try {
    const codigo = trim(req.query.codigo, 20).toUpperCase();
    const repair = codigo ? getRepairByCode(codigo) : null;
    const history = repair ? getRepairHistory(repair.id) : [];
    const demoCodes = db
      .prepare('SELECT codigo FROM repairs ORDER BY id DESC LIMIT 4')
      .all()
      .map((item) => item.codigo);

    res.render('seguimiento', {
      pageTitle: 'Estado de reparación | Cellphone Hospital',
      pageDescription:
        'Consulta el estado de tu reparación con el número de ticket asignado por Cellphone Hospital.',
      codigo,
      repair,
      history,
      demoCodes,
      nuevo: req.query.nuevo === '1',
      notFound: Boolean(codigo && !repair)
    });
  } catch (error) {
    next(error);
  }
});

app.get('/ubicacion', (req, res) => {
  res.render('ubicacion', {
    pageTitle: 'Ubicación y contacto | Cellphone Hospital',
    pageDescription:
      'Visítanos en Cl. 4 #6-75, Plaza Comercial La Campana, Local 102, San Francisco de Sales, Cundinamarca.'
  });
});

/* ----------------------------------------
   Administración
---------------------------------------- */

app.get('/admin', (req, res) => {
  const authed = isAuthed(req);
  const repairs = authed
    ? db.prepare('SELECT * FROM repairs ORDER BY creado_en DESC, id DESC').all()
    : [];
  const products = authed
    ? db.prepare('SELECT * FROM products ORDER BY id DESC').all()
    : [];

  res.render('admin', {
    pageTitle: 'Panel de administración | Cellphone Hospital',
    pageDescription: 'Gestión de reparaciones y productos de Cellphone Hospital.',
    authed,
    repairs,
    products,
    loginError: null,
    adminDemoHint: ADMIN_DEMO_HINT
  });
});

app.post('/admin/login', (req, res) => {
  const password = String(req.body.password || '');

  if (!safeEqual(password, ADMIN_PASSWORD)) {
    return res.status(401).render('admin', {
      pageTitle: 'Panel de administración | Cellphone Hospital',
      pageDescription: 'Gestión de reparaciones y productos de Cellphone Hospital.',
      authed: false,
      repairs: [],
      products: [],
      loginError: 'Contraseña incorrecta. Intenta de nuevo.',
      adminDemoHint: ADMIN_DEMO_HINT
    });
  }

  const token = createSession();
  setSessionCookie(res, token, SESSION_TTL_MS / 1000);
  return res.redirect('/admin');
});

app.post('/admin/logout', (req, res) => {
  const token = getSessionToken(req);
  if (token) sessions.delete(token);
  setSessionCookie(res, '', 0);
  res.redirect('/admin');
});

/* ----------------------------------------
   API pública
---------------------------------------- */

app.get('/api/products', (req, res) => {
  const categoria = trim(req.query.categoria, 60);
  const q = trim(req.query.q, 80);

  let sql = 'SELECT * FROM products WHERE activo = 1';
  const params = [];

  if (categoria) {
    sql += ' AND categoria = ?';
    params.push(categoria);
  }

  if (q) {
    sql += ' AND (nombre LIKE ? OR descripcion LIKE ? OR categoria LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  sql += ' ORDER BY destacado DESC, id ASC';
  const products = db.prepare(sql).all(...params);
  res.json({ products: products.map(publicProduct) });
});

app.get('/api/products/:idOrSlug', (req, res) => {
  const product = findProduct(req.params.idOrSlug);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado.' });
  return res.json({ product: publicProduct(product) });
});

app.get('/api/services', (req, res) => {
  const services = db
    .prepare('SELECT * FROM services WHERE activo = 1 ORDER BY id ASC')
    .all();
  res.json({ services });
});

app.post('/api/repairs', (req, res, next) => {
  try {
    const { values, errors } = validateRepair(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Revisa los datos enviados.', fields: errors });
    }

    const repair = createRepair(values);
    return res.status(201).json({
      ok: true,
      codigo: repair.codigo,
      estado: repair.estado,
      repair: publicRepair(repair)
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/repairs/:codigo', (req, res) => {
  const repair = getRepairByCode(req.params.codigo);
  if (!repair) return res.status(404).json({ error: 'Ticket no encontrado.' });

  return res.json({
    repair: publicRepair(repair),
    history: getRepairHistory(repair.id)
  });
});

/* ----------------------------------------
   API de administración
---------------------------------------- */

app.get('/api/admin/repairs', requireAdmin, (req, res) => {
  const estado = trim(req.query.estado, 30).toUpperCase();
  const q = trim(req.query.q, 80);

  let sql = 'SELECT * FROM repairs WHERE 1 = 1';
  const params = [];

  if (estado) {
    sql += ' AND estado = ?';
    params.push(estado);
  }

  if (q) {
    sql += ' AND (codigo LIKE ? OR nombre LIKE ? OR dispositivo LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  sql += ' ORDER BY creado_en DESC, id DESC';
  const repairs = db.prepare(sql).all(...params);
  res.json({ repairs });
});

app.patch('/api/admin/repairs/:codigo/estado', requireAdmin, (req, res, next) => {
  try {
    const codigo = String(req.params.codigo || '').toUpperCase();
    const estado = trim(req.body.estado, 30).toUpperCase();
    const nota = trim(req.body.nota, 500);
    const validStates = REPAIR_STATUSES.map((status) => status.value);

    if (!validStates.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido.' });
    }

    const repair = getRepairByCode(codigo);
    if (!repair) return res.status(404).json({ error: 'Reparación no encontrada.' });

    const updated = nowISO();
    db.prepare('UPDATE repairs SET estado = ?, actualizado_en = ? WHERE id = ?').run(
      estado,
      updated,
      repair.id
    );
    db.prepare(
      'INSERT INTO repair_history (repair_id, estado, nota, creado_en) VALUES (?, ?, ?, ?)'
    ).run(repair.id, estado, nota || `Estado actualizado a ${getStatusInfo(estado).label}.`, updated);

    return res.json({ ok: true, repair: publicRepair(getRepairByCode(codigo)) });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/admin/products', requireAdmin, (req, res) => {
  const categoria = trim(req.query.categoria, 60);
  const q = trim(req.query.q, 80);

  let sql = 'SELECT * FROM products WHERE 1 = 1';
  const params = [];

  if (categoria) {
    sql += ' AND categoria = ?';
    params.push(categoria);
  }

  if (q) {
    sql += ' AND (nombre LIKE ? OR descripcion LIKE ? OR categoria LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  sql += ' ORDER BY id DESC';
  const products = db.prepare(sql).all(...params);
  res.json({ products });
});

app.post('/api/admin/products/image', requireAdmin, (req, res) => {
  upload.single('imagen')(req, res, (uploadError) => {
    if (uploadError) {
      const message =
        uploadError.code === 'LIMIT_FILE_SIZE'
          ? 'La imagen supera el máximo de 2 MB.'
          : 'No se pudo procesar el archivo. Intenta con otra imagen.';
      return res.status(400).json({ error: message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Selecciona una imagen para subir.' });
    }

    const detected = detectImageType(req.file.buffer);
    if (!detected) {
      return res.status(400).json({ error: 'El archivo no es una imagen JPG, PNG o WebP válida.' });
    }

    let dimensions;
    try {
      dimensions = imageSize(req.file.buffer);
    } catch {
      return res.status(400).json({ error: 'No se pudieron leer las dimensiones de la imagen.' });
    }

    const width = Number(dimensions.width);
    const height = Number(dimensions.height);

    if (!width || !height) {
      return res.status(400).json({ error: 'La imagen no tiene dimensiones válidas.' });
    }

    if (width < MIN_IMAGE.width || height < MIN_IMAGE.height) {
      return res.status(400).json({
        error: `La imagen es muy pequeña (${width}×${height}). Mínimo ${MIN_IMAGE.width}×${MIN_IMAGE.height} px.`
      });
    }

    if (width > MAX_IMAGE.width || height > MAX_IMAGE.height) {
      return res.status(400).json({
        error: `La imagen es muy grande (${width}×${height}). Máximo ${MAX_IMAGE.width}×${MAX_IMAGE.height} px.`
      });
    }

    const filename = `producto-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${detected}`;

    try {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), req.file.buffer);
    } catch (error) {
      console.error('[upload]', error);
      return res.status(500).json({ error: 'No se pudo guardar la imagen en el servidor.' });
    }

    return res.status(201).json({
      ok: true,
      url: `/uploads/productos/${filename}`,
      width,
      height,
      size: req.file.size
    });
  });
});

app.post('/api/admin/products', requireAdmin, (req, res, next) => {
  try {
    const { values, errors } = validateProduct(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Revisa los datos del producto.', fields: errors });
    }

    const slug = uniqueSlug(values.slug || values.nombre);
    const created = nowISO();

    const result = db
      .prepare(
        `INSERT INTO products
          (slug, nombre, categoria, descripcion, precio, stock, imagen, destacado, activo, creado_en)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        slug,
        values.nombre,
        values.categoria,
        values.descripcion,
        values.precio,
        values.stock,
        values.imagen,
        values.destacado,
        values.activo,
        created
      );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(result.lastInsertRowid));
    return res.status(201).json({ ok: true, product });
  } catch (error) {
    return next(error);
  }
});

app.put('/api/admin/products/:id', requireAdmin, (req, res, next) => {
  try {
    const id = toInteger(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Identificador no válido.' });

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Producto no encontrado.' });

    const { values, errors } = validateProduct(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Revisa los datos del producto.', fields: errors });
    }

    const slug = values.slug ? uniqueSlug(values.slug, id) : existing.slug;

    db.prepare(
      `UPDATE products
       SET slug = ?, nombre = ?, categoria = ?, descripcion = ?, precio = ?, stock = ?,
           imagen = ?, destacado = ?, activo = ?
       WHERE id = ?`
    ).run(
      slug,
      values.nombre,
      values.categoria,
      values.descripcion,
      values.precio,
      values.stock,
      values.imagen,
      values.destacado,
      values.activo,
      id
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return res.json({ ok: true, product });
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res, next) => {
  try {
    const id = toInteger(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Identificador no válido.' });

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Producto no encontrado.' });

    db.prepare('UPDATE products SET activo = 0 WHERE id = ?').run(id);
    return res.json({ ok: true, message: 'Producto desactivado.' });
  } catch (error) {
    return next(error);
  }
});

/* ----------------------------------------
   SEO
---------------------------------------- */

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

app.get('/robots.txt', (req, res) => {
  res
    .type('text/plain')
    .send(
      ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api/', '', `Sitemap: ${BASE_URL}/sitemap.xml`, ''].join(
        '\n'
      )
    );
});

app.get('/sitemap.xml', (req, res) => {
  const products = db.prepare('SELECT slug FROM products WHERE activo = 1 ORDER BY id ASC').all();
  const paths = ['/', '/productos', '/agendar', '/seguimiento', '/ubicacion'];

  const urls = paths
    .map((route) => `${BASE_URL}${route}`)
    .concat(
      products.map((product) => `${BASE_URL}/productos?producto=${encodeURIComponent(product.slug)}`)
    );

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    '</urlset>',
    ''
  ].join('\n');

  res.type('application/xml').send(body);
});

/* ----------------------------------------
   Manejo de errores
---------------------------------------- */

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Recurso no encontrado.' });
  }

  return res.status(404).render('404', {
    pageTitle: 'Página no encontrada | Cellphone Hospital',
    pageDescription: 'La página que buscas no existe.'
  });
});

app.use((error, req, res, next) => {
  console.error('[error]', error);

  if (res.headersSent) return next(error);

  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }

  return res.status(500).render('error', {
    pageTitle: 'Error | Cellphone Hospital',
    pageDescription: 'Ocurrió un error inesperado.',
    message: 'Ocurrió un error inesperado. Intenta de nuevo en unos segundos.'
  });
});

function start() {
  initDb();
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const seeded = seedDatabase();

  app.listen(PORT, () => {
    console.log(`[server] Cellphone Hospital MVP en http://localhost:${PORT}`);
    console.log(
      `[server] Datos: ${seeded.products} productos, ${seeded.services} servicios, ${seeded.repairs} reparaciones.`
    );
    console.log(`[server] Admin: http://localhost:${PORT}/admin`);
    if (!process.env.ADMIN_PASSWORD) {
      console.log('[server] Contraseña de demostración: admin123');
    }
  });
}

if (require.main === module) {
  start();
}

module.exports = app;
