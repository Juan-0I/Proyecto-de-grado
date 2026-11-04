# Plan y evidencias de prueba

**Fecha de ejecución:** 3 de noviembre de 2026  
**Entorno:** Windows 11, Node.js 26.13.0, Chrome headless (Playwright Core), servidor local en `http://localhost:3000`.

---

## 1. Cómo reproducir las pruebas

### 1.1 Preparación

```bash
npm install
npm run seed
npm start
```

En otra terminal:

```bash
npm run test:smoke
```

La prueba detecta Chrome o Edge automáticamente. Si el navegador está en una ruta distinta:

```powershell
$env:CHROME_PATH='C:\ruta\a\chrome.exe'
npm run test:smoke
```

### 1.2 Resultado esperado

```text
Resultado: 39 comprobaciones correctas, 0 fallos.
Prueba de humo superada.
```

---

## 2. Prueba de humo automatizada

**Archivo:** `tests/smoke.js`  
**Herramienta:** Playwright Core + Chrome headless  
**Resultado:** **39/39 comprobaciones correctas** (3 de noviembre de 2026).

| Bloque | Comprobaciones |
| --- | --- |
| Página de inicio | Respuesta 200, título, un solo H1, botón de menú móvil visible. |
| Responsive | Sin desborde horizontal a 320, 390, 768 y 1280 px. |
| Catálogo | 12 productos, filtro Audio = 3, estado vacío, texto exacto, limpieza de filtros. |
| Modal | Apertura, parámetro `producto` en URL, cierre con Escape, enlace directo, producto correcto. |
| Seguimiento | Ticket `CH-98234`, estado “En revisión”, historial, ticket inexistente. |
| Agendamiento | Preselección de servicio, contador de caracteres, fecha mínima. |
| Administración | Login, panel, 4+ reparaciones, pestaña Productos, 12+ productos, diálogos, búsqueda vacía. |
| Móvil e impresión | Apertura del menú, cierre por clic exterior, ocultamiento de encabezado/pie/buscador/aside, nota de impresión. |
| Consola | Sin errores de JavaScript. |

### Salida resumida

```text
Prueba de humo contra http://localhost:3000

1. Página de inicio
  OK   La página de inicio responde 200
  OK   El título de la página es correcto
  OK   Hay exactamente un H1
  OK   El botón del menú móvil está presente

2. Responsive sin desborde horizontal
  OK   Sin desborde horizontal a 320px
  OK   Sin desborde horizontal a 390px
  OK   Sin desborde horizontal a 768px
  OK   Sin desborde horizontal a 1280px

3. Catálogo, filtros y estado vacío
  OK   Se muestran 12 productos activos
  OK   El filtro Audio muestra 3 productos
  OK   Aparece el estado vacío al buscar sin resultados
  OK   El texto del estado vacío es el solicitado
  OK   Limpiar filtros restaura los 12 productos

4. Modal de producto y enlace directo
  OK   El modal de producto se abre
  OK   La URL incluye el parámetro producto
  OK   El modal se cierra con Escape
  OK   El enlace directo abre el modal
  OK   El modal muestra el producto correcto

5. Seguimiento de ticket
  OK   Se muestra el código del ticket
  OK   Se muestra el estado En revisión
  OK   Se muestra el historial de la reparación
  OK   Un ticket inexistente muestra el mensaje de error

6. Formulario de agendamiento
  OK   El servicio se preselecciona desde la URL
  OK   El contador de caracteres funciona
  OK   La fecha mínima está configurada

7. Panel administrativo
  OK   El formulario de acceso es visible
  OK   El panel se muestra tras iniciar sesión
  OK   Se listan al menos 4 reparaciones demo
  OK   La pestaña Productos se activa
  OK   Se listan al menos 12 productos en el panel
  OK   El diálogo de nuevo producto se abre
  OK   El diálogo de estado se abre
  OK   La búsqueda sin resultados muestra el estado vacío

8. Menú móvil e impresión
  OK   El menú móvil se abre
  OK   El menú móvil se cierra al hacer clic fuera
  OK   La impresión oculta encabezado y pie
  OK   La impresión oculta buscador y panel lateral
  OK   La impresión incluye la nota de demostración

9. Errores de consola
  OK   Sin errores de consola

Resultado: 39 comprobaciones correctas, 0 fallos.
Prueba de humo superada.
```

