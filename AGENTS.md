<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Guidelines for This Repository

## Project Overview

- **Framework**: Next.js 16.2.2 with React 19.2.4
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS v4
- **Path Alias**: `@/*` maps to project root

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

**No test framework is currently configured.** If adding tests, use Vitest or Jest.

## Code Style Guidelines

### File Organization
- Use the Next.js App Router (`app/` directory)
- Server Components by default; use `'use client'` only when needed
- Place shared components in `components/` (create if needed)
- Place utilities in `lib/` or `utils/` (create if needed)
- Route handlers in `app/api/` (create if needed)

### Imports
- Use path alias `@/` for internal imports: `import Button from '@/components/Button'`
- Group imports: external (React, Next), then internal
- No unused imports

### Naming Conventions
- **Components**: PascalCase (`Button.tsx`, `UserProfile.tsx`)
- **Files**: kebab-case for utilities (`date-utils.ts`), PascalCase for components
- **Variables/functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Interfaces**: PascalCase with `I` prefix (e.g., `IUserProps`) or use TypeScript type aliases

### TypeScript
- Enable strict mode; avoid `any`
- Use explicit return types for functions
- Use interface for object shapes, type for unions/primitives
- Avoid type assertions (`as`) when possible

### React/Next.js Patterns
- Use Server Components by default
- Add `'use client'` directive only for:
  - Interactive components (onClick, onChange)
  - React hooks (useState, useEffect, useContext)
  - Browser APIs
- Use `next/image` for images, `next/link` for navigation
- Prefer async/await in Server Components

### Tailwind CSS
- Use utility classes directly in JSX
- Follow mobile-first responsive patterns (`sm:`, `md:`, `lg:`)
- Use semantic color names when available
- Dark mode via `dark:` prefix

### Error Handling
- Use try/catch with async functions
- Display user-friendly error messages
- Use Next.js error boundaries (`error.tsx`) for route-level error handling
- Handle loading states with `loading.tsx`

### General Guidelines
- No console.log in production code
- Add `rel="noopener noreferrer"` to external links
- Use semantic HTML elements
- Ensure accessibility (aria attributes, alt text)
- Keep components small and focused
- Extract repeated patterns into reusable components

## Linting

ESLint uses `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
Run `npm run lint` before committing.