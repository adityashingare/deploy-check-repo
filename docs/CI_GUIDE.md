# GitHub Actions Continuous Integration (CI) Architecture

This guide explains the branch-specific GitHub Actions CI pipelines implemented for the BLFA Learning Lab.

---

## 1. CI Strategy Across Separate Branches

Because the repository uses two separate long-lived branches (`frontend` and `backend`), each branch contains its own dedicated workflow file that executes strictly within its own branch context:

| Branch | Workflow File | Trigger Conditions | Responsibilities |
| :--- | :--- | :--- | :--- |
| **`frontend`** | `.github/workflows/frontend-ci.yml` | Push & PR to `frontend` | Dependencies install (`npm ci`), ESLint verification, Next.js build compilation, Docker multi-stage image build validation. |
| **`backend`** | `.github/workflows/backend-ci.yml` | Push & PR to `backend` | Docker Compose specification linting (`docker compose config`), Nginx configuration syntax test (`nginx -t` in container), official image verification. |

---

## 2. Security & Least Privilege

- **Read-Only Permissions**: Both workflows specify `permissions: contents: read` to prevent unauthorized repository modifications.
- **No Cloud Credentials**: No AWS credentials, OIDC roles, or external secrets are required or configured.
- **Fail Fast**: Pipelines abort immediately upon any lint, compilation, or container configuration failure.

---

## 3. Frontend CI Workflow Breakdown

```yaml
name: Frontend CI Pipeline

on:
  push:
    branches: [ frontend ]
  pull_request:
    branches: [ frontend ]

permissions:
  contents: read

jobs:
  validate-and-build:
    name: Lint, Test, and Build Next.js
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
        env:
          NEXT_TELEMETRY_DISABLED: 1
          NODE_ENV: production
          NEXT_PUBLIC_WORDPRESS_API_URL: http://localhost:9000/graphql
          WORDPRESS_INTERNAL_API_URL: http://nginx/graphql

  docker-image-validation:
    name: Build & Validate Frontend Docker Image
    runs-on: ubuntu-latest
    needs: validate-and-build
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: false
          tags: blfa-frontend:ci-test
          build-args: |
            NEXT_PUBLIC_WORDPRESS_API_URL=http://localhost:9000/graphql
            WORDPRESS_INTERNAL_API_URL=http://nginx/graphql
```

---

## 4. Backend CI Workflow Breakdown

```yaml
name: Backend CI Pipeline

on:
  push:
    branches: [ backend ]
  pull_request:
    branches: [ backend ]

permissions:
  contents: read

jobs:
  validate-compose-and-nginx:
    name: Validate Docker Compose & Nginx
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate Docker Compose Configuration
        run: |
          docker compose config --quiet

      - name: Validate Nginx Configuration Syntax
        run: |
          docker run --rm \
            -v ${{ github.workspace }}/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro \
            nginx:1.27-alpine nginx -t
```

---

## 5. Local Reproduction of CI Steps

To run the exact checks executed by CI on your local Windows workstation:

### Frontend Checks
```powershell
# 1. Run linter
npm run lint

# 2. Run Next.js production build
npm run build

# 3. Test building the Docker image
docker build -t blfa-frontend:local-test .
```

### Backend Checks
```powershell
# 1. Validate docker-compose.yml syntax
docker compose config --quiet

# 2. Test Nginx syntax with a one-shot container
docker run --rm -v ${PWD}/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro nginx:1.27-alpine nginx -t
```