---

## 3. Pruebas de rutas y API

Ejecutadas con PowerShell e `Invoke-WebRequest` / `Invoke-RestMethod` contra el servidor local.

### 3.1 Rutas públicas

| Caso | Resultado esperado | Resultado obtenido |
| --- | --- | --- |
| `GET /` | 200 HTML | 200 |
| `GET /productos` | 200 HTML | 200 |
| `GET /productos?producto=smartwatch` | 200 HTML | 200 |
| `GET /agendar` | 200 HTML | 200 |
| `GET /seguimiento` | 200 HTML | 200 |
| `GET /seguimiento?codigo=CH-98234` | 200 HTML | 200 |
| `GET /seguimiento?codigo=CH-00000` | 200 con mensaje “no encontrado” | 200 |
| `GET /ubicacion` | 200 HTML | 200 |
| `GET /admin` | 200 HTML | 200 |
| `GET /no-existe` | 404 HTML | 404 (intencional) |
| `GET /api/products` | 200 JSON | 200, 12 productos |
| `GET /api/products/smartwatch` | 200 JSON | 200 |
| `GET /api/services` | 200 JSON | 200, 4 servicios |
| `GET /api/repairs/CH-98234` | 200 JSON | 200 |

### 3.2 Autenticación

| Caso | Resultado esperado | Resultado obtenido |
| --- | --- | --- |
| `GET /api/admin/repairs` sin sesión | 401 | 401 |
| `POST /admin/login` con contraseña incorrecta | 401 | 401 |
| `POST /admin/login` con `admin123` | 302/200 y sesión | 200, dashboard autenticado |
| `GET /admin` autenticado | Panel visible | “Sesión activa” presente |

### 3.3 Reparaciones

| Caso | Resultado esperado | Resultado obtenido |
| --- | --- | --- |
| `GET /api/admin/repairs` autenticado | Lista completa | 4 reparaciones |
| `PATCH /api/admin/repairs/CH-10001/estado` con `LISTO` | 200 y estado actualizado | 200, `LISTO` |
| `GET /api/repairs/CH-10001` tras el cambio | Estado e historial nuevos | `LISTO`, historial con 2 entradas |
| `POST /agendar` con datos válidos | Redirección con ticket nuevo | `CH-87359`, `nuevo=1` |
| `POST /agendar` con datos incompletos | 422 | 422 |
| `POST /api/repairs` con datos inválidos | 400 | 400 |
| `GET /api/repairs/CH-00000` | 404 | 404 |

> Los datos creados durante estas pruebas se eliminaron con `npm run seed` al finalizar.

### 3.4 Productos

| Caso | Resultado esperado | Resultado obtenido |
| --- | --- | --- |
| `POST /api/admin/products` | 201 y producto creado | 201, id 13 |
| `PUT /api/admin/products/13` | 200 y datos actualizados | 200, nombre y precio actualizados |
| `DELETE /api/admin/products/13` | 200 y borrado lógico | 200, “Producto desactivado” |
| `GET /api/products` tras desactivar | 12 activos | 12 |
| `GET /api/admin/products` tras desactivar | 13 totales (incluye inactivo) | 13 |

> Los datos de prueba se eliminaron con `npm run seed`; la entrega final parte de 12 productos activos.

---

## 4. Pruebas de interfaz y responsive

### 4.1 Matriz de anchos

Rutas verificadas: `/`, `/productos`, `/agendar`, `/seguimiento?codigo=CH-98234`, `/ubicacion`, `/admin`.

| Ancho | Desborde horizontal | Observaciones |
| --- | --- | --- |
| 320 px | No | Encabezado compacto, CTA principal como icono. |
| 360 px | No | Menú móvil y tarjetas en una columna. |
| 390 px | No | Flujo móvil estándar. |
| 768 px | No | Tarjetas en dos columnas. |
| 1024 px | No | Navegación de escritorio visible. |
| 1280 px | No | Catálogo en cuatro columnas. |
| 1440 px | No | Contenedor máximo centrado. |

La medición se hizo con `document.documentElement.scrollWidth <= clientWidth + 1` en cada ruta.

### 4.2 Catálogo

