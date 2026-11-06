# Roadmap y propuestas futuras

**Proyecto:** Cellphone Hospital MVP
**Base:** `v0.2.0` (commit `cca9a98`)
**Última actualización:** 5 de noviembre de 2026
**Estado:** documento de propuestas. **Nada de esto está implementado, aprobado ni confirmado.**

> **Nota de versión:** este documento es solo documentación y no modifica el código de la `v0.2.0`. La numeración `0.2.1` se reservaría para una corrección puntual (por ejemplo, un fallo de privacidad). Las mejoras de este documento apuntan a una futura `0.3.0` o posterior, y deben confirmarse antes de implementarse.

---

## 1. Cómo usar este documento

1. Registrar cada propuesta con su origen (auditoría interna, cliente, docente o evaluador).
2. Clasificarla como obligatoria, deseable u opcional.
3. Estimar impacto y esfuerzo.
4. Confirmar el alcance final antes de escribir código.

Nada de lo aquí descrito es requisito para la entrega académica del domingo 8 de noviembre de 2026.

---

## 2. Mejoras detectadas en la auditoría interna

### Prioridad sugerida

| # | Mejora | Impacto | Esfuerzo | ¿Urgente? |
| --- | --- | --- | --- | --- |
| 1 | Sesiones persistentes, rate limiting y CSRF | Alto (seguridad) | Medio | Solo si se publica |
| 2 | Limpieza de imágenes huérfanas | Medio (orden/disco) | Bajo | No |
| 3 | Tests del ciclo CRUD del admin | Medio (calidad) | Bajo | No |
| 4 | Imagen OG 1200×630 | Bajo (presentación) | Bajo | No |
| 5 | WebP + `srcset` | Medio (rendimiento) | Medio | No |
| 6 | Paginación del catálogo | Bajo (escala) | Medio | No |
| 7 | Despliegue con volumen persistente | Alto (si se publica) | Alto | No |

### 2.1 Sesiones persistentes, rate limiting y CSRF

**Estado actual**

- Sesiones en un `Map` en memoria (`server/server.js`): se pierden al reiniciar.
- Cookie `ch_admin_session` con `HttpOnly`, `Path=/`, `SameSite=Strict`, `Max-Age` de 8 h y `Secure` en producción.
- Sin límite de intentos de login ni token CSRF.
- Cabeceras de seguridad manuales: `X-Content-Type-Options`, `Referrer-Policy` y `X-Frame-Options`.

**Propuesta**

- Guardar sesiones en SQLite (tabla `sessions` con token hasheado y expiración) o en un almacén externo si hay varias instancias.
- Rate limit en `POST /admin/login` y `POST /agendar` (ej.: 5 intentos por IP cada 15 minutos).
- Token CSRF en login y acciones del admin, o validación de `Origin`/`Referer` en escrituras.
- Migrar las cabeceras a `helmet` con una CSP compatible con el iframe de Google Maps y las fuentes locales.

**Riesgo:** una CSP mal configurada puede bloquear Maps o los estilos; validar con la prueba de humo.

### 2.2 Limpieza de imágenes huérfanas

**Estado actual**

- Las imágenes se guardan en `public/uploads/productos/` y la ruta queda en `products.imagen`.
- Al reemplazar una imagen o desactivar un producto, el archivo anterior permanece.
- El borrado de productos es lógico (`activo = 0`), por lo que no se debe borrar el archivo al desactivar.

**Propuesta**

- Al reemplazar una imagen, comprobar si otro producto usa la ruta anterior; si no, borrar el archivo.
- No borrar nada al desactivar.
- Comando manual `npm run cleanup:uploads` que elimine archivos sin referencia en la base.
- Opcional: tabla `uploads` para registrar creación y uso.

**Riesgo:** bajo si la limpieza solo corre como comando manual.

### 2.3 Tests del ciclo CRUD del admin

**Estado actual**

- La prueba de humo cubre apertura de diálogos, subida válida y rechazo de archivo falso.
- No cubre crear, editar, desactivar y reactivar un producto.

**Propuesta**

- Crear producto vía API → verlo en catálogo → editarlo → desactivarlo → comprobar que desaparece del público y sigue en el admin → reactivarlo.
- Usar `DB_PATH` a un archivo temporal por prueba para no ensuciar la demo.
- Separar pruebas de API y de navegador.

**Riesgo:** bajo; limpiar datos al terminar para conservar el seed.

### 2.4 Imagen OG dedicada de 1200×630

**Estado actual**

- `og:image` usa `hero-tecnico.jpg` (512×343), que se recorta al compartir.

