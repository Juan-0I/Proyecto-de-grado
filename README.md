# Cellphone Hospital — MVP web

**Versión:** `v0.2.0`

Sitio web y panel administrativo de **Cellphone Hospital**, ubicado en San Francisco de Sales, Cundinamarca. El proyecto nace del prototipo visual de Stitch y lo convierte en una aplicación funcional con backend, base de datos y flujos demostrables de reparaciones y catálogo.

> **Sitio de demostración académica.** Los productos, precios, servicios, tickets y datos de contacto son ficticios. No hay carrito, pagos, reservas ni envío de correos reales.

---

## 1. Requisitos

- **Node.js 24 o superior** (probado con Node.js 26.13.0). La base de datos usa el módulo nativo `node:sqlite`.
- npm 10 o superior.
- Navegador moderno (Chrome, Edge, Firefox o Safari recientes).

No se requiere PHP, MySQL, Docker ni servicios externos para ejecutar el proyecto.

## 2. Puesta en marcha

```bash
npm install
npm run seed      # crea/restaura los datos de demostración
npm start
```

Abrir <http://localhost:3000>.

Para desarrollo con recarga del servidor y recompilación de estilos:

```bash
npm run dev        # node --watch server/server.js
npm run watch:css  # Tailwind en modo watch (en otra terminal)
```

### Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm start` | Inicia el servidor en `http://localhost:3000`. |
| `npm run dev` | Inicia el servidor con recarga automática. |
| `npm run seed` | Reinicia la base y vuelve a cargar los datos demo. |
| `npm run build:css` | Compila `public/assets/css/input.css` a `styles.css`. |
| `npm run watch:css` | Compila Tailwind en modo vigilancia. |
| `npm run test:smoke` | Prueba de humo en navegador real (requiere servidor activo). |

## 3. Rutas principales

| Ruta | Descripción |
| --- | --- |
| `/` | Inicio: hero, productos destacados, servicios, cómo funciona, seguimiento, FAQ y ubicación. |
| `/productos` | Catálogo con búsqueda, filtros por categoría y modal de detalle. |
| `/productos?producto=slug` | Enlace directo a un producto (abre el modal). |
| `/agendar` | Formulario de solicitud de reparación; genera un ticket. |
| `/seguimiento` | Consulta de ticket por código. |
| `/seguimiento?codigo=CH-98234` | Ejemplo de ticket con estado e historial. |
| `/ubicacion` | Dirección, horario, contacto y mapa integrado de Google Maps. |
| `/admin` | Panel administrativo (requiere contraseña). |
| `/robots.txt` | Reglas para buscadores. |
| `/sitemap.xml` | Mapa del sitio generado desde las rutas y los productos activos. |

## 4. Acceso al panel

- URL: <http://localhost:3000/admin>
- Contraseña por defecto: **`admin123`**
- La pista de contraseña solo aparece cuando `ADMIN_PASSWORD` no está definida.

En el panel se puede:

- Buscar y filtrar reparaciones por estado.
- Actualizar el estado de una reparación y dejar una nota en el historial.
- Buscar y filtrar productos por categoría.
- Crear, editar y desactivar productos (borrado lógico: `activo = 0`).
- Subir imágenes de producto desde el PC (JPG, PNG o WebP, máximo 2 MB, mínimo 800×600 px, ideal 1600×1200 px).

## 5. Datos de demostración

- **12 productos** ficticios en seis categorías: Audio, Wearables, Consolas, Almacenamiento, Accesorios y Repuestos.
- **4 servicios** técnicos: Pantallas, Baterías, Humedad y Software.
- **4 tickets** de reparación:

| Ticket | Cliente | Equipo | Estado |
| --- | --- | --- | --- |
| `CH-98234` | Carlos Gómez | Samsung Galaxy A54 | En revisión |
| `CH-10001` | María Rodríguez | iPhone 12 | Recibido |
| `CH-10002` | Andrés Martínez | Xiaomi Redmi Note 12 | En reparación |
| `CH-10003` | Laura Díaz | Motorola G84 | Listo para entrega |

Para volver al estado inicial en cualquier momento:

```bash
npm run seed
```

## 6. Configuración

Copiar `.env.example` como `.env` y ajustar los valores:

| Variable | Valor por defecto | Uso |
| --- | --- | --- |
| `PORT` | `3000` | Puerto HTTP. |
| `ADMIN_PASSWORD` | `admin123` | Contraseña del panel. **Cambiar en producción.** |
| `ENLACES_ACTIVOS` | `false` | Activa teléfono, correo, WhatsApp, Facebook y enlaces a Google Maps. |
| `DB_PATH` | `server/data.sqlite` | Ruta alternativa de la base SQLite. |
| `BASE_URL` | `http://localhost:3000` | Dominio público para URLs absolutas (canonical, Open Graph y sitemap). |
| `ASSET_VERSION` | versión de `package.json` | Versión usada en `styles.css?v=` y en los scripts para evitar caché vieja. |
| `NODE_ENV` | — | En `production` la cookie de sesión se marca `Secure`. |

## 7. Enlaces externos — TODO antes de publicar

Mientras `ENLACES_ACTIVOS` sea `false`, la información de contacto se muestra como **texto sin hipervínculo**. El iframe de Google Maps sí está activo porque es una referencia visual integrada.

Antes de publicar el sitio, activar los enlaces:

