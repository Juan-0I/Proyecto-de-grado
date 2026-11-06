# v0.2.1 — Parche de documentación

Versión de mantenimiento del MVP web de **Cellphone Hospital** (San Francisco de Sales, Cundinamarca). **No cambia el código de la aplicación**: no toca `server/`, `views/` ni `public/`.

> **Demostración académica:** productos, precios, servicios, tickets y datos de contacto son ficticios. No hay carrito, pagos, reservas ni envío de correos reales.

## Qué cambió

- **README:** nueva sección **“Solución de problemas en Windows (npm)”** con el error de `npm.ps1`, la solución con `RemoteSigned`, la alternativa `npm.cmd` y una tabla de errores frecuentes.
- **README:** aviso **“Importante en Windows”** al inicio del punto 2 (Puesta en marcha), antes de los comandos.
- **docs/ENTREGA.md:** el mismo aviso en el punto 9 (Cómo ejecutar y verificar).
- **Versión:** `0.2.0` → `0.2.1` en `package.json`, `package-lock.json`, `README.md` y `docs/ENTREGA.md`.

## Por qué es un parche

El fallo que motivó este cambio **no estaba en el proyecto**: era la política de ejecución de PowerShell en un equipo Windows, que bloquea los scripts `.ps1` (incluido `npm.ps1`). Node.js y npm estaban correctamente instalados.

Como solo se agregó documentación, no hay cambios de comportamiento ni correcciones de código. La aplicación es funcionalmente idéntica a la `v0.2.0`.

## Verificación

- Sin cambios en `server/`, `views/` ni `public/`.
- `npm start` funciona igual que en la `v0.2.0`.
- `npm run test:smoke`: **60/60 comprobaciones correctas** (misma suite que la `v0.2.0`).
- `package-lock.json` solo cambió la versión del proyecto; las dependencias quedaron intactas (`forwarded` sigue en `0.2.0`).

## Cómo ejecutar

```bash
npm install
npm run seed
npm start
```

Abrir <http://localhost:3000>. Requiere **Node.js 24 o superior** (usa `node:sqlite`).

Panel administrativo: <http://localhost:3000/admin>  
Contraseña de demostración: `admin123` (cambiar con `ADMIN_PASSWORD`).

### Si `npm start` falla en Windows

```text
npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

Es la política de PowerShell, no el proyecto. Solución:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

O usar `npm.cmd start`. Ver el README para el detalle.

## Próximos pasos

Las propuestas para futuras versiones están en **[docs/ROADMAP.md](https://github.com/Juan-0I/Proyecto-de-grado/blob/master/docs/ROADMAP.md)** y en los issues del repositorio. No forman parte de esta entrega y están sujetas a cambios.

El siguiente parche (`v0.2.2` o superior) debería corregir la lista pública de tickets en `/seguimiento` (issue #1), que sí es un cambio de código.
