# Cherry

Escritura científica con LaTeX en el navegador, compilación a PDF en la nube y un asistente de investigación basado en agentes que conoce el contexto de tu proyecto.

Cherry nació como un proyecto para explorar cómo se siente redactar un paper sin salir del navegador: un editor de LaTeX con preview, un compilador que corre en sandboxes aislados y un agente de IA que lee el proyecto para ayudarte a escribir. El backend es una API de NestJS con PostgreSQL; el frontend es una SPA construida con Next.js.

## Stack

### Frontend

| Tecnología | Rol |
|---|---|
| Next.js 16.2.2 (App Router) + React 19 | Aplicación y renderizado del lado del servidor |
| Tailwind CSS v4 | Estilos con un tema "obsidiana": modo claro/oscuro |
| Monaco Editor | Editor de LaTeX con `@monaco-editor/react` |
| pdfjs-dist / react-pdf | Renderizado de PDFs en el panel de preview |
| TanStack Query | Estado y caché de datos del servidor |
| Zustand | Estado de UI (pestañas, paneles) |
| shadcn/ui + radix-ui | Componentes accesibles |

### Backend

| Tecnología | Rol |
|---|---|
| NestJS 11 | API REST modular |
| TypeORM + PostgreSQL | Persistencia con `synchronize` habilitado |
| JWT (cookie de sesión) + bcrypt | Autenticación |
| class-validator / class-transformer | Validación de DTOs |
| @nestjs/throttler | Rate limiting global (10 requests/min) |

### IA y herramientas

| Tecnología | Rol |
|---|---|
| LangChain / LangGraph | Agente de investigación (`ReactAgent`) con herramientas |
| @langchain/openrouter | Modelo de lenguaje vía OpenRouter |
| langgraph-checkpoint-postgres | Persistencia del estado del agente por conversación |
| @daytona/sdk | Sandboxes aislados para compilar LaTeX a PDF |
| Resend | Envío de emails de verificación y reseteo de contraseña |

## Arquitectura

Monorepo con dos aplicaciones independientes: `frontend/` y `backend/`. No comparten código; se comunican por HTTP.

```
┌────────────────────┐       ┌─────────────────────┐      ┌─────────────┐
│   Next.js (Vercel) │  API  │ NestJS (backend)    │  SQL │ PostgreSQL  │
│  App Router / SPA  │ ─────►│ auth, projects,     │ ────►│  (TypeORM)  │
│                    │       │ latex, conversations│      └─────────────┘
└────────────────────┘       │        ai-agent     │
                             └─────────────────────┘
```

- **Autenticación**: el backend emite un JWT; el frontend lo guarda como cookie (`session_token`). Las páginas protegidas verifican la sesión en el servidor con `getUser()` y redirigen según corresponda. No hay middleware global: cada página/layout decide.
- **Chat**: el frontend no llama al agente directamente. `app/api/chat/route.ts` proxya el `POST /conversations/:id/messages` del backend, que hace streaming del agente de LangGraph al navegador. Así se evitan los límites de las Server Actions de Next.js.
- **Compilación**: `POST /projects/:id/pdf` ejecuta `latexmk` en un sandbox de Daytona y devuelve el PDF compilado desde el backend.
- **Agente**: persiste el historial por conversación en Postgres (`checkpointer`). Puede leer los documentos LaTeX del proyecto y responder preguntas sobre ellos.

## Estructura del repositorio

```
.
├── backend/                  # API NestJS
│   ├── src/
│   │   ├── auth/             # registro, login, verificación de email, reset de contraseña
│   │   ├── users/            # CRUD de usuarios
│   │   ├── projects/         # proyectos y templado de archivos LaTeX
│   │   ├── latex/            # documentos LaTeX por proyecto
│   │   ├── conversations/    # conversaciones y mensajes con el agente
│   │   ├── ai-agent/         # agente LangGraph + sandbox de Daytona
│   │   ├── email/            # envío de emails (Resend)
│   │   ├── config/           # configuración de TypeORM
│   │   └── database/         # seed del usuario demo
│   └── .env.example
└── frontend/                 # Next.js
    ├── app/
    │   ├── auth/             # login, registro, recuperación y verificación
    │   ├── dashboard/        # proyectos y workspace (editor + preview + chat)
    │   └── api/chat/         # proxy de streaming para el chat
    ├── components/           # UI reutilizable (auth, editor, documentos, dashboard)
    └── lib/                  # constantes, schemas (zod), store (zustand)
```

