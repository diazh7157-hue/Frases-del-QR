# replit.md

## Overview

This is a **Phrase Manager** application — a full-stack web app where authenticated users can create, view, and delete text phrases through an admin dashboard. It also provides a public-facing page (`/view`) that displays a random phrase with animated visuals and a QR code feature for sharing the public link.

The app follows a monorepo structure with a React frontend, Express backend, and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Directory Structure
- `client/` — React frontend (Vite-powered SPA)
- `server/` — Express backend API
- `shared/` — Shared code between frontend and backend (database schema, route definitions, types)
- `migrations/` — Drizzle ORM database migrations

### Frontend Architecture
- **Framework**: React with TypeScript
- **Bundler**: Vite (with HMR in development via `server/vite.ts`)
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (soft pink/rose theme)
- **Forms**: React Hook Form with Zod validation via `@hookform/resolvers`
- **Animations**: Framer Motion (used in PublicView)
- **Key Pages**:
  - `/` — Admin Dashboard (authenticated, CRUD for phrases, QR code generation)
  - `/view` — Public View (displays random phrase, no auth required)

### Backend Architecture
- **Framework**: Express.js on Node.js
- **Language**: TypeScript (run via `tsx` in dev, bundled with esbuild for production)
- **API Pattern**: REST API under `/api/` prefix
- **Route Definitions**: Shared route contract in `shared/routes.ts` using Zod schemas for input validation and response typing
- **Authentication**: Replit Auth (OpenID Connect) with Passport.js, session-based with `express-session` and `connect-pg-simple` for session storage
- **Auth Middleware**: `isAuthenticated` middleware protects admin routes; `/api/phrases/random` is public
- **Storage Layer**: `IStorage` interface in `server/storage.ts` with `DatabaseStorage` implementation — provides abstraction over database operations

### Database
- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-Zod conversion
- **Schema Location**: `shared/schema.ts` and `shared/models/auth.ts`
- **Tables**:
  - `phrases` — `id` (serial PK), `text` (text), `created_at` (timestamp)
  - `users` — Replit Auth user storage (`id`, `email`, `first_name`, `last_name`, `profile_image_url`, timestamps)
  - `sessions` — Session storage for `connect-pg-simple` (`sid`, `sess`, `expire`)
- **Schema Push**: Use `npm run db:push` (runs `drizzle-kit push`) to sync schema to database

### API Endpoints
- `GET /api/phrases` — List all phrases (authenticated)
- `POST /api/phrases` — Create a phrase (authenticated, validated with Zod)
- `DELETE /api/phrases/:id` — Delete a phrase (authenticated)
- `GET /api/phrases/random` — Get a random phrase (public, no auth)
- `GET /api/auth/user` — Get current authenticated user
- `GET /api/login` — Redirect to Replit OIDC login
- `GET /api/logout` — Logout and redirect

### Build System
- **Development**: `npm run dev` runs the Express server with Vite middleware for HMR
- **Production Build**: `npm run build` runs `script/build.ts` which builds the client with Vite and bundles the server with esbuild
- **Production Start**: `npm start` runs the bundled server from `dist/index.cjs`
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

## External Dependencies

### Required Services
- **PostgreSQL Database**: Must be provisioned and accessible via `DATABASE_URL` environment variable
- **Replit Auth (OIDC)**: Uses Replit's OpenID Connect provider for authentication. Requires `REPL_ID`, `ISSUER_URL`, and `SESSION_SECRET` environment variables

### Key NPM Packages
- `drizzle-orm` + `drizzle-kit` — Database ORM and migration tooling
- `express` + `express-session` — HTTP server and session management
- `connect-pg-simple` — PostgreSQL session store
- `passport` + `openid-client` — Authentication via OIDC
- `@tanstack/react-query` — Client-side data fetching and caching
- `zod` + `drizzle-zod` — Runtime validation and schema generation
- `wouter` — Client-side routing
- `qrcode.react` — QR code generation for the public view link
- `framer-motion` — Animations on the public view page
- `react-hook-form` — Form management
- shadcn/ui ecosystem (Radix UI primitives, Tailwind CSS, class-variance-authority, clsx, tailwind-merge)