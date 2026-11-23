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
