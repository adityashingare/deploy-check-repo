# Docker Conceptual Foundations: Images, Containers, Dockerfile & Compose

This guide explains the fundamental Docker concepts underlying the BLFA Learning Lab architecture.

---

## 1. Docker Image vs. Container

| Concept | Definition | Analogy | In This Project |
| :--- | :--- | :--- | :--- |
| **Docker Image** | An immutable, read-only snapshot containing application code, runtime, system libraries, and default configurations. Stored in a registry or local engine. | A compiled executable, blueprint, or CD-ROM. | `node:20-alpine`, `wordpress:php8.2-fpm-alpine`, `nginx:1.27-alpine`, `mysql:8.0`. |
| **Docker Container** | A runnable, isolated instance of an image executed in its own Linux cgroup and namespace with a writable top layer. | A running process or active instance. | `blfa-frontend`, `blfa-wordpress`, `blfa-nginx`, `blfa-mysql`. |

### Key Differences & Lifecycle
- **Statelessness**: Containers are ephemeral by default. If a container is stopped and removed (`docker rm`), any data written to its local container layer is lost unless stored in a **Docker Volume**.
- **Images are Immutable**: To update code or dependencies, you rebuild the image (`docker build` or `docker compose build`). You do not modify running images directly.

---

## 2. Dockerfile vs. Docker Compose

| Dimension | Dockerfile | Docker Compose (`docker-compose.yml`) |
| :--- | :--- | :--- |
| **Scope** | Builds a **single image** from source code. | Orchestrates **multiple interconnected containers**, networks, and volumes. |
| **Purpose** | Defines *how to package* an application (runtime, dependencies, build steps, non-root user). | Defines *how services run together* (ports, environment variables, dependencies, volumes, restart policies). |
| **Analogy** | A recipe for baking a single pastry. | A catering schedule coordinating the oven, pastry, beverages, and dining tables. |
| **In BLFA** | Used exclusively for the custom **Next.js frontend** (`Dockerfile`). The backend intentionally avoids custom Dockerfiles! | Used to orchestrate **Backend** (Nginx + WordPress + MySQL) and **Frontend** (Next.js service). |

---

## 3. Why the Backend Uses No Custom Dockerfile

In enterprise architectures, teams often mistakenly create custom Dockerfiles for WordPress (e.g. running `RUN curl ...` or `RUN apt-get install`). The BLFA architecture intentionally avoids this:
1. **Security & Patching**: The official `wordpress:php8.2-fpm-alpine` and `mysql:8.0` images are maintained and patched directly by upstream teams.
2. **Deterministic Orchestration**: Service configurations (PHP-FPM socket, database credentials, volume persistence) are declared in `docker-compose.yml` rather than hidden inside an image layer.
3. **Dynamic Plugin & Configuration Management**: Custom plugins like **WPGraphQL** and configurations are managed via mounted volumes and reproducible WP-CLI commands.
