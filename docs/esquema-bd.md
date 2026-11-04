# Esquema de base de datos

El proyecto usa **SQLite** mediante el módulo nativo `node:sqlite` de Node.js. El archivo por defecto es `server/data.sqlite` y se crea automáticamente al iniciar el servidor o ejecutar `npm run seed`.

## 1. Diagrama general

```text
┌────────────────────┐
│     products       │
│────────────────────│
│ id (PK)            │
│ slug (UNIQUE)      │
│ nombre             │
│ categoria          │
│ descripcion        │
│ precio             │
│ stock              │
│ imagen             │
│ destacado          │
│ activo             │
│ creado_en          │
└────────────────────┘

┌────────────────────┐
│     services       │
│────────────────────│
│ id (PK)            │
│ nombre             │
│ descripcion        │
│ precio_desde       │
│ icono              │
│ activo             │
└────────────────────┘

┌────────────────────┐          ┌──────────────────────┐
│      repairs       │ 1      N │    repair_history    │
│────────────────────│──────────│──────────────────────│
│ id (PK)            │          │ id (PK)              │
│ codigo (UNIQUE)    │          │ repair_id (FK)       │
│ nombre             │          │ estado               │
│ telefono           │          │ nota                 │
│ email              │          │ creado_en            │
│ dispositivo        │          └──────────────────────┘
│ servicio           │
│ problema           │
│ descripcion        │
│ fecha_preferida    │
│ franja             │
│ estado             │
│ creado_en          │
│ actualizado_en     │
└────────────────────┘
```

`repair_history.repair_id` referencia `repairs.id` con `ON DELETE CASCADE`.

## 2. Tabla `products`

Catálogo de productos de exhibición.

| Columna | Tipo | Restricciones | Descripción |
| --- | --- | --- | --- |
| `id` | INTEGER | PK, AUTOINCREMENT | Identificador interno. |
| `slug` | TEXT | NOT NULL, UNIQUE | Identificador legible para URL (`?producto=slug`). |
| `nombre` | TEXT | NOT NULL | Nombre comercial del producto. |
| `categoria` | TEXT | NOT NULL | Audio, Wearables, Consolas, Almacenamiento, Accesorios o Repuestos. |
| `descripcion` | TEXT | NOT NULL | Descripción corta para tarjeta y modal. |
| `precio` | INTEGER | NOT NULL, CHECK >= 0 | Precio de referencia en COP. |
| `stock` | INTEGER | NOT NULL, DEFAULT 0, CHECK >= 0 | Unidades disponibles para exhibición. |
| `imagen` | TEXT | NOT NULL | Ruta local `/assets/...` o URL `http(s)`. |
| `destacado` | INTEGER | NOT NULL, DEFAULT 0 | `1` si aparece en destacados. |
| `activo` | INTEGER | NOT NULL, DEFAULT 1 | `0` = desactivado (borrado lógico). |
| `creado_en` | TEXT | NOT NULL | Fecha ISO 8601 de creación. |

### Reglas de negocio

- El catálogo público solo consulta `activo = 1`.
- El panel administrativo consulta todos los registros.
- `DELETE /api/admin/products/:id` no elimina la fila: cambia `activo` a `0`.
- El `slug` se genera automáticamente desde el nombre si no se envía, y se hace único con sufijos `-2`, `-3`, etc.

## 3. Tabla `services`

Servicios técnicos ofrecidos y usados en el formulario de agendamiento.

| Columna | Tipo | Restricciones | Descripción |
| --- | --- | --- | --- |
| `id` | INTEGER | PK, AUTOINCREMENT | Identificador interno. |
| `nombre` | TEXT | NOT NULL | Nombre del servicio (Pantallas, Baterías, Humedad, Software). |
| `descripcion` | TEXT | NOT NULL | Texto para la tarjeta de servicio. |
| `precio_desde` | INTEGER | NOT NULL, CHECK >= 0 | Precio estimado “desde” en COP. |
| `icono` | TEXT | NOT NULL | Nombre de icono Material Symbols. |
| `activo` | INTEGER | NOT NULL, DEFAULT 1 | Servicios visibles y seleccionables. |

## 4. Tabla `repairs`

Solicitudes de reparación y su estado actual.

