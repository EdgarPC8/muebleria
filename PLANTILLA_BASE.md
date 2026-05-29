# Plantilla base SoftEd (alumni · eddeli · tienda → muebleria)

Los tres sistemas comparten el mismo **núcleo de plataforma**. Cada proyecto añade módulos de negocio encima.

## Módulos comunes

| Módulo | Backend | Web (React) |
|--------|---------|-------------|
| **Usuarios** | `Users`, `UserData`, `UserController`, `/users` | `UserForm`, tablas usuarios, `userRequest` |
| **Roles** | `Roles`, permisos por rol en sesión | `Roles.jsx`, `SelectDataRoles` |
| **Cuentas** | `Account`, `AccountRoles`, `/account` | `AccountForm`, `accountRequest` |
| **Auth** | JWT, login, sesión | `Login.jsx`, `authRequest`, `AuthProvider` |
| **Notificaciones** | `Notifications` + Socket.IO | `Notifications.jsx`, `notificationSocket` |
| **Logs** | `Logs` + `loggerMiddleware` (auto) + `GET /comands/getLogs` | `LogsForm`, página logs (enfermería/eddeli) |
| **Comandos** | backup, reload BD, upload backup | `Comandos.jsx`, `comandsRequest` |
| **Imágenes** | `ImgRoutes`, fotos en `src/img` | subida de fotos de perfil |

## Estructura de proyecto

```
muebleria/
├── backend/          ← API Node (Express + Sequelize + Socket.IO)
│   ├── index.js
│   ├── package.json
│   └── src/
│       ├── controllers/   # Auth, User, Account, Notifications, Comands, Img
│       ├── database/      # connection, backup.json, insertData
│       ├── middlewares/   # auth, logger, img
│       ├── models/        # Users, Roles, Account, Notifications, Logs
│       ├── routes/
│       ├── sockets/
│       └── img/
├── web/              ← Frontend (equivale a softed/frontend, carpeta renombrada)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── appConfig.js
│   ├── public/       # favicon, logos estáticos
│   └── src/          # App, Components, api, page, context…
├── appMovil/         # (futuro)
└── appDesckopt/     # (futuro)
```

En **alumni** y **tienda** el build de Vite se despliega en la raíz del repo (`index.html` + `assets/`). En **muebleria** el código fuente vive en `web/` y el build puede ir a `web/dist` o copiarse a la raíz al desplegar.

## Referencia por sistema

| | alumni / eddeli | tienda | muebleria |
|---|-----------------|--------|-----------|
| API prefix | `alumniapi` / `eddeliapi` | `tiendaapi` | `muebleriaapi` |
| Puerto típico | 3001 | 3006 | **3007** |
| BD MySQL | propia | `tienda` | `muebleria` |
| Frontend fuente | `softed/frontend` (VITE_ACTIVE_APP) | idem | **`muebleria/web`** |
| Módulos extra | inventario, alumni, quiz… | catálogo, pedidos, caja… | *(por definir)* |

**Tienda** es la plantilla backend más limpia (solo base + dominio tienda). **Muebleria** se generó copiando esa base **sin** el dominio `Tienda.js`.

## API muebleria (base)

- `POST /muebleriaapi/login`
- `GET /muebleriaapi/getSession`
- `GET /muebleriaapi/users` …
- `GET /muebleriaapi/comands/getLogs`
- `GET /muebleriaapi/comands/saveBackup` | `reloadBD` | `downloadBackup`

Usuario inicial en `backup.json`: **administrador** / contraseña hash de `12345678` (mismo seed que tienda).

## Web: qué reutilizar de softed/frontend

Copiar o enlazar desde `softed/frontend/src` hacia `muebleria/web/src`:

- `api/axios.js`, `authRequest.js`, `accountRequest.js`, `userRequest.js`, `notificationsRequest.js`, `comandsRequest.js`
- `context/AuthProvider.jsx`
- `page/Login.jsx`, `ControlPanel.jsx`, `Notifications.jsx`, `Comandos.jsx`
- `Components/NavBar`, `Roles.jsx`, formularios de usuario/cuenta/logs

En `web/src/api/axios.js`: prefijo `muebleriaapi`. En `vite.config.js`: proxy `/muebleriaapi` → `http://localhost:3007`.

## Arranque rápido

```bash
# MySQL
CREATE DATABASE muebleria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

cd muebleria/backend && npm install && npm run dev
cd muebleria/web && npm install && npm run dev
```
