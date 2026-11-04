const { db, initDb } = require('./db');
const { nowISO } = require('./constants');

const PRODUCTS = [
  {
    slug: 'audifonos-bluetooth',
    nombre: 'Audífonos Bluetooth Over-Ear',
    categoria: 'Audio',
    descripcion: 'Sonido envolvente, almohadillas suaves y hasta 30 horas de batería. Ideales para música, estudio y llamadas.',
    precio: 189900,
    stock: 8,
    imagen: '/assets/img/productos/audifonos-bluetooth.jpg',
    destacado: 1
  },
  {
    slug: 'audifonos-tws',
    nombre: 'Audífonos TWS con estuche',
    categoria: 'Audio',
    descripcion: 'Conexión inalámbrica, control táctil y estuche de carga compacto. Prácticos para el día a día.',
    precio: 119900,
    stock: 12,
    imagen: '/assets/img/productos/audifonos-tws.jpg',
    destacado: 0
  },
  {
    slug: 'parlante-bluetooth',
    nombre: 'Parlante Bluetooth Portátil',
    categoria: 'Audio',
    descripcion: 'Resistente a salpicaduras, sonido potente y batería de larga duración. Perfecto para reuniones y paseos.',
    precio: 149900,
    stock: 6,
    imagen: '/assets/img/productos/parlante-bluetooth.jpg',
    destacado: 1
  },
  {
    slug: 'smartwatch',
    nombre: 'Smartwatch Deportivo',
    categoria: 'Wearables',
    descripcion: 'Monitoreo de actividad, notificaciones y pantalla a color. Compatible con Android y iPhone.',
    precio: 219900,
    stock: 5,
    imagen: '/assets/img/productos/smartwatch.jpg',
    destacado: 1
  },
  {
    slug: 'consola-retro',
    nombre: 'Consola Portátil Retro',
    categoria: 'Consolas',
    descripcion: 'Clásicos restaurados y listos para jugar. Incluye cargador y una selección de juegos instalados.',
    precio: 259900,
    stock: 3,
    imagen: '/assets/img/productos/consola-retro.jpg',
    destacado: 1
  },
  {
    slug: 'control-inalambrico',
    nombre: 'Control Inalámbrico',
    categoria: 'Consolas',
    descripcion: 'Compatible con consolas y PC. Batería recargable y conexión estable para tus partidas.',
    precio: 139900,
    stock: 7,
    imagen: '/assets/img/productos/control-inalambrico.jpg',
    destacado: 0
  },
  {
    slug: 'ssd-1tb',
    nombre: 'SSD 1TB SATA',
    categoria: 'Almacenamiento',
    descripcion: 'Velocidad y espacio para tu computador o consola. Instalación y asesoría disponibles en tienda.',
    precio: 349900,
    stock: 4,
    imagen: '/assets/img/productos/ssd-1tb.jpg',
    destacado: 0
  },
  {
    slug: 'microsd-128gb',
    nombre: 'Memoria microSD 128GB',
    categoria: 'Almacenamiento',
    descripcion: 'Ideal para celulares, cámaras y consolas portátiles. Alta velocidad de lectura y escritura.',
    precio: 89900,
    stock: 15,
    imagen: '/assets/img/productos/microsd-128gb.jpg',
    destacado: 0
  },
  {
    slug: 'cargador-65w',
    nombre: 'Cargador Rápido 65W',
    categoria: 'Accesorios',
    descripcion: 'Carga rápida para celulares, tablets y portátiles compatibles. Diseño compacto y seguro.',
    precio: 99900,
    stock: 10,
    imagen: '/assets/img/productos/cargador-65w.jpg',
    destacado: 0
  },
  {
    slug: 'cable-usbc',
    nombre: 'Cable USB-C Reforzado',
    categoria: 'Accesorios',
    descripcion: '1.5 metros, carga rápida y transferencia de datos. Reforzado en los extremos para mayor durabilidad.',
    precio: 29900,
    stock: 20,
    imagen: '/assets/img/productos/cable-usbc.jpg',
    destacado: 0
  },
  {
    slug: 'forro-antigolpe',
    nombre: 'Forro Antigolpe',
    categoria: 'Accesorios',
    descripcion: 'Protección reforzada para tu equipo. Varios colores y modelos disponibles en tienda.',
    precio: 39900,
    stock: 18,
    imagen: '/assets/img/productos/forro-antigolpe.jpg',
    destacado: 0
  },
  {
    slug: 'vidrio-templado',
    nombre: 'Vidrio Templado',
    categoria: 'Repuestos',
    descripcion: 'Protección contra rayones y golpes. Instalación disponible en tienda.',
    precio: 24900,
    stock: 25,
    imagen: '/assets/img/productos/vidrio-templado.jpg',
    destacado: 0
  }
];

