# SoundHaze Change Log

This file explains every change made while working through `MODERNIZATION_PLAN.md`.
Each section matches one plan item (S1, S2, ...) and one git commit on the `modernize` branch.

## Deviations from plan

_None yet._

## Open questions for Tyler

_None yet._

---

# Batch 1: security and bug fixes (S1 to S13)

## S13 — Fix package layout so each app builds by itself
_Done first (as the plan's "Recommended order" says) so the frontend could be built to verify S12._
- **Problem:** `react-icons` was only listed in the **root** `package.json`, so `cd frontend && npm ci && npm run build` failed with `Can't resolve 'react-icons/hi'`. It only worked before because Node also looks in parent folders' `node_modules`. The root `package.json` also had a weird `"install"` lifecycle script (it ran automatically on every root `npm install` and re-installed both apps), unused frontend packages (Font Awesome, `pg`, `redux`, ...), and `dev:*` scripts that ran `npm install` instead of starting anything. `backend/package.json` had a typo (`sequleize-cli`), and there was an empty file `backend/npx` committed by accident.
- **What changed:**
  - `react-icons` added to `frontend/package.json` (npm resolved `^4.12.0`, still the same major version 4 the code was written for).
  - Root `package.json` now has **no dependencies** and only simple scripts: `dev:backend`, `dev:frontend`, `build` (builds the frontend), `start` (starts the backend), `sequelize`. It is marked `"private": true`. Root `package-lock.json` regenerated (now empty of packages).
  - `"engines": { "node": ">=22" }` added to root, backend and frontend `package.json`.
  - `sequleize-cli` typo fixed to `sequelize-cli` in `backend/package.json`.
  - Empty `backend/npx` deleted.
- **Files:** `package.json`, `package-lock.json`, `frontend/package.json`, `frontend/package-lock.json`, `backend/package.json`, `backend/npx` (deleted)
- **How to verify:**
  1. `rm -rf node_modules frontend/node_modules` (make sure no root `node_modules` exists).
  2. `cd frontend && npm ci && npm run build` should finish with "The build folder is ready to be deployed." (verified: 82.9 KB gzipped JS, one harmless lint warning about an unused import in `store/artists.js`).
  3. `cd backend && npm ci` installs cleanly.
  4. From the root: `npm run dev:backend` and `npm run dev:frontend` (in two terminals) start the two apps.
- **Things to watch / follow-ups:**
  - Installing is now per app: run `npm install` inside `backend/` and inside `frontend/`. Running `npm install` at the root no longer installs anything (that is intended).
  - The old Render.com deploy flow relied on the root `install` hook and `render-postbuild` script. That flow is gone; the AWS deploy (S36 to S44) replaces it. If you still deploy to Render, set its build command to `npm ci --prefix backend && npm ci --prefix frontend && npm run build --prefix backend && npm run build --prefix frontend`.
  - The `react-scripts` (CRA) build still prints many deprecation warnings during install; S21 (Vite) removes them.

## S1 — Remove leftover debug/test routes
- **Problem:** `routes/api/index.js` still had tutorial scaffolding routes. The dangerous one was `GET /api/set-token-cookie`: anyone who opened that URL got a valid login cookie for the demo user, with no password and no CSRF token. `POST /api/test` (defined twice) echoed the request body, and `GET /api/require-auth` / `GET /api/restore-user` returned the current user. None were used by the frontend.
- **What changed:** Deleted all four routes (five route definitions) and the now-unused imports (`setTokenCookie`, `User`, the duplicate `requireAuth` import).
- **Files:** `backend/routes/api/index.js`
- **How to verify:**
  - Start the backend and run `curl -i http://localhost:5000/api/set-token-cookie`. Expect `404` and **no** `Set-Cookie: token=...` header. Same for `/api/restore-user`, `/api/require-auth`, and `curl -X POST /api/test` (POST gets 403 without a CSRF token, 404 with one).
  - Logging in as the demo user through the normal login still works (verified with curl: `POST /api/session/login`, then `GET /api/my`).
- **Things to watch / follow-ups:** The demo login button in the frontend uses the normal `POST /api/session/login` with the demo credentials, so it is unaffected.