## Requisitos

- Node.js ≥ 20
- pnpm (el proyecto usa pnpm en ambos paquetes)
- PostgreSQL local o una instancia en la nube (Neon, etc.)

## Instalación y desarrollo

### 1. Backend

```bash
cd backend
cp .env.example .env    # completa DATABASE_*, JWT_SECRET, etc.
pnpm install
pnpm run start:dev      # API en http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
pnpm install
pnpm run dev                 # app en http://localhost:3001
```

El frontend no incluye un `.env.example`; crea `.env.local` con las variables de la tabla de abajo (mínimo `NEXT_PUBLIC_API_URL`).

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Obligatoria | Descripción |
|---|---|---|
| `PORT` | No | Puerto de escucha (por defecto `3000`) |
| `DATABASE_HOST` | Sí | Host de PostgreSQL |
| `DATABASE_PORT` | Sí | Puerto (por defecto `5432`) |
| `DATABASE_USER` | Sí | Usuario |
| `DATABASE_PASS` | Sí | Contraseña |
| `DATABASE_NAME` | Sí | Nombre de la base de datos |
| `DATABASE_URL` | No | Cadena de conexión alternativa (la usa el checkpointer del agente) |
| `JWT_SECRET` | Sí | Secreto para firmar los tokens de sesión |
| `RESEND_API_KEY` | No | API key de Resend para emails |
| `EMAIL_FROM` | No | Remitente de los emails |
| `GOOGLE_API_KEY` | No | Google AI (sin usar por ahora; la IA va por OpenRouter) |
| `OPENROUTER_API_KEY` | No | Modelo de lenguaje del agente |
| `DAYTONA_API_KEY` | No | Sandboxes para compilar LaTeX |
| `DAYTONA_API_URL` | No | URL de la API de Daytona |
| `FRONTEND_URL` | Sí | URL del frontend; usada para CORS y para los links de los emails |
| `DEMO_EMAIL` / `DEMO_PASSWORD` / `DEMO_NAME` | No | Credenciales del usuario demo (seed) |

### Frontend (`frontend/.env.local`)

| Variable | Obligatoria | Descripción |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Sí | URL de la API del backend |
| `NEXT_PUBLIC_DEMO_MODE` | No | `true` para mostrar la cuenta demo en el login |
| `NEXT_PUBLIC_DEMO_EMAIL` | No | Email de la cuenta demo (con `DEMO_MODE=true`) |
| `NEXT_PUBLIC_DEMO_PASSWORD` | No | Contraseña de la cuenta demo |

## Scripts

### Backend

| Script | Descripción |
|---|---|
| `pnpm start:dev` | Servidor con recarga en caliente |
| `pnpm build` | Compila a `dist/` con `nest build` |
| `pnpm start:prod` | Ejecuta el build (`node dist/main`) |
| `pnpm seed:demo` | Crea el usuario demo y datos de ejemplo (idempotente) |
| `pnpm lint` | ESLint con auto-fix |
| `pnpm test` | Tests unitarios (Jest) |

### Frontend

| Script | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Sirve el build de producción |
| `pnpm lint` | ESLint |

## Cuenta demo

El proyecto incluye un acceso de prueba pensado para la demo pública:

| | |
|---|---|
| Email | `demo@cherry.app` |
| Contraseña | `demo1234` |

1. Crea el usuario y sus datos de ejemplo (idempotente):

   ```bash
   cd backend
   pnpm run seed:demo
   ```

2. Activa el modo demo en el frontend (`NEXT_PUBLIC_DEMO_MODE=true`). El login mostrará una nota con las credenciales y un botón **"Rellenar"** que las autocompleta.

Las credenciales se controlan por variables de entorno (`DEMO_EMAIL`, `DEMO_PASSWORD` en el backend; `NEXT_PUBLIC_DEMO_EMAIL`, `NEXT_PUBLIC_DEMO_PASSWORD` en el frontend).