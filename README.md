# MERKAMAX Monorepo

Plataforma de supermercado, logistica y delivery con arquitectura de microservicios.

## Stack principal

- Monorepo: Turborepo + npm workspaces
- Frontend: Next.js 14 + Tailwind + Framer Motion (`apps/web`)
- Backend Node.js: Fastify + TypeScript strict + Zod + Prisma/Mongoose
- Mensajeria: Kafka (KRaft)
- Datos: PostgreSQL (pgvector), MongoDB, Redis, Elasticsearch

---

## 1) Requisitos locales

Instala estas herramientas:

- Node.js 20+
- npm 10+
- Docker Desktop
- Git

Verifica rapidamente:

```powershell
node -v
npm -v
docker --version
docker compose version
```

---

## 2) Clonar e instalar

```powershell
git clone https://github.com/Paula85Garcia/supermarket.git
cd supermarket
npm install
```

---

## 3) Levantar infraestructura con Docker

Esto inicia PostgreSQL (pgvector), Redis, Kafka, Elasticsearch, MongoDB y Kafka UI.

```powershell
docker compose up -d
docker compose ps
```

Kafka UI queda en:

- [http://localhost:8080](http://localhost:8080)

---

## 4) Variables de entorno (minimo para iniciar)

Cada servicio valida env al arrancar. Crea su `.env` en cada carpeta de servicio cuando quieras correrlo.

### Frontend web (`apps/web/.env.local`)

```env
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
NEXT_PUBLIC_USER_ROLE=admin
AUTH_SERVICE_URL=http://localhost:3001
```

Cloud name usado por el upload route:

- `dky2dscgr`
- La subida de imagenes se muestra solo si `NEXT_PUBLIC_USER_ROLE=admin`.
- Regla de domicilio: pedidos menores a `$20.000` tienen recargo de `$2.000`.
- Login/registro real del frontend usa `AUTH_SERVICE_URL` para conectar con `auth-service`.
- Logout disponible desde el header.
- Refresh token automatico activo en middleware y llamadas protegidas (`/api/auth/me`).

---

## 5) Iniciar dashboard web (lo que quieres ver ya)

Desde la raiz:

```powershell
npm run dev --workspace=@supermarket/web
```

Abre:

- [http://localhost:3000](http://localhost:3000)

Incluye:

- Sidebar glassmorphism
- Header con busqueda IA
- Hero MERKAMAX
- Grid de productos animado
- Boton reusable `AddToCartButton`
- Chat flotante de Max
- Subida de imagenes a Cloudinary

---

## 6) Comandos utiles de desarrollo

### Todo el monorepo

```powershell
npm run dev
npm run build
npm run lint
npm run test
```

### Solo web

```powershell
npm run dev --workspace=@supermarket/web
npm run build --workspace=@supermarket/web
```

---

## 7) Servicios implementados actualmente

- `auth-service`
- `catalog-service`
- `order-service`
- `payment-service`
- `fulfillment-service`
- `delivery-service`
- `notification-service`

Servicios pendientes base:

- `inventory-service` (Go/Fiber)
- `ai-agent-service` (Python/FastAPI)

---

## 8) Troubleshooting rapido

### Puerto ocupado

```powershell
netstat -ano | findstr :3000
```

Mata proceso:

```powershell
taskkill /PID <PID> /F
```

### Reset de contenedores

```powershell
docker compose down -v
docker compose up -d
```

### Error de dependencias

```powershell
npm cache verify
npm install
```

---

## 9) Siguiente paso recomendado

1. Ejecutar `apps/web` y validar UX responsive.
2. Conectar cards del dashboard con `catalog-service`.
3. Configurar `.env` de `auth-service` y `order-service` para flujo real de login + pedido.
