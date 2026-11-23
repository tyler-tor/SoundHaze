# SoundHaze Change Log

This file explains every change made while working through `MODERNIZATION_PLAN.md`.
Each section matches one plan item (S1, S2, ...) and one git commit on the `modernize` branch.

## Deviations from plan

- **S3 (song fields):** the plan's allow-list for songs was `title`, `description`. I also allowed `previewImage`, because the existing Update Song form lets the owner change the song's cover image and leaving it out would silently break that feature.
- **S3 (album/playlist image field name):** the frontend sends the new image as `imageUrl` (the create routes use that name too), not `previewImage`. The update routes now accept `imageUrl` as an alias that is saved into `previewImage`. Side effect: changing an album/playlist image from the edit form now actually works (before, the `...album` spread in the form re-sent the **old** `previewImage`, and `imageUrl` was ignored because there is no such column).
- **S6 (album page):** the plan only named the playlist page, but the album detail page (`DisplayAlbumInfo.js`) also printed the artist's email. Removed it there too (it would have rendered empty after the API change anyway).
- **S9 (before S17):** the plan suggests doing S9 together with the helmet 5 → 8 upgrade (S17). S17 is not in this batch, so S9 was done on helmet 5. Two helmet-5-specific adjustments: `crossOriginEmbedderPolicy` is turned **off** (helmet 5 enables it by default and it would block S3 images/audio; helmet 7+ has it off by default), and the Content-Security-Policy was extended to allow the Font Awesome kit plus https images/audio. When S17 is done, re-check these options.
- **S9 (trust proxy):** `app.set('trust proxy', 1)` is applied **only in production**. In development there is no proxy, and trusting `X-Forwarded-For` there would let anyone fake their IP to dodge the rate limiter.
- **S9 (separate counters):** login and signup each have their **own** 10/min counter, so failed logins do not block signups (and vice versa).

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

