# Documento de entrega — Cellphone Hospital MVP

**Proyecto:** Sitio web y panel administrativo de Cellphone Hospital  
**Ubicación del negocio:** Cl. 4 #6-75, Plaza Comercial La Campana, Local 102, San Francisco de Sales, Cundinamarca  
**Tipo:** MVP académico / demostración funcional  
**Fecha de entrega:** 8 de noviembre de 2026  
**Versión:** `v0.2.0`

---

## 1. Resumen ejecutivo

Se transformó el prototipo visual de Stitch en una aplicación web funcional, conservando su identidad visual (paleta verde, tipografía Inter, tarjetas suaves, iconografía Material Symbols y estructura editorial). El resultado incluye:

- Sitio público responsive con inicio, catálogo, agendamiento, seguimiento y ubicación.
- Backend en Node.js + Express + EJS con base de datos SQLite nativa.
- Catálogo de 12 productos ficticios con búsqueda, filtros, estado vacío y modal accesible con enlace directo.
- Flujo completo de reparaciones: el cliente agenda y recibe un ticket; el administrador cambia el estado y el historial queda registrado.
- Panel administrativo protegido por sesión para gestionar reparaciones y productos, con subida de imágenes desde el PC.
- Ajustes de la `v0.2.0`: toda la tarjeta del catálogo abre el detalle, “Otro” y “Necesito diagnóstico” en el agendamiento, modal de ticket creado, stock solo interno, compresión HTTP y SEO técnico.
- Documentación, datos demo, pruebas automatizadas y guion de presentación.

El proyecto se ejecuta con `npm start` y no depende de PHP, MySQL ni servicios de pago.

---

## 2. Objetivo y alcance

### Objetivo

Entregar un MVP evaluable que demuestre, de punta a punta, los procesos clave del negocio: **mostrar productos**, **recibir solicitudes de reparación**, **hacer seguimiento por ticket** y **administrar el taller y el catálogo**.

### Incluido en el alcance

- Diseño responsive basado en el prototipo original.
- Catálogo de exhibición (sin venta en línea).
- Agendamiento de reparaciones con validación en cliente y servidor.
- Generación y consulta de tickets con historial de estados.
- Panel administrativo con autenticación por contraseña.
- CRUD de productos con desactivación lógica y subida de imágenes (máx. 2 MB).
- Datos ficticios claramente marcados como demo.
- Stock como dato interno: el público solo ve “Consultar disponibilidad”.
- SEO técnico: canonical y Open Graph absolutos, `robots.txt` y `sitemap.xml`.
- Rendimiento: compresión HTTP y cache busting de CSS/JS.
- Documentación de uso, base de datos, pruebas y demo.
- Pruebas de humo automatizadas en navegador real (60 comprobaciones).

### Fuera del alcance

- Carrito de compras, reservas de productos, pagos o pasarelas.
- Envío real de correos, SMS o mensajes de WhatsApp.
- Usuarios múltiples, roles, recuperación de contraseña o auditoría avanzada.
- Inventario transaccional, facturación o integración contable.
- Despliegue en producción con HTTPS, dominio y base administrada.
- Activación definitiva de enlaces externos (teléfono, WhatsApp, Facebook y Google Maps).

---

## 3. Requisitos y trazabilidad

