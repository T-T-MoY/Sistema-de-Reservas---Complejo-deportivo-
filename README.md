# 🏟️ Sistema de Reservas — Complejo Deportivo

Aplicación web para administrar un complejo deportivo: reserva de canchas, pagos con comprobante, eventos con inscripción de cupo limitado y reportes para administración.

## Índice

- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Cómo iniciar el proyecto](#cómo-iniciar-el-proyecto)
- [Usuarios de prueba](#usuarios-de-prueba)
- [Servicios implementados](#servicios-implementados)
- [Arquitectura y flujo de comunicación](#arquitectura-y-flujo-de-comunicación)
- [Comandos útiles](#comandos-útiles)
- [Notas y pendientes conocidos](#notas-y-pendientes-conocidos)

## Stack tecnológico

**Backend** (`backend/`)
- Node.js 20 + Express 4, en TypeScript
- PostgreSQL vía `pg` — SQL puro, sin ORM
- JWT (`jsonwebtoken`) + `bcrypt` para autenticación
- `multer` para subir fotos de perfil y comprobantes de pago
- `nodemailer` (Gmail SMTP) para el correo de recuperación de contraseña

**Frontend** (`frontend/`)
- React 18 + Vite + TypeScript
- React Router 7
- Axios como cliente HTTP
- Tailwind CSS
- `@nivo/heatmap` y `@nivo/pie` para las gráficas de reportes
- `jspdf`, `html2canvas` y `xlsx` para exportar reportes

**Infraestructura**
- PostgreSQL 15 (`postgres:15-alpine`) + pgAdmin 4
- Docker Compose orquesta los 4 servicios: base de datos, pgAdmin, backend y frontend

## Estructura del proyecto

```text
Sistema de Reservas Complejo deportivo/
├── compose.yaml
├── database/
│   ├── 01_schema.sql        # Tablas, relaciones y restricciones
│   └── 02_inserts.sql       # Datos de prueba (seeders)
├── backend/
│   ├── .env
│   ├── Dockerfile
│   ├── uploads/
│   │   ├── perfiles/        # Fotos de perfil
│   │   └── comprobantes/    # Comprobantes de pago
│   └── src/
│       ├── server.ts        # Punto de entrada
│       ├── app.ts           # Configuración de Express y rutas
│       ├── config/          # Conexión a PostgreSQL
│       ├── controllers/     # req/res de cada endpoint
│       ├── services/        # Lógica de negocio (canchas, reservas)
│       ├── models/          # Consultas SQL
│       ├── routes/          # Endpoints de la API
│       ├── middlewares/     # Verificación de JWT y de rol
│       ├── types/ utils/    # Interfaces y validaciones
│       └── documents/       # Peticiones de prueba (REST Client)
└── frontend/
    ├── Dockerfile
    ├── vite.config.ts
    └── src/
        ├── App.tsx / main.tsx   # Rutas y entrada
        ├── context/             # AuthContext (sesión), ThemeContext
        ├── services/api.ts      # Cliente Axios con interceptores
        ├── components/          # canchas/ reservas/ pagos/ eventos/
        │                        # usuarios/ reportes/ layout/ landing/
        └── pages/               # Login, Dashboard, Reportes, etc.
```

Cada módulo del backend sigue el mismo patrón: `routes → controllers → (services) → models`. Solo **canchas** y **reservas** tienen una capa `services` explícita; el resto llama al modelo directamente desde el controlador.

## Cómo iniciar el proyecto

### Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 20+ |
| Docker Desktop | última estable |
| Git | cualquiera |

### Opción A — Todo con Docker

```bash
git clone https://github.com/Roberto-Carlos01/Sistema-de-Reservas---Complejo-deportivo-.git
cd Sistema-de-Reservas---Complejo-deportivo-
docker compose up -d --build
```

Levanta los 4 contenedores. La base de datos se siembra sola con `database/01_schema.sql` y `02_inserts.sql`, pero **solo la primera vez** que se crea el volumen (`docker compose down -v` para reiniciarla desde cero).

### Opción B — Modo desarrollo (recomendado para programar)

```bash
# 1. Solo la base de datos
docker compose up -d db

# 1.1. Solo la base de datos y pgadmin(version web)
docker compose up -d db pgadmin

# 2. Backend (nueva terminal)
cd backend
npm install
npm run dev

# 3. Frontend (otra terminal)
cd frontend
npm install
npm run dev
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:4000 |
| Health check | http://localhost:4000/api/health |
| pgAdmin | http://localhost:5050 |

`backend/.env` este archivo telo tienes que generar (solo la base de datos esta ahi porque es un ejemplo)

```env
PORT=4000

DB_USER=limber
DB_PASSWORD=123456
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bdcomplejodeportivo

JWT_SECRET=<definir un secreto propio>

EMAIL_USER=<correo Gmail remitente>
EMAIL_PASS=<contraseña de aplicación de Gmail>
FRONTEND_URL=http://localhost:5173
```

## 🔑 Usuarios de prueba

| Email                           | Contraseña | Rol           |
| ------------------------------- | ---------- | ------------- |
| `carla.mamani@canchasbo.com`    | `Passw123` | Administrador |
| `jorge.fernandez@canchasbo.com` | `Passw123` | Administrador |
| `ana.torrez@canchasbo.com`      | `Passw123` | Empleado      |
| `maria.lopez@gmail.com`         | `Passw123` | Cliente       |

## Servicios implementados

**Autenticación** (`/api/auth`) — Registro público de clientes, login con JWT (expira a los 15 min) y recuperación de contraseña por correo con token temporal.

**Usuarios** (`/api/usuarios`) — Perfil propio (ver/editar, con foto) y, desde el panel de administración, listado, creación, edición, cambio de estado (activo/inactivo) y eliminación de usuarios con rol Cliente, Empleado o Admin.

**Canchas** (`/api/canchas`) — CRUD de canchas (crear/editar/eliminar restringido a administradores) y consulta de reservas por cancha para calcular disponibilidad.

**Reservas** (`/api/reservas`) — Creación validando que el horario no se solape con otra reserva. Las reservas en línea quedan `pendiente`; las presenciales (cargadas por un empleado) quedan `confirmada`. El cliente solo puede cancelar con más de 24 horas de anticipación; solo un administrador puede modificar fecha, hora o cancha de una reserva existente.

**Pagos** (`/api/pagos`) — Métodos: presencial, tarjeta de débito, tarjeta de crédito y QR. El monto es precio por hora × horas reservadas. Los métodos virtuales exigen comprobante (imagen o PDF, máx. 5 MB) y quedan `pendiente_verificacion` hasta que un empleado o admin lo aprueba o rechaza. Incluye historial y reintento tras un rechazo.

**Eventos** (`/api/eventos`) — Administradores y empleados crean, editan, reprograman y cancelan eventos (con cancha y servicios contratados). Los clientes se inscriben respetando el cupo máximo; la inscripción y su cancelación usan transacciones SQL para mantener el cupo consistente.

**Reportes** (`/api/reportes`, solo administradores) — Pagos por estado y por método, mapa de calor de ocupación, total de reservas, horas ocupadas, horarios de mayor demanda, rentabilidad de servicios contratados en eventos y comportamiento de usuarios.

## Arquitectura y flujo de comunicación

```text
Navegador
   │  http://localhost:5173
   ▼
Frontend (React + Vite)
   │  Axios → /api/...   (header Authorization: Bearer <token>)
   ▼
Backend (Express :4000)
   routes → controllers → services → models
   │  pool.query(...)
   ▼
PostgreSQL (Docker :5432)
```

La sesión se guarda como JWT en `localStorage`. El frontend cierra sesión automáticamente a los 15 minutos de inactividad, y también ante cualquier respuesta `401`/`403` del backend.

## Comandos útiles

```bash
# Logs de la base de datos
docker logs postgres-db-complejo-deportivo

# Reiniciar todo
docker compose down
docker compose up -d

# Reconstruir el backend tras cambiar dependencias
docker compose up -d --build backend
```

## Notas y pendientes conocidos

- **Permisos en `/api/usuarios`:** listar, crear, editar, cambiar estado y eliminar usuarios solo exigen un token válido; falta el middleware `esAdmin` para restringirlos a administradores.
- **`modo_demo` en pagos:** `POST /api/pagos/procesar` acepta un flag `modo_demo` que marca el pago como `pagado` sin comprobante. Solo se desactiva si `NODE_ENV=production`, variable que hoy no está definida ni en `compose.yaml` ni en ningún `.env`.
- **Extras de reserva** (balón, arbitraje, iluminación) se guardan solo en el `localStorage` del navegador; las tablas `utilidad` y `reserva_utilidad` existen en el esquema pero el backend todavía no las usa.
- **Secretos versionados:** `backend/.env` y `credenciales.txt` incluyen credenciales reales, entre ellas una contraseña de aplicación de Gmail. Si el repositorio es público, conviene rotarlas y dejar solo un `.env.example` con valores ficticios.
- `manual_inicio.md` describe una versión anterior del proyecto (Postgres 16, credenciales `admin/admin1234`, carpeta `frontend/src/iteraciones/`) que ya no coincide con el código actual.