# SoundHaze Change Log

This file explains every change made while working through `MODERNIZATION_PLAN.md`.
Each section matches one plan item (S1, S2, ...) and one git commit on the `modernize` branch.

## Database rule (read this before deploying)

- **Every deploy:** `npm run db:migrate` (adds new tables/columns, never deletes) and `npm run db:seed` (inserts the demo data **only into an empty database**; otherwise it prints "skipping" and does nothing).
- **Never in production:** `db:seed:undo`, `db:migrate:undo`, `npm run db:reset`, or truncating tables. These now refuse to run when `NODE_ENV=production`.
- **Never** `docker compose down -v` on the server: `-v` deletes the Postgres data volume, i.e. every real user, song and playlist. Plain `docker compose down` is fine.
- `npm run db:reset` is for your laptop only (drops all tables, migrates, re-seeds).

## Deviations from plan

- **S3 (song fields):** the plan's allow-list for songs was `title`, `description`. I also allowed `previewImage`, because the existing Update Song form lets the owner change the song's cover image and leaving it out would silently break that feature.
- **S3 (album/playlist image field name):** the frontend sends the new image as `imageUrl` (the create routes use that name too), not `previewImage`. The update routes now accept `imageUrl` as an alias that is saved into `previewImage`. (Correction made during S12: the Update Album / Update Playlist forms have no image picker today; they re-send the current image as `imageUrl`, so the alias simply keeps the image unchanged. It means an image picker can be added later without backend changes.)
- **S6 (album page):** the plan only named the playlist page, but the album detail page (`DisplayAlbumInfo.js`) also printed the artist's email. Removed it there too (it would have rendered empty after the API change anyway).
- **S9 (before S17):** the plan suggests doing S9 together with the helmet 5 → 8 upgrade (S17). S17 is not in this batch, so S9 was done on helmet 5. Two helmet-5-specific adjustments: `crossOriginEmbedderPolicy` is turned **off** (helmet 5 enables it by default and it would block S3 images/audio; helmet 7+ has it off by default), and the Content-Security-Policy was extended to allow the Font Awesome kit plus https images/audio. When S17 is done, re-check these options.
- **S9 (trust proxy):** `app.set('trust proxy', 1)` is applied **only in production**. In development there is no proxy, and trusting `X-Forwarded-For` there would let anyone fake their IP to dodge the rate limiter.
- **S9 (separate counters):** login and signup each have their **own** 10/min counter, so failed logins do not block signups (and vice versa).
- **S11 (frontend):** the plan lists `frontend/src/store/songs.js` as "later". Because the API now returns 20 songs by default and there are 100 seed songs, the Songs page and the song detail page (which looks songs up in the full list) would have lost songs. So `getSongs()` in the store now fetches page after page (100 per page) until it has them all. The UI behaves exactly as before; real paginated UI ("Load more") can come with the UI items (S33/S34).
- **S11 (invalid params):** instead of silently clamping bad values (the old code turned `page=-1` into `0`), invalid `page`/`size`/`createdAt` now return `400` with a clear message. Maximum `size` is 100.
- **S12 (more files than named):** the plan named the `.then(() => ..., history.push(...))` bug in `CreateSong` only. The exact same bug was in `UpdateSong`, `UpdateAlbum` and `CreateAlbum`, and a related one (`.then(dispatch(...))` plus reading the id from an empty Redux slice) in `DeleteAlbum`/`DeletePlaylist`, so those were fixed in the same commit.
- **Order of commits:** S13 was committed first (the plan's "Recommended order" says to do it first), then S1 to S12 in number order.

### Batch 2 deviations

- **S0 (new item; overlaps S37):** removing the fixed ids from the seeds is part of S37 in the plan. It was required for safe seeding, so it was done here. The rest of S37 (Jane Doe's broken image URL, dropping the `UNIQUE` on `Songs.title`/`url`, wider titles, `MEDIA_BASE_URL` seed URLs) is **not** done; the seed data is copied exactly as it was.
- **S0 (stricter skip rule):** the seeder skips if the demo user exists **or if the Users table has any rows at all** ("seed only into an empty DB"). If someone ever deleted the demo user from a live database, the seeder still would not pour demo data into it.
- **S0 (seeder bookkeeping):** `seederStorage` changed from `"sequelize"` (a `SequelizeData` table recording which seeders ran) to `"none"`. The demo seeder checks the data itself, so it can run on every deploy; with the old table, `db:reset` would have dropped the data but kept the "already seeded" record and skipped re-seeding.
- **S17:** the S9 note said to re-check the helmet options after the upgrade. Done: `crossOriginEmbedderPolicy: false` was removed because helmet 8 already has it off; the CSP and `crossOriginResourcePolicy` options are unchanged.
- **S19 (before S38/S46):** the plan lists S46 (API tests) and S38 (API-only server, which removes the catch-all route) as prerequisites. Neither is in this batch. Instead, the catch-all was converted to Express 5 syntax (`/{*splat}`), and the API was checked with the curl smoke/validation scripts plus a production-mode routing check (see S19). Two extra Express 5 fixes not named in the plan: an empty `req.body = {}` fallback (Express 5 leaves it `undefined`) and reading song-list query params with `matchedData()` (Express 5's `req.query` cannot be changed by sanitizers).
- **S20 (before S38):** the plan lists S38 as a prerequisite; it is not in this batch, so S20 was done on the current server (which still serves the build in production). The CSRF flow does not depend on who serves `index.html`, so it will keep working after S38.
- **S20 (token delivery):** instead of a JavaScript-readable `XSRF-TOKEN` cookie, `GET /api/csrf/restore` returns the token in its JSON body (`{ csrfToken }`) and the frontend keeps it in memory; only the httpOnly hash cookie is set. The header is now `X-CSRF-Token` (was `XSRF-Token`). `js-cookie` is no longer needed and was removed from the frontend.
- **S20 (extras):** the token is bound to the login cookie (csrf-csrf requires a "session identifier"), so the frontend fetches a new token after login/signup/logout, and `csrfFetch` retries a request **once** with a fresh token if the server answers "Invalid CSRF token" (e.g. after the login cookie expires). Restore responds `200` (was `201`).
- **S21 (test packages removed):** `@testing-library/*` were removed together with `react-scripts`, because `react-scripts test` was their only runner and there are no test files. Frontend tests come back with Vitest in S48. `"type": "module"` was added to `frontend/package.json` (Vite's config is ESM).
- **S21 (backend path):** the backend's production static-file path changed from `frontend/build` to `frontend/dist` in `backend/routes/index.js` (needed so `NODE_ENV=production` keeps serving the app until S38 removes that code).
- **S23 (before S48):** S48 (frontend tests) is listed as a prerequisite and is not in this batch. Instead, the built app was exercised in jsdom with a scripted tour (see S23). Lazy-loading routes with `React.lazy` (optional in the plan) was **not** done: the whole bundle is 88 KB gzipped, so splitting buys little.
- **S24 (scope):** only the required part was done: `configureStore` replaces `createStore` + thunk + logger. Converting each `store/*.js` file to `createSlice` (optional, "one file per follow-up commit" in the plan) and moving to React 19 (optional) were **not** done, to keep one commit per item and avoid an unverified React 19 jump (`react-h5-audio-player` compatibility is untested). `react-redux` was upgraded 8 → 9 (the version made for RTK 2 / Redux 5).
- **S24 (extra fix):** the albums reducer's `SHOW_ALBUM` case mutated the previous state (and crashed if `currentAlbum` was `null`). RTK's development check throws on mutations, so it was fixed in the same commit.

### Batch 3 deviations

- **S25 (plan said "depends on S37"):** S37 (Postgres-safe seeds) is not in this batch. The migration dedupes join rows itself, so it does not need it.
- **S26 (/api/my/library):** the plan marks the combined library endpoint as optional. Not done: it would change three store thunks and the Home page for a small saving on three small requests.
- **S27 (width/height):** the plan asks for `width`/`height` on every cover `<img>`. Done in S35 through one shared `Cover` component instead of editing every old component twice (they are rewritten there). `sharp` resizing (optional in the plan) **was** done.
- **S29 (depends on S43/S44):** neither exists yet, so only the parts that live in this repo's code were done (Express static serving, API `no-store`, S3 `CacheControl` on uploads). The deploy-script and CloudFront parts are left for S43/S44.

## Open questions for Tyler

1. **`GET /api/playlists` is now public (S2).** I treated the `/playlists` page as a public "browse all playlists" page, like `/albums`. If you meant it to show only *your* playlists, say so and it can call `GET /api/my/playlists` instead.
2. **S3 bucket public access (S8).** Uploads no longer set `ACL: public-read`. Does `soundcloud-bucket` still exist, and does it have a bucket policy that allows public `s3:GetObject`? If it relied on per-object ACLs, newly uploaded songs/images will return 403 until a bucket policy (or CloudFront, S43) is in place.
3. **Sliding sessions (S5).** `GET /api/my` no longer renews the login cookie, so users are logged out `JWT_EXPIRES_IN` seconds after logging in, even if active. OK, or do you want it to renew (without putting the token in the body)?
4. **Rate limit numbers (S9).** 10 requests/minute per IP for login and for signup. Good, or higher/lower?
5. **Default avatar (S7).** A plain grey silhouette (`frontend/public/default-avatar.svg`). Want a different image? Set `DEFAULT_AVATAR_URL` or replace the file.

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

## S7 — Make signup work without a profile image, and return honest errors
- **Problem:** `POST /api/users/signup` always called `singlePublicFileUpload(req.file)`. With no image, `req.file` is `undefined` and `awsS3.js` crashed while destructuring it. The `catch` block then turned **every** error into `403 "User already exists"`, so the real cause was hidden (confirmed: signup without an image said "User already exists" for a brand-new username).
- **What changed:**
  - The image is uploaded only if one was sent (`req.file ? upload : null`).
  - Users without an image get a default avatar: the User model's `previewImage` now has a getter that returns `DEFAULT_AVATAR_URL` when the stored value is empty. The default is `/default-avatar.svg`, a tiny grey placeholder added to `frontend/public/`, so the frontend serves it itself. You can override it with the `DEFAULT_AVATAR_URL` env var. The DB keeps `NULL`, so you can change the default later without touching rows.
  - Duplicate username or email (Sequelize `UniqueConstraintError`) now returns **409** with `errors: ["Username or email already taken."]` (the signup form already displays `errors`).
  - Every other error is passed on unchanged, so it becomes a 500 with the real message in the server log.
- **Files:** `backend/routes/api/users.js`, `backend/db/models/user.js`, `frontend/public/default-avatar.svg` (new)
- **How to verify** (verified with curl, multipart form like the real form sends):
  - `curl -F username=newuser1 -F email=new1@x.io -F password=secret1 ... /api/users/signup` (no image) → `200`, user created, `previewImage: "/default-avatar.svg"`, logged in (`GET /api/my` returns the new user).
  - Same username again with a different email → `409 "Username or email already taken."`. Same email with a different username → `409`.
  - Signup **with** an image needs real S3 access, so it was not tested here (see S8).
  - Demo login unaffected.
- **Things to watch / follow-ups:**
  - If the image upload succeeds but the user insert then fails (e.g. duplicate username), the uploaded image is left orphaned in S3. Rare and harmless; could be fixed later by checking for duplicates before uploading.
  - With the frontend on S3/CloudFront and the API elsewhere, `/default-avatar.svg` still resolves against the frontend's own domain, which is where the file lives.

## S8 — Harden uploads (limits, types, keys, ACL)
- **Problem:**
  - No file-size limits. multer's `memoryStorage` keeps the whole file in RAM, so one huge upload could exhaust the server's memory (and your S3 bill).
  - No file-type checks: any file could be uploaded as a "song" or "image".
  - Object keys were `Date.now()` + extension. Two uploads in the same millisecond get the same key, and the second silently overwrites the first.
  - Every upload set `ACL: "public-read"`. New S3 buckets have "Object Ownership: Bucket owner enforced" on by default, which **rejects** any upload that sets an ACL, so uploads would fail on a fresh bucket.
  - `express.json` / `urlencoded` accepted 50 MB bodies, though the API's JSON bodies are tiny.
  - Missing files caused crashes (500) instead of clear errors.
- **What changed** (`backend/awsS3.js` was reorganised around one `uploadToS3` helper):
  - Upload rules per kind: **audio** up to 20 MB, `audio/mpeg`, `audio/mp4`, `audio/x-m4a`; **image** up to 5 MB, `image/jpeg`, `image/png`, `image/webp`. `singleMulterUpload(field, kind)` now takes `"audio"` or `"image"` (default `"image"`). Also limits: 1 file per request, 20 text fields, 100 KB per field.
  - multer errors are translated into normal API errors: too big → **413** "File is too large. The limit is N MB."; wrong type → **415** "Unsupported file type. Please upload a ...".
  - Keys are now `audio/<uuid>.<ext>` or `images/<uuid>.<ext>` using `crypto.randomUUID()`. `ContentType` is set on the S3 object so browsers play/show it correctly.
  - `ACL: "public-read"` removed.
  - `POST /api/albums/:id/songs` returns **400** "Audio file is required." and `POST /api/images/upload` returns **400** "Image file is required." when no file is sent.
  - `express.json` and `express.urlencoded` limits lowered from 50 MB to 100 KB (larger bodies → **413**).
- **Files:** `backend/awsS3.js`, `backend/app.js`, `backend/routes/api/album.js`, `backend/routes/api/images.js`, `backend/routes/api/users.js`
- **How to verify** (verified with curl; S3 itself was not reachable from the sandbox):
  - `POST /api/images/upload` with no file → 400; with a `.txt` (`text/plain`) → 415; with a 6 MB PNG → 413.
  - As `Los Lonley Boys`: `POST /api/albums/1/songs` with no file → 400; with a PNG → 415; with a 21 MB MP3 → 413.
  - Signup with a `.txt` image → 415; signup without an image → 200.
  - A 200 KB JSON body to `POST /api/playlists` → 413.
  - A valid small PNG gets past all checks and reaches S3 (fails here with "Missing credentials", as expected without AWS keys).
  - Key format checked by stubbing `s3.upload` in Node: `audio/6b9c42fc-....mp3` and `images/9594....png`, no `ACL`, correct `ContentType`.
  - **Still to test with your real bucket:** upload a real MP3/M4A song and a JPEG/PNG image from the UI.
- **Things to watch / follow-ups:**
  - **Important:** without the ACL, new files are only publicly readable if the bucket has a bucket policy allowing public `s3:GetObject` (or, later, CloudFront in S43). If your existing `soundcloud-bucket` relied on per-object ACLs, new uploads will upload fine but return 403 when played until you add such a policy. See "Open questions".
  - The MIME type comes from the browser, so it is a guard against mistakes and casual abuse, not proof of the content. Some systems report MP3s as `audio/mp3`; if a real MP3 is rejected with 415, add `audio/mp3` to `UPLOAD_RULES.audio.mimeTypes`.
  - The frontend does not yet show these upload errors nicely or set `accept=` on file inputs (UI items S32/S33). AWS SDK v3 is S18.

## S9 — Full security headers and rate limiting
- **Problem:** Only one helmet header was enabled (`Cross-Origin-Resource-Policy`), so responses lacked HSTS, `X-Content-Type-Options: nosniff`, frame protection (clickjacking), `Referrer-Policy`, a Content-Security-Policy, etc. Login and signup had no rate limiting, so a script could guess passwords or create accounts as fast as the server could answer.
- **What changed:**
  - `helmet()` with its defaults, plus: `crossOriginResourcePolicy: cross-origin` (kept), `crossOriginEmbedderPolicy: false` (see Deviations), and a CSP based on helmet's defaults that also allows `https://kit.fontawesome.com` scripts, `https://ka-f.fontawesome.com` connections, and images/audio/fonts from any `https:` URL (S3) plus `data:`/`blob:`.
  - New `backend/utils/rateLimit.js` using the `express-rate-limit` package (v8): **10 requests per minute per IP**, separately for `POST /api/session/login` and `POST /api/users/signup`. Over the limit → `429` with `errors: ["Too many attempts. Please wait a minute and try again."]` (same JSON shape as other errors, so the forms can display it). Standard `RateLimit` headers are sent.
  - `app.set('trust proxy', 1)` in production, so `req.ip` is the real client IP behind CloudFront/a load balancer (one proxy hop).
- **Files:** `backend/app.js`, `backend/utils/rateLimit.js` (new), `backend/routes/api/session.js`, `backend/routes/api/users.js`, `backend/package.json`, `backend/package-lock.json`
- **How to verify** (verified with curl):
  - `curl -I http://localhost:5000/api/songs/1` shows `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: no-referrer`, `Content-Security-Policy: ...`, and **no** `Cross-Origin-Embedder-Policy`.
  - Send 11 wrong-password logins within a minute: the first 10 → `401`, the 11th → `429`. A correct password during that minute is also `429` (the limit counts all attempts). Signup from the same IP still works (`200`), since it has its own counter.
  - Wait a minute (or restart the server; counters are in memory) and login works again.
- **Things to watch / follow-ups:**
  - **Not tested in a browser:** the CSP only affects the HTML page Express serves in production mode (`NODE_ENV=production`, which needs Postgres, so it was not run here). After deploying, open the browser dev-tools console and look for "Refused to load ... Content-Security-Policy" messages. If something is blocked, add its origin to the matching directive in `app.js`. Once the frontend moves to S3/CloudFront (S21/S43), its CSP should be set there instead.
  - The demo-login button counts toward the login limit (10/min per IP). Fine for real users; if a whole classroom shares one IP, raise the limit.
  - Counters live in memory: they reset on restart and are not shared between multiple server processes. For more than one server, use a shared store (e.g. Redis).
  - Revisit options when upgrading helmet (S17).

## S10 — Let users comment on any song
- **Problem:** `POST /api/songs/:songId/comments` looked the song up with `where: { id: songId, userId: user.id }`, so you could only comment on **your own** songs; on anyone else's song you got "Song couldn't be found." A logic bug (copied from the delete route).
- **What changed:** The lookup is now `Song.findByPk(songId)`. Any logged-in user can comment on any existing song. Editing/deleting a comment is still limited to its author (unchanged, in `comment.js`).
- **Files:** `backend/routes/api/songs.js`
- **How to verify** (verified with curl):
  - As the demo user, `POST /api/songs/1/comments` (song 1 belongs to user 2) with `{"body":"Great track!"}` → `200` with the new comment (`userId: 1`, `songId: 1`).
  - `POST /api/songs/999/comments` → `404 "Song couldn't be found."`.
  - Logged out → `401`.
- **Things to watch / follow-ups:** There is still no comments UI in the frontend; S34 adds one.

## S11 — Fix song list pagination
- **Problem:** `GET /api/songs` pagination was broken in several ways:
  - `parseInt(page)` was called but its result thrown away, so `page`/`size` stayed strings.
  - Pages effectively started at 0: `?page=0` produced `OFFSET -20`, which Postgres rejects (500). SQLite tolerates it, which hid the bug locally.
  - When filtering by `title` or `createdAt`, `limit`/`offset` were nested under a `pagination` key that Sequelize ignores, so filters returned everything.
  - In the last branch `where` was spread into the options object itself (`{...where}` instead of `{ where }`), so filters were ignored there.
  - With no params it returned every song.
- **What changed:**
  - Query params are validated with express-validator `query()`: `page` integer ≥ 1 (default 1), `size` integer 1 to 100 (default 20), `title` string ≤ 30, `createdAt` ISO date. Invalid values → `400`.
  - One code path: `Song.findAndCountAll({ where, order: [['id','ASC']], limit: size, offset: (page - 1) * size })`. The stable `ORDER BY id` keeps pages from overlapping.
  - Response is always `{ Songs, page, size, total }` (`total` = number of songs matching the filters).
  - Frontend `getSongs()` loops through pages so the UI still gets the full list (see Deviations).
- **Files:** `backend/routes/api/songs.js`, `frontend/src/store/songs.js`
- **How to verify** (verified with curl against the 100 seed songs):
  - `GET /api/songs` → 20 songs, `page: 1, size: 20, total: 100`.
  - `?page=2&size=5` → ids 6 to 10.
  - `?page=0`, `?page=abc`, `?size=0`, `?size=101`, `?createdAt=notadate` → `400` with a message.
  - `?title=My%20Way` → 1 song, `total: 1`; `?title=My%20Way&page=2` → 0 songs (pagination now applies to filters).
  - `?page=1&size=100` → all 100; `?page=2&size=100` → empty.
  - UI: the Songs page still lists every song (frontend build verified after S12).
- **Things to watch / follow-ups:**
  - This is a small API shape change: `page`, `size` and `total` are now always present, and `page` starts at 1.
  - `title` is an exact match and `createdAt` must equal the exact timestamp (both unchanged from before). A "search" feature would use `LIKE`/`ILIKE` and a date range.
  - Fetching all songs in a loop is fine for hundreds of songs; with thousands, switch the UI to real pagination.

## S12 — Fix frontend crashes and stale pages
- **Problem:**
  - Opening `/albums/:id` or `/playlists/:id` while **logged out** crashed the page: `checkValidation` read `user.id` while `user` was `null` ("Cannot read properties of null").
  - The album and playlist detail pages used `useEffect(..., [])`, so going from one album to another (same component, new URL) never refetched. The page stayed blank or stale until a refresh.
  - `CreateSong` (and `UpdateSong`, `UpdateAlbum`, `CreateAlbum`) did `.then(() => setShowModal(false), history.push('/songs'))`. The second argument of `.then()` is the **error** handler slot, and `history.push(...)` is evaluated immediately, so the app navigated away even when the request failed. `CreateSong` also cleared the errors right after the `catch`.
  - Error messages were never shown: `csrfFetch` throws the raw `Response`, and the forms checked `response.errors`, which does not exist on a `Response` (you have to `await response.json()` first).
  - `DeleteAlbum` and `DeletePlaylist` read the id from `currentAlbum`/`currentPlaylist` in Redux, which is empty on the `/albums` and `/playlists` list pages, so deleting from the list page crashed. They also had the same `.then(dispatch(...))` bug (runs immediately, not after the delete).
- **What changed:**
  - `user.id` → `user?.id` in `DisplayAlbumInfo`, `DisplayPlaylistInfo`, `Albums`, `Playlists` (optional chaining: gives `undefined` instead of crashing when `user` is `null`, so owner-only buttons are simply hidden).
  - `useEffect` dependency arrays are now `[dispatch, albumId]` / `[dispatch, playlistId]`.
  - New helper `getErrorMessages(res)` in `frontend/src/store/csrf.js`: reads the JSON body of a failed response and returns `errors` (or `message`, or a generic fallback; also handles network errors).
  - `CreateSong`, `UpdateSong`, `CreateAlbum`, `UpdateAlbum` now use `try { await dispatch(...); close modal; navigate } catch (res) { setErrors(await getErrorMessages(res)) }`, so the modal only closes on success and the server's message is shown on failure. `CreatePlaylist`/`UpdatePlaylist` already chained correctly; they now use `getErrorMessages` too.
  - `DeleteAlbum`/`DeletePlaylist` use the id from props, `await` the delete, then refresh/navigate, and show an alert with the server message if the delete fails. (`DeletePlaylist` no longer refetches all songs; deleting a playlist does not change songs.)
- **Files:** `frontend/src/store/csrf.js`, `frontend/src/components/Albums/{Albums,DisplayAlbumInfo,DeleteAlbum}.js`, `frontend/src/components/Playlists/{Playlists,DisplayPlaylistInfo,DeletePlaylist,UpdatePlaylist}.js`, `frontend/src/components/CreateSong/CreateSong.js`, `frontend/src/components/UpdateSong/UpdateSong.js`, `frontend/src/components/CreateAlbum/CreateAlbum.js`, `frontend/src/components/UpdateAlbum/UpdateAlbum.js`, `frontend/src/components/CreatePlaylist/CreatePlaylist.js`
- **How to verify:**
  - `cd frontend && npm run build` → compiles (verified; only warnings that already existed, none from these files' changes).
  - **Manual browser checks (not run here; no browser was available to this session):**
    1. Log out, open `/albums/1` and `/playlists/1` directly: the page renders, without edit/delete buttons.
    2. On an album page, use the browser's address bar to go from `/albums/1` to `/albums/2`: the content switches.
    3. Log in as demo, open "Create Song", submit with no audio file: the modal stays open and shows "Audio file is required." (from S8).
    4. Create a playlist with a 31-character name (bypass the input in dev tools, or use a long name): the form shows "Playlist name must be 30 characters or less.".
    5. On `/albums`, delete one of your albums from the list: no crash; it disappears.
- **Things to watch / follow-ups:**
  - Remaining lint warnings (missing `alt`, unused vars, `useEffect` deps in `App.js`/`HomePage.js`) are pre-existing and belong to S32/S47.
  - Frontend tests (S48) and an end-to-end smoke test (S50) would catch regressions like these automatically.

---

# Batch 2: modern stack (S0, S14 to S24)


## S0 — Safe seeding
_New item (not in the original plan), done first at Tyler's request._
- **Problem:** The old Render deploy ran `db:seed:undo:all` and then `db:seed:all` on **every deploy**, which deleted every real user, song and playlist and replaced them with the demo data. The seeders also inserted fixed ids (`id: 1` ... `id: 7`). On Postgres that does not move the auto-increment counter, so the first real signup after seeding tries `id = 1` and fails with a unique-key error. Nothing stopped an undo from running against production.
- **What changed:**
  - The 7 old seeder files were replaced by **one** seeder, `db/seeders/20261123000000-demo-data.js`, plus a plain data file `db/seed-data.js` (generated from the old seeders by a script, so the content is identical: 7 users, 7 albums, 100 songs, 15 playlists with 151 playlist entries, 2 comments).
  - **Idempotent:** the seeder first checks the Users table. If the demo user `Demo-lition` exists, or there are any users at all, it prints a "skipping" message and inserts nothing. Running it twice is harmless.
  - **No fixed ids:** relationships in `seed-data.js` use names (album `owner: "Los Lonley Boys"`, song `album: "Sacred"`, playlist `songs: ["My Way", ...]`). The seeder inserts users, looks up their new ids by username, then albums (looked up by title), songs (by title), playlists (by name), playlist songs and comments. The database picks every id, so Postgres counters stay correct.
  - **All-or-nothing:** everything runs in one transaction.
  - **Production guard:** new `db/safety.js` with `assertNotProduction(action)`. The seeder's `down` and every migration's `down` call it, so `sequelize db:seed:undo` / `db:migrate:undo` throw "Refusing to ... because NODE_ENV=production" instead of deleting data. `scripts/assert-not-production.js` does the same check from the command line.
  - **npm scripts** (in `backend/`, with the same names forwarded from the repo root):
    - `npm run db:migrate`: safe every deploy.
    - `npm run db:seed`: safe every deploy; no-ops when data exists.
    - `npm run db:reset`: development only. Refuses in production, otherwise undoes all migrations (drops the tables), migrates and seeds again.
  - `config/database.js` now loads `backend/.env` itself (`require('dotenv').config()`), so these scripts work without `npx dotenv`. `seederStorage` is now `"none"` (see Deviations).
- **The rule:** migrate on every deploy; seed only into an empty database (the seeder enforces this); never undo or truncate in production; never `docker compose down -v` (it deletes the database volume). See "Database rule" at the top of this file.
- **Files:** `backend/db/seeders/20261123000000-demo-data.js` (new), `backend/db/seed-data.js` (new), `backend/db/safety.js` (new), `backend/scripts/assert-not-production.js` (new), `backend/db/seeders/2022*.js` (7 files deleted), `backend/db/migrations/*.js` (guard line in each `down`), `backend/config/database.js`, `backend/package.json`, `package.json`
- **How to verify** (all verified on SQLite):
  1. Delete the dev DB, then `npm run db:migrate` and `npm run db:seed` → "Demo seed data inserted." Counts: Users 7, Albums 7, Songs 100, Playlists 15, PlaylistSongs 151, Comments 2. Ids and relations match the old seeds (song 1 "My Way" → album 1 "Sacred" → user 2; playlist 1 starts with songs 1, 2, 14).
  2. `npm run db:seed` again → `Demo user "Demo-lition" already exists: skipping demo seed data.` and the counts do not change.
  3. `npm run db:reset` → tables dropped, recreated, re-seeded (7 users).
  4. `NODE_ENV=production npm run db:reset` → "Refusing to reset the database because NODE_ENV=production..." and exit code 1. Calling the seeder's or a migration's `down` with `NODE_ENV=production` throws the same kind of error.
  5. Demo login (`Demo-lition` / `password`) and the usual API checks still pass.
- **Things to watch / follow-ups:**
  - **Existing databases** (for example the old Render Postgres) that were seeded by the old files: the new seeder sees the users and does nothing. Nothing is deleted. Their `SequelizeData` table is now simply unused.
  - Any **future seeder must also be idempotent** (check before inserting), because with `seederStorage: "none"` every `db:seed` runs every seeder file.
  - If you add a seed song whose title already exists, the lookup by title would be ambiguous; the seeder fails loudly ("Seed lookup failed") rather than guessing. Titles are unique today (the DB enforces it).
  - The production config still needs `DATABASE_URL` and forces SSL; making that configurable is S36.

## S14 — Safe backend upgrades within the same major versions
- **Problem:** Old patch/minor versions with known advisories (the critical one was in `sequelize` 6.21). `nodemon` and `per-env` were extra packages for things Node 22 and plain npm scripts already do.
- **What changed:**
  - Upgraded (same major version, no API changes): `sequelize` 6.21 → 6.37.8, `sequelize-cli` 6.4 → 6.6.5, `pg` 8.7 → 8.23, `dotenv` 16.0 → 16.6 (kept on 16; 17+ prints a banner on every start), `morgan` 1.10 → 1.12, `cookie-parser` 1.4.6 → 1.4.7, `sqlite3` 5.0.8 → 5.1.7 (dev only; kept, since the walkthrough and tests use it).
  - Removed `nodemon` (replaced by `node --watch`, built into Node 22) and `per-env`.
  - New scripts in `backend/package.json`: `npm start` = `node ./bin/www` (always, any environment), `npm run dev` = `node --watch ./bin/www` (restarts when a file changes). The root `dev:backend` script now runs `npm run dev` in `backend/`.
- **Files:** `backend/package.json`, `backend/package-lock.json`, `package.json`
- **How to verify** (verified): fresh SQLite DB → `npm run db:migrate`, `npm run db:seed` (and a second `db:seed` no-ops) → `npm start` → CSRF restore, demo login, `/api/my`, songs list (20 of 100), 400/403/404 checks, playlist create, comment, logout all behave as before. `npm run dev` starts and serves requests.
- **Things to watch / follow-ups:**
  - **Changed command:** `start:development` / `start:production` are gone. Use `npm run dev` locally and `npm start` in production (set `NODE_ENV=production` in the environment, as before).
  - `node --watch` restarts on changes to files the app `require`s; it does not watch `.env`. Restart by hand after editing `.env`.
  - `@faker-js/faker` (dev dependency) is not used anywhere; it can be removed in a cleanup item.

## S15 — jsonwebtoken 8 to 9
- **Problem:** `jsonwebtoken` 8 has known vulnerabilities (fixed in 9). A missing `JWT_SECRET` only showed up as a crash at the first login. `JWT_EXPIRES_IN` was used as a string in one place (`expiresIn * 1000`, which only worked through JavaScript's automatic string-to-number conversion) and with `parseInt` in another.
- **What changed:**
  - `jsonwebtoken` upgraded to `^9.0.3`.
  - `utils/auth.js` checks the config once at startup: no `JWT_SECRET` → the server refuses to start with "JWT_SECRET is not set..."; `JWT_EXPIRES_IN` must be a whole number of seconds, otherwise "JWT_EXPIRES_IN must be a whole number of seconds (got "7d")". If `JWT_EXPIRES_IN` is not set at all it defaults to `604800` (7 days) in `config/index.js`.
  - `expiresIn` is converted to a number once and used for both the token (`expiresIn` seconds) and the cookie (`maxAge` = seconds × 1000 ms).
  - `jwt.verify` now only accepts `HS256` (the algorithm the app signs with) and is skipped when there is no `token` cookie.
- **Files:** `backend/utils/auth.js`, `backend/config/index.js`, `backend/package.json`, `backend/package-lock.json`
- **How to verify** (verified):
  - Normal flow: the usual curl checks pass; the login response has `Set-Cookie: token=...; Max-Age=604800; HttpOnly`.
  - `JWT_SECRET= node -e 'require("./app")'` → throws "JWT_SECRET is not set...". `JWT_EXPIRES_IN=7d` → throws the "whole number of seconds" error.
  - A forged token using `"alg":"none"` in the cookie → `GET /api/my` returns `{}` (not logged in).
- **Things to watch / follow-ups:**
  - Values like `7d` used to "work" for the JWT part only by accident (and broke the cookie's `maxAge`). Use seconds, e.g. `JWT_EXPIRES_IN=604800`.
  - Existing login cookies stay valid across the upgrade (same algorithm and secret).

## S16 — express-validator 6 to 7, and multer 1 to 2
- **Problem:** `multer` 1.x has denial-of-service advisories (malformed multipart requests could crash or hang the server). `express-validator` 6 is no longer maintained.
- **What changed:**
  - `express-validator` `^6.14.2` → `^7.3.2`, `multer` `^1.4.5-lts.1` → `^2.5.0`.
  - No code changes were needed for the upgrade itself: the validators only use `check()`/`query()` chains (`exists`, `isString`, `trim`, `notEmpty`, `isLength`, `isInt`, `toInt`, `isISO8601`, `optional`, `withMessage`), which work the same in v7, and `handleValidationErrors` only reads `error.msg` (v7 renamed `error.param` to `error.path`, which we do not use). multer 2 keeps the same API (`memoryStorage`, `limits`, `fileFilter`, `MulterError` codes).
  - One `.withMessage` placement fix (the plan's warning): the login validator had `.exists().notEmpty().withMessage(...)`, so an empty credential produced an extra generic "Invalid value" message from `exists()`. It is now `.exists({ checkFalsy: true }).withMessage(...)`.
- **Files:** `backend/routes/api/session.js`, `backend/package.json`, `backend/package-lock.json`
- **How to verify** (verified with curl; same results as Batch 1):
  - Validation: empty/whitespace/31-char playlist name, empty comment, `songId: "abc"`, `?page=0`, `?size=101`, `?createdAt=notadate`, empty album description → `400` with the same messages as before. `?page=2&size=5` → ids 6 to 10 (`page`/`size` are numbers, so `toInt()` still works). Empty login → `["Please provide a valid email or username.", "Please provide a password."]`.
  - Uploads: no file → `400`, `.txt` → `415`, 6 MB PNG → `413`, small PNG reaches the S3 call (fails only for lack of AWS credentials), signup without image → `200`, signup with `.txt` → `415`, PNG as a song → `415`, no audio → `400`.
- **Things to watch / follow-ups:** Several chains start with `.isString()` without a message, so sending a number instead of a string shows "Invalid value". Harmless (pre-existing); messages can be added in the lint/tests items.

## S17 — helmet 5 to 8
- **Problem:** helmet 5 is three major versions old. It still sent the obsolete `Expect-CT` header and needed a manual override to keep COEP off.
- **What changed:**
  - `helmet` `^5.1.0` → `^8.3.0`.
  - Removed `crossOriginEmbedderPolicy: false` from `app.js` (helmet 7+ leaves COEP off by default; a comment explains why it must stay off). The CSP directives and `crossOriginResourcePolicy: cross-origin` from S9 are unchanged.
  - Header differences after the upgrade: `Expect-CT` is gone (browsers dropped it), HSTS `max-age` is now 1 year (was 180 days), `Origin-Agent-Cluster: ?1` and `X-XSS-Protection: 0` are sent, and the CSP gains `upgrade-insecure-requests` by default.
- **Files:** `backend/app.js`, `backend/package.json`, `backend/package-lock.json`
- **How to verify** (verified): `curl -I http://localhost:5000/api/songs/1` shows `Content-Security-Policy` (with the Font Awesome and `https:` media rules), `Strict-Transport-Security: max-age=31536000; includeSubDomains`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Cross-Origin-Resource-Policy: cross-origin`, and **no** `Cross-Origin-Embedder-Policy` or `Expect-CT`. All curl smoke and validation checks pass.
- **Things to watch / follow-ups:**
  - `upgrade-insecure-requests` tells browsers to load `http://` images/audio over `https://`. All seed media is `https://` already; a media URL that only works over plain HTTP would break in the Express-served build.
  - The CSP still only matters for pages Express serves (production mode). Once the frontend lives on S3/CloudFront, set the CSP there (S43).

## S18 — AWS SDK v2 to v3, with config from env vars and no access keys
- **Problem:** `aws-sdk` v2 reached end of support in September 2025 and is one huge package. The bucket name was hard-coded (`"soundcloud-bucket"`), the URL saved in the database was whatever S3 returned (so it could not point at CloudFront later), and the comments told you to put access keys in env vars. There were also unused "private upload" and signed-URL helpers.
- **What changed:**
  - `aws-sdk` removed; `@aws-sdk/client-s3` and `@aws-sdk/lib-storage` added. `awsS3.js` creates one `S3Client` and uploads with lib-storage's `Upload` (which automatically switches to a multipart upload for big files).
  - New settings in `config/index.js` (`config.s3`), all optional:
    - `S3_BUCKET` (default `soundcloud-bucket`)
    - `AWS_REGION` (default `us-west-2`)
    - `MEDIA_BASE_URL` (default `https://<bucket>.s3.<region>.amazonaws.com`): the prefix of the URL saved in the database for each upload. Later this becomes the CloudFront address, e.g. `https://xxxx.cloudfront.net/media`.
  - The saved URL is now `MEDIA_BASE_URL + "/" + key` (for example `.../audio/<uuid>.mp3`), built by the new `publicUrlFor(key)`.
  - **No access keys in code or config.** The SDK's default credential chain finds credentials itself: the EC2 instance's IAM role in production, `aws configure`/`AWS_PROFILE` on your laptop, or `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` if you still set them.
  - Removed `singlePrivateFileUpload`, `multiplePrivateFileUpload` and `retrievePrivateFile` (never used). The S8 upload rules (sizes, types, UUID keys, no ACL, `ContentType`) are unchanged.
- **Files:** `backend/awsS3.js`, `backend/config/index.js`, `backend/package.json`, `backend/package-lock.json`
- **How to verify** (verified with a stubbed S3 client, since this sandbox has no AWS access):
  - Stubbing `s3.send` and uploading `My Song.MP3` → one `PutObjectCommand` with `Bucket: "soundcloud-bucket"`, `Key: "audio/<uuid>.mp3"`, `ContentType: "audio/mpeg"`, no ACL; returned URL `https://soundcloud-bucket.s3.us-west-2.amazonaws.com/audio/<uuid>.mp3`.
  - With `MEDIA_BASE_URL=https://d123.cloudfront.net/media/` → `https://d123.cloudfront.net/media/images/<uuid>.png` (trailing slash handled).
  - `S3_BUCKET=other AWS_REGION=us-east-1` → base URL `https://other.s3.us-east-1.amazonaws.com`.
  - Running server without credentials: a valid upload passes all checks and fails with "Could not load credentials from any providers" (500), as expected. All other curl checks pass.
  - **Still to test with your real bucket:** upload a song and an image from the UI with your AWS profile (`AWS_PROFILE=... npm run dev`).
- **Things to watch / follow-ups:**
  - `AWS_REGION` is now read by our config as well as by the SDK. If your bucket is not in `us-west-2`, set it.
  - When CloudFront serves uploads under `/media/*` (S43), `MEDIA_BASE_URL` must be set to that prefix and CloudFront's origin path must strip `/media`, otherwise new URLs 404. Existing database rows keep their old full S3 URLs.
  - The seed data still uses hard-coded `https://soundcloud-bucket...` URLs (building them from `MEDIA_BASE_URL` is S37).

## S19 — Express 4 to 5
- **Problem:** Express 4 is in maintenance mode and pulled in `path-to-regexp`/`body-parser` versions with advisories. The app needed the `express-async-errors` monkey-patch to catch errors in `async` handlers. Two handlers misused the response object: `comment.js` did `res.status = 200` (overwrites the `status` *function* with a number) and `artist.js` called `res.message(...)`, which does not exist.
- **What changed:**
  - `express` `^4.18.1` → `^5.3.0`; `express-async-errors` removed. Express 5 sends a rejected promise from any route handler to the error handler by itself.
  - `routes/index.js`: the production catch-all `router.get(/^(?!\/?api).*/, ...)` became `router.get('/{*splat}', ...)` (Express 5's wildcard syntax), which skips paths starting with `/api` so unknown API routes still get the JSON 404.
  - `comment.js`: `res.status = 200; res.json(...)` → `res.status(200).json(...)`.
  - `artist.js` `GET /api/artists`: removed the dead `res.message`/`next(res)` branch (`findAll` always returns an array).
  - `app.js`: after the body parsers, `req.body` defaults to `{}`. Express 5 leaves it `undefined` when no parser ran (e.g. a `PUT` with no body), and several handlers destructure it, which would have turned a 400 into a 500.
  - `songs.js` `GET /api/songs`: reads `page`, `size`, `title`, `createdAt` via express-validator's `matchedData()` instead of `req.query`. In Express 5 `req.query` is re-parsed on each access, so the `toInt()` sanitizers can no longer change it in place; `matchedData()` returns the sanitized numbers.
- **Files:** `backend/app.js`, `backend/routes/index.js`, `backend/routes/api/comment.js`, `backend/routes/api/artist.js`, `backend/routes/api/songs.js`, `backend/package.json`, `backend/package-lock.json`
- **How to verify** (verified):
  - Full curl smoke and validation scripts: same results as before (`?page=2&size=5` returns ids 6 to 10 and `page`/`size` as numbers).
  - Async errors: `POST /api/playlists` with `{"name":"x"}` (no image) throws a Sequelize `notNull` error inside an async handler → JSON error response, and the server keeps running.
  - `PUT /api/albums/1` with no body → `400` with validation messages (not 500). Malformed JSON → `400`.
  - `DELETE /api/comments/2` (by its author) → `200 {"message":"Successfully deleted"}`. `GET /api/artists` → list.
  - Production routing (run with `NODE_ENV=production` and a dummy `DATABASE_URL`, routes that need no DB): `/` and `/albums/3` → `index.html` with the `XSRF-TOKEN` cookie; `/manifest.json` → the static file; `/api/nope` and `/api` → JSON 404.
- **Things to watch / follow-ups:**
  - Express 5 route syntax differs: `*` must be named (`/*splat` or `/{*splat}`), optional parts use braces (`/:id{.:ext}`), and regex characters in strings are not allowed. Keep this in mind when adding routes.
  - Several route files still have an unused circular `require('../../app')` at the top (noted in S2). Harmless; remove in the lint item (S47).

## S20 — Replace `csurf` and make CSRF work with the frontend on S3
- **Problem:** `csurf` is deprecated and archived. Worse, in production the CSRF cookie was only set when Express served `index.html`, and `/api/csrf/restore` existed only in development. Once the React build is served by S3/CloudFront, Express never serves `index.html`, so the browser would never get a token and **every** POST/PUT/DELETE (including the demo login) would fail with 403.
- **What changed (backend):**
  - `csurf` removed; `csrf-csrf` (v4) added. New `backend/utils/csrf.js` sets it up with the "double-submit" pattern:
    - `GET /api/csrf/restore` (now in **every** environment, registered in `routes/index.js`) returns `{ csrfToken }`, sets an httpOnly cookie holding a matching HMAC hash, and sends `Cache-Control: no-store`.
    - Every POST/PUT/PATCH/DELETE must send the token in the `X-CSRF-Token` header. Missing or wrong → `403` with `title: "Invalid CSRF token"` and the usual `errors` array.
    - Cookie: `soundhaze.x-csrf-token` in development; `__Host-soundhaze.x-csrf-token` with `Secure` in production (the `__Host-` prefix makes browsers reject the cookie unless it is Secure, `Path=/` and has no `Domain`). Always `SameSite=Lax`, `HttpOnly`.
    - The token is tied to the login cookie (`token`), or to "anonymous" when logged out, so a token taken before login stops working after login.
    - Secret: `CSRF_SECRET` if set, otherwise a separate key derived from `JWT_SECRET` (no new required env var).
  - `routes/index.js`: the production `index.html` routes no longer set an `XSRF-TOKEN` cookie.
- **What changed (frontend):**
  - `store/csrf.js`: `restoreCSRF()` fetches the token and keeps it in memory; `csrfFetch` sends it as `X-CSRF-Token`, fetches one first if it has none, and retries once with a fresh token if the server says "Invalid CSRF token".
  - `index.js`: `restoreCSRF()` runs on startup in every environment (the debug `window.*` helpers stay dev-only).
  - `store/session.js`: after a successful login, signup or logout, a new token is fetched.
  - `js-cookie` removed from `frontend/package.json`.
- **Why this works on S3/CloudFront:** with `/api/*` routed through the same CloudFront domain, the API is same-origin, so the `SameSite=Lax` cookies are sent and the app gets its token from `/api/csrf/restore` no matter who served `index.html`.
- **Files:** `backend/utils/csrf.js` (new), `backend/app.js`, `backend/routes/index.js`, `backend/config/index.js`, `backend/package.json`, `backend/package-lock.json`, `frontend/src/store/csrf.js`, `frontend/src/store/session.js`, `frontend/src/index.js`, `frontend/package.json`, `frontend/package-lock.json`
- **How to verify** (verified):
  - curl: `GET /api/csrf/restore` → `200 {"csrfToken":"..."}` + cookie. Login with the token → `200`. A POST with the **pre-login** token after logging in → `403`. With a fresh token → `201`. Forged token `abc|def` → `403`. No token → `403`. Logout → `200`. All validation/upload checks pass.
  - Production mode (`NODE_ENV=production`, dummy `DATABASE_URL`): restore sets `__Host-soundhaze.x-csrf-token=...; Path=/; HttpOnly; Secure; SameSite=Lax`; a POST with that token passes the CSRF check (gets `401 Authentication required`, as expected without login); `GET /` serves `index.html` without setting any cookie.
  - The real `frontend/src/store/csrf.js`, run in Node against the backend with a cookie jar: login without a prior restore (fetches a token itself) → 200; POST right after login without restore → 403, automatic restore, retry → 201 (3 requests); after restore → 201 in 1 request; validation errors still reach `getErrorMessages`; multipart signup → 200; logout → 200.
  - `npm run build` (frontend) succeeds.
  - **Not tested in a real browser** (none available to this session): log in with the Demo button, create a playlist, log out, log in again.
- **Things to watch / follow-ups:**
  - Anything that calls the API outside `csrfFetch` (curl, Postman, a future mobile app) must first `GET /api/csrf/restore` with a cookie jar and send `X-CSRF-Token`.
  - In production the CSRF cookie requires HTTPS (`Secure`). Behind CloudFront that is the case; testing a production build over plain `http://` will fail with 403.

## S21 — Create React App to Vite
- **Problem:** Create React App (`react-scripts`) was officially deprecated in February 2025 and caused about 75 of the 79 frontend `npm audit` findings. It is also slow to start and build.
- **What changed:**
  - Removed `react-scripts` (and the `@testing-library/*` packages that only ran under it). Added `vite` 8 and `@vitejs/plugin-react` 6 as dev dependencies.
  - New `frontend/vite.config.js`: React plugin; dev server on port **3000** with `server.proxy` sending `/api` to the backend (replaces CRA's `"proxy"` field); build output folder **`dist/`**.
  - The proxy target can be changed with `VITE_BACKEND_URL` (e.g. in `frontend/.env.local`); default `http://localhost:5000`.
  - `public/index.html` moved to `frontend/index.html` (Vite's entry point), `%PUBLIC_URL%` removed, and `<script type="module" src="/src/index.jsx">` added. Files in `public/` (manifest, `default-avatar.svg`, `images/`) are still copied as-is.
  - The 40 `.js` files that contain JSX were renamed to `.jsx` (found by parsing every file; plain modules such as `store/*.js` and the `components/*/index.js` re-export files stay `.js`). Imports did not need to change.
  - `process.env.NODE_ENV` → `import.meta.env.DEV` (`src/index.jsx`) and `import.meta.env.PROD` (`src/store/index.js`). `require('redux-logger')` (CommonJS, not allowed by Vite) became a normal `import` (removed entirely in S24). No `REACT_APP_*` variables existed.
  - `frontend/package.json`: scripts `dev` / `start` (both run `vite`), `build` (`vite build`), `preview` (serves `dist/` locally); `"type": "module"`; removed the CRA-only `eslintConfig`, `browserslist` and `proxy` fields. The root `dev:frontend` script now runs `npm run dev`.
  - Backend: production static files are served from `frontend/dist` (was `frontend/build`). `.gitignore` ignores `dist`.
- **Files:** `frontend/package.json`, `frontend/package-lock.json`, `frontend/vite.config.js` (new), `frontend/index.html` (moved from `public/`), 40 renames `frontend/src/**/*.js` → `*.jsx`, `frontend/src/index.jsx`, `frontend/src/store/index.js`, `backend/routes/index.js`, `package.json`, `.gitignore`
- **How to verify** (verified):
  - `cd frontend && npm run build` → `dist/index.html`, `dist/assets/index-*.js` (81 KB gzipped, was 83 KB with CRA), CSS 2.2 KB gzipped; built in under a second.
  - Dev server (`npm run dev`) with the backend running: `/` returns the page with the `src/index.jsx` module, `/src/App.jsx` compiles, and through the proxy `GET /api/csrf/restore`, demo login and `GET /api/my` (returns `Demo-lition`) work, so cookies flow through the proxy. `/albums/1` returns the app (SPA fallback).
  - Production mode backend serves `dist/index.html` at `/` and `/songs`, the hashed JS from `/assets/`, and `/default-avatar.svg`; `/api/nope` stays a JSON 404.
  - **Not tested in a real browser** (no browser in this session): open http://localhost:3000, click Demo, browse songs/albums/playlists, play a song.
- **Things to watch / follow-ups:**
  - **New commands:** `npm run dev` (or `npm start`) in `frontend/` starts Vite on http://localhost:3000. The build is in `frontend/dist/`, not `build/`. Your old `frontend/build/` folder (git-ignored) can be deleted.
  - Env vars for browser code must start with `VITE_` and are read as `import.meta.env.VITE_...`.
  - Vite does not run ESLint during builds (CRA did). Linting comes with S47.
  - The Font Awesome kit `<script>` in `index.html` is unchanged.

## S22 — Use React 18's `createRoot`
- **Problem:** `ReactDOM.render` is deprecated in React 18 (and removed in React 19). With it, React 18 runs the app in legacy React 17 mode, without automatic batching or concurrent features.
- **What changed:** `src/index.jsx` now does `createRoot(document.getElementById('root')).render(<React.StrictMode><Root /></React.StrictMode>)` with `createRoot` from `react-dom/client`. (`context/Modal.jsx` still imports `react-dom` for `createPortal`, which is correct.)
- **Files:** `frontend/src/index.jsx`
- **How to verify** (verified):
  - `npm run build` succeeds.
  - New render check: the built bundle was run in **jsdom** (a browser-like DOM for Node) against the seeded backend. Every page rendered with **0 errors**: `/` (landing page with Demo button), `/songs` (100 songs, 100 images), `/albums` (7), `/playlists` (15), `/albums/1` ("Sacred", Los Lonley Boys, 15 images), `/playlists/1` ("Chill" by Demo-lition), `/songs/1` ("Song Information: My Way"), an unknown URL (404 page) and `/signup`. Clicking **Demo** logged in (login + CSRF cookies set, nav shows Demo-lition, Create Album / Create Playlist), and clicking the Songs/Albums/Playlists nav links changed pages; browser Back worked.
  - **Not tested in a real browser:** audio playback and visual layout.
- **Things to watch / follow-ups:** With `createRoot`, `React.StrictMode` runs every `useEffect` twice in **development** (mount, unmount, mount) to surface bugs. You will see some API requests twice in the dev Network tab. Production builds run effects once.

## S23 — react-router v5 to v7
- **Problem:** react-router v5 is unmaintained and does not support React 19.
- **What changed:**
  - `react-router-dom` `^5.3.3` → `^7.18.6`.
  - `App.jsx`: `<Switch>` with child `<Route>`s → `<Routes>` with `<Route path=... element={<Page />} />`. v7 ranks routes itself, so `exact` and route order no longer matter. The catch-all 404 route is now `path='*'`.
  - `useHistory()` / `history.push(x)` → `useNavigate()` / `navigate(x)` in 10 components (`CreateSong`, `UpdateSong`, `CreateAlbum`, `UpdateAlbum`, `DeleteAlbum`, `CreatePlaylist`, `UpdatePlaylist`, `DeletePlaylist`, `PageNotFound`, `Navigation/ProfileButton`), plus the commented-out code in `AddSong`.
  - `SignupFormPage`: `<Redirect to='/' />` → `<Navigate to='/' replace />` (`replace` keeps the old behaviour of not adding a history entry).
  - `NavLink` needed no change: the app never used `activeClassName`, and v7 still adds the `active` class. `useParams` and `BrowserRouter` work the same.
- **Files:** `frontend/package.json`, `frontend/package-lock.json`, `frontend/src/App.jsx`, `frontend/src/components/SignupFormPage/SignupFormPage.jsx`, and the 11 component files listed above
- **How to verify** (verified):
  - `npm run build` succeeds (88.5 KB gzipped JS; react-router 7 is a bit larger than 5).
  - jsdom tour against the seeded backend, **0 errors**: all pages render on direct load (`/`, `/songs`, `/albums`, `/playlists`, `/albums/1`, `/playlists/1`, `/songs/1`, unknown URL → 404 page, `/signup`); Demo login; nav links switch pages; Back works; visiting `/signup` while logged in redirects to `/` (`Navigate`); creating a playlist through the modal succeeds and stays on `/playlists` with the new playlist listed (`navigate`); Log Out from the profile menu returns to `/` and shows the Demo button again; the 404 page's "Back to Home!" button goes to `/`.
  - **Not tested in a real browser:** the update/delete album and song modals (same `navigate` change, not clicked in the tour).
- **Things to watch / follow-ups:**
  - In v7, `navigate()` must be called from event handlers or effects, never during render (use `<Navigate>` there), which is how the code is written now.
  - Route pages could later be lazy-loaded with `React.lazy` if the bundle grows.

## S24 — Redux to Redux Toolkit
- **Problem:** `createStore` is deprecated, and the store was wired by hand (`applyMiddleware(thunk)`, `compose` with the DevTools extension, `redux-logger` in development).
- **What changed:**
  - Added `@reduxjs/toolkit` 2.15; upgraded `react-redux` 8 → 9.3. Removed `redux`, `redux-thunk` and `redux-logger` (RTK includes Redux and thunk).
  - `store/index.js` now calls RTK's `configureStore({ reducer, preloadedState, devTools: import.meta.env.DEV })`. Thunk middleware is built in, so every existing async action creator (`getSongs()`, `loginUser()`, ...) works unchanged. Redux DevTools works automatically in development. In development RTK also checks that reducers never mutate state and that state/actions are serializable.
  - The `configureStore()` export used by `src/index.jsx` keeps the same name and signature.
  - `store/albums.js` `SHOW_ALBUM`: now copies `currentAlbum` instead of writing into the old state object (a real mutation bug that RTK's dev check would throw on, and a crash when `currentAlbum` was `null` after creating an album).
  - `store/artists.js`: removed an unused `import { bindActionCreators } from "redux"` (the `redux` package is no longer a direct dependency).
- **Files:** `frontend/src/store/index.js`, `frontend/src/store/albums.js`, `frontend/src/store/artists.js`, `frontend/package.json`, `frontend/package-lock.json`
- **How to verify** (verified):
  - `npm run build` succeeds (84.8 KB gzipped JS, down from 88.5 KB).
  - jsdom tour on the **production** build and on a **development** build (`NODE_ENV=development vite build --mode development`, where RTK's mutation/serializability checks are active): all pages and interactions from S23 work with **0 errors and 0 warnings**, including `/albums/1` (which dispatches `SHOW_ALBUM`). In the dev build `window.store.getState()` has the same slices as before: `session, songs, albums, player, artists, playlists`.
- **Things to watch / follow-ups:**
  - Action logs no longer print in the browser console (redux-logger is gone). Install the **Redux DevTools** browser extension to see actions and state.
  - If a future reducer mutates state, the dev server will throw "A state mutation was detected..."; that is RTK catching a real bug.
  - Next steps (not done): convert the store files to `createSlice` one at a time, then move to React 19.

---

# Batch 3: performance, UI/UX, extras (S25 to S35, X1 to X5)

## S25 — Add database indexes and a uniqueness rule
- **Problem:** Postgres does not index foreign keys, so "songs by user", "songs in an album" or "comments on a song" scanned whole tables. Nothing stopped the same song being added to a playlist twice.
- **What changed:**
  - New migration `20261124000000-add-indexes.js`: indexes on `Songs.userId`, `Songs.albumId`, `Albums.userId`, `Playlists.userId`, `Comments.songId`, `Comments.userId`, and a **unique** index on `PlaylistSongs(playlistId, songId)`. It works with the production schema (`SCHEMA`).
  - Before creating the unique index the migration deletes duplicate join rows (keeps the oldest of each pair). On a database without duplicates it deletes nothing. This is the only data change and it only touches join rows, never songs or playlists.
  - `PlaylistSong` model declares the same unique index.
  - `POST /api/playlists/:id/songs` now answers `409 "That song is already in this playlist."` for a duplicate instead of a 500.
  - The migration's `down()` only drops indexes, so unlike the table migrations it is allowed in production (no data is lost).
- **Files:** `backend/db/migrations/20261124000000-add-indexes.js`, `backend/db/models/playlistsong.js`, `backend/routes/api/playlist.js`
- **How to verify** (verified): inserted 2 duplicate join rows in the SQLite dev DB (151 -> 153 rows), ran `npm run db:migrate` (back to 151 rows, 7 indexes present); a further duplicate insert fails with `UNIQUE constraint failed`; `db:migrate:undo` removes all 7 indexes and re-running migrate restores them. API: adding song 99 to a playlist twice returns 200 then 409. Not run against Postgres (not available here); the SQL is plain and quotes the schema name.
- **Things to watch:** on Postgres, `CREATE INDEX` locks writes to the table briefly; these tables are tiny. Run `db:migrate` as usual on deploy.

## S26 — Remove wasted queries
- **Problem:** the song page downloaded every song to show one; `GET /api/songs/:id` and `GET /api/albums/:id` ran a second query for the artist; `GET /api/artists/:id` ran two counts one after the other.
- **What changed:**
  - `DisplaySongInfo` calls `showSong(songId)` (one request) and re-fetches when the URL changes.
  - Song and album detail now load the artist with `include` (one query). The JSON is byte-for-byte the same as before (`Artist` key kept; checked by diffing old and new responses for song 1, album 1, artist 2).
  - Artist detail runs its two counts with `Promise.all`.
- **Files:** `frontend/src/components/Songs/DisplaySongInfo.jsx`, `backend/routes/api/songs.js`, `album.js`, `artist.js`
- **How to verify** (verified): response bodies of `/api/songs/1`, `/api/albums/1`, `/api/artists/2` were saved before and after and are identical; a missing song still returns 404; `npm run build` passes.
- **Things to watch:** the optional "combine playlists/albums/songs into one `/api/my/library`" idea was **not** done (see Batch 3 deviations).

## S27 — Optimize images
- **Problem:** the welcome-page photo was a 53 KB JPEG, a second 280 KB background JPEG was not used by anything, cover images loaded eagerly, and uploads were stored exactly as sent (a phone photo can be several MB, shown at 200 px).
- **What changed:**
  - `studio.jpg` converted to `studio.webp` (53 KB -> 18 KB); `homepage.css` points to it. `studiobackground.jpg` (280 KB) was referenced nowhere, so it was deleted instead of converted.
  - Cover-art `<img>` tags got `loading="lazy"` and `decoding="async"` (not the avatar in the nav or the upload preview, which are on screen at once).
  - Server-side resize with `sharp` (new backend dependency): every uploaded image (album/playlist cover, signup avatar) is rotated by its EXIF tag, shrunk to at most 600 px on the longest side (never enlarged) and stored as WebP at quality 80. A test 3000x2000 noise PNG of 15.3 MB became a 68 KB 600x400 WebP. A file that claims to be an image but is not returns `400 "That file is not a valid image."`. Audio uploads are untouched.
- **Files:** `backend/awsS3.js`, `backend/package.json` (+ lock), `frontend/public/images/*`, `frontend/src/components/HomePage/homepage.css`, cover `<img>` tags in Songs/Albums/Playlists/HomePage components
- **How to verify** (verified): `optimizeImage` run directly on a generated 15 MB PNG (output metadata: webp 600x400); fake PNG posted to `/api/images/upload` gives 400; `npm run build` passes and emits `studio-*.webp`. **Not verified:** a real S3 upload (no AWS credentials here).
- **Things to watch:** `sharp` ships a native binary per platform (installed automatically by `npm ci`; the Docker image in S39 must be Linux, not copied from a Mac). `width`/`height` attributes were left for the S35 redesign, which introduces one shared `Cover` image component (see Batch 3 deviations).

## S28 — Audio player efficiency
- **Problem:** the player logged every play/pause event object to the console, preloaded whatever the browser decided, showed only a song title, and could not go to the next song.
- **What changed:**
  - Removed the `console.log` handlers; `preload="metadata"` (only the length is downloaded until you press play); `autoPlay={false}` (nothing plays on first render; choosing a song still starts it).
  - The player header shows the cover image, song title and (when known) the artist name.
  - Simple queue in `store/player.js`: state is now `{ song, queue, index }`. `playSong(song, list, artistName)` makes `list` the queue; new `playNext()` / `playPrevious()`. Next/Previous buttons appear when the queue has more than one song, and a song that finishes moves on to the next one. Songs, Album and Playlist pages pass their list. The artist name is passed on the album page only (a playlist mixes artists).
  - `react-h5-audio-player` 3.8.6 -> 3.10.2.
- **Files:** `frontend/src/store/player.js`, `components/Player/Player.jsx` + `Player.css`, `Songs.jsx`, `DisplayAlbumInfo.jsx`, `DisplayPlaylistInfo.jsx`, `frontend/package.json` (+ lock)
- **How to verify** (verified): jsdom on the album page: 13 play buttons; click play on the first -> `{index: 0, queue: 13, song: "My Way"}`, header shows title and artist; the Skip button moves to "Oracle"; `<audio preload="metadata">`; no console errors or warnings. Real audio playback cannot be tested without a browser.
- **Things to watch:** the artist name is missing in the player when a song is started from the Songs page or a playlist (those lists only have the user id). A later change could add the artist to the song list API.

## S29 — Caching headers
- **Problem:** nothing told browsers or a CDN how long files may be reused, so everything was re-checked on every visit (or cached unpredictably).
- **What changed:**
  - New `backend/utils/staticFrontend.js` (used by `routes/index.js` in production): `/assets/*` (Vite's content-hashed files) get `Cache-Control: public, max-age=31536000, immutable`; `index.html` gets `no-cache`; other files in `dist/` get one day.
  - Every `/api/*` response, and `/api/csrf/restore`, gets `Cache-Control: no-store` (answers depend on who is logged in and change whenever anyone edits).
  - Uploads to S3 are saved with `Cache-Control: public, max-age=31536000, immutable`. This is safe because each upload has a unique random key (S8), so a file never changes.
- **Files:** `backend/utils/staticFrontend.js`, `backend/routes/index.js`, `backend/awsS3.js`
- **How to verify** (verified): a test Express app mounting `serveFrontend` on the real `frontend/dist`: `/` and `/songs/1` -> `no-cache`, `/assets/index-*.js` -> `max-age=31536000, immutable`, `/default-avatar.svg` -> `max-age=86400`; dev backend: `/api/songs/1`, `/api/albums`, `/api/csrf/restore` -> `no-store`, login still works. **Not verified:** the `CacheControl` field on a real S3 upload (no AWS credentials here) and `NODE_ENV=production` end to end (needs Postgres).
- **Things to watch:** the plan also lists the deploy script (S44) and Terraform/CloudFront cache policies (S43); those items do not exist yet. When they are written, the S3 *frontend* bucket upload needs the same two rules (hashed assets immutable, `index.html` no-cache).

## X3 — sqlite3 6, remove faker, npm audit fix (frontend)
- **Problem:** `sqlite3` 5 pulled in an old build toolchain with many known vulnerabilities, `@faker-js/faker` was a dev dependency nothing used (the seeds are plain data), and the frontend had one moderate advisory.
- **What changed:** backend: `sqlite3` ^5.1.7 -> ^6.0.1 (dev dependency, only used for the local SQLite DB); `@faker-js/faker` removed (no file imports it). Frontend: `npm audit fix` (non-breaking only; it updated `@babel/runtime`).
- **npm audit counts** (before -> after):
  - backend: 19 (2 low, 6 moderate, 10 high, 1 critical) -> **7 moderate**
  - frontend: 1 (moderate) -> **0**
  - Remaining in backend: `uuid` < 11.1.1 (needed by `sequelize` 6) and `glob`/`minimatch` (needed by `sequelize-cli`). Fixing them needs Sequelize 7 or a different CLI, i.e. a breaking change; not done. They are not reachable from user input here (the advisories concern calling `uuid` with a caller-supplied buffer, and glob patterns passed on the command line).
- **Files:** `backend/package.json`, `backend/package-lock.json`, `frontend/package-lock.json`
- **How to verify** (verified): `npm run db:reset` (undo all, migrate, seed) works, the server starts, login and API calls work, frontend builds. **Important:** the prebuilt `sqlite3` 6 binary needs glibc 2.38 or newer, which this sandbox (Ubuntu 22.04, glibc 2.35) does not have, so here the module was compiled from source (`npm rebuild sqlite3 --build-from-source`) to run these checks. On macOS, Windows and current Linux (Ubuntu 24.04+, Debian 13) `npm install` downloads a working binary.
- **Things to watch:** the Docker image (S39) must not use Debian 12 / Ubuntu 22.04 as the base if it installs dev dependencies; production only needs `pg`, so installing with `--omit=dev` avoids sqlite3 entirely. If `npm install` ever fails on sqlite3, run `npm rebuild sqlite3 --build-from-source`.