**Propuesta**

- Diseñar `public/assets/img/site/og-default.jpg` (1200×630) con logo, nombre y propuesta de valor.
- Actualizar `views/partials/head.ejs`.
- Opcional: imagen por producto con su foto y nombre.

**Riesgo:** nulo.

### 2.5 WebP y `srcset`

**Estado actual**

- Imágenes de hasta 2 MB servidas en un solo tamaño; ya usan `loading="lazy"` y `decoding="async"`.

**Propuesta**

- Convertir cada subida a WebP con `sharp` y generar 400, 800 y 1200 px de ancho.
- Servir `srcset`/`sizes` en la tarjeta y el modal.
- Ajustar la validación actual de `multer` + `image-size`.

**Riesgo:** medio por la dependencia nativa `sharp`; requiere probar en cada sistema operativo.

### 2.6 Paginación del catálogo

**Estado actual**

- `/productos` carga los 12 productos y filtra en el navegador. Es suficiente para el alcance actual.

**Cuándo haría falta:** a partir de ~40–50 productos, sobre todo en móvil.

**Propuesta**

- Paginación en servidor (`?pagina=2`, 12 por página) o “cargar más”.
- Mantener filtros y búsqueda en la URL.
- Añadir `lastmod` al `sitemap.xml` y las imágenes de producto.

**Riesgo:** medio; toca filtros, modal y enlaces directos. Actualizar pruebas.

### 2.7 Despliegue con volumen persistente

**Estado actual**

- `PORT`, `DB_PATH` y `BASE_URL` son variables de entorno.
- `UPLOAD_DIR` está fijo en el código.
- Sin Dockerfile, healthcheck ni backups.

**Propuesta**

- Leer `UPLOAD_DIR` de una variable de entorno.
- `Dockerfile` o configuración de Railway/Render.
- Volumen para SQLite y las imágenes.
- `trust proxy` para cookies `Secure` detrás del proxy.
- Endpoint `/healthz`, logs estructurados y backups automáticos.
- Política de seed: no reiniciar la base en cada arranque.

**Riesgo:** alto sin volumen; se perderían base e imágenes en cada despliegue.

### Fases propuestas

| Fase | Contenido | Depende de |
| --- | --- | --- |
| 1 | Limpieza de uploads + tests CRUD | Nada |
| 2 | Seguridad: sesiones, rate limit, CSRF, helmet | Nada |
| 3 | Imágenes: OG 1200×630 y WebP/`srcset` | Fase 1 |
| 4 | Despliegue con volumen y `/healthz` | Fase 2 |
| 5 | Paginación y sitemap con `lastmod` | Fase 4 |

**Orden recomendado:** 1 → 2 → 4. Primero ordenar lo existente, luego protegerlo y después publicarlo; rendimiento y escala solo importan cuando el sitio ya está en línea.

---

## 3. Recomendaciones externas revisadas

Sugerencias aportadas por un tercero, contrastadas con el código de la `v0.2.0`.

| # | Sugerencia | Estado | Acción propuesta |
| --- | --- | --- | --- |
| 1 | Middleware que verifique la sesión antes de acceder a páginas privadas | **Cumplida** | Ninguna; opcional: middleware de página para mantener el patrón |
| 2 | Limpiar el navbar del admin y quitar botones duplicados | **Pendiente** | Quitar navbar público del admin, mover “Cerrar sesión” al navbar y dejar un solo CTA de agendar |
| 3 | Marcar como opcional el detalle del agendamiento | **Cumplida** | Opcional: mostrar el límite de 80 caracteres y rechazar en servidor en vez de recortar |
| 4 | No mostrar tickets de otros clientes | **Pendiente (crítico)** | Eliminar la lista pública de los 4 tickets más recientes |

### 3.1 Sesión y middleware

La verificación de sesión ya existe:

- `requireAdmin(req, res, next)` en `server/server.js` protege todas las rutas `/api/admin/*`.
- Sin sesión, la API responde `401` y las páginas redirigen a `/admin`.
- `/admin` comprueba `isAuthed(req)` y, si no hay sesión, muestra el login sin cargar tickets ni productos.
- La cookie es `HttpOnly`, `SameSite=Strict` y `Secure` en producción.

Mejora opcional: aplicar un middleware también a la página `/admin` para que futuras páginas privadas no dependan de repetir la comprobación.

### 3.2 Navbar del admin y botones duplicados

