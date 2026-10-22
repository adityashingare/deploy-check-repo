# BLFA Learning Lab — Next.js Frontend

Containerized Next.js frontend built with React 18, App Router, and TypeScript. Designed to serve as a decoupled presentation layer communicating with a headless WordPress CMS backend via **WPGraphQL**.

---

## Architecture Overview

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS Design System with responsive grid, glassmorphic accents, and micro-interactions
- **Containerization**: Multi-stage production `Dockerfile` (Alpine Linux, non-root user `nextjs:nodejs`, standalone output)
- **Data Layer**: GraphQL queries against WPGraphQL with automatic fallback caching for offline resilience
- **Endpoints**:
  - `/` — Homepage featuring architecture showcase and highlighted articles
  - `/blog` — Complete blog listing with categories and reading times
  - `/blog/[slug]` — Dynamic individual post detail rendered from WordPress content
  - `/contact` — Client form with real-time UI validation and server-side verification
  - `/api/contact` — Next.js API route performing strict server-side payload validation
  - `/api/health` — Frontend health check endpoint reporting status, uptime, and target WPGraphQL endpoint

---

## Local Development (Without Docker)

If you have Node.js 20+ installed on your host machine:

```bash
# 1. Install dependencies
npm ci

# 2. Configure environment
cp .env.example .env.local

# 3. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running with Docker Compose

The frontend attaches to the shared Docker bridge network `blfa-network`.

```bash
# 1. Ensure the shared Docker network exists (created automatically by backend compose, or run manually):
docker network create blfa-network

# 2. Build and start the container in detached mode:
docker compose up --build -d

# 3. Inspect container logs:
docker compose logs -f frontend

# 4. Check health status:
docker compose ps
curl http://localhost:3000/api/health

# 5. Stop the container:
docker compose down
```

---

## Environment Variables Reference

| Variable Name | Required At | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_WORDPRESS_API_URL` | Build & Runtime | `http://localhost:9000/graphql` | Browser-accessible GraphQL endpoint embedded into client JavaScript bundles. |
| `WORDPRESS_INTERNAL_API_URL` | Runtime (SSR) | `http://nginx/graphql` | Internal Docker network URL used by Next.js Server Components to reach Nginx directly. |
| `PORT` | Runtime | `3000` | Host port on which Next.js listens. |
| `NODE_ENV` | Build & Runtime | `production` | Node execution environment. |

> **Important**: Never store sensitive database passwords or API keys in variables prefixed with `NEXT_PUBLIC_` or pass them as Docker build arguments.

---

## Multi-Stage Dockerfile Highlights

The frontend `Dockerfile` follows enterprise Docker best practices:
1. **`deps` stage**: Uses `node:20-alpine` and `npm ci` with `package-lock.json` for deterministic, cached dependency installation.
2. **`builder` stage**: Compiles the Next.js app using `output: 'standalone'`, creating a self-contained runtime package with minimal dependencies.
3. **`runner` stage**: Runs as unprivileged user `nextjs` (UID 1001), exposes port 3000, and defines a `HEALTHCHECK` command.

---

## Continuous Integration (CI)

The GitHub Actions workflow (`.github/workflows/frontend-ci.yml`) triggers on pushes and pull requests to the `frontend` branch. It executes:
- Dependency installation (`npm ci`)
- Code linting (`npm run lint`)
- Application compilation (`npm run build`)
- Production Docker image build validation (`docker build`)
