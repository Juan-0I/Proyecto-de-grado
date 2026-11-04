# v0.2.0 — Feedback del cliente y cierre de calidad

Segunda versión del MVP web de **Cellphone Hospital** (San Francisco de Sales, Cundinamarca). Mantiene la identidad visual del prototipo de Stitch y cierra los ajustes solicitados tras la primera revisión.

> **Demostración académica:** productos, precios, servicios, tickets y datos de contacto son ficticios. No hay carrito, pagos, reservas ni envío de correos reales.

## Cambios solicitados

- **Catálogo:** toda la tarjeta y la flecha abren el detalle del producto, igual que las tarjetas de servicios. El detalle sigue disponible con enlace directo (`/productos?producto=slug`).
- **Agendamiento:** se agregaron las opciones **“Otro”** y **“No estoy seguro / Necesito diagnóstico”**.
  - “Otro” exige un detalle de 3 a 80 caracteres, validado en el navegador y en el servidor.
  - “Necesito diagnóstico” no pide detalle.
- **Seguimiento:** al crear un ticket se abre un modal con el número, un botón para copiarlo y acceso directo al estado de la reparación. Al cerrarlo se limpia `?nuevo=1` de la URL.
- **Disponibilidad:** el stock ahora es un dato **solo interno**. El público siempre ve “Consultar disponibilidad”; la API pública no devuelve cantidades ni estado de stock.
- **Panel administrativo:** carga de imágenes desde el PC (JPG, PNG o WebP; máximo 2 MB; mínimo 800×600 px; ideal 1600×1200 px) con vista previa y validación real del archivo.
- **Móvil:** se retiró el botón-icono de agendar del encabezado; la acción permanece dentro del menú.

## Calidad, SEO y rendimiento

- URLs canónicas y Open Graph absolutas configurables con `BASE_URL`.
- `robots.txt` y `sitemap.xml` dinámicos, con las páginas y los productos activos.
- Compresión HTTP y cache busting de CSS/JS mediante `ASSET_VERSION`.
- Corrección de escapado en atributos ARIA (`aria-invalid`, `aria-describedby`, `aria-current`).
- Accesibilidad: foco visible en tarjetas, cierre de diálogos con `Escape` y navegación por teclado.

## Verificación

- `npm run test:smoke`: **60/60 comprobaciones correctas**, 0 errores de consola.
- Responsive sin desborde horizontal entre 320 px y 1440 px.
- `npm audit`: 0 vulnerabilidades.
- Base demo reiniciada: 12 productos, 4 servicios, 4 reparaciones y 10 eventos de historial.

## Cómo ejecutar

```bash
npm install
npm run seed
npm start
```

Abrir <http://localhost:3000>. Requiere **Node.js 24 o superior** (usa `node:sqlite`).

Panel administrativo: <http://localhost:3000/admin>  
Contraseña de demostración: `admin123` (cambiar con `ADMIN_PASSWORD`).

## Notas

- Los enlaces externos (Facebook, WhatsApp, teléfono y Google Maps) permanecen como texto hasta definir `ENLACES_ACTIVOS=true`. El mapa integrado sí está activo.
- Las imágenes subidas se guardan en `public/uploads/productos/` (ignoradas por Git), no en la base de datos.
- `npm run seed` reinicia la base y borra los tickets creados.
- Antes de publicar en producción: definir `BASE_URL`, cambiar `ADMIN_PASSWORD` y añadir sesiones persistentes, rate limiting y CSRF.