| Columna | Tipo | Restricciones | Descripción |
| --- | --- | --- | --- |
| `id` | INTEGER | PK, AUTOINCREMENT | Identificador interno. |
| `codigo` | TEXT | NOT NULL, UNIQUE | Ticket público con formato `CH-12345`. |
| `nombre` | TEXT | NOT NULL | Nombre del cliente. |
| `telefono` | TEXT | NOT NULL | Teléfono o WhatsApp de contacto. |
| `email` | TEXT | NULL | Correo opcional. |
| `dispositivo` | TEXT | NOT NULL | Marca y modelo del equipo. |
| `servicio` | TEXT | NOT NULL | Servicio solicitado. |
| `problema` | TEXT | NOT NULL | Categoría del problema. |
| `descripcion` | TEXT | NULL | Detalle libre del caso. |
| `fecha_preferida` | TEXT | NULL | Fecha `YYYY-MM-DD` solicitada por el cliente. |
| `franja` | TEXT | NULL | Franja horaria preferida. |
| `estado` | TEXT | NOT NULL, DEFAULT `RECIBIDO` | Estado actual del flujo. |
| `creado_en` | TEXT | NOT NULL | Fecha ISO 8601 de creación. |
| `actualizado_en` | TEXT | NOT NULL | Fecha ISO 8601 de la última actualización. |

### Estados válidos

| Valor | Etiqueta | Paso en la línea de tiempo |
| --- | --- | --- |
| `RECIBIDO` | Recibido | 1 |
| `EN_REVISION` | En revisión | 2 |
| `EN_REPARACION` | En reparación | 3 |
| `LISTO` | Listo para entrega | 4 |
| `ENTREGADO` | Entregado | 5 |
| `CANCELADO` | Cancelado | Fuera de la línea de tiempo |

Los estados se validan en el servidor antes de actualizar. `CANCELADO` se muestra con un aviso especial y no usa la barra de progreso.

## 5. Tabla `repair_history`

Bitácora de cambios de estado de cada reparación.

| Columna | Tipo | Restricciones | Descripción |
| --- | --- | --- | --- |
| `id` | INTEGER | PK, AUTOINCREMENT | Identificador interno. |
| `repair_id` | INTEGER | NOT NULL, FK → `repairs.id` | Reparación asociada. |
| `estado` | TEXT | NOT NULL | Estado registrado. |
| `nota` | TEXT | NULL | Nota del taller o mensaje automático. |
| `creado_en` | TEXT | NOT NULL | Fecha ISO 8601 del cambio. |

La página de seguimiento ordena el historial por `creado_en` y luego por `id`, de forma ascendente.

## 6. Índices

| Índice | Tabla | Columna | Uso |
| --- | --- | --- | --- |
| `idx_products_categoria` | `products` | `categoria` | Filtros de catálogo y panel. |
| `idx_products_activo` | `products` | `activo` | Catálogo público. |
| `idx_repairs_estado` | `repairs` | `estado` | Filtro del panel. |
| `idx_repair_history_repair` | `repair_history` | `repair_id` | Historial de un ticket. |

## 7. Datos iniciales

`npm run seed` elimina el contenido y vuelve a insertar:

- 12 productos.
- 4 servicios.
- 4 reparaciones demo: `CH-98234`, `CH-10001`, `CH-10002`, `CH-10003`.
- 10 registros de historial aproximadamente, según los estados iniciales.

El servidor llama a `seedDatabase()` sin `reset` al iniciar: solo inserta datos si las tablas están vacías. Para restaurar los datos demo después de las pruebas se debe ejecutar `npm run seed`.

## 8. Consultas de referencia

```sql
-- Catálogo público
SELECT * FROM products WHERE activo = 1 ORDER BY destacado DESC, id ASC;

-- Producto por slug
SELECT * FROM products WHERE slug = ? AND activo = 1;

-- Reparación por ticket
SELECT * FROM repairs WHERE codigo = ?;

-- Historial de una reparación
SELECT * FROM repair_history WHERE repair_id = ? ORDER BY creado_en ASC, id ASC;

-- Borrado lógico
UPDATE products SET activo = 0 WHERE id = ?;
```

## 9. Copias de seguridad

Al ser SQLite, basta copiar `server/data.sqlite` con el servidor detenido. También se puede exportar con:

```bash
sqlite3 server/data.sqlite ".backup 'respaldo.sqlite'"
```

> El archivo `server/data.sqlite` está incluido en `.gitignore`; no se versiona.