| # | Requisito | Estado | Dónde se cumple |
| --- | --- | --- | --- |
| 1 | Conservar y mejorar el diseño del prototipo | Cumplido | `views/`, `public/assets/css/input.css`, `DESIGN.md`, `docs/original/` |
| 2 | Productos solo de exhibición, sin carrito ni pagos | Cumplido | `views/productos.ejs`, `views/partials/product-card.ejs`, avisos demo |
| 3 | Filtros por categoría, búsqueda y estado vacío exacto | Cumplido | `public/assets/js/productos.js`, `views/productos.ejs` |
| 4 | 12 productos ficticios marcados como demo | Cumplido | `server/seed.js`, etiqueta “Demo” en tarjetas y modal |
| 5 | Agendamiento con backend demostrable | Cumplido | `POST /agendar`, `POST /api/repairs`, `server/server.js` |
| 6 | Seguimiento de tickets con historial | Cumplido | `GET /seguimiento`, `GET /api/repairs/:codigo` |
| 7 | Panel admin para reparaciones | Cumplido | `views/admin.ejs`, `PATCH /api/admin/repairs/:codigo/estado` |
| 8 | CRUD de productos y borrado lógico | Cumplido | `POST/PUT/DELETE /api/admin/products`, `activo = 0` |
| 9 | Modal accesible con enlace directo | Cumplido | `<dialog>`, `?producto=slug`, cierre con Escape y retorno de foco |
| 10 | Enlaces externos desactivados con TODO visible | Cumplido | `business.linksActive`, `ENLACES_ACTIVOS=false`, avisos en vistas |
| 11 | Iframe de Google Maps conservado | Cumplido | `views/ubicacion.ejs` |
| 12 | Datos de contacto correctos | Cumplido | `server/server.js` (`business`) |
| 13 | Año del copyright actualizado | Cumplido | `res.locals.year` y `views/partials/footer.ejs` |
| 14 | FAQ, garantía y “cómo funciona” | Cumplido | `views/index.ejs` |
| 15 | Ejecución con `npm start` | Cumplido | `package.json`, `server/server.js` |
| 16 | Commits por fase y tag del MVP | Cumplido | Historial Git, tags `v0.1.0-mvp` y `v0.2.0` |
| 17 | Flecha y toda la tarjeta del catálogo abren el detalle | Cumplido | `views/partials/product-card.ejs`, `public/assets/js/productos.js` |
| 18 | “Otro” con detalle obligatorio y “No estoy seguro / Necesito diagnóstico” | Cumplido | `views/agendar.ejs`, `server/server.js`, `public/assets/js/agendar.js` |
| 19 | Modal de confirmación con el número de ticket | Cumplido | `views/seguimiento.ejs`, `public/assets/js/seguimiento.js` |
| 20 | Stock solo interno y “Consultar disponibilidad” en público | Cumplido | `publicProduct()`, `views/productos.ejs`, `views/admin.ejs` |
| 21 | Subida de imagen desde el PC en el panel | Cumplido | `POST /api/admin/products/image`, `views/admin.ejs`, `public/assets/js/admin.js` |
| 22 | Botón de agendar oculto en el encabezado móvil | Cumplido | `views/partials/header.ejs` |
| 23 | SEO y rendimiento: URLs absolutas, robots/sitemap, compresión y cache busting | Cumplido | `server/server.js`, `views/partials/head.ejs`, `views/partials/scripts.ejs` |

---

## 4. Arquitectura

```text
Navegador
   │  HTML / CSS / JS
   ▼
Express (Node.js)
   ├─ Rutas públicas (EJS)
   ├─ API pública JSON
   ├─ Panel /admin + sesión en memoria
   ├─ API administrativa JSON
   └─ Validación en servidor
          │
          ▼
   SQLite nativo (node:sqlite)
   ├─ products
   ├─ services
   ├─ repairs
   └─ repair_history
```

### Tecnologías

| Capa | Tecnología | Motivo |
| --- | --- | --- |
| Servidor | Node.js 26 + Express 4 | Ecosistema simple, rápido de ejecutar y evaluar. |
| Vistas | EJS | Render del lado del servidor sin framework pesado. |
| Base de datos | `node:sqlite` | Sin instalación externa; archivo local reproducible. |
| Estilos | Tailwind CSS 3.4 compilado localmente | Control del diseño y funcionamiento sin CDN. |
| Cliente | JavaScript vanilla | Ligero, sin build de frontend. |
| Iconos | Material Symbols local | Sin dependencia de Google Fonts en tiempo de ejecución. |
| Pruebas | Playwright Core + Chrome/Edge | Verificación real de UI, teclado y responsive. |

### Decisiones relevantes

1. **Backend Node.js en lugar de PHP/MySQL:** el entorno ya dispone de Node y el módulo `node:sqlite`, lo que reduce la instalación y hace el proyecto portable.
2. **Sesión en memoria:** suficiente para un MVP de una sola instancia. Se documenta como limitación para producción.
3. **Borrado lógico de productos:** conserva historial y permite reactivar; cumple el requisito de no eliminar físicamente.
4. **Modal con `<dialog>` nativo:** accesible por teclado, con foco atrapado por el navegador y enlace directo compartible.
5. **Enlaces externos desactivados por configuración:** evita publicar contactos prematuramente y deja un TODO explícito.
6. **Fuente de iconos completa:** se reemplazó un subconjunto defectuoso por la fuente completa de Material Symbols para garantizar las ligaduras.