1. Definir `ENLACES_ACTIVOS=true` en `.env` (o en el entorno del hosting).
2. Verificar que los datos de `business` en `server/server.js` sean los definitivos:
   - Teléfono: `+57 321 7635196`
   - WhatsApp: `https://wa.me/573217635196`
   - Facebook: `https://www.facebook.com/p/Cell-Phone-Hospital-61557347480288/`
   - Correo: `hola@cellhospital.co`
   - Dirección: `Cl. 4 #6-75, Plaza Comercial La Campana, Local 102`
3. Añadir el enlace de WhatsApp en los puntos de contacto (hoy el número se muestra como texto).
4. Revisar que el iframe de Google Maps apunte a la ubicación definitiva.
5. Probar los enlaces en móvil y escritorio.

> **Pendiente:** el botón/enlace de WhatsApp aún no está implementado. El número y la URL base están documentados para activarlo en la versión final.

## 8. Estructura del proyecto

```text
.
├─ server/
│  ├─ server.js        # Rutas, API, validación, sesión y render EJS
│  ├─ seed.js          # Datos demo y reinicio de la base
│  ├─ db.js            # Esquema SQLite (node:sqlite)
│  └─ constants.js     # Estados, categorías, formatos y helpers
├─ views/
│  ├─ partials/        # head, header, footer, scripts, product-card
│  ├─ index.ejs        # Página de inicio
│  ├─ productos.ejs    # Catálogo + modal
│  ├─ agendar.ejs      # Formulario de reparación
│  ├─ seguimiento.ejs  # Consulta de ticket
│  ├─ ubicacion.ejs    # Ubicación y contacto
│  ├─ admin.ejs        # Panel administrativo
│  ├─ 404.ejs
│  └─ error.ejs
├─ public/assets/
│  ├─ css/input.css    # Fuente Tailwind y estilos de componentes/impresión
│  ├─ css/styles.css   # CSS compilado (generado)
│  ├─ js/              # ui, productos, agendar, seguimiento, admin
│  ├─ fonts/           # Inter y Material Symbols locales
│  ├─ img/             # Imágenes del sitio y del catálogo
│  └─ uploads/productos/ # Imágenes subidas desde el panel (ignoradas por Git)
├─ tests/smoke.js      # Prueba de humo con Playwright
├─ docs/
│  ├─ original/        # Prototipo original de Stitch
│  ├─ ENTREGA.md
│  ├─ cronograma.md    # Plan de cierre de la v0.2.0
│  ├─ esquema-bd.md
│  ├─ guion-demo.md
│  └─ pruebas.md
├─ DESIGN.md           # Tokens y guía visual
├─ tailwind.config.js
└─ package.json
```

## 9. API pública

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/products` | Productos activos. Acepta `?categoria=` y `?q=`. |
| `GET` | `/api/products/:idOrSlug` | Detalle de un producto activo. |
| `GET` | `/api/services` | Servicios activos. |
| `POST` | `/api/repairs` | Crea una solicitud y devuelve el ticket. |
| `GET` | `/api/repairs/:codigo` | Consulta un ticket y su historial. |

## 10. API administrativa

Requiere sesión iniciada. Responde `401` sin sesión.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/admin/repairs` | Lista reparaciones. Acepta `?estado=` y `?q=`. |
| `PATCH` | `/api/admin/repairs/:codigo/estado` | Cambia el estado y agrega una nota al historial. |
| `GET` | `/api/admin/products` | Lista todos los productos, incluidos los inactivos. |
| `POST` | `/api/admin/products/image` | Sube una imagen (`multipart/form-data`, campo `imagen`) y devuelve su URL. |
| `POST` | `/api/admin/products` | Crea un producto. |
| `PUT` | `/api/admin/products/:id` | Actualiza un producto. |
| `DELETE` | `/api/admin/products/:id` | Desactiva un producto (borrado lógico). |

## 11. Pruebas

Con el servidor activo:

```bash
npm run test:smoke
```

La prueba usa Chrome o Edge instalado en el sistema y cubre **60 comprobaciones** (incluye flecha del catálogo, stock fuera del navegador, “Otro” en agendamiento, modal de ticket, subida de imagen y SEO). Ver [docs/pruebas.md](docs/pruebas.md) para el detalle de casos, resultados y evidencias.

## 12. Documentación de entrega

- [docs/ENTREGA.md](docs/ENTREGA.md) — alcance, arquitectura, requisitos y checklist.
- [docs/esquema-bd.md](docs/esquema-bd.md) — modelo de datos.
- [docs/guion-demo.md](docs/guion-demo.md) — guion de presentación.
- [docs/pruebas.md](docs/pruebas.md) — plan y evidencias de prueba.
- [DESIGN.md](DESIGN.md) — sistema de diseño heredado del prototipo.

## 13. Limitaciones conocidas

- Sesiones en memoria: se pierden al reiniciar el servidor.
- Autenticación con una sola contraseña compartida, sin usuarios ni roles.
- Sin envío real de correos, SMS ni WhatsApp.
- Sin carrito, pagos, reservas de productos ni control de inventario transaccional.
- El mapa integrado depende de la disponibilidad de Google Maps.
- Los datos viven en un archivo SQLite local (`server/data.sqlite`, ignorado por Git).
- Las imágenes subidas se guardan en disco (`public/uploads/productos/`), no en la base de datos ni en un servicio externo.

Estas limitaciones son coherentes con un MVP académico y están documentadas para una futura versión de producción.
