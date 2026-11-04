# Cronograma de cierre — v0.2.0

**Proyecto:** Cellphone Hospital MVP
**Fecha de entrega:** domingo 8 de noviembre de 2026
**Punto de partida:** `v0.1.0-mvp` (39/39 pruebas, árbol limpio)

---

## Alcance de la v0.2.0

### Feedback del cliente (obligatorio)

| Fase | Cambio | Estado |
| --- | --- | --- |
| A | Flecha del catálogo y toda la tarjeta abren el detalle del producto | Cumplido |
| B | “Otro” + “No estoy seguro / Necesito diagnóstico” en servicio y problema, con detalle obligatorio | Cumplido |
| C | Modal de confirmación al crear el ticket, con número y botón de copiar | Cumplido |
| D | Stock solo interno; en público “Consultar disponibilidad” | Cumplido |
| E | Subida de imagen desde el PC en el panel admin (2 MB, JPG/PNG/WebP, ideal 1600×1200) | Cumplido |
| F | Quitar el botón-icono de agendar del encabezado en móvil | Cumplido |

### Mejoras incluidas (top 3)

| # | Mejora | Estado |
| --- | --- | --- |
| 1 | URLs absolutas para compartir (OG, canonical, JSON-LD) con `BASE_URL` | Cumplido |
| 2 | `robots.txt` y `sitemap.xml` dinámicos | Cumplido |
| 3 | Compresión HTTP y cache busting de CSS/JS | Cumplido |

---

## Itinerario

> El desarrollo se adelantó el miércoles 4 para dejar el sábado solo para calidad y el domingo para la entrega.

### Miércoles 4 — Cambios rápidos

- [x] Crear `docs/cronograma.md`.
- [x] Fase A: tarjeta de producto con un solo enlace estirado; flecha clicable.
- [x] Fase F: ocultar el CTA de agendar en móvil.
- [x] Fase D: “Consultar disponibilidad” y stock fuera del navegador.
- [x] Commit y verificación visual.

### Jueves 5 — Formulario y confirmación

- [x] Fase B: opciones especiales, campo condicional y validación en servidor.
- [x] Fase C: diálogo de ticket creado con copia y limpieza de `?nuevo=1`.
- [x] Pruebas de validación 422 y conservación de datos.
- [x] Commit.

### Viernes 6 — Subida de imagen

- [x] Fase E: `multer` + `image-size`, endpoint autenticado.
- [x] Validación por contenido real, peso y dimensiones.
- [x] Vista previa y estados de carga en el panel.
- [x] `.gitignore`, documentación y commit.

### Sábado 7 — Calidad y cierre

- [x] Top 3: OG/canonical, robots/sitemap, compresión y cache busting.
- [x] Actualizar `tests/smoke.js` y documentación.
- [x] `npm run seed`, prueba de humo, responsive 320–1440 px.
- [x] Tag `v0.2.0`.

### Domingo 8 — Entrega

- [ ] Arranque limpio con `npm start`.
- [ ] Ensayo del guion de 8–10 minutos.
- [ ] Checklist de entrega y presentación.

---

## Regla de prioridad

1. **Obligatorio:** fases A, B, C, D, F, pruebas y documentación.
2. **Deseable:** fase E (subida de imagen).
3. **Opcional:** top 3.

**Congelar código el sábado a las 8:00 p. m.** El domingo solo se ensaya y se entrega.

---

## Criterios de aceptación

- [x] La flecha de cada producto abre el modal y funciona con teclado.
- [x] “Otro” exige detalle y “No estoy seguro” no lo exige.
- [x] Al crear un ticket aparece un modal con el número y se puede copiar.
- [x] El catálogo público no muestra cantidades ni envía `stock` al navegador.
- [x] El admin sube imágenes de hasta 2 MB y rechaza archivos inválidos.
- [x] En móvil no aparece el botón-icono de agendar en el encabezado.
- [x] `npm run test:smoke` termina con 0 fallos.
- [x] Documentación actualizada y tag `v0.2.0`.
