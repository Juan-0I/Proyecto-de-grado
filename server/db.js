const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'data.sqlite');
const db = new DatabaseSync(dbPath);

function initDb() {
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      nombre TEXT NOT NULL,
      categoria TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      precio INTEGER NOT NULL CHECK (precio >= 0),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      imagen TEXT NOT NULL,
      destacado INTEGER NOT NULL DEFAULT 0,
      activo INTEGER NOT NULL DEFAULT 1,
      creado_en TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      precio_desde INTEGER NOT NULL CHECK (precio_desde >= 0),
      icono TEXT NOT NULL,
      activo INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS repairs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      nombre TEXT NOT NULL,
      telefono TEXT NOT NULL,
      email TEXT,
      dispositivo TEXT NOT NULL,
      servicio TEXT NOT NULL,
      problema TEXT NOT NULL,
      descripcion TEXT,
      fecha_preferida TEXT,
      franja TEXT,
      estado TEXT NOT NULL DEFAULT 'RECIBIDO',
      creado_en TEXT NOT NULL,
      actualizado_en TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS repair_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      repair_id INTEGER NOT NULL,
      estado TEXT NOT NULL,
      nota TEXT,
      creado_en TEXT NOT NULL,
      FOREIGN KEY (repair_id) REFERENCES repairs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_products_categoria ON products(categoria);
    CREATE INDEX IF NOT EXISTS idx_products_activo ON products(activo);
    CREATE INDEX IF NOT EXISTS idx_repairs_estado ON repairs(estado);
    CREATE INDEX IF NOT EXISTS idx_repair_history_repair ON repair_history(repair_id);
  `);
}

module.exports = { db, dbPath, initDb };
