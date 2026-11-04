# Guion de demostración

**Duración estimada:** 8 a 10 minutos  
**Objetivo:** mostrar el flujo completo del MVP: sitio público → agendamiento → seguimiento → administración.

---

## Antes de empezar

1. Ejecutar desde la carpeta del proyecto:

   ```bash
   npm run seed
   npm start
   ```

2. Abrir dos pestañas:
   - Pestaña A: <http://localhost:3000>
   - Pestaña B: <http://localhost:3000/admin>
3. Confirmar que el servidor muestra en consola: `12 productos, 4 servicios, 4 reparaciones`.
4. Tener a mano la contraseña **`admin123`** y el ticket **`CH-98234`**.
5. Cerrar notificaciones o ventanas que puedan tapar el navegador.

> Si algo falla durante la demo, el servidor se puede reiniciar con `Ctrl + C`, `npm run seed` y `npm start`.

---

## 1. Inicio (1 minuto)

**En la pestaña A:**

1. Abrir `http://localhost:3000`.
2. Señalar el encabezado, el hero y la etiqueta “Reparación y tecnología en San Francisco de Sales”.
3. Bajar hasta “Productos destacados”.
4. Mostrar la franja de confianza, los servicios y la sección “Cómo funciona”.
5. Detenerse en “Sigue el rastro de tu equipo” y señalar los tickets de demostración.
6. Bajar hasta la FAQ, la garantía de 30 días y la ubicación con el mapa integrado.

**Mensaje sugerido:**

> “La página conserva la identidad visual del prototipo, pero ahora los productos, servicios y tickets vienen de una base de datos real.”

---

## 2. Catálogo con búsqueda y filtros (1.5 minutos)

1. Ir a **Productos** en el menú.
2. Mostrar que hay 12 productos y que cada tarjeta lleva la etiqueta **Demo**.
3. Hacer clic en la categoría **Audio**.
   - Resultado esperado: **3 productos** y el contador cambia a 3.
4. Escribir `zzzz` en el buscador.
   - Resultado esperado: aparece el estado vacío con el texto exacto:
     **“Ups! No hay más productos con esos filtros.”**
5. Hacer clic en **Ver todos los productos**.
   - Resultado esperado: vuelven los 12 productos y el buscador queda limpio.
6. Hacer clic en la **flecha** de la tarjeta **Smartwatch Deportivo** (o en cualquier parte de la tarjeta).
   - Resultado esperado: se abre un modal con imagen, categoría, descripción, precio, “Consultar disponibilidad” y aviso de producto demo.
   - Señalar que la URL cambia a `?producto=smartwatch`.
   - Aclarar que el número de stock es interno: el público solo ve “Consultar disponibilidad”.
7. Cerrar con `Escape` y comprobar que la URL vuelve a `/productos`.

**Mensaje sugerido:**

> “El detalle es un enlace directo: si comparto `?producto=smartwatch`, el modal se abre solo. No hay carrito porque el catálogo es de exhibición.”

---

## 3. Agendar una reparación (1.5 minutos)

1. Ir a **Agendar reparación**.
2. Mostrar que el formulario está dividido en tres pasos: datos, equipo y disponibilidad.
3. Completar en vivo:
   - Nombre: `Demo Cliente`
   - Teléfono: `3001234567`
   - Equipo: `Samsung Galaxy S21`
   - Servicio: `Pantallas`
   - Problema: `Pantalla rota`
   - Descripción: `Se cayó y el táctil no responde.`
4. Antes de enviar, mostrar las opciones **No estoy seguro / Necesito diagnóstico** y **Otro**.
   - Al elegir “Otro” aparece un campo de detalle obligatorio (mínimo 3 caracteres).
5. Enviar el formulario.
   - Resultado esperado: redirección a `/seguimiento` con un ticket nuevo `CH-xxxxx` y un modal “¡Ticket creado!”.
6. Señalar el número en grande y el botón **Copiar número de ticket**; cerrar con **Ver mi reparación**.
   - Al cerrar, la URL pierde `?nuevo=1` y el aviso queda visible en la página.

**Alternativa si no se quiere crear un ticket nuevo:**

- Abrir directamente `/agendar?servicio=Pantallas` y explicar la preselección del servicio desde la página de inicio.

**Mensaje sugerido:**

> “El servidor valida los datos otra vez. Si algo falta, responde 422 y conserva lo escrito; si todo está bien, genera un ticket único.”

---

## 4. Seguimiento del ticket (1.5 minutos)

