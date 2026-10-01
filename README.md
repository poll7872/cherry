# Cherry

Cherry es un espacio de trabajo web para escribir documentos científicos en LaTeX. Reúne los archivos del proyecto, un editor, una vista previa en PDF y un chat con un agente de IA que puede trabajar sobre esos archivos.

El agente, llamado Cherry, responde en el chat y puede listar, leer, crear y editar documentos LaTeX del proyecto. También puede compilar el proyecto a PDF. Los cambios en los documentos se guardan en la base de datos y se sincronizan con el entorno de compilación; el PDF generado queda disponible en la vista previa. La compilación también se puede iniciar desde el panel de vista previa.

Cherry usa un backend NestJS con PostgreSQL y un frontend Next.js. El frontend y el backend son aplicaciones separadas que se comunican por HTTP.

## Qué incluye

- **Proyectos y documentos:** crea proyectos con un `main.tex` inicial y administra sus archivos LaTeX.
- **Editor y vista previa:** edita documentos en Monaco y consulta el PDF compilado en el mismo espacio de trabajo.
- **Asistente de escritura:** conversa sobre el proyecto; el agente puede consultar y modificar sus documentos con herramientas específicas.
- **Compilación:** ejecuta `latexmk` en un sandbox de Daytona y devuelve el PDF.
- **Cuentas:** registro, inicio de sesión, verificación de correo, recuperación de contraseña y ajustes de perfil.

El agente está configurado para apoyar la escritura académica, con atención a la estructura y al formato LaTeX. El código de instrucciones propone una estructura habitual de paper e indica usar IEEE cuando corresponda. El resultado depende de la solicitud y del contenido del proyecto.

## Cómo se conectan las partes

```text
Navegador
  Next.js ── HTTP ──► API NestJS ──► PostgreSQL
                         │
                         ├── OpenRouter: respuestas del agente
                         └── Daytona: archivos de trabajo y compilación LaTeX
```

- El backend administra usuarios, proyectos, documentos y conversaciones.
- Los mensajes del agente se transmiten al navegador; el estado de cada conversación se conserva en PostgreSQL.
- El agente identifica el proyecto asociado a la conversación para limitar sus herramientas a los documentos de ese proyecto.
- La compilación usa el sandbox de Daytona. Los documentos también se guardan en PostgreSQL, que sirve como fuente principal para las operaciones de lectura y escritura del agente.
- El frontend protege las páginas según la sesión del usuario. El endpoint `frontend/app/api/chat/route.ts` actúa como proxy del chat hacia el backend.

## Estructura

```text
.
├── backend/
│   ├── src/
│   │   ├── auth/           # Registro, sesión y recuperación de cuenta
│   │   ├── projects/       # Proyectos y plantilla LaTeX inicial
│   │   ├── latex/          # Documentos por proyecto
│   │   ├── conversations/  # Conversaciones y mensajes
│   │   ├── ai-agent/       # Agente y operaciones con Daytona
│   │   ├── email/          # Envío de correos con Resend
│   │   └── database/       # Seed de la cuenta demo
│   └── .env.example
└── frontend/
    ├── app/                # Rutas de autenticación, dashboard y proxy del chat
    ├── components/         # Editor, chat, documentos y elementos de interfaz
    ├── actions/            # Operaciones del frontend contra la API
    └── lib/                # Tipos, validaciones y estado de interfaz
```

## Requisitos

- Node.js 20 o superior
- pnpm
- PostgreSQL
- Una clave de OpenRouter para iniciar el agente
- Credenciales de Daytona para usar el agente con documentos y compilar

Resend solo hace falta si se van a enviar correos de verificación o recuperación. Para desarrollo local, el backend permite CORS desde `http://localhost:3000` y `http://localhost:3001`.

## Desarrollo local

### Backend

```bash
cd backend
cp .env.example .env
```

Configura las variables necesarias descritas más abajo y luego ejecuta:

```bash
pnpm install
pnpm run start:dev
```

La API queda disponible en `http://localhost:3000`.

### Frontend

En otra terminal:

```bash
cd frontend
pnpm install
```

Crea `frontend/.env.local` con la URL del backend:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Inicia la aplicación:

```bash
pnpm run dev -- --port 3001
```