- 12 productos visibles al entrar.
- Filtro **Audio** → 3 productos y contador `3`.
- Búsqueda `zzzz` → estado vacío visible.
- Texto exacto: **“Ups! No hay más productos con esos filtros.”**
- Botón de limpieza → 12 productos y búsqueda vacía.
- Modal: abre, cambia la URL, cierra con Escape y restaura la URL.
- Enlace directo `?producto=smartwatch` → abre “Smartwatch Deportivo”.

### 4.3 Seguimiento

- `CH-98234` muestra el código, el estado “En revisión” y el historial.
- `CH-00000` muestra “No encontramos el ticket”.
- El botón de copiar usa el portapapeles y muestra un aviso.
- La impresión oculta navegación y paneles, y muestra un comprobante con nota demo.

### 4.4 Panel administrativo

- Login correcto e incorrecto.
- Pestañas Reparaciones/Productos con navegación por teclado (`←`, `→`, `Home`, `End`).
- Filtros de reparaciones y productos, incluidos sus estados vacíos.
- Diálogo de estado con código, equipo y nota.
- Diálogo de producto con vista previa de imagen.
- Diálogo de desactivación con confirmación.

### 4.5 Accesibilidad

| Aspecto | Resultado |
| --- | --- |
| Un solo H1 por página | Verificado en todas las rutas. |
| Campos con etiqueta o `aria-label` | Verificado; sin campos sin nombre. |
| Botones con nombre accesible | Verificado. |
| Imágenes con `alt` | Verificado. |
| Foco visible | `:focus-visible` con contorno verde. |
| Enlace “Saltar al contenido” | Presente y visible al enfocar. |
| Cierre de modales con Escape | Verificado. |
| Retorno de foco al cerrar el modal | Implementado en `productos.js`. |
| Menú móvil con `aria-expanded` | Verificado. |
| Movimiento reducido | Respetado con `prefers-reduced-motion`. |

---

## 5. Pruebas de impresión

En `/seguimiento?codigo=CH-98234`, con `emulateMedia({ media: 'print' })`:

| Elemento | Resultado |
| --- | --- |
| Encabezado | Oculto. |
| Pie de página | Oculto. |
| Buscador de tickets | Oculto. |
| Panel lateral de acciones | Oculto. |
| Detalle e historial | Visibles. |
| Nota de demostración | Visible solo en impresión. |

---

## 6. Pruebas de datos y consistencia

Después de `npm run seed`:

```text
[seed] Base de datos lista (reiniciada).
[seed] Productos: 12, servicios: 4, reparaciones: 4, historial: 10
```

| Verificación | Resultado |
| --- | --- |
| Productos públicos | 12 |
| Productos en admin | 12 |
| Servicios | 4 |
| Reparaciones | 4 |
| Tickets demo | `CH-98234`, `CH-10001`, `CH-10002`, `CH-10003` |
| Estados iniciales | En revisión, Recibido, En reparación, Listo |

---

## 7. Incidencias y notas

| Incidencia | Estado | Detalle |
| --- | --- | --- |
| Iconos Material Symbols mostraban el nombre en texto | Corregido | Se reemplazó el subconjunto por la fuente completa `wght,FILL@400,0..1`. |
| Desborde horizontal del encabezado en 320–360 px | Corregido | Logo y CTA compactos; `gap` reducido; botón de agendar solo con icono en móvil. |
| Fuente de iconos con peso 500 inexistente | Corregido | Se ajustó `.filled` a `wght 400`, que es el peso disponible. |
| `/no-existe` devuelve 404 y un error de consola de red | Esperado | Es la prueba intencional de la página 404. |
| El mapa depende de Google Maps | Aceptado | Requiere conexión a internet; no bloquea el resto del sitio. |

---

## 8. Criterios de aceptación

- [x] `npm start` inicia el sitio sin pasos adicionales.
- [x] `npm run seed` restaura los datos demo.
- [x] `npm run test:smoke` finaliza con 0 fallos.
- [x] Rutas públicas y API responden según lo esperado.
- [x] Flujo de agendamiento → ticket → seguimiento funciona.
- [x] Panel administrativo autenticado funciona.
- [x] CRUD de productos y borrado lógico funcionan.
- [x] Catálogo con filtros, búsqueda, estado vacío y modal funciona.
- [x] Responsive sin desborde de 320 a 1440 px.
- [x] Sin errores de JavaScript en las rutas revisadas.
