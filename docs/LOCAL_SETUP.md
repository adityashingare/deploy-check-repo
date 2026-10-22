# Local Installation & Quickstart Guide

This guide walks through starting the entire BLFA Learning Lab on a Windows workstation running Git and Docker Desktop.

---

## 1. Prerequisites

Before starting, ensure your system meets the following requirements:
1. **Windows 10/11 Pro, Enterprise, or Home** with WSL2 enabled.
2. **Docker Desktop**: Running with the Linux container engine selected.
3. **Git**: Installed and available in PowerShell (`git --version`).
4. **Node.js LTS (Optional)**: If running Next.js outside Docker (`node --version`).

---

## 2. Architecture Quick Recap

- **Frontend**: Next.js 14 App Router on `http://localhost:3000` (Branch: `frontend`)
- **Backend Nginx**: Reverse proxy on `http://localhost:9000` (Branch: `backend`)
- **WP Admin**: `http://localhost:9000/wp-admin`
- **WPGraphQL Endpoint**: `http://localhost:9000/graphql`
- **Shared Network**: `blfa-network` (Docker bridge)

---

## 3. Step-by-Step Setup Using Git Worktrees

The recommended workflow uses Git worktrees so both branches run side-by-side in separate folders.

### Step 1: Open Terminal in the Repository
```powershell
cd D:\blfa-copy-project
git checkout frontend
```

### Step 2: Create the Backend Worktree
```powershell
git worktree add ..\blfa-backend backend
```

---

### Step 3: Start the Backend Services
In Terminal 1:
```powershell
cd ..\blfa-backend

# 1. Create .env from template
cp .env.example .env

# 2. Launch MySQL, WordPress (PHP-FPM), and Nginx in detached mode
docker compose up -d

# 3. Wait 15-20 seconds for MySQL to complete initialization, then check container status:
docker compose ps
```

All 3 containers (`blfa-mysql`, `blfa-wordpress`, `blfa-nginx`) should show state `Up`.

---

### Step 4: Automate WP Installation & WPGraphQL Setup
We provide a helper WP-CLI execution to install WordPress and activate WPGraphQL:

```powershell
# 1. Run WordPress core installation (dummy dev credentials)
docker compose run --rm wp-cli wp core install `
  --url="http://localhost:9000" `
  --title="BLFA Headless CMS" `
  --admin_user="admin" `
  --admin_password="admin_local_pass123!" `
  --admin_email="admin@example.com" `
  --skip-email

# 2. Configure pretty permalinks (required for WPGraphQL)
docker compose run --rm wp-cli wp rewrite structure '/%postname%/' --hard

# 3. Install and activate WPGraphQL plugin
docker compose run --rm wp-cli wp plugin install wp-graphql --activate

# 4. (Optional) Seed sample post
docker compose run --rm wp-cli wp post create `
  --post_type=post `
  --post_title="Microservices and Headless WordPress in Action" `
  --post_content="This article was queried live through WPGraphQL from the official PHP-FPM container!" `
  --post_status=publish
```

#### Verification: Test GraphQL Endpoint
```powershell
curl -X POST http://localhost:9000/graphql -H "Content-Type: application/json" -d '{"query":"{ posts { nodes { title } } }"}'
```

---

### Step 5: Start the Frontend Application
In Terminal 2:
```powershell
cd D:\blfa-copy-project

# Option A: Run inside Docker container (recommended for production testing)
docker compose up --build -d

# Option B: Run locally on host via Node.js (for hot reloading)
npm install
npm run dev
```

---

### Step 6: Verify Everything in the Browser
1. **Frontend Homepage**: [http://localhost:3000](http://localhost:3000)
   - Status dot in navbar will indicate **"WordPress Live"** (green).
   - Posts from WordPress will render in the featured articles section.
2. **Blog Listing**: [http://localhost:3000/blog](http://localhost:3000/blog)
3. **Contact Form**: [http://localhost:3000/contact](http://localhost:3000/contact)
4. **Frontend API Health**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
5. **Nginx Health Check**: [http://localhost:9000/healthz](http://localhost:9000/healthz)
6. **WordPress Admin**: [http://localhost:9000/wp-admin](http://localhost:9000/wp-admin)
   - Username: `admin`
   - Password: `admin_local_pass123!`

---

## 4. Teardown / Stopping Services

To stop services when you are finished:

```powershell
# Stop frontend
cd D:\blfa-copy-project
docker compose down

# Stop backend
cd ..\blfa-backend
docker compose down
```

To also remove persisted database volumes and start completely fresh:
```powershell
docker compose down -v
```
