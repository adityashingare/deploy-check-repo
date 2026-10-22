# Git Branch Management & Worktrees Guide (One Repository, Two Branches)

This guide documents the repository strategy used by the client's BLFA project: **ONE Git repository with TWO long-lived branches (`frontend` and `backend`)**.

---

## 1. Architectural Philosophy: Why Separate Branches?

Instead of maintaining a monorepo on `main` or two completely disconnected Git repositories, the BLFA architecture separates the lifecycle of the frontend and backend into two parallel branches:

```
                  ┌── [Commit F1] ── [Commit F2] ── [Commit F3] (frontend branch)
                  │
[Initial Commit] ─┤
                  │
                  └── [Commit B1] ── [Commit B2] ── [Commit B3] (backend branch)
```

### Key Rules
- **No Shared File Assumptions**: Files on `frontend` (e.g., `package.json`, `Dockerfile`, `src/`) do **not** exist on `backend`.
- **Independent CI Pipelines**: `.github/workflows/frontend-ci.yml` exists only on `frontend`. `.github/workflows/backend-ci.yml` exists only on `backend`.
- **Zero Monorepo Overhead**: Each branch contains only the code and configurations strictly needed for that application.

---

## 2. Managing Both Branches Locally on Windows

When working locally, you need both applications running at the same time:
- The WordPress backend running on port 9000.
- The Next.js frontend running on port 3000.

There are two primary workflows for running both simultaneously:

### Workflow Option A: Git Worktrees (Recommended for Concurrent Development)

`git worktree` allows you to check out multiple branches of the same local repository into separate directories simultaneously.

#### Step 1: Clone or Open the Repository
```powershell
# Open terminal in your primary working directory
cd D:\blfa-copy-project
git checkout frontend
```

#### Step 2: Create a Worktree for the Backend
```powershell
# Add a secondary worktree in a sibling folder pointing to the 'backend' branch
git worktree add ..\blfa-backend backend
```

Now you have two separate directory trees on your machine pointing to the exact same repository:
- `D:\blfa-copy-project` (checked out on `frontend`)
- `D:\blfa-backend` (checked out on `backend`)

#### Step 3: Run Both Services Simultaneously
In Terminal 1 (Backend):
```powershell
cd D:\blfa-backend
docker compose up -d
```

In Terminal 2 (Frontend):
```powershell
cd D:\blfa-copy-project
docker compose up -d
```

Both projects run concurrently without any file switching or conflicts!

#### Listing & Removing Worktrees
```powershell
# List active worktrees
git worktree list

# When finished, remove the worktree
git worktree remove ..\blfa-backend
```

---

### Workflow Option B: Branch Switching with Detached Docker Containers

Because Docker containers run independently in the background, you can also operate from a single directory:

1. Switch to `backend` and launch the containers:
   ```powershell
   git checkout backend
   docker compose up -d
   ```
2. Verify backend containers are healthy:
   ```powershell
   docker compose ps
   ```
3. Switch to `frontend` and launch frontend:
   ```powershell
   git checkout frontend
   docker compose up -d
   # Or run with host Node:
   npm run dev
   ```
The backend containers will continue running uninterrupted in the background!

---

## 3. Creating & Maintaining Separate Branches

### Initializing the Orphan Backend Branch
If creating the branch structure from scratch:
```powershell
# 1. Commit all frontend files to 'frontend'
git checkout -b frontend
git add .
git commit -m "feat(frontend): initialize Next.js frontend architecture"

# 2. Create a clean orphan branch for backend (clears working index)
git checkout --orphan backend
git rm -rf .

# 3. Add backend files, compose, and configs
git add .
git commit -m "feat(backend): initialize Headless WordPress and Nginx architecture"
```

### Safe Branch Switching Commands
```powershell
# Check current branch and uncommitted modifications
git status

# Fetch remote updates without merging
git fetch origin

# Switch branches safely
git checkout frontend
git checkout backend

# Prevent accidental merges between frontend and backend
# Do NOT run: git merge backend while on frontend!
```
