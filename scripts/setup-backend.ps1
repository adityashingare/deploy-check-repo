# BLFA Learning Lab — Backend Automated Provisioning (PowerShell)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  BLFA Learning Lab - Backend Automated Provisioning     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Ensure .env exists
if (-not (Test-Path ".env")) {
    Write-Host "[1/6] Generating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
} else {
    Write-Host "[1/6] .env already exists." -ForegroundColor Green
}

# 2. Start backend services
Write-Host "[2/6] Starting Docker Compose backend services..." -ForegroundColor Yellow
docker compose up -d

Write-Host "[3/6] Waiting for MySQL database to become healthy..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$healthy = $false

while ($attempt -lt $maxAttempts -and -not $healthy) {
    Start-Sleep -Seconds 3
    $attempt++
    $dbStatus = docker inspect --format='{{json .State.Health.Status}}' blfa-mysql 2>$null
    if ($dbStatus -match "healthy") {
        $healthy = $true
        Write-Host " -> MySQL database is healthy!" -ForegroundColor Green
    } else {
        Write-Host " -> Waiting for MySQL ($attempt/$maxAttempts)..." -ForegroundColor Gray
    }
}

if (-not $healthy) {
    Write-Host "ERROR: MySQL failed to report healthy status within 90 seconds." -ForegroundColor Red
    docker compose logs --tail=30 db
    exit 1
}

# 4. Install WordPress Core (if not already installed)
Write-Host "[4/6] Verifying WordPress Core installation..." -ForegroundColor Yellow
$null = docker compose run --rm wp-cli wp core is-installed 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host " -> Installing WordPress core with local credentials..." -ForegroundColor Yellow
    docker compose run --rm wp-cli wp core install --url="http://localhost:9000" --title="BLFA Headless WordPress" --admin_user="admin" --admin_password="admin_local_pass123!" --admin_email="admin@example.com" --skip-email
    Write-Host " -> WordPress core installed successfully!" -ForegroundColor Green
} else {
    Write-Host " -> WordPress core is already installed." -ForegroundColor Green
}

# 5. Configure Permalinks (Required by WPGraphQL)
Write-Host "[5/6] Configuring WordPress permalink structure..." -ForegroundColor Yellow
docker compose run --rm wp-cli wp rewrite structure '/%postname%/' --hard

# 6. Install & Activate WPGraphQL Plugin
Write-Host "[6/6] Installing and activating WPGraphQL..." -ForegroundColor Yellow
docker compose run --rm wp-cli wp plugin install wp-graphql --activate

# Seed initial blog posts if none exist
$postCount = docker compose run --rm wp-cli wp post list --post_type=post --format=count 2>$null
if (-not $postCount -or [int]$postCount -le 1) {
    Write-Host " -> Seeding BLFA sample posts..." -ForegroundColor Yellow
    
    docker compose run --rm wp-cli wp post create --post_type=post --post_title="Architecting Next.js with Headless WordPress" --post_content="This blog post was dynamically generated in WordPress and retrieved by the Next.js frontend over WPGraphQL! Our containerized architecture separates concerns cleanly between presentation and content authoring." --post_excerpt="Discover the decoupled architecture of BLFA using Next.js, Headless WordPress, and Docker." --post_status=publish

    docker compose run --rm wp-cli wp post create --post_type=post --post_title="Overcoming Docker Networking in Local Microservices" --post_content="When developing microservices locally, understanding the distinction between internal container DNS (http://nginx/graphql) and host-facing browser URLs (http://localhost:9000/graphql) is paramount for seamless SSR." --post_excerpt="A deep dive into Docker bridge networking and client/server URL resolution." --post_status=publish
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  BLFA Backend Setup Complete!                            " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  WordPress Admin:  http://localhost:9000/wp-admin"
Write-Host "  Admin User:       admin"
Write-Host "  Admin Password:   admin_local_pass123!"
Write-Host "  GraphQL Endpoint: http://localhost:9000/graphql"
Write-Host "  Nginx Health:     http://localhost:9000/healthz"
Write-Host "==========================================================" -ForegroundColor Green