const SERVICES = [
  {
    nombre: 'Pantallas',
    descripcion: 'Reparación inmediata de pantallas rotas y LCD.',
    precio_desde: 120000,
    icono: 'smartphone'
  },
  {
    nombre: 'Baterías',
    descripcion: 'Cambio de batería original para mayor duración.',
    precio_desde: 80000,
    icono: 'battery_charging_full'
  },
  {
    nombre: 'Humedad',
    descripcion: 'Limpieza ultrasónica y rescate de circuitos.',
    precio_desde: 95000,
    icono: 'water_drop'
  },
  {
    nombre: 'Software',
    descripcion: 'Actualizaciones, desbloqueos y respaldos.',
    precio_desde: 50000,
    icono: 'settings_suggest'
  }
];

const REPAIRS = [
  {
    codigo: 'CH-10003',
    nombre: 'Laura Díaz',
    telefono: '300 555 0193',
    email: 'laura.demo@example.com',
    dispositivo: 'Motorola G84',
    servicio: 'Humedad',
    problema: 'Humedad',
    descripcion: 'El equipo se mojó y presenta fallas en la pantalla.',
    fecha_preferida: '2026-11-02',
    franja: '11:00 - 14:00',
    estado: 'LISTO',
    creado_en: '2026-10-27T16:00:00.000Z',
    actualizado_en: '2026-10-31T15:20:00.000Z',
    historia: [
      { estado: 'RECIBIDO', nota: 'Equipo recibido en tienda.', creado_en: '2026-10-27T16:00:00.000Z' },
      { estado: 'EN_REVISION', nota: 'Diagnóstico inicial de humedad.', creado_en: '2026-10-28T14:10:00.000Z' },
      { estado: 'EN_REPARACION', nota: 'Limpieza ultrasónica y revisión de circuitos.', creado_en: '2026-10-29T11:30:00.000Z' },
      { estado: 'LISTO', nota: 'Equipo probado y listo para entrega.', creado_en: '2026-10-31T15:20:00.000Z' }
    ]
  },
  {
    codigo: 'CH-10002',
    nombre: 'Andrés Martínez',
    telefono: '311 555 0248',
    email: 'andres.demo@example.com',
    dispositivo: 'Xiaomi Redmi Note 12',
    servicio: 'Software',
    problema: 'Software',
    descripcion: 'El celular se queda en el logo de inicio.',
    fecha_preferida: '2026-10-30',
    franja: '14:00 - 17:00',
    estado: 'EN_REPARACION',
    creado_en: '2026-10-29T13:00:00.000Z',
    actualizado_en: '2026-11-01T10:15:00.000Z',
    historia: [
      { estado: 'RECIBIDO', nota: 'Solicitud registrada.', creado_en: '2026-10-29T13:00:00.000Z' },
      { estado: 'EN_REVISION', nota: 'Se revisa el sistema y el almacenamiento.', creado_en: '2026-10-30T09:40:00.000Z' },
      { estado: 'EN_REPARACION', nota: 'Reinstalación de software y respaldo de datos.', creado_en: '2026-11-01T10:15:00.000Z' }
    ]
  },
  {
    codigo: 'CH-10001',
    nombre: 'María Rodríguez',
    telefono: '320 555 0176',
    email: 'maria.demo@example.com',
    dispositivo: 'iPhone 12',
    servicio: 'Baterías',
    problema: 'Batería',
    descripcion: 'La batería se descarga muy rápido.',
    fecha_preferida: '2026-11-01',
    franja: '8:30 - 11:00',
    estado: 'RECIBIDO',
    creado_en: '2026-11-01T14:10:00.000Z',
    actualizado_en: '2026-11-01T14:10:00.000Z',
    historia: [
      { estado: 'RECIBIDO', nota: 'Solicitud registrada desde el sitio web.', creado_en: '2026-11-01T14:10:00.000Z' }
    ]
  },
  {
    codigo: 'CH-98234',
    nombre: 'Carlos Gómez',
    telefono: '300 555 0111',
    email: 'carlos.demo@example.com',
    dispositivo: 'Samsung Galaxy A54',
    servicio: 'Pantallas',
    problema: 'Pantalla rota',
    descripcion: 'Se cayó y el táctil no responde.',
    fecha_preferida: '2026-11-03',
    franja: '14:00 - 17:00',
    estado: 'EN_REVISION',
    creado_en: '2026-10-30T15:20:00.000Z',
    actualizado_en: '2026-10-31T09:05:00.000Z',
    historia: [
      { estado: 'RECIBIDO', nota: 'Equipo recibido en tienda.', creado_en: '2026-10-30T15:20:00.000Z' },
      { estado: 'EN_REVISION', nota: 'Se verifica el estado del táctil y la pantalla.', creado_en: '2026-10-31T09:05:00.000Z' }
    ]
  }
];