---

## 5. Flujos principales

### 5.1 Cliente agenda una reparación

1. Entra a `/agendar`.
2. Completa datos personales, equipo, servicio, problema y fecha preferida. Puede elegir “No estoy seguro / Necesito diagnóstico” o “Otro”; en este último caso debe escribir el detalle (3–80 caracteres).
3. El navegador valida campos obligatorios y muestra el detalle solo cuando corresponde; el servidor vuelve a validar.
4. Si hay errores, responde `422` y conserva los datos ingresados, incluido el detalle.
5. Si todo es válido, crea el ticket `CH-xxxxx`, registra el estado `RECIBIDO` y redirige a `/seguimiento?codigo=...&nuevo=1`.
6. Se abre un modal con el número de ticket y un botón para copiarlo. Al cerrarlo se limpia `nuevo=1` de la URL.

### 5.2 Cliente consulta el estado

1. Entra a `/seguimiento` o usa el buscador del inicio.
2. Escribe el código del ticket.
3. Ve estado actual, barra de progreso, detalles e historial.
4. Puede copiar el código o imprimir un comprobante amigable.

### 5.3 Administrador actualiza una reparación

1. Entra a `/admin` e inicia sesión.
2. Busca o filtra la reparación.
3. Abre el diálogo “Actualizar estado”.
4. Elige el nuevo estado y, opcionalmente, una nota.
5. El servidor actualiza `repairs` e inserta un registro en `repair_history`.
6. El cambio se refleja de inmediato en el seguimiento público.

### 5.4 Administrador gestiona productos

1. Abre la pestaña “Productos”.
2. Crea o edita un producto con validación de nombre, categoría, descripción, precio, stock e imagen.
3. Puede subir una imagen desde el PC (JPG, PNG o WebP, máximo 2 MB, mínimo 800×600 px) o escribir una ruta/URL.
4. El stock es un dato interno: el catálogo público siempre muestra “Consultar disponibilidad”.
5. Puede marcarlo como destacado o inactivo.
6. Al desactivarlo, desaparece del catálogo público pero permanece en la base para su reactivación.

---

## 6. Seguridad y limitaciones

### Medidas implementadas

- Contraseña comparada con `crypto.timingSafeEqual`.
- Sesión con token aleatorio de 32 bytes y cookie `HttpOnly`, `SameSite=Strict`; `Secure` en producción.
- Expiración de sesión a las 8 horas.
- Validación y límites de longitud en servidor para todos los formularios.
- Consultas SQL parametrizadas.
- Límite de cuerpo JSON/formulario a 100 kB.
- Cabeceras `X-Content-Type-Options`, `Referrer-Policy` y `X-Frame-Options`.
- Escapado de salida de EJS y serialización segura de JSON en `<script>`.
- Subida de imágenes restringida a JPG, PNG y WebP, con validación por firma real del archivo, tamaño máximo de 2 MB y dimensiones entre 800×600 y 4000×3000 px.
- El stock numérico no se envía al navegador en las respuestas públicas.

### Limitaciones asumidas del MVP

- No hay usuarios ni roles: una sola contraseña compartida.
- Las sesiones se guardan en memoria y se pierden al reiniciar.
- No hay rate limiting ni bloqueo por intentos fallidos.
- No hay CSRF token explícito; se mitiga parcialmente con `SameSite=Strict`.
- La base SQLite es local y no está pensada para alta concurrencia.
- No se envían notificaciones reales.
- El sitio no está desplegado en un dominio público.

Para producción se recomienda: usuarios individuales con hash de contraseña, sesiones persistentes, CSRF, rate limiting, HTTPS, backups y base administrada.

---

## 7. Privacidad y tratamiento de datos

El formulario de agendamiento recoge nombre, teléfono, correo opcional, equipo y descripción del problema. En este MVP los datos son ficticios y se almacenan localmente con fines académicos.

Antes de publicar el sitio se debe:

