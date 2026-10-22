# BLFA Learning Lab — Troubleshooting & Operations Guide

This guide provides step-by-step diagnostic procedures, common error resolutions, and commands for operating the BLFA Learning Lab.

---

## 1. Quick Diagnostic Cheat Sheet

| Action | Command | Expected Output / Result |
| :--- | :--- | :--- |
| **Check container status** | `docker compose ps` | Status `Up` or `Up (healthy)` for all running containers. |
| **Inspect all logs** | `docker compose logs` | Streaming output of all service stdout/stderr. |
| **Inspect single service logs** | `docker compose logs -f <service>` | Real-time logs for `frontend`, `nginx`, `wordpress`, or `db`. |
| **Validate compose syntax** | `docker compose config` | Parsed YAML output without syntax errors. |
| **Validate Nginx syntax** | `docker compose exec nginx nginx -t` | `syntax is ok` & `test is successful`. |
| **Check Nginx health** | `curl -i http://localhost:9000/healthz` | HTTP 200 OK with body `healthy`. |
| **Check Frontend health** | `curl -i http://localhost:3000/api/health` | HTTP 200 OK with JSON status `healthy`. |
| **Test WPGraphQL query** | `curl -X POST http://localhost:9000/graphql -H "Content-Type: application/json" -d '{"query":"{ __typename }"}'` | `{"data":{"__typename":"RootQuery"}}`. |
| **Restart a single service** | `docker compose restart <service>` | Graceful restart of specified container. |
| **Rebuild frontend** | `docker compose up --build -d frontend` | Recompiles Next.js and replaces container. |

---

## 2. Common HTTP Errors & Solutions

### A. HTTP 502 Bad Gateway (Nginx)

**Symptoms:** Browsing to `http://localhost:9000` returns Nginx `502 Bad Gateway`.

**Underlying Causes:**
1. The `wordpress` (PHP-FPM) container is still starting up or crashed.
2. Nginx cannot resolve the `wordpress` service name on the Docker network.
3. FastCGI port mismatch (expecting port 9000).

**Resolution Steps:**
```powershell
# 1. Check if the WordPress container is running
docker compose ps wordpress

# 2. Inspect WordPress logs for fatal PHP errors
docker compose logs --tail=50 wordpress

# 3. Test direct network connectivity from Nginx to WordPress
docker compose exec nginx nc -zv wordpress 9000
# Expected: wordpress (172.x.x.x:9000) open
```

---

### B. HTTP 503 Service Unavailable / Database Connection Error

**Symptoms:** WordPress displays *"Error establishing a database connection"*.

**Underlying Causes:**
1. MySQL container (`db`) is still initializing its initial tables on first boot (can take 20–40 seconds).
2. Database environment variables mismatch between `wordpress` and `db`.

**Resolution Steps:**
```powershell
# 1. Check MySQL container health
docker compose ps db

# 2. Verify MySQL logs
docker compose logs --tail=50 db

# 3. Verify that WORDPRESS_DB_NAME, WORDPRESS_DB_USER, and WORDPRESS_DB_PASSWORD in .env match exactly between WordPress and MySQL.
```

---

### C. HTTP 404 Not Found on GraphQL (`/graphql`)

**Symptoms:** Navigating to `http://localhost:9000/graphql` returns WordPress 404 or page not found.

**Underlying Causes:**
1. WordPress is installed, but the **WPGraphQL** plugin has not been installed or activated yet.
2. WordPress permalinks are set to "Plain" (`?p=123`) instead of "Post name" (`/%postname%/`).

**Resolution Steps:**
```powershell
# 1. Check if WPGraphQL is active via WP-CLI:
docker compose run --rm wp-cli wp plugin is-active wp-graphql
# If inactive or missing:
docker compose run --rm wp-cli wp plugin install wp-graphql --activate

# 2. Flush and update WordPress rewrite structure:
docker compose run --rm wp-cli wp rewrite structure '/%postname%/' --hard
```

---

### D. HTTP 403 Forbidden

**Symptoms:** Nginx returns `403 Forbidden` when accessing files or routes.

**Underlying Causes:**
1. File permissions on the shared `wp_data` volume prevent the `nginx` user from reading static assets.
2. Attempted access to hidden files (`.env`, `.git`) or PHP files inside `wp-content/uploads/` (intentionally blocked by security rules in `nginx/default.conf`).

**Resolution Steps:**
```powershell
# Ensure proper ownership of WordPress files inside the container:
docker compose exec -u root wordpress chown -R www-data:www-data /var/www/html
```

---

## 3. Database Persistence & Hard Reset

The MySQL database is stored in a Docker named volume (`db_data`) so data persists across container restarts.

### How to Completely Reset the Local Database
When you want to start from a clean slate:
```powershell
# 1. Stop and remove containers along with volumes
docker compose down -v

# 2. Verify volumes are removed
docker volume ls | grep db_data

# 3. Restart backend (creates fresh database)
docker compose up -d
```
