# Mueblería

Sistema SoftEd con arquitectura alineada a **alumni**, **eddeli** y **tienda**.

| Carpeta | Rol |
|---------|-----|
| `backend/` | API Node: usuarios, roles, cuentas, notificaciones, logs, comandos |
| `web/` | Frontend React (Vite) — `src/` + `public/` |
| `appMovil/` | App móvil (pendiente) |
| `appDesckopt/` | App escritorio (pendiente) |

Documentación de la plantilla común: [PLANTILLA_BASE.md](./PLANTILLA_BASE.md).

## Inicio

```sql
CREATE DATABASE muebleria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
cd backend && npm install && npm run dev
cd web && npm install && npm run dev
```

Credencial inicial: usuario `administrador` (ver `backend/src/database/backup.json`).
