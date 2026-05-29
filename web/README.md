# Web — Mueblería

Frontend React (Vite). Una sola app, sin selector multi-app.

## Desarrollo

Terminal 1 — API:

```bash
cd ../backend && npm run dev
```

Terminal 2 — Web:

```bash
npm install
npm run dev
```

Abre **http://localhost:5174/muebleria/** (rutas con prefijo `/muebleria`).

En `src/api/axios.js` define el backend con `API_ENV`:

| Valor | Backend |
|-------|---------|
| `local` | `localhost:3007` (en dev usa proxy Vite) |
| `server` | `http://192.168.110.199:3007` |
| `production` | `https://aplicaciones.marianosamaniego.edu.ec` |

Si `npm run dev` falla con *Bus error*, borra caché e reinstala:

```bash
rm -rf node_modules node_modules/.vite vite.config.js.timestamp-*.mjs package-lock.json
npm install
npm run dev
```

Usuario inicial: `administrador` / `12345678`

## Estructura

```
src/
├── api/          axios + requests
├── context/      Auth + rutas protegidas
├── pages/        Login, Home
├── App.jsx
└── main.jsx
public/
```