1. Ir a **Estado del ticket**.
2. Escribir `CH-98234` y consultar.
3. Mostrar:
   - Estado **En revisión**.
   - Línea de tiempo con los pasos.
   - Progreso.
   - Detalles del servicio.
   - Historial con fechas y notas.
4. Hacer clic en **Imprimir comprobante** y mostrar la vista de impresión (o cancelar el diálogo).
   - Resultado esperado: desaparecen encabezado, pie, buscador y panel lateral; queda el comprobante con la nota de demostración.
5. Volver a la vista normal.

**Mensaje sugerido:**

> “El cliente puede consultar el avance sin llamar a la tienda.”

---

## 5. Panel administrativo (2 minutos)

**En la pestaña B:**

1. Abrir `http://localhost:3000/admin`.
2. Mostrar el login y la pista de contraseña demo.
3. Ingresar `admin123`.
4. En **Reparaciones**:
   - Mostrar las 4 reparaciones y las tarjetas de resumen.
   - Buscar `CH-98234`.
   - Hacer clic en **Actualizar estado**.
   - Cambiar a **Listo para entrega**.
   - Escribir la nota: `Prueba de demostración: equipo probado y listo.`
   - Guardar.
   - Resultado esperado: aviso de éxito y recarga con el nuevo estado.
5. Volver a la pestaña A y recargar `/seguimiento?codigo=CH-98234`.
   - Resultado esperado: el estado cambió a **Listo para entrega** y el historial incluye la nueva nota.
6. En la pestaña B, ir a **Productos**:
   - Mostrar los 12 productos.
   - Crear un producto de prueba con nombre `Producto Demo`, categoría `Accesorios`, precio `10000`, stock interno `1`.
   - Subir una imagen desde el PC (JPG/PNG/WebP, máximo 2 MB) y mostrar la vista previa.
   - Guardar y señalar que aparece en la lista.
   - Editarlo y cambiar el precio.
   - Desactivarlo con el icono de papelera y confirmar.
   - Resultado esperado: queda como **Inactivo** y no aparece en el catálogo público.
7. Cerrar sesión.

**Mensaje sugerido:**

> “El borrado es lógico: el producto no se elimina de la base, solo se oculta del catálogo. Así se conserva el historial.”

---

## 6. Responsive y accesibilidad (1 minuto)

1. Abrir las herramientas de desarrollo y activar el modo dispositivo (por ejemplo, 390 × 844).
2. Recargar el inicio.
3. Abrir el menú móvil con el botón de hamburguesa. Señalar que el botón verde de agendar ya no ocupa el encabezado móvil; la acción sigue dentro del menú.
4. Cerrar con `Escape` o haciendo clic fuera del menú.
5. Navegar con `Tab` y mostrar el foco visible en botones y enlaces.
6. Señalar que el modal se cierra con `Escape` y devuelve el foco a la tarjeta.

**Mensaje sugerido:**

> “El sitio se probó de 320 a 1440 px, sin desborde horizontal, y los componentes principales funcionan con teclado.”

---

## 7. Cierre (30 segundos)

1. Volver a la página de inicio.
2. Recordar que es un sitio de demostración.
3. Mencionar los pendientes antes de publicar:
   - Activar enlaces de teléfono, WhatsApp, Facebook y Google Maps.
   - Cambiar la contraseña del panel.
   - Redactar política de privacidad.
4. Agradecer y abrir espacio a preguntas.

---

## Frases de respaldo

- **Si preguntan por pagos:** “No hay carrito ni pasarela; el catálogo es de exhibición y la compra se concreta en la tienda.”
- **Si preguntan por la base de datos:** “Es SQLite nativo de Node, con cuatro tablas: productos, servicios, reparaciones e historial.”
- **Si preguntan por los enlaces externos:** “Están desactivados a propósito hasta la publicación; se activan con `ENLACES_ACTIVOS=true`.”
- **Si preguntan por producción:** “El MVP usa una sola contraseña y sesiones en memoria; para producción se requieren usuarios, HTTPS y persistencia.”

---

## Lista de verificación rápida

- [ ] Servidor activo y datos demo cargados.
- [ ] Pestaña pública y pestaña admin abiertas.
- [ ] Contraseña `admin123` disponible.
- [ ] Ticket `CH-98234` disponible.
- [ ] Navegador en zoom 100 %.
- [ ] Notificaciones silenciadas.
- [ ] Plan B: reiniciar con `npm run seed`.