function count(table) {
  return db.prepare(`SELECT COUNT(*) AS total FROM ${table}`).get().total;
}

function seedDatabase({ reset = false } = {}) {
  const created = nowISO();

  try {
    db.exec('BEGIN');

    if (reset) {
      db.exec('DELETE FROM repair_history; DELETE FROM repairs; DELETE FROM products; DELETE FROM services;');
      try {
        db.exec("DELETE FROM sqlite_sequence WHERE name IN ('products', 'services', 'repairs', 'repair_history');");
      } catch {
        // sqlite_sequence puede no existir en una base nueva.
      }
    }

    if (count('products') === 0) {
      const insertProduct = db.prepare(`
        INSERT INTO products
          (slug, nombre, categoria, descripcion, precio, stock, imagen, destacado, activo, creado_en)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      `);

      for (const product of PRODUCTS) {
        insertProduct.run(
          product.slug,
          product.nombre,
          product.categoria,
          product.descripcion,
          product.precio,
          product.stock,
          product.imagen,
          product.destacado,
          created
        );
      }
    }

    if (count('services') === 0) {
      const insertService = db.prepare(`
        INSERT INTO services (nombre, descripcion, precio_desde, icono, activo)
        VALUES (?, ?, ?, ?, 1)
      `);

      for (const service of SERVICES) {
        insertService.run(
          service.nombre,
          service.descripcion,
          service.precio_desde,
          service.icono
        );
      }
    }

    if (count('repairs') === 0) {
      const insertRepair = db.prepare(`
        INSERT INTO repairs
          (codigo, nombre, telefono, email, dispositivo, servicio, problema, descripcion,
           fecha_preferida, franja, estado, creado_en, actualizado_en)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insertHistory = db.prepare(`
        INSERT INTO repair_history (repair_id, estado, nota, creado_en)
        VALUES (?, ?, ?, ?)
      `);

      for (const repair of REPAIRS) {
        const result = insertRepair.run(
          repair.codigo,
          repair.nombre,
          repair.telefono,
          repair.email,
          repair.dispositivo,
          repair.servicio,
          repair.problema,
          repair.descripcion,
          repair.fecha_preferida,
          repair.franja,
          repair.estado,
          repair.creado_en,
          repair.actualizado_en
        );

        const repairId = Number(result.lastInsertRowid);
        for (const item of repair.historia) {
          insertHistory.run(repairId, item.estado, item.nota, item.creado_en);
        }
      }
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return {
    products: count('products'),
    services: count('services'),
    repairs: count('repairs'),
    history: count('repair_history')
  };
}

if (require.main === module) {
  initDb();
  const reset = process.argv.includes('--reset');
  const result = seedDatabase({ reset });
  console.log(`[seed] Base de datos lista${reset ? ' (reiniciada)' : ''}.`);
  console.log(`[seed] Productos: ${result.products}, servicios: ${result.services}, reparaciones: ${result.repairs}, historial: ${result.history}`);
}

module.exports = { seedDatabase, PRODUCTS, SERVICES, REPAIRS };
