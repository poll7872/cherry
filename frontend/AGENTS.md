<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This repository uses Next.js 16.2.2, which includes breaking changes and APIs that may differ from older versions. Before changing Next.js behavior, routing, caching, or server APIs, read the relevant guide in `node_modules/next/dist/docs/`. Follow the current documentation and heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Frontend agent guidelines

## Project overview

- Package manager: **pnpm**. Use pnpm for install and scripts; do not use npm or yarn.
- Framework: Next.js 16.2.2 App Router with React 19.2.4.
- Language: TypeScript with strict mode enabled.
- Styling: Tailwind CSS v4, with shared UI primitives in `components/ui/`.
- Internal import alias: `@/*` maps to the `frontend/` directory.
- This app is the Cherry interface for projects, LaTeX documents, conversations, and PDF preview. The NestJS API is a separate application.

## Commands

Run commands from `frontend/`:

| Command | Description |
|---|---|
| `pnpm install` | Install dependencies from the pnpm lockfile. |
| `pnpm run dev -- --port 3001` | Start the local development server on port 3001. |
| `pnpm run build` | Build the production app. |
| `pnpm run start` | Serve the production build. |
| `pnpm run lint` | Run ESLint. |

There is no frontend test script or test framework configured in this package. Do not substitute npm commands for pnpm commands.

## Existing app structure

- `app/`: routes and layouts. Keep route-specific components close to their route where appropriate.
- `app/api/chat/route.ts`: server route that proxies the authenticated, streamed chat request to the backend.
- `proxy.ts`: protects `/dashboard/:path*` by checking the session cookie. Read the Next.js 16 proxy documentation before changing it.
- `actions/`: server actions and API operations for auth, projects, documents, conversations, profile, settings, and compilation.
- `components/`: reusable UI, including auth forms, dashboard controls, LaTeX editor, PDF viewer, and dialogs.
- `hooks/`: TanStack Query hooks for workspace data.
- `lib/`: API constants, schemas, types, utilities, and Zustand stores.

The backend URL is read from `NEXT_PUBLIC_API_URL` in `lib/constants.ts` and falls back to `http://localhost:3000`. Demo login behavior is controlled by `NEXT_PUBLIC_DEMO_MODE`, `NEXT_PUBLIC_DEMO_EMAIL`, and `NEXT_PUBLIC_DEMO_PASSWORD`.

## Implementation conventions

### Next.js and React

- Use App Router conventions and prefer Server Components by default.
- Add `'use client'` only where browser interaction, React hooks, client-side state, or browser-only libraries require it.
- Keep secrets and authenticated backend calls on the server. `NEXT_PUBLIC_*` values are exposed to the browser; never put private credentials in them.
- Preserve the current cookie-based session flow. The chat route reads `session_token` server-side and forwards its bearer token to the backend.
- For browser-only libraries such as the PDF viewer, follow the existing client-side/dynamic import pattern to avoid server rendering issues.
- Read the installed Next.js documentation before introducing or changing framework APIs. Do not assume behavior from older Next.js versions.

### Data and state

- Use the existing `actions/` functions for API operations and `hooks/use-workspace-queries.ts` for workspace queries and mutations. Avoid adding a second data-fetching pattern without a clear need.
- TanStack Query owns server data and cache invalidation. Zustand stores local workspace and UI state; do not duplicate server records in a store unnecessarily.
- Validate user input with the existing Zod schemas in `lib/schemas.ts` where applicable.
- Preserve the streamed response behavior in `app/api/chat/route.ts`; the chat UI consumes incremental assistant text.

### TypeScript and components

- Keep strict typing; avoid `any` and unnecessary type assertions.
- Use `@/` for internal imports and avoid unused imports.
- Use PascalCase for React component names, camelCase for variables and functions, and descriptive kebab-case for utility filenames.
- Prefer existing shared components and patterns over introducing duplicate UI primitives.
- Keep components focused and preserve accessible labels, keyboard behavior, semantic elements, and useful loading/error states.

### Styling

- Use Tailwind utility classes and the project's existing CSS variables and theme conventions.
- Keep layouts responsive and support both light and dark themes where the surrounding UI does.
- Use the existing `cn` helper from `lib/utils.ts` when composing conditional class names.

### Errors and external links

- Show clear, user-facing errors for failed operations and handle loading states in the relevant UI.
- Avoid debug logging in production paths. Do not log tokens, passwords, or other credentials.
- External links opened in a new tab must include `rel="noopener noreferrer"`.

## Linting

ESLint uses the Next.js Core Web Vitals and TypeScript configurations. Run `pnpm run lint` from `frontend/` when lint verification is requested or needed for the change.