1. Redactar la política de privacidad y el aviso de tratamiento de datos.
2. Informar la finalidad, el tiempo de conservación y los canales de contacto.
3. Obtener la autorización correspondiente conforme a la normativa colombiana de protección de datos.
4. Restringir el acceso al panel y a la base de datos.

> Los términos y la política de privacidad son **opcionales** para esta entrega y quedan como pendiente para la versión de producción.

---

## 8. Pruebas realizadas

La evidencia detallada está en [pruebas.md](pruebas.md). Resumen:

- Rutas públicas responden `200`; ruta inexistente responde `404`.
- Login correcto `200`, incorrecto `401`; API administrativa sin sesión `401`.
- Cambio de estado de reparación verificado en API y en la página pública.
- CRUD de producto verificado: creación, edición, desactivación y desaparición del catálogo público.
- Formulario inválido responde `422`; API inválida responde `400`.
- Filtros, búsqueda, estado vacío y modal verificados en navegador.
- La flecha de la tarjeta abre el modal; el enlace directo `?producto=slug` abre el producto correcto.
- El stock no aparece en los datos enviados al navegador ni en la API pública.
- “Otro” exige detalle en cliente y servidor; “Necesito diagnóstico” no lo exige.
- El modal de ticket creado muestra el código y limpia `?nuevo=1` al cerrarse.
- La API de imágenes acepta un JPG de 900×600 y rechaza un archivo que no es imagen real.
- `robots.txt` y `sitemap.xml` responden correctamente.
- Responsive sin desborde horizontal entre 320 px y 1440 px.
- Navegación móvil con teclado, cierre con Escape y cierre al hacer clic fuera.
- Impresión de ticket oculta encabezado, pie, buscador y panel lateral.
- Sin errores de consola ni solicitudes fallidas en las rutas revisadas.

---

## 9. Cómo ejecutar y verificar

```bash
npm install
npm run seed
npm start
```

Abrir <http://localhost:3000>. Para el panel: <http://localhost:3000/admin> con `admin123`.

Prueba automatizada (con el servidor activo):

```bash
npm run test:smoke
```

---

## 10. Pendientes y próximos pasos

1. **Activar enlaces externos** (`ENLACES_ACTIVOS=true`) y añadir el enlace de WhatsApp.
2. Reemplazar la contraseña demo y implementar usuarios/roles.
3. Persistir sesiones y añadir CSRF y rate limiting.
4. Redactar política de privacidad y términos.
5. Configurar dominio, HTTPS y despliegue.
6. Migrar a una base administrada si aumenta la concurrencia.
7. Añadir notificaciones reales por correo o WhatsApp.
8. Incorporar imágenes definitivas de productos y del local desde el panel.
9. Validar precios, horarios y disponibilidad reales con el negocio.
10. Mover las imágenes subidas a un almacenamiento persistente si se despliega en un servicio con disco efímero.
11. Añadir rate limiting, CSRF y sesiones persistentes antes de publicar.

---

## 11. Checklist de entrega

- [x] Proyecto ejecutable con `npm start`.
- [x] 12 productos demo y 4 servicios.
- [x] 4 tickets demo con historial.
- [x] Catálogo con filtros, búsqueda y estado vacío.
- [x] Modal de producto con enlace directo.
- [x] Agendamiento con validación y generación de ticket.
- [x] Seguimiento público por código.
- [x] Panel admin con login.
- [x] Actualización de estados de reparación.
- [x] CRUD de productos con borrado lógico.
- [x] Enlaces externos desactivados y documentados.
- [x] Mapa de Google integrado.
- [x] Diseño responsive y estilos de impresión.
- [x] Documentación de entrega, base de datos, pruebas y demo.
- [x] La flecha y toda la tarjeta del catálogo abren el detalle.
- [x] “Otro” con detalle obligatorio y “Necesito diagnóstico” disponibles.
- [x] Modal de ticket creado con copia del código.
- [x] Stock solo interno y “Consultar disponibilidad” en público.
- [x] Subida de imágenes desde el PC con validación.
- [x] Botón de agendar oculto en el encabezado móvil.
- [x] SEO técnico y compresión HTTP.
- [x] Prueba de humo automatizada (60 comprobaciones).
- [x] Commits por fase y tags `v0.1.0-mvp` y `v0.2.0`.