- `views/admin.ejs` incluye el encabezado público completo, con Inicio, Productos, Agendar, Seguimiento y Ubicación.
- En escritorio conviven dos accesos al mismo destino: el ítem “Agendar reparación” y el botón “Agendar cita”.
- “Cómo llegar” del encabezado duplica el ítem “Ubicación”.

Propuesta: encabezado propio del admin con logo y “Cerrar sesión” en blanco/verde; quitar “Ver sitio” y los botones públicos; dejar una sola etiqueta para agendar.

### 3.3 Detalle del agendamiento

El campo “Cuéntanos qué pasó” ya está marcado como **opcional** y el servidor no lo exige.

Los campos de detalle de “Otro” ya son obligatorios (mínimo 3 caracteres) y tienen `maxlength="80"`. Mejora propuesta: mostrar un contador `0/80` y responder un error claro si se supera el límite, en lugar de recortar en silencio con `trim(valor, 80)`.

### 3.4 Privacidad de los tickets

`GET /seguimiento` ejecuta hoy:

```sql
SELECT codigo FROM repairs ORDER BY id DESC LIMIT 4
```

y publica esos códigos en la página. Si un cliente real agenda, su ticket aparece listado para cualquiera y al abrirlo se ven nombre, teléfono, equipo y problema.

Propuesta:

- Eliminar la consulta dinámica y las listas públicas.
- Dejar como máximo un ejemplo fijo (`CH-98234`) en el placeholder del buscador.
- Si se necesita modo demo, controlarlo con una variable de entorno.

Además, los códigos actuales son `CH-` + 5 dígitos (90.000 combinaciones). Para uso real conviene un código aleatorio más largo, por ejemplo `CH-7K2M9P`, y limitar los intentos de consulta.

### 3.5 Base de datos

- **SQLite** (`node:sqlite`) sigue siendo la opción correcta para este proyecto: sin instalación, portable y suficiente para una tienda local.
- **PostgreSQL** sería el siguiente paso si hay varias instancias, varios empleados escribiendo a la vez o reportes pesados.
- **MongoDB** no aplica: los datos son relacionales (productos, reparaciones e historial).
- **MySQL** sigue vigente en la industria; no está obsoleto.

---

## 4. Plan de lanzamiento público (propuesta no confirmada)

> **Aviso:** esta sección es una propuesta abierta, **sujeta a cambios y no confirmada**. No está aprobada, no tiene fecha comprometida y no modifica el alcance ni la entrega de la `v0.2.0`. Los costos son estimados y deben verificarse antes de decidir.

### Intención

Publicar el sitio en un dominio real para que clientes del local puedan:

- Encontrarlo en el navegador y en Google.
- Agendar reparaciones con datos reales.
- Consultar el estado de su ticket sin depender del administrador.

Esto convierte la demo académica en un sistema en producción, con obligaciones de seguridad, disponibilidad y protección de datos.

### Bloqueadores antes de abrir al público

| # | Bloqueador | Estado actual | Acción |
| --- | --- | --- | --- |
| 1 | Lista pública de tickets recientes | `/seguimiento` publica los 4 últimos códigos | Eliminar la consulta dinámica y la lista |
| 2 | Códigos de ticket adivinables | `CH-` + 5 dígitos | Códigos aleatorios más largos |
| 3 | Sin rate limiting | Login, agendamiento y seguimiento libres | Limitar por IP y por ruta |
| 4 | Sesiones en memoria | Se pierden al reiniciar | Guardar en SQLite |
| 5 | Sin CSRF explícito | Mitigado solo con `SameSite=Strict` | Token CSRF o validación de origen |
| 6 | Contraseña admin débil por defecto | `admin123` si falta `ADMIN_PASSWORD` | Contraseña fuerte obligatoria en producción |
| 7 | Sin base legal de datos | No hay política ni autorización | Política de privacidad y consentimiento (Ley 1581 de 2012) |
| 8 | Contactos y enlaces inactivos | `ENLACES_ACTIVOS` desactivado | Activar correo, Facebook, teléfono y WhatsApp reales |
| 9 | Datos y productos ficticios | 12 productos demo | Reemplazar por catálogo real o mantener aviso de demo |
| 10 | Sin respaldos | Solo el archivo local | Backup automático y copia externa |

### Fases propuestas

| Fase | Contenido | Duración estimada |
| --- | --- | --- |
| 0 | Confirmar alcance, dominio y hosting | 1–2 días |
| 1 | Bloqueadores 1–8 | 4–5 días |
| 2 | Infraestructura: Docker, volumen, HTTPS, dominio, `/healthz` | 2–3 días |
| 3 | Operación: backups, logs, monitor, SEO local | 2–3 días |
| 4 | Beta cerrada con 3–5 personas | 3–5 días |
| 5 | Apertura pública | — |

