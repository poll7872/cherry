# Cherry

Plataforma de escritura científica con edición LaTeX, compilación a PDF en la nube y un asistente de investigación basado en IA.

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend:** NestJS 11, TypeORM, PostgreSQL
- **Infra:** sandboxes Daytona para compilar LaTeX, LangGraph/LangChain para el agente

## Estructura

```
frontend/   App de Next.js
backend/    API de NestJS
```

## Desarrollo

```bash
# Backend
cd backend
cp .env.example .env   # configura DATABASE_*, JWT_SECRET, etc.
npm install
npm run start:dev

# Frontend (otra terminal)
cd frontend
cp .env.example .env.local   # apunta NEXT_PUBLIC_API_URL al backend
npm install
npm run dev
```

## Cuenta demo

El proyecto incluye un acceso de prueba pensado para la demo pública (portafolio):

| | |
|---|---|
| Email | `demo@cherry.app` |
| Contraseña | `demo1234` |

1. Crea el usuario y sus datos de ejemplo (idempotente):

   ```bash
   cd backend
   npm run seed:demo
   ```

2. Activa el modo demo en el frontend (`NEXT_PUBLIC_DEMO_MODE=true`) para mostrar el botón **"Explorar la demo"** y la nota con credenciales en el login.

Las credenciales se controlan por variables de entorno (`DEMO_EMAIL`, `DEMO_PASSWORD` en el backend; `NEXT_PUBLIC_DEMO_EMAIL`, `NEXT_PUBLIC_DEMO_PASSWORD` en el frontend).
