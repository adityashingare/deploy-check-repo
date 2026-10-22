#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================="
echo "  BLFA Learning Lab — Backend Automated Provisioning     "
echo "=========================================================="

# 1. Ensure .env exists
if [ ! -f .env ]; then
  echo "[1/6] Copying .env from .env.example..."
  cp .env.example .env
else
  echo "[1/6] .env already exists."
fi

# 2. Start services
echo "[2/6] Starting Docker Compose backend services..."
docker compose up -d

# 3. Wait for database
echo "[3/6] Waiting for MySQL database to become healthy..."
until [ "$(docker inspect --format='{{json .State.Health.Status}}' blfa-mysql 2>/dev/null)" = "\"healthy\"" ]; do
  sleep 3
  echo " -> Waiting for MySQL to report healthy..."
done
echo " -> MySQL is healthy!"

# 4. Install WordPress Core
echo "[4/6] Installing WordPress core if needed..."
if ! docker compose run --rm wp-cli wp core is-installed 2>/dev/null; then
  docker compose run --rm wp-cli wp core install \
    --url="http://localhost:9000" \
    --title="BLFA Headless WordPress" \
    --admin_user="admin" \
    --admin_password="admin_local_pass123!" \
    --admin_email="admin@example.com" \
    --skip-email
  echo " -> WordPress core installed!"
else
  echo " -> WordPress core is already installed."
fi

# 5. Configure permalinks
echo "[5/6] Setting permalink structure for WPGraphQL..."
docker compose run --rm wp-cli wp rewrite structure '/%postname%/' --hard

# 6. Install & activate WPGraphQL
echo "[6/6] Installing and activating WPGraphQL plugin..."
docker compose run --rm wp-cli wp plugin install wp-graphql --activate

# Seed sample post if needed
POST_COUNT=$(docker compose run --rm wp-cli wp post list --post_type=post --format=count 2>/dev/null || echo "0")
if [ "$POST_COUNT" -le 1 ]; then
  echo " -> Seeding BLFA sample posts..."
  docker compose run --rm wp-cli wp post create \
    --post_type=post \
    --post_title="Architecting Next.js with Headless WordPress" \
    --post_content="This blog post was dynamically generated in WordPress and retrieved by Next.js over WPGraphQL!" \
    --post_excerpt="Discover the decoupled architecture of BLFA using Next.js and Docker." \
    --post_status=publish
fi

echo "=========================================================="
echo "  BLFA Backend Setup Complete!                            "
echo "  WordPress Admin:  http://localhost:9000/wp-admin        "
echo "  GraphQL Endpoint: http://localhost:9000/graphql         "
echo "=========================================================="