### Hosting: opciones y costos estimados

| Opción | Costo aproximado | Pros | Contras |
| --- | --- | --- | --- |
| **Railway** (recomendada) | ~US$5/mes | Deploy desde GitHub, volumen, HTTPS | Consumo medido |
| **Render** | ~US$7/mes + disco | Disco persistente, documentación clara | El plan gratuito no sirve (se duerme y no tiene disco) |
| **Fly.io** | ~US$3–5/mes | Volúmenes, red global | Más configuración |
| **VPS** (Hetzner/DigitalOcean) | ~US$5–6/mes | Control total, barato a largo plazo | Requiere administrar SO, Docker y backups |
| Túnel desde PC | $0 | Sirve para demostrar | **No sirve para clientes reales** |

**Recomendación:** Railway + volumen + Cloudflare (gratis) + dominio `.com.co`. Costo total estimado: **US$6–8 al mes** más el dominio (aprox. COP 50.000–100.000 al año). Verificar precios vigentes.

### ¿Se mantiene SQLite?

Sí, para una tienda local con pocas escrituras al día. SQLite es suficiente si hay:

- Un solo servidor.
- Volumen persistente.
- Respaldos automáticos.

Se migraría a PostgreSQL solo si hay varias instancias, varios empleados escribiendo a la vez o reportes pesados.

### Rendimiento

- `compression` ya está activo.
- Cloudflare delante para CDN, HTTPS y caché.
- Imágenes WebP con 400/800/1200 px y `srcset`.
- `Cache-Control` largo para assets estáticos.
- Hosting en US East: latencia aceptable desde Colombia.

### SEO y presencia local

- Dominio propio y `BASE_URL` configurado.
- Google Search Console.
- **Google Business Profile** para aparecer en Maps y búsquedas locales.
- Sitemap, `robots.txt` e imagen OG 1200×630.

### Idea pendiente: cifrado y borrado de datos

> **Estado:** idea sin diseñar, no planificada ni aprobada.

Se planteó cifrar los datos y borrarlos automáticamente después de ~48 horas. Antes de decidir hay que resolver varios puntos:

- **El borrado a 48 h choca con el seguimiento:** una reparación puede tardar días o semanas. Si se borra el ticket a las 48 h, el cliente pierde el seguimiento y el historial.
- **Alternativa sugerida:** conservar los datos mientras la reparación esté activa y anonimizar o borrar un tiempo después de la entrega (ej. 30–90 días), informándolo en la política.
- **Cifrado en tránsito:** HTTPS obligatorio.
- **Cifrado en reposo:** el disco o volumen del proveedor suele ofrecerlo; verificar si aplica.
- **Cifrado a nivel de campo:** nombre y teléfono cifrados con una clave en variable de entorno. Añade complejidad y afecta búsquedas; evaluar costo/beneficio.
- **Marco legal:** Ley 1581 de 2012 y Decreto 1377 de 2013 (Colombia): finalidad, autorización, conservación y canal de eliminación.

### Criterios para considerar el sitio listo para público

- [ ] Ningún ticket real visible para terceros.
- [ ] HTTPS y cookies `Secure`.
- [ ] Rate limiting activo.
- [ ] Respaldos probados (restaurar en un entorno de prueba).
- [ ] Política de privacidad y consentimiento publicados.
- [ ] Contactos reales activos.
- [ ] Monitor de disponibilidad y alertas.
- [ ] Beta cerrada sin incidentes.

---

## 5. Decisiones abiertas

- ¿Se publicará el sitio en un dominio real o seguirá siendo demo local?
- ¿Se confirma el plan de lanzamiento público descrito arriba?
- ¿Se mantiene SQLite o se migra a PostgreSQL si hay despliegue?
- ¿Se implementa autenticación multiusuario o se mantiene una sola contraseña?
- ¿Se añaden términos, privacidad y aviso de cookies?
- ¿Se integra un canal real de notificaciones (correo/WhatsApp) o se mantiene solo demostrativo?
- ¿Qué política de retención se adopta: borrado a 48 h, anonimización tras la entrega o conservación con plazo legal?
- ¿Se implementa cifrado a nivel de campo o solo HTTPS + cifrado en reposo del proveedor?

---

## 6. Historial del documento

| Fecha | Cambio |
| --- | --- |
| 5 de noviembre de 2026 | Creación con la auditoría interna, las recomendaciones externas y el plan de lanzamiento público. |
