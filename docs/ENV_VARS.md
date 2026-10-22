# Environment Variables Reference

This document provides a comprehensive specification of every environment variable utilized across the BLFA Learning Lab frontend and backend services.

---

## 1. Frontend Environment Variables (`frontend` branch)

| Variable Name | Consuming Service | Sensitive? | Stage Required | Default / Local Dev Value | Purpose & Architectural Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_WORDPRESS_API_URL` | Next.js Client Bundle & Node SSR | **No** (Public) | **Build & Runtime** | `http://localhost:9000/graphql` | The browser-facing URL to the WPGraphQL endpoint. Embedded into JavaScript bundles sent to the client browser during `next build`. |
| `WORDPRESS_INTERNAL_API_URL` | Next.js Server Components / SSR | **No** | **Runtime** | `http://nginx/graphql` | Internal Docker bridge network URL. Used during Server-Side Rendering (SSR) to retrieve GraphQL data directly from the Nginx proxy without routing out to the host. |
| `PORT` | Next.js Server Process | **No** | **Runtime** | `3000` | Port on which the Next.js standalone Node server binds and listens. |
| `NODE_ENV` | Next.js & Node Runtime | **No** | **Build & Runtime** | `production` | Optimizes React runtime performance, enables minification, and suppresses development logs. |

---

## 2. Backend Environment Variables (`backend` branch)

| Variable Name | Consuming Service | Sensitive? | Stage Required | Default / Local Dev Value | Purpose & Architectural Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `WORDPRESS_DB_HOST` | WordPress (`wordpress`) | **No** | Runtime | `db:3306` | Hostname and port of the database service within the Docker network. Points to the MySQL container service name. |
| `WORDPRESS_DB_NAME` | WordPress (`wordpress`) & MySQL (`db`) | **No** | Runtime | `blfa_local` | Name of the relational database schema created upon first MySQL container initialization. |
| `WORDPRESS_DB_USER` | WordPress (`wordpress`) & MySQL (`db`) | **No** | Runtime | `blfa_local` | Database application username used by WordPress to execute queries. |
| `WORDPRESS_DB_PASSWORD` | WordPress (`wordpress`) & MySQL (`db`) | **Yes** (Local Dummy Only) | Runtime | `blfa_local_pass` | Password associated with the application database user. Dummy credential for local development only. |
| `WORDPRESS_DB_ROOT_PASSWORD` | MySQL (`db`) | **Yes** (Local Dummy Only) | Runtime | `root_local_pass` | Root administrative password for MySQL database container. |
| `WORDPRESS_TABLE_PREFIX` | WordPress (`wordpress`) | **No** | Runtime | `wp_` | Database table prefix for WordPress tables. |
| `WORDPRESS_DEBUG` | WordPress (`wordpress`) | **No** | Runtime | `1` | Enables PHP error logging and WordPress debug notices for local development. |
| `WORDPRESS_PORT` | Nginx (`nginx`) | **No** | Runtime | `9000` | Host port mapped to Nginx container port 80 (`9000:80`). |
| `DOMAIN` | Nginx (`nginx`) | **No** | Runtime | `localhost` | Server name recognized by Nginx virtual host. Can be changed to `local.blfa.com`. |

---

## 3. How Docker Compose Ingests Environment Variables

Docker Compose reads environment variables through multiple mechanisms:
1. **`.env` file in the current directory**: Automatically parsed by `docker compose`.
2. **Explicit environment block in `docker-compose.yml`**:
   ```yaml
   environment:
     - WORDPRESS_DB_NAME=${WORDPRESS_DB_NAME:-blfa_local}
   ```
   Uses bash-style fallback syntax `${VAR:-default_value}`. If the variable is unset in `.env` or the shell, Compose falls back to the declared default.
3. **Build Arguments (`args`)**:
   Passed into the Docker build context for building images. Note: Build arguments are baked into image layers; **never pass private passwords as build arguments**.

---

## 4. Security Rules for Credentials

1. **Dummy Credentials Only**: All credentials (`blfa_local_pass`, `root_local_pass`) are dummy values intended solely for local workstation isolation.
2. **Never Commit `.env` Files**: Only `.env.example` templates are checked into Git. Real `.env` files are ignored via `.gitignore` and `.dockerignore`.
3. **No AWS Secrets in Local Setup**: AWS-specific environment variables (e.g., `PCS_STATIC_DEPLOY_*`, AWS IAM keys) are intentionally omitted from this local learning lab.
