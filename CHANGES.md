# SoundHaze Change Log

This file explains every change made while working through `MODERNIZATION_PLAN.md`.
Each section matches one plan item (S1, S2, ...) and one git commit on the `modernize` branch.

## Deviations from plan

- **S3 (song fields):** the plan's allow-list for songs was `title`, `description`. I also allowed `previewImage`, because the existing Update Song form lets the owner change the song's cover image and leaving it out would silently break that feature.
- **S3 (album/playlist image field name):** the frontend sends the new image as `imageUrl` (the create routes use that name too), not `previewImage`. The update routes now accept `imageUrl` as an alias that is saved into `previewImage`. Side effect: changing an album/playlist image from the edit form now actually works (before, the `...album` spread in the form re-sent the **old** `previewImage`, and `imageUrl` was ignored because there is no such column).
- **S6 (album page):** the plan only named the playlist page, but the album detail page (`DisplayAlbumInfo.js`) also printed the artist's email. Removed it there too (it would have rendered empty after the API change anyway).

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

## S2 — Enforce ownership on every write route
- **Problem:** Some write routes only checked that you were **logged in**, not that you **owned** the thing you were changing. This is an IDOR bug (Insecure Direct Object Reference: change the id in the URL and you act on someone else's data). Confirmed: logged in as the demo user, `PUT /api/songs/1` (a song owned by user 2) changed its title. `PUT /api/albums/:id` had the same hole, and `DELETE /api/playlists/:pid/songs/:sid` let anyone remove songs from anyone's playlist. `POST /api/albums/:id/songs` did check ownership, but only **after** uploading the file to S3, so a non-owner could still push files into the bucket.
- **What changed:**
  - New helper `backend/utils/ownership.js` exporting `requireOwner(Model, paramName)`. It is Express middleware: it loads the record by the URL id, returns **404** if it does not exist, **403** if `record.userId !== req.user.id`, and otherwise saves the record on `res.locals.record` so the route handler does not query it again.
  - Used on `PUT /api/songs/:songId`, `PUT /api/albums/:albumId`, `DELETE /api/playlists/:playlistId/songs/:songId` and `POST /api/albums/:albumId/songs`. On that last one it now runs **before** multer, so a non-owner's upload is rejected before anything reaches S3.
  - `DELETE /api/playlists/:pid/songs/:sid` now says "Song couldn't be found." (not "Playlist couldn't be found.") when the playlist is yours but the song is not in it.
  - `GET /api/playlists` (which returned every user's playlists but required login) is now **public on purpose**. The frontend's `/playlists` page is a "browse all playlists" page, just like `/albums` (whose API was already public), and each playlist's detail endpoint was already public. Your own playlists still come from `GET /api/my/playlists`. Side effect: logged-out visitors can now see the `/playlists` page instead of an empty page caused by a 401.
- **Files:** `backend/utils/ownership.js` (new), `backend/routes/api/songs.js`, `backend/routes/api/album.js`, `backend/routes/api/playlist.js`
- **How to verify** (all verified with curl against SQLite + seed data):
  - Log in as the demo user (`Demo-lition` / `password`). `PUT /api/songs/1` with `{"title":"stolen"}` → `403 Forbidden`. `PUT /api/songs/999` → `404`.
  - Log in as `Los Lonley Boys` / `password2` (owner of song 1). Same `PUT` → `200` with the new title.
  - Demo user: `PUT /api/albums/1` → `403`.
  - `Los Lonley Boys`: `DELETE /api/playlists/1/songs/1` (playlist 1 belongs to the demo user) → `403`. Demo user: same request → `200`, then again → `404`.
  - Demo user: multipart `POST /api/albums/1/songs` → `403` (no upload attempted).
  - Logged out: `GET /api/playlists` → `200` with the list.
- **Things to watch / follow-ups:**
  - The older owner-only routes (`DELETE` song/album/playlist/comment, `PUT` playlist/comment, `POST` playlist songs) were already safe: they look the record up with `where: { id, userId: user.id }`, so a non-owner gets **404** rather than 403. I left them unchanged to keep this commit small; switching them to `requireOwner` later would make the status codes consistent.
  - Route files cannot be `require`d on their own in a script because of an old unused circular `require('../../app')` at the top of several route files. Harmless at runtime; worth deleting during S14/S47 lint cleanup.
  - See "Open questions": confirm you want `GET /api/playlists` public.

## S3 — Stop "mass assignment" in update routes
- **Problem:** The update routes did `record.update({...req.body})`, which copies **every** key the client sends into the database row. Adding `"userId": 1` to the JSON body of `PUT /api/songs/1` reassigned the song to user 1 (this is how the confirmed "song stolen" bug worked, together with S2). The same applied to `albumId`, `url`, `id`, `createdAt`, and to albums, playlists and comments.
- **What changed:** New tiny helper `backend/utils/pick.js` (`pick(obj, allowedKeys)` copies only listed keys and skips missing ones, so partial updates still work). Each update route now passes only an allow-list:
  - Songs (`PUT /api/songs/:id`): `title`, `description`, `previewImage`
  - Albums (`PUT /api/albums/:id`): `title`, `description`, `previewImage` (also accepts `imageUrl` as an alias, which is what the frontend sends)
  - Playlists (`PUT /api/playlists/:id`): `name`, `previewImage` (also accepts `imageUrl`)
  - Comments (`PUT /api/comments/:id`): `body`
- **Files:** `backend/utils/pick.js` (new), `backend/routes/api/songs.js`, `album.js`, `playlist.js`, `comment.js`
- **How to verify** (verified with curl):
  - As `Los Lonley Boys` (owner of song 1): `PUT /api/songs/1` with `{"title":"Renamed","userId":1,"albumId":3,"id":77,"url":"http://evil"}` → title changes, but `id` stays 1, `userId` stays 2, `albumId` stays 1, `url` unchanged.
  - `PUT /api/albums/1` with `{"title":"Sacred2","description":"d","imageUrl":"http://new.img/x.jpg","userId":1}` → title and image change, `userId` stays 2.
  - As demo: `PUT /api/playlists/1` with `{"name":"Chill2","imageUrl":"...","userId":2}` → `userId` stays 1. `PUT /api/comments/1` with `{"body":"edited","songId":5,"userId":3}` → only `body` changes.
  - In the UI: edit an album and change the image URL; the new image now shows (it did not before).
- **Things to watch / follow-ups:** If you add a new editable column later, you must add it to the allow-list or the update will silently ignore it. That is the intended safe default. See "Deviations from plan" for why songs allow `previewImage` and why `imageUrl` is accepted.

## S4 — Fix the validation middleware
- **Problem:**
  1. `handleValidationErrors` called `next(err)` and then fell through to `next()` again. Express then ran the route handler anyway, so invalid data could still be saved.
  2. Eight validators used `exists({ checkFalsey: true })` (typo; the option is `checkFalsy`). express-validator silently ignores unknown options, so an empty string `""` passed as "exists". Confirmed before the fix: `POST /api/playlists` with `{"name":""}` returned `201` and created a playlist with an empty name.
  3. No length limits. The DB columns are e.g. `STRING(30)` for titles/names; SQLite ignores that, but Postgres throws, which became a `500` instead of a helpful `400`.
  4. URL ids like `/api/songs/abc` went straight to the database.
- **What changed:**
  - `handleValidationErrors` now does `return next(err)` and `return next()`.
  - All `checkFalsey` typos fixed. Text fields are also `.trim()`ed and must be non-empty, so `"   "` is rejected too.
  - Length limits that match the migrations: song title 30, song description 256, album title 30 / description 256 / imageUrl 256, playlist name 30 / imageUrl 256, comment body 256, username 4 to 30, email 256, first/last name 30, song image 255.
  - New validator for `PUT /api/songs/:id` (it had none): fields are optional, but if sent they must be valid.
  - `POST /api/playlists/:id/songs` now requires `songId` to be a positive integer.
  - New `validateIdParam` in `utils/validation.js`, attached with `router.param('songId', validateIdParam)` (and `albumId`, `playlistId`, `commentId`, `artistId`). `router.param` runs automatically for every route in that router that has that URL param, so ids must be positive integers or you get a `400`.
- **Files:** `backend/utils/validation.js`, `backend/routes/api/songs.js`, `album.js`, `playlist.js`, `comment.js`, `artist.js`, `users.js`
- **How to verify** (all verified with curl; each returned `400` with a clear message in `errors`):
  - `POST /api/playlists` with `{"name":""}`, `{"name":"   "}` or a 31-character name.
  - `POST /api/songs/1/comments` with `{"body":""}`.
  - `GET /api/songs/abc`, `GET /api/artists/1x`.
  - As the owner: `PUT /api/songs/1` with `{"title":""}` or a 31-character title.
  - `POST /api/albums` with an empty `description`.
  - `POST /api/playlists/1/songs` with `{"songId":"abc"}`.
  - Valid requests still work (`201` for a new playlist, `200` adding song 5 to playlist 1). The server log shows only one `INSERT INTO Playlists` (the valid one), proving the handler no longer runs after a validation error.
- **Things to watch / follow-ups:**
  - Song list query params (`page`, `size`) are validated as part of S11.
  - Validation for the multipart routes (signup, create song) runs after multer has parsed the file. S8 adds file size/type limits.
  - `express-validator` 6 → 7 (S16) changes some APIs; these validators use only basic chain methods that exist in v7 too.

## S5 — Don't send the JWT in JSON responses
- **Problem:** Login and signup put the JWT into the response body (`user.dataValues.token = ...`), and `GET /api/my` did the same under `Token`. The JWT is already set as an `httpOnly` cookie, which exists precisely so that JavaScript (and therefore an XSS attack) **cannot** read it. Sending it in the JSON body undid that protection. `GET /api/my` also issued a brand-new token cookie on every page load.
- **What changed:**
  - Login (`POST /api/session/login`) and signup (`POST /api/users/signup`) still call `setTokenCookie(res, user)` but no longer add the token to the JSON.
  - `GET /api/my` is now read-only: it returns `{ currUser }` without a token and **does not** re-issue the cookie. Decision: no "sliding session". A session lasts `JWT_EXPIRES_IN` seconds after login/signup (for example 604800 = 7 days), then the user logs in again.
- **Files:** `backend/routes/api/session.js`, `backend/routes/api/users.js`, `backend/routes/api/my.js`
- **How to verify** (verified with curl):
  - `curl -i` the login request: the response has `Set-Cookie: token=...; HttpOnly` and the JSON body has only `id, username, email, firstName, lastName, previewImage` (no `token`).
  - `curl -i -b <cookie jar> /api/my`: JSON has no `Token`, and there is no `Set-Cookie` header.
  - The frontend never read `token`/`Token` (checked with grep), so the UI is unaffected; login and page refresh keep you logged in through the cookie.
- **Things to watch / follow-ups:** If you would rather have a sliding session (stay logged in while active), re-add `setTokenCookie(res, currUser)` in `GET /api/my` but **without** putting the token in the body. jsonwebtoken 8 → 9 is S15.

## S6 — Stop exposing users' emails publicly
- **Problem:** The Sequelize scope `includedArtist` (used by public, no-login endpoints) returned the user's `email`. Confirmed: `GET /api/artists/2` showed `loslonleyboys@user.io`. The same scope feeds `GET /api/artists`, `GET /api/songs/:id`, `GET /api/albums/:id` and `GET /api/playlists/:id`, so anyone could scrape every user's email. The playlist and album detail pages also printed the owner's email on screen.
- **What changed:**
  - `email` added to the excluded attributes of the `includedArtist` scope in the User model.
  - Removed the `{playlist.User.email}` line from the playlist page and the `{album.Artist.email}` line from the album page.
  - Your **own** email is still returned by `GET /api/my` and login/signup (the `currentUser` scope), and still shown on your own home page. That is fine because only you see it.
- **Files:** `backend/db/models/user.js`, `frontend/src/components/Playlists/DisplayPlaylistInfo.js`, `frontend/src/components/Albums/DisplayAlbumInfo.js`
- **How to verify** (verified with curl, logged out):
  - `curl http://localhost:5000/api/artists/2 | grep @` → no match (before the fix: 1 match).
  - Same for `/api/artists`, `/api/songs/1`, `/api/albums/1`, `/api/playlists/1`.
  - In the UI, open any album or playlist page: only the avatar and username are shown.
- **Things to watch / follow-ups:** The `currentUser` scope still includes email. It is used by `artist.js` routes only to look up the user before listing songs/albums/playlists (the user object itself is not returned), so nothing leaks today. If a future route returns that object directly, use `includedArtist` instead.

