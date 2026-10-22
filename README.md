# BLFA Learning Lab — WordPress Backend (Headless CMS)

Containerized Headless WordPress CMS environment orchestrated with Docker Compose, featuring **Nginx reverse proxy**, **WordPress PHP 8.2-FPM**, and **MySQL 8.0**.

> **Crucial Architecture Rule**: The backend strictly avoids custom Dockerfiles! All services run directly on official, unmodified, upstream container images (`wordpress:php8.2-fpm-alpine`, `nginx:1.27-alpine`, `mysql:8.0`).

---

## 1. Services & Architecture Overview

| Service | Container Name | Base Image | Role | Port(s) |
| :--- | :--- | :--- | :--- | :--- |
| **`nginx`** | `blfa-nginx` | `nginx:1.27-alpine` | Reverse proxy, static file server, health check endpoint. | Host `9000:80` |
| **`wordpress`**| `blfa-wordpress`| `wordpress:php8.2-fpm-alpine` | Headless WordPress CMS executing via FastCGI. | Internal `9000` |
| **`db`** | `blfa-mysql` | `mysql:8.0` | Relational database with persistent named volume. | Internal `3306` |
| **`wp-cli`** | `blfa-wp-cli` | `wordpress:cli-php8.2` | Automated management utility tool profile. | N/A (Utility) |

---

## 2. Shared Volumes & Data Persistence

1. **`blfa_wp_data` (`/var/www/html`)**:
   - Shared between `wordpress` (read-write) and `nginx` (read-only).
   - On initial container launch, the official WordPress entrypoint automatically extracts WordPress core files into this volume.
   - Houses WordPress core, uploads, themes, and plugins (including `wp-graphql`).
2. **`blfa_db_data` (`/var/lib/mysql`)**:
   - Persists MySQL tables and database indexes across container restarts and updates.

---

## 3. Quickstart: Automated Setup

On Windows PowerShell:

```powershell
# 1. Run the all-in-one setup script:
.\scripts\setup-backend.ps1
```

Or on Linux / macOS / WSL:
```bash
./scripts/setup-backend.sh
```

This script:
- Creates `.env` from `.env.example`
- Starts containers in detached mode (`docker compose up -d`)
- Waits for MySQL database health check to report healthy
- Installs WordPress core with local credentials
- Sets rewrite structure to `/%postname%/` (required by WPGraphQL)
- Installs and activates the **WPGraphQL** plugin
- Seeds initial sample blog posts

---

## 4. Manual Setup via WP-CLI

If you prefer executing steps manually:

```bash
# 1. Start containers
docker compose up -d

# 2. Wait for MySQL to become healthy (check with docker compose ps)
docker compose ps

# 3. Install WordPress
docker compose run --rm wp-cli wp core install \
  --url="http://localhost:9000" \
  --title="BLFA Headless CMS" \
  --admin_user="admin" \
  --admin_password="admin_local_pass123!" \
  --admin_email="admin@example.com" \
  --skip-email

# 4. Set permalink structure
docker compose run --rm wp-cli wp rewrite structure '/%postname%/' --hard

# 5. Install and activate WPGraphQL
docker compose run --rm wp-cli wp plugin install wp-graphql --activate
```

---

## 5. Verifying the Endpoints

### A. Nginx Health Check
```bash
curl -i http://localhost:9000/healthz
```
*Expected: HTTP 200 OK with `healthy` body.*

### B. WPGraphQL Query Verification
```bash
curl -X POST http://localhost:9000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ generalSettings { title url } posts { nodes { title slug } } }"}'
```

*Expected Response:*
```json
{
  "data": {
    "generalSettings": {
      "title": "BLFA Headless WordPress",
      "url": "http://localhost:9000"
    },
    "posts": {
      "nodes": [
        {
          "title": "Architecting Next.js with Headless WordPress",
          "slug": "architecting-next-js-with-headless-wordpress"
        }
      ]
    }
  }
}
```

### C. WordPress Admin Dashboard
- **URL**: [http://localhost:9000/wp-admin](http://localhost:9000/wp-admin)
- **Username**: `admin`
- **Password**: `admin_local_pass123!`

---

## 6. Daily Operations & Troubleshooting

```bash
# View live container logs
docker compose logs -f

# Check container status
docker compose ps

# Validate Nginx configuration
docker compose exec nginx nginx -t

# Stop all backend services
docker compose down

# Complete database reset (destroys data volume for fresh start)
docker compose down -v
```
