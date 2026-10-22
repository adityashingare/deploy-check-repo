# Local Docker Networking Strategy & URL Architecture

This document clarifies how network communication operates between Docker containers, the host machine, and the web browser in the BLFA Learning Lab.

---

## 1. Network Topology

The architecture relies on a single shared Docker bridge network named `blfa-network`:

```
 [ Developer's Web Browser ]
      │ (Host Port 3000)                │ (Host Port 9000)
      ▼                                 ▼
┌──────────────────┐             ┌──────────────────────────────────────────────┐
│  blfa-frontend   │             │                 blfa-nginx                   │
│ (Next.js Node)   │             │            (Official Nginx 1.27)             │
└─────────┬────────┘             └──────────────┬───────────────────────────────┘
          │                                     │
          │ Container-to-Container              │ Container-to-Container
          │ HTTP (http://nginx/graphql)         │ FastCGI (wordpress:9000)
          │                                     ▼
          │                              ┌──────────────────────────────────────┐
          │                              │            blfa-wordpress            │
          │                              │      (Official PHP 8.2-FPM)          │
          │                              └──────────────┬───────────────────────┘
          │                                             │
          │                                             │ TCP (db:3306)
          │                                             ▼
          │                                      ┌──────────────────────────────┐
          │                                      │          blfa-mysql          │
          │                                      │      (Official MySQL 8.0)    │
          │                                      └──────────────────────────────┘
          │                                                     │
          └──────────────── blfa-network (Docker Bridge) ───────┘
```

---

## 2. Browser-Facing URLs vs. Internal Docker URLs

One of the most critical concepts in containerized web development is **URL Context Separation**:

| Context | URL Pattern | Who Initiates Request? | Where Does It Route? |
| :--- | :--- | :--- | :--- |
| **Browser-Facing (Client-Side)** | `http://localhost:9000/graphql` (or `http://local.blfa.com:9000/graphql`) | The user's web browser running on the Windows host machine. | Resolves via `localhost` (127.0.0.1) on port 9000, connecting to Nginx's published port. |
| **Internal Docker (Server-Side)** | `http://nginx/graphql` | Next.js Server Components / SSR executing inside the `blfa-frontend` container. | Resolves via Docker's embedded DNS server directly to the `blfa-nginx` container IP. |
| **PHP FastCGI (Nginx to WordPress)** | `wordpress:9000` | Nginx reverse proxy. | Forwards PHP FastCGI packets to the `blfa-wordpress` container on internal port 9000. |
| **Database (WordPress to MySQL)** | `db:3306` | WordPress PHP-FPM process. | Directly connects to the MySQL container on standard port 3306. |

---

## 3. Why `http://wordpress:9000/graphql` Fails in the Browser

Developers sometimes try to use `http://wordpress:9000/graphql` in their browser or in client-side React code. **This will always fail** because:
1. `wordpress` is an internal Docker DNS hostname, not registered in the host operating system's DNS table.
2. Even if DNS resolved, `wordpress` runs **PHP-FPM** (binary FastCGI protocol), not an HTTP web server! It cannot handle raw HTTP browser requests directly.
3. Only **Nginx** handles incoming HTTP traffic and knows how to translate it into FastCGI requests for WordPress.

---

## 4. Why We Avoid `host.docker.internal`

While Docker Desktop provides `host.docker.internal`, relying on it for application traffic introduces significant issues:
- **Portability**: It does not function natively on standard Linux Docker engines without extra host-gateway configurations.
- **Architectural drift**: Containers should communicate as independent services on a defined Docker bridge network, not loop through the host's networking stack.
- In BLFA, all inter-container communication uses explicit Docker service names (`nginx`, `wordpress`, `db`).

---

## 5. Security & Minimal Port Exposure

To prevent security misconfigurations and port collisions on the developer's workstation:
- **MySQL (`db`)**: Port 3306 is **NOT** published to the host machine. Only containers on `blfa-network` can access MySQL.
- **WordPress FPM (`wordpress`)**: Port 9000 is internal only; it is not bound directly to the host.
- **Nginx (`nginx`)**: Publishes port `9000:80` (Host 9000 -> Container 80).
- **Next.js (`frontend`)**: Publishes port `3000:3000` (Host 3000 -> Container 3000).

---

## 6. Optional Local Domain (`local.blfa.com`)

If you prefer using the client's BLFA-style local domain instead of `localhost:9000`:
1. Open PowerShell as Administrator on Windows.
2. Add the following entry to `C:\Windows\System32\drivers\etc\hosts`:
   ```
   127.0.0.1  local.blfa.com
   ```
3. Update `.env`:
   ```env
   NEXT_PUBLIC_WORDPRESS_API_URL=http://local.blfa.com:9000/graphql
   ```
4. Rebuild the frontend container to bake the new public variable into the client bundle:
   ```bash
   docker compose up --build -d
   ```