El frontend queda disponible en `http://localhost:3001`.

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Configuración |
|---|---|
| `PORT` | Puerto HTTP; por defecto `3000`. |
| `DATABASE_HOST` | Host de PostgreSQL. |
| `DATABASE_PORT` | Puerto de PostgreSQL; habitualmente `5432`. |
| `DATABASE_USER` | Usuario de PostgreSQL. |
| `DATABASE_PASS` | Contraseña de PostgreSQL. |
| `DATABASE_NAME` | Base de datos de la aplicación. |
| `DATABASE_URL` | Cadena de conexión PostgreSQL que usa el checkpointer de LangGraph. Requerida para iniciar el agente. |
| `JWT_SECRET` | Secreto con el que se firman los tokens de sesión. |
| `OPENROUTER_API_KEY` | Clave de OpenRouter para el modelo del agente. |
| `DAYTONA_API_KEY` | Clave para crear y usar sandboxes de compilación. |
| `DAYTONA_API_URL` | URL de la API de Daytona; el código usa `https://app.daytona.io/api` si se omite. |
| `FRONTEND_URL` | Origen del frontend permitido por CORS en producción y base de los enlaces enviados por correo. |
| `RESEND_API_KEY` | Clave de Resend para enviar correos. |
| `EMAIL_FROM` | Dirección remitente de los correos. |
| `DEMO_EMAIL` | Email de la cuenta creada por `seed:demo`; por defecto `demo@cherry.app`. |
| `DEMO_PASSWORD` | Contraseña de la cuenta demo; por defecto `demo1234`. |
| `DEMO_NAME` | Nombre de la cuenta demo; por defecto `Usuario Demo`. |

La conexión del backend a TypeORM se configura con `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASS` y `DATABASE_NAME`. Además, `DATABASE_URL` debe apuntar a una base accesible por el agente. `OPENROUTER_API_KEY` también es necesaria para que el agente responda. Las credenciales de Daytona se necesitan para las herramientas que leen y escriben en el sandbox y compilan documentos.

`GOOGLE_API_KEY` aparece en `.env.example`, pero el proveedor Google está comentado y el agente activo usa OpenRouter. No es necesaria para la configuración actual.

### Frontend (`frontend/.env.local`)

| Variable | Configuración |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base de la API; por ejemplo `http://localhost:3000`. |
| `NEXT_PUBLIC_DEMO_MODE` | Usa `true` para mostrar la opción de cuenta demo en el login. |
| `NEXT_PUBLIC_DEMO_EMAIL` | Email que se autocompleta en el modo demo. |
| `NEXT_PUBLIC_DEMO_PASSWORD` | Contraseña que se autocompleta en el modo demo. |

## Cuenta demo

El repositorio incluye un seed idempotente para crear la cuenta y sus datos de ejemplo. Los valores por defecto son:

| Campo | Valor por defecto |
|---|---|
| Email | `demo@cherry.app` |
| Contraseña | `demo1234` |

Con el backend configurado, ejecuta:

```bash
cd backend
pnpm run seed:demo
```

Para mostrar la opción demo en el login, configura `NEXT_PUBLIC_DEMO_MODE=true` y, si cambiaste las credenciales predeterminadas, define también `NEXT_PUBLIC_DEMO_EMAIL` y `NEXT_PUBLIC_DEMO_PASSWORD` en el frontend.

## Scripts disponibles

### Backend

| Comando | Acción |
|---|---|
| `pnpm run start:dev` | Inicia NestJS en modo desarrollo con recarga. |
| `pnpm run build` | Genera el build en `dist/`. |
| `pnpm run start:prod` | Ejecuta el build de producción. |
| `pnpm run seed:demo` | Crea la cuenta demo y sus datos de ejemplo. |
| `pnpm run lint` | Ejecuta ESLint con auto-fix. |
| `pnpm run test` | Ejecuta las pruebas unitarias con Jest. |

### Frontend

| Comando | Acción |
|---|---|
| `pnpm run dev` | Inicia Next.js en modo desarrollo. |
| `pnpm run build` | Genera el build de producción. |
| `pnpm run start` | Sirve el build de producción. |
| `pnpm run lint` | Ejecuta ESLint. |

## Tecnologías

| Área | Tecnologías principales |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Monaco Editor, TanStack Query, Zustand y react-pdf. |
| Backend | NestJS 11, TypeORM, PostgreSQL y JWT. |
| Agente | LangChain, LangGraph y OpenRouter. |
| Compilación | Daytona y `latexmk`. |
| Correo | Resend. |

## Documentación de la API

La referencia de endpoints está en [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md).
