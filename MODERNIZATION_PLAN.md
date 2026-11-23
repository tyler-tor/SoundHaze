# SoundHaze Modernization Plan

_Audit date: 2026-11-23. Audited commit: `365f69a` on `main` (last change Feb 24, 2023). No code was changed during the audit; this file is the only addition._

**Total items: 55** (S1 to S55). Each item is meant to be one git commit that you can approve, skip or postpone on its own.

## Top 5 recommendations

1. **S2 + S3: Lock down who can edit what.** Any logged-in user can currently edit *anyone's* song or album, and can even change its owner. Confirmed by testing (see "Confirmed bugs").
2. **S13: Fix the frontend build.** `frontend/` cannot build by itself: `react-icons` is listed only in the *root* `package.json`. Every Docker or CI build will fail until this is fixed.
3. **S20 + S36: Get the CSRF and DB config ready for the new hosting setup.** With the React app served from S3, the browser never gets its CSRF cookie, so every login/POST would fail with 403. Also, the production DB config forces SSL, which a Postgres container on the same machine does not use.
4. **S8: Harden file uploads and move to AWS SDK v3 (S18).** No file-size limits, no file-type checks, 50 MB JSON bodies, and `ACL: "public-read"`, which new S3 buckets reject by default, so uploads would fail on a fresh bucket.
5. **S38 to S45: Docker + Terraform deployment**, in the order listed. This is the learning path you asked for and ends with a cheap, reproducible AWS setup.

## Recommended order

1. **Make it build and run safely (half a day to a day):** S13, S1, S4, S2, S3, S5, S6, S7, S10, S11, S12
2. **Get tests in place before the big upgrades:** S46, S47, S49
3. **Dependency upgrades:** S14, S15, S16, S17, S18, S19, then the frontend S21, S22, S23, S24, then S48, S50
4. **Deployment prep in the app code:** S8, S9, S36, S37, S20
5. **Docker locally:** S38, S39, S40
6. **AWS with Terraform:** S41, S42, S43, S44, S45, then S51
7. **Performance and UI polish (can overlap with 5 and 6):** S25 to S35
8. **Docs:** S52, S53, S54, S55 (do S52 early, since it protects secrets)

## Confirmed bugs (tested against a throwaway copy of the backend running on SQLite)

- `PUT /api/songs/1`, sent while logged in as the demo user (song 1 belongs to user 2), changed the title **and reassigned `userId` to the demo user**.
- `POST /api/users/signup` with no profile image fails with the message "User already exists". The real cause is a crash in `awsS3.js` when `req.file` is undefined.
- `GET /api/set-token-cookie` logs any visitor in as the demo user (a leftover debug route).
- `GET /api/artists/:id` (public, no login needed) returns the user's email. The playlist page also shows the owner's email on screen.
- `npm run build` in `frontend/` fails: `Can't resolve 'react-icons/hi'`.
- Found by reading the code, not run: opening `/albums/:id` or `/playlists/:id` while logged out crashes the page (`user.id` is read while `user` is `null`).

## Secrets check

No `.env`, keys, database files or credentials are committed, now or anywhere in git history. `.env` and `*.db` are already in `.gitignore`. The seed files contain demo passwords in plain text (for example `password`). That is fine for public demo accounts, but see the open question about whether those accounts should stay.

## Dependency health (Nov 2026)

- **Backend `npm audit` (production deps):** 27 issues (2 critical, 12 high). The critical ones are in old `sequelize` and Express's `proxy-addr`. Most go away with S14 to S17.
- **Frontend `npm audit`:** 79 issues (7 critical, 37 high). Nearly all come from `react-scripts` (Create React App) build tooling, not from code that ships to the browser. Moving to Vite (S21) removes them.
- **Deprecated or end-of-life packages:** `csurf` (deprecated and archived), `aws-sdk` v2 (end of support Sep 2025), `react-scripts`/CRA (officially deprecated Feb 2025), `ReactDOM.render` (deprecated in React 18), `jsonwebtoken` 8 (known vulnerabilities, fixed in 9).
- **Latest versions:** express 5.3, sequelize 6.37, helmet 8.3, jsonwebtoken 9.0, multer 2.5, express-validator 7.3, react 19.3, react-router-dom 7.18, react-redux 9.3, @reduxjs/toolkit 2.15, vite 8.3, @aws-sdk/client-s3 3.x.
- **Production bundle today:** 83 KB gzipped JS plus 2 KB CSS. That is already small, so bundle size is not a priority.

## Open questions for Tyler

1. **AWS account and region.** Which AWS account, and which region? Your existing media bucket is in `us-west-2`. Terraform needs credentials on your machine (AWS CLI profile). Never paste access keys into the repo.
2. **Domain name.** Do you want a custom domain (for example `soundhaze.yourdomain.com`)? If so, is the DNS on Cloudflare or Route 53? Without one, the app will use the default `*.cloudfront.net` address. A custom domain also needs a free ACM certificate (ACM = AWS Certificate Manager), which must be created in `us-east-1` to work with CloudFront.
3. **S3 bucket names.** Bucket names are globally unique. Suggested names: `soundhaze-web-<random>` for the built React app and `soundhaze-media-<random>` for uploads. Should we reuse the existing `soundcloud-bucket`? The audit could not reach it from this sandbox, so it is unknown whether it still exists and still holds the seed audio and images.
4. **Seed music licensing.** The seed songs are commercial tracks (Los Lonely Boys, Mac Miller, Leon Bridges, Kid Cudi) hosted publicly. For a public portfolio, royalty-free or Creative Commons tracks would be safer. Do you want to swap them?
5. **Budget and instance size.** A `t4g.micro` (ARM, 1 GB RAM) is probably enough for Node + Postgres with a swap file; `t4g.small` (2 GB) is more comfortable. Check current prices on the AWS pricing page; the free tier rules changed in 2025.
6. **Demo-user protection.** Today the demo user can delete or rename shared seed content, so the demo can get "used up". Options: (a) a nightly re-seed, (b) block deletes on seed records, (c) leave as is.
7. **CI/CD.** GitHub Actions deploying automatically (S51), or manual deploys from your laptop at first?
8. **Design direction for S35.** Stay close to the SoundCloud look (orange/white), or go for a fresh dark theme?

---

## Critical fixes & security

### S1. Remove leftover debug/test routes
- **What changes:** Delete `/api/set-token-cookie`, both `/api/test` routes, `/api/require-auth` and `/api/restore-user` from `routes/api/index.js`.
- **Why:** `GET /api/set-token-cookie` logs anyone in as the demo user without a password or CSRF check, and the others are tutorial scaffolding.
- **Files:** `backend/routes/api/index.js`
- **Risk:** low | **Effort:** S | **Depends on:** none

### S2. Enforce ownership on every write route
- **What changes:** Add a `userId: req.user.id` check (respond 403 if the user is not the owner, 404 if the record does not exist) to:
  - `PUT /songs/:id`
  - `PUT /albums/:id`
  - `DELETE /playlists/:pid/songs/:sid`
  - `POST /albums/:id/songs` (already correct)

  Also scope `GET /api/playlists`, which today returns every user's playlists, or make it public on purpose. Use one small helper such as `requireOwner(Model, param)`.
- **Why:** Any logged-in user can edit any song or album (confirmed), or remove songs from other people's playlists. This is an IDOR bug (Insecure Direct Object Reference: changing an ID in the URL lets you act on someone else's data).
- **Files:** `backend/routes/api/songs.js`, `album.js`, `playlist.js`, new `backend/utils/ownership.js`
- **Risk:** low | **Effort:** S | **Depends on:** none

### S3. Stop "mass assignment" in update routes
- **What changes:** Replace `record.update({...req.body})` with an explicit list of allowed fields (songs: `title`, `description`; albums: `title`, `description`, `previewImage`; comments: `body`; playlists: `name`, `previewImage`).
- **Why:** Today a request can overwrite `userId`, `albumId`, `id` and so on. That is how the confirmed "song stolen" bug works.
- **Files:** `songs.js`, `album.js`, `comment.js`, `playlist.js`
- **Risk:** low | **Effort:** S | **Depends on:** S2 (same lines; do them back to back)

### S4. Fix the validation middleware
- **What changes:**
  - `handleValidationErrors` calls `next(err)` and then `next()` again, so after a validation error the route handler still runs. Add `return`.
  - Fix the `checkFalsey` typo (should be `checkFalsy`) in 6 validators, so empty strings are rejected.
  - Add length limits that match the DB columns (for example, song title is `STRING(30)` in the migration).
  - Validate that `:id` params are integers.
- **Why:** Empty titles, names and comment bodies are currently accepted. Overlong values crash with a 500 on Postgres instead of returning a helpful 400.
- **Files:** `backend/utils/validation.js`, `routes/api/*.js`
- **Risk:** low | **Effort:** S | **Depends on:** none

### S5. Don't send the JWT in JSON responses
- **What changes:** Remove `user.dataValues.token = ...` from login, signup and `GET /api/my`. The token stays only in the `httpOnly` cookie. Also stop issuing a new token cookie on every `GET /api/my`, or keep it on purpose as a "sliding session" and document that.
- **Why:** An `httpOnly` cookie exists so that JavaScript (and therefore an XSS attack) cannot read the token. Putting the same token in the JSON body defeats that.
- **Files:** `routes/api/session.js`, `users.js`, `my.js`
- **Risk:** low (the frontend never reads `token`) | **Effort:** S | **Depends on:** none

### S6. Stop exposing users' emails publicly
- **What changes:** Remove `email` from the `includedArtist` scope, and remove the owner's email from the playlist page UI.
- **Why:** Public endpoints and pages currently show every user's email (confirmed on `/api/artists/2`).
- **Files:** `backend/db/models/user.js`, `frontend/src/components/Playlists/DisplayPlaylistInfo.js`
- **Risk:** low | **Effort:** S | **Depends on:** none

### S7. Make signup work without a profile image, and return honest errors
- **What changes:** Upload an image only if one was sent, otherwise use a default avatar. Map Sequelize `UniqueConstraintError` to 409 "username or email already taken". Let all other errors through as 500.
- **Why:** Signup without an image currently fails with a misleading "User already exists" (confirmed). The `catch` turns every error into that message.
- **Files:** `backend/routes/api/users.js`, `backend/db/models/user.js`
- **Risk:** low | **Effort:** S | **Depends on:** none

### S8. Harden uploads (limits, types, keys, ACL)
- **What changes:**
  - Add multer limits: audio up to about 20 MB, images up to about 5 MB.
  - Add a MIME type allowlist (`audio/mpeg`, `audio/mp4`, `audio/x-m4a`, `image/jpeg`, `image/png`, `image/webp`).
  - Generate object keys with `crypto.randomUUID()` instead of a millisecond timestamp, which can collide.
  - Group keys under prefixes (`audio/`, `images/`).
  - Remove `ACL: "public-read"`.
  - Lower the `express.json` and `urlencoded` limits from 50 MB to about 100 KB.
- **Why:** Without limits, anyone can fill your disk or RAM (multer `memoryStorage` holds the whole file in memory) or your S3 bill. New S3 buckets have "Object Ownership: bucket owner enforced" on by default, which **rejects** uploads that set an ACL. Public reads will go through CloudFront instead (S43).
- **Files:** `backend/awsS3.js`, `backend/app.js`
- **Risk:** med (upload behavior changes; test with real files) | **Effort:** S | **Depends on:** pairs well with S18

### S9. Full security headers and rate limiting
- **What changes:** Use `helmet()` with its defaults, not just `crossOriginResourcePolicy`. Add `express-rate-limit` on `/api/session/login` and `/api/users/signup` (for example, 10 requests/min per IP). Set `app.set('trust proxy', 1)` so the real client IP is seen behind CloudFront.
- **Why:** Defaults add HSTS, X-Content-Type-Options, frame protection and more. Rate limiting slows password guessing.
- **Files:** `backend/app.js`, `backend/package.json`
- **Risk:** low | **Effort:** S | **Depends on:** S17 (helmet upgrade), ideally done together

### S10. Let users comment on any song
- **What changes:** `POST /songs/:id/comments` currently only works if *you own the song*. Remove the `userId` filter from that lookup.
- **Why:** This is a logic bug. (There is also no comments UI yet; see S34.)
- **Files:** `backend/routes/api/songs.js`
- **Risk:** low | **Effort:** S | **Depends on:** none

### S11. Fix song list pagination
- **What changes:** Parse `page` and `size` as integers, with pages starting at 1. Compute `offset = (page-1)*size`. Actually pass `limit`/`offset`: today they are nested under an ignored `pagination` key in two branches, and in the last branch `where` is spread into the wrong place. Return `{ Songs, page, size, total }` and default to a reasonable page size.
- **Why:** `?page=0` gives a negative OFFSET, which Postgres rejects. Filtering by title or date ignores pagination. With no params, the endpoint returns every song.
- **Files:** `backend/routes/api/songs.js`, later `frontend/src/store/songs.js`
- **Risk:** med (API response shape changes slightly) | **Effort:** S | **Depends on:** S4

### S12. Fix frontend crashes and stale pages
- **What changes:**
  - Guard `user?.id` in `DisplayAlbumInfo`, `DisplayPlaylistInfo`, `Albums` and `Playlists`, so logged-out visitors don't crash.
  - Add `albumId`/`playlistId` to the `useEffect` dependency arrays, so moving from one album to another refetches.
  - Fix `CreateSong`'s `.then(() => setShowModal(false), history.push('/songs'))`. The second argument runs right away, even on errors.
  - Show the real server error message (`await res.json()`).
- **Why:** These are crash and correctness bugs that real visitors would hit.
- **Files:** `frontend/src/components/Albums/*`, `Playlists/*`, `CreateSong/CreateSong.js`
- **Risk:** low | **Effort:** S | **Depends on:** none

---

## Dependency upgrades

### S13. Fix package layout so each app builds by itself
- **What changes:**
  - Move `react-icons` into `frontend/package.json`.
  - Remove the unused Font Awesome, `pg`, `redux` and other frontend packages from the **root** `package.json`.
  - Replace the odd root scripts (`"install": "npm --prefix backend install backend ..."`, the `render-postbuild` script, `dev:*` scripts that run `npm install`) with simple `dev:backend`, `dev:frontend` and `build` scripts.
  - Fix the `sequleize-cli` typo in `backend/package.json`.
  - Delete the empty, accidentally committed file `backend/npx`.
  - Add `"engines": { "node": ">=22" }`.
- **Why:** `cd frontend && npm ci && npm run build` fails today (confirmed). It only worked before because Node also searched the root `node_modules`. Docker and CI build each folder on its own.
- **Files:** `package.json`, `package-lock.json` (root), `frontend/package.json` and its lockfile, `backend/package.json`, `backend/npx`
- **Risk:** low | **Effort:** S | **Depends on:** none (do first)

### S14. Safe backend upgrades within the same major versions
- **What changes:**
  - Bump `sequelize` (6.21 to 6.37; fixes a critical advisory), `sequelize-cli`, `pg`, `dotenv`, `morgan`, `cookie-parser` and `sqlite3`. sqlite3 is dev-only; consider swapping it for Node 22's built-in test DB, or keep it.
  - Replace `nodemon` with `node --watch`, which is built into Node 22.
  - Remove `per-env`; use plain `start` and `dev` scripts.
- **Why:** Security fixes with almost no API changes.
- **Files:** `backend/package.json`, `backend/package-lock.json`
- **Risk:** low | **Effort:** S | **Depends on:** S13

### S15. jsonwebtoken 8 to 9
- **What changes:** Upgrade. Pass `expiresIn` as a number or string consistently (today the cookie uses `expiresIn * 1000` on a string). Fail fast at startup if `JWT_SECRET` is missing.
- **Why:** Version 8 has known vulnerabilities. A missing secret today fails silently at first login.
- **Files:** `backend/utils/auth.js`, `backend/config/index.js`, `package.json`
- **Risk:** low | **Effort:** S | **Depends on:** S14

### S16. express-validator 6 to 7, and multer 1 to 2
- **What changes:** Upgrade. In express-validator 7, `check()` chains mostly keep working, and `.withMessage` placement matters. multer 2 fixes denial-of-service advisories.
- **Files:** `backend/routes/api/*.js`, `backend/awsS3.js`, `package.json`
- **Risk:** med | **Effort:** S | **Depends on:** S4, S46 (tests first)

### S17. helmet 5 to 8
- **What changes:** Upgrade, together with S9.
- **Files:** `backend/app.js`, `package.json`
- **Risk:** low | **Effort:** S | **Depends on:** S9

### S18. AWS SDK v2 to v3, with config from env vars and no access keys
- **What changes:**
  - Replace `aws-sdk` with `@aws-sdk/client-s3` and `@aws-sdk/lib-storage` (the latter for multipart uploads).
  - Read the bucket name, region and public media base URL from env vars instead of the hard-coded `"soundcloud-bucket"`.
  - Remove the unused "private upload" helpers.
  - On EC2, credentials come automatically from the **IAM instance role** (permissions attached to the server itself), so no `AWS_ACCESS_KEY_ID` is stored anywhere.
- **Why:** v2 reached end of support in Sep 2025. It is also a big package; v3 is modular and smaller.
- **Files:** `backend/awsS3.js`, `backend/package.json`, `backend/config/index.js`
- **Risk:** med | **Effort:** M | **Depends on:** S8

### S19. Express 4 to 5
- **What changes:** Upgrade. Express 5 handles async errors natively, so remove `express-async-errors`. Fix the regex catch-all route (it goes away in S38 anyway) and remove `res.status = 200` / `res.message(...)` misuse in `comment.js` and `artist.js`.
- **Why:** Express 4 is in maintenance mode, and the audit flagged `path-to-regexp` and `body-parser` advisories.
- **Files:** `backend/app.js`, `backend/routes/**`, `package.json`
- **Risk:** med | **Effort:** S | **Depends on:** S46, S38

### S20. Replace `csurf` and make CSRF work with the frontend on S3
- **What changes:**
  - Replace the deprecated `csurf` with `csrf-csrf` (the "double-submit cookie" pattern: the server sets a random token in a cookie, and the browser must echo it back in a header).
  - Expose `GET /api/csrf/restore` in **all** environments. Today it exists only outside production, because in production Express set the cookie when it served `index.html`.
  - Call it once when the React app starts, in every environment.
  - Keep cookies `SameSite=Lax`, `Secure` in production.
- **Why:** Once the React build is served by S3/CloudFront, Express never serves `index.html`, so no CSRF cookie is set and **every POST/PUT/DELETE (including the demo login) fails with 403**.
- **Files:** `backend/app.js`, `backend/routes/index.js`, `frontend/src/index.js`, `frontend/src/store/csrf.js`
- **Risk:** med | **Effort:** M | **Depends on:** S38

### S21. Create React App to Vite
- **What changes:**
  - Replace `react-scripts` with Vite, plus `@vitejs/plugin-react`.
  - Move `public/index.html` to the project root as `index.html`.
  - Replace `"proxy"` in `package.json` with `server.proxy` in `vite.config.js`.
  - Rename env vars from `REACT_APP_*` to `VITE_*`. Today only `NODE_ENV` is used, which becomes `import.meta.env.MODE`/`DEV`.
  - Rename `.js` files that contain JSX to `.jsx`.
  - The output folder becomes `dist/`.
- **Why:** CRA is officially deprecated and is the source of about 75 of the 79 frontend audit findings. Vite starts and builds much faster.
- **Files:** `frontend/**` (configuration and file renames, not logic)
- **Risk:** med | **Effort:** M | **Depends on:** S13

### S22. Use React 18's `createRoot`
- **What changes:** Replace `ReactDOM.render` with `createRoot(...).render(...)` in `index.js`. React 18 is already installed, but it currently runs in legacy React 17 mode.
- **Files:** `frontend/src/index.js`
- **Risk:** low | **Effort:** S | **Depends on:** none (can go before S21)

### S23. react-router v5 to v7
- **What changes:**
  - `Switch` becomes `Routes`, and children become the `element` prop.
  - `useHistory` becomes `useNavigate`; `Redirect` becomes `Navigate`.
  - `NavLink`'s `activeClassName` usage, if any, changes.
  - Consider lazy-loading route pages with `React.lazy`.
- **Why:** v5 is unmaintained and blocks React 19.
- **Files:** `frontend/src/App.js` and every component that uses `useHistory`/`Redirect`
- **Risk:** med-high (touches many files) | **Effort:** M | **Depends on:** S21, S48

### S24. Redux to Redux Toolkit (and optionally React 19)
- **What changes:**
  - Swap `createStore` and the hand-written thunk setup for RTK's `configureStore`. It includes thunk and devtools, so `redux-logger` can go.
  - Optionally convert each `store/*.js` file to `createSlice`, one file per follow-up commit.
  - After that, React can move to 19.
- **Why:** `createStore` is deprecated, and RTK removes a lot of boilerplate. It is optional, but good portfolio polish.
- **Files:** `frontend/src/store/*`
- **Risk:** med | **Effort:** M | **Depends on:** S48

---

## Performance

### S25. Add database indexes and a uniqueness rule
- **What changes:** Add a new migration with indexes on the foreign-key columns `Songs.userId`, `Songs.albumId`, `Albums.userId`, `Playlists.userId`, `Comments.songId` and `Comments.userId`, plus a **unique** index on `PlaylistSongs(playlistId, songId)`.
- **Why:** Postgres does not index foreign keys automatically, so every "songs by user" or "songs in album" query scans the whole table. The unique index stops the same song being added to a playlist twice; today it can be.
- **Files:** new `backend/db/migrations/2026xxxx-add-indexes.js`, `backend/db/models/playlistsong.js`
- **Risk:** low | **Effort:** S | **Depends on:** S37 (dedupe seed data first, if needed)

### S26. Remove wasted queries
- **What changes:**
  - The song detail page currently downloads **all** songs (`getSongs()`) to show one. Switch it to `showSong(id)`.
  - `GET /songs/:id` and `GET /albums/:id` run a second query for the artist. Use `include` instead.
  - `GET /artists/:id` runs two counts one after the other. Run them with `Promise.all` or `include` + `COUNT`.
  - The home page fetches playlists, albums and songs in three requests. Optionally combine them into one `/api/my/library`.
- **Files:** `frontend/src/components/Songs/DisplaySongInfo.js`, `backend/routes/api/songs.js`, `album.js`, `artist.js`
- **Risk:** low | **Effort:** S | **Depends on:** S11

### S27. Optimize images
- **What changes:** Convert `public/images/studiobackground.jpg` (280 KB) and `studio.jpg` to WebP/AVIF at the size they are displayed. Add `loading="lazy"`, `decoding="async"` and `width`/`height` to cover-art `<img>` tags. Optionally resize uploaded images on the server with `sharp` (about 600 px square covers).
- **Why:** Faster first load and no layout jumping. Uploaded cover images can be several MB each.
- **Files:** `frontend/public/images/*`, tile components, optionally `backend/awsS3.js`
- **Risk:** low | **Effort:** S | **Depends on:** none (sharp part: S18)

### S28. Audio player efficiency
- **What changes:**
  - Remove the `console.log` in the `onPlay`/`onPause` handlers.
  - Set `preload="metadata"`.
  - Don't auto-play on first render.
  - Show the album art and artist in the player bar.
  - Add a simple queue (next/previous within the current list).
  - Upgrade `react-h5-audio-player` to 3.10.
- **Files:** `frontend/src/components/Player/*`, `frontend/src/store/player.js`
- **Risk:** low | **Effort:** S-M | **Depends on:** none

### S29. Caching headers
- **What changes:**
  - Hashed build assets get `Cache-Control: public, max-age=31536000, immutable`.
  - `index.html` gets `no-cache`.
  - Uploaded media gets a long max-age, which is safe because S8 gives every upload a unique key.
  - API responses get `no-store` for user-specific data.
- **Why:** CloudFront can then serve almost everything from the edge, which is cheaper and faster.
- **Files:** deploy script (S44), `backend/awsS3.js`, Terraform CloudFront cache policies (S43)
- **Risk:** low | **Effort:** S | **Depends on:** S43, S44

---

## UI/UX & accessibility

### S30. Responsive layout
- **What changes:** There are currently **zero** `@media` queries, so the app is desktop-only. Add:
  - a mobile nav (hamburger menu or bottom tabs)
  - CSS Grid tiles that reflow (`grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))`)
  - a player bar that fits small screens
  - forms at full width on phones
- **Files:** `frontend/src/index.css`, `components/**/*.css`, `Navigation/*`
- **Risk:** low | **Effort:** M | **Depends on:** S35 is easier if done first, but not required

### S31. Accessible modals
- **What changes:** Give the modal `role="dialog"`, `aria-modal="true"` and an `aria-labelledby` title. Close it on Escape. Trap focus inside while it is open, and return focus to the button that opened it. Alternatively, use the native `<dialog>` element, which does most of this for free.
- **Why:** Keyboard and screen-reader users currently cannot use login, create or edit dialogs properly.
- **Files:** `frontend/src/context/Modal.js`, `Modal.css`
- **Risk:** low | **Effort:** S | **Depends on:** none

### S32. Real buttons, labels and alt text
- **What changes:**
  - The play icons (`<HiPlay onClick>`) are SVGs, which can't be focused or activated with a keyboard. Wrap them in `<button aria-label="Play {title}">`.
  - Add `alt` to the 4 images flagged by the build (`DisplayAlbumInfo`, `ImageComponent`, `ProfileButton`, `Songs`).
  - The signup form uses placeholders only; add `<label>`s.
  - Use `type="email"` and `autocomplete` attributes.
  - Announce form errors with `aria-live="polite"`.
  - Check color contrast.
- **Files:** `Songs.js`, `DisplayAlbumInfo.js`, `DisplayPlaylistInfo.js`, `SignupFormPage.js`, `LoginForm.js`, `ProfileButton.js`
- **Risk:** low | **Effort:** S | **Depends on:** none

### S33. Loading, empty and error states, plus a more prominent demo login
- **What changes:**
  - Show skeletons or spinners while data loads.
  - Show "No songs yet, create an album first" style empty states.
  - Show a "not found" page for missing albums, songs or playlists.
  - Show a toast for failed actions.
  - Add a "Try the demo" call to action on the welcome page and the signup page, not only the small nav button.
  - Keep demo credentials in one constant.
- **Files:** `HomePage.js`, `Songs.js`, `Albums.js`, `Playlists.js`, `DemoUser.js`, new `components/common/*`
- **Risk:** low | **Effort:** M | **Depends on:** S12

### S34. Song detail page and comments UI
- **What changes:** The song page currently shows the raw S3 URL and numeric `albumId`/`userId`. Show the cover, title, artist name and link, album link, and a play button instead. Add a comments list and form: the backend has comment routes, but the frontend has no comments UI at all.
- **Files:** `components/Songs/DisplaySongInfo.js`, new `store/comments.js`, new `components/Comments/*`
- **Risk:** low | **Effort:** M | **Depends on:** S10, S26

### S35. Visual refresh with design tokens
- **What changes:**
  - Define CSS variables for colors, spacing, radius and font sizes.
  - Use one font stack and a consistent button style.
  - Optionally add a dark theme via `prefers-color-scheme`.
  - Make the player bar persistent and polished.
  - Remove or finish the unused `Footer` component (the build warns that it is imported but unused).
  - Truncate long titles with CSS `text-overflow: ellipsis` instead of `slice(0, 7)`.
  - Add a favicon and `<meta name="description">`.
- **Files:** `frontend/src/index.css`, `components/**/*.css`, `public/` (or root `index.html` after S21)
- **Risk:** low | **Effort:** L (split into one commit per page if needed) | **Depends on:** open question 8

---

## Docker & AWS deployment

**Target architecture, in plain terms:**

```
Browser ──► CloudFront (CDN, HTTPS)
              ├── /*        ──► S3 "web" bucket (React build, private, read via OAC)
              ├── /media/*  ──► S3 "media" bucket (uploads, private, read via OAC)
              └── /api/*    ──► EC2 instance :80 ──► Docker: api (Node) + db (Postgres, data on EBS volume)
```

- **CloudFront** is a CDN (Content Delivery Network) that caches files close to users and provides HTTPS.
- **OAC** (Origin Access Control) lets CloudFront read a private bucket, so the buckets themselves stay closed to the public.
- Routing `/api/*` through the same CloudFront domain makes the frontend and API **same-origin**. That means no CORS setup is needed, and `SameSite=Lax` cookies just work.
- **EC2** is a virtual Linux server. **EBS** is its disk.
- **Terraform** describes all of this in `.tf` files, so `terraform apply` creates it and `terraform destroy` removes it.

### S36. Configure the backend entirely from environment variables
- **What changes:**
  - Make DB SSL optional (`DB_SSL=true|false`). Today production **always** requires SSL, which a Postgres container on the same machine doesn't use, so the app would fail to connect.
  - Make `SCHEMA` optional; it was a Render shared-DB workaround and isn't needed with your own Postgres.
  - Add `S3_BUCKET`, `AWS_REGION`, `MEDIA_BASE_URL` and `CORS_ORIGIN` (dev only).
  - Validate required vars at startup.
- **Files:** `backend/config/index.js`, `backend/config/database.js`, `backend/db/migrations/*` and `seeders/*` (the `options.schema` lines), `backend/psql-setup-script.js` (likely deleted)
- **Risk:** med | **Effort:** S | **Depends on:** none

### S37. Make migrations and seeds safe on Postgres
- **What changes:**
  - Seeds insert explicit `id`s (users 1 to 7 and so on). On Postgres, this does **not** move the auto-increment counter, so the first real signup tries `id=1` and fails with a unique-key error, which surfaces as "User already exists". Fix this either by dropping the explicit ids and looking up related ids, or by adding a final seeder that runs `SELECT setval(...)` for each table.
  - Fix Jane Doe's broken image URL (`imahttps://...jpggeurl`).
  - Add a migration to remove the global `UNIQUE` on `Songs.title` and `Songs.url`. Two artists can't currently have songs with the same name.
  - Widen title to 100 characters.
  - Build seed media URLs from `MEDIA_BASE_URL`.
- **Note:** The id issue was found by reading the code; it was not run against a real Postgres. S46 tests should cover it.
- **Files:** `backend/db/seeders/*`, new migration(s)
- **Risk:** med | **Effort:** M | **Depends on:** S36

### S38. Health check, clean shutdown, and an API-only server
- **What changes:**
  - Add `GET /api/health`, which returns 200 when the DB is reachable.
  - On `SIGTERM`, close the HTTP server and the Sequelize connection. Docker sends `SIGTERM` on stop or redeploy.
  - `process.exit(1)` if the DB is unreachable at boot, so Docker's restart policy kicks in. Today it logs and quietly does nothing.
  - Remove the production static-file serving in `routes/index.js`, because S3 serves the frontend now.
- **Files:** `backend/bin/www`, `backend/routes/index.js`, `backend/routes/api/index.js`
- **Risk:** low | **Effort:** S | **Depends on:** none

### S39. Backend Dockerfile
- **What changes:** Add a multi-stage `backend/Dockerfile`:
  - It starts from `node:22-alpine`, runs `npm ci --omit=dev` and runs as the non-root `node` user.
  - It includes a `HEALTHCHECK` that hits `/api/health`.
  - Add a `.dockerignore` that excludes `node_modules`, `.env` and `*.db`.
  - Build for `linux/arm64` if you use a Graviton (`t4g`) instance.
- **Explanation:** A *Dockerfile* is a recipe for an *image*: a frozen snapshot of the OS, Node and your code. A *container* is a running copy of that image. "Multi-stage" means you build in one stage and copy only what is needed into a smaller final image.
- **Files:** new `backend/Dockerfile`, new `backend/.dockerignore`
- **Risk:** low | **Effort:** S | **Depends on:** S13, S36, S38

### S40. docker-compose for local dev and the EC2 box
- **What changes:** Add `docker-compose.yml` with three services:
  - `db`: `postgres:17-alpine`, a named volume, a `pg_isready` healthcheck, and **no public port**.
  - `migrate`: a one-off service that runs `sequelize db:migrate` (and the seeds, behind a flag) and then exits.
  - `api`: depends on a healthy `db` and a completed `migrate`, with `restart: unless-stopped` and `env_file: .env`.

  Add a `docker-compose.override.yml` for local dev that mounts the source and runs `node --watch`. Locally, `docker compose up` then gives you the whole backend.
- **Explanation:** Compose starts several containers together and connects them on a private network, where `api` reaches Postgres at hostname `db`.
- **Files:** new `docker-compose.yml`, new `docker-compose.override.yml`, new `.env.example` (S52)
- **Risk:** low | **Effort:** S | **Depends on:** S39, S37

### S41. Terraform skeleton and remote state
- **What changes:** Create `infra/` with:
  - `versions.tf` (AWS provider pinned)
  - `variables.tf` (region, app name, domain, instance type)
  - `outputs.tf`
  - a small `bootstrap/` stack that creates an S3 bucket for Terraform state, with native S3 state locking

  Add `infra/README` notes on `terraform init/plan/apply/destroy`.
- **Explanation:** Terraform's *state* file records what it created. Keeping it in S3 means it isn't lost if your laptop dies. **It can contain secrets, so it must never be committed** (see S52).
- **Files:** new `infra/**`
- **Risk:** low | **Effort:** S | **Depends on:** open questions 1 and 3

### S42. Terraform: EC2, security group, IAM role, Elastic IP
- **What changes:** Add:
  - one `t4g.micro` or `t4g.small` Amazon Linux 2023 instance, with a 20 GB gp3 EBS volume
  - `user_data` (a first-boot script) that installs Docker and the Compose plugin and adds a 1 GB swap file
  - an **IAM instance role** allowing `s3:PutObject`/`GetObject`/`DeleteObject` on the media bucket only, plus the `AmazonSSMManagedInstanceCore` policy
  - a security group that allows port 80 **only from CloudFront** (via the AWS-managed CloudFront prefix list) and **no SSH port at all**. Use SSM Session Manager (a browser or CLI shell into the instance through AWS) instead of SSH keys.
  - an Elastic IP (a fixed public IP)
- **Files:** `infra/ec2.tf`, `infra/iam.tf`, `infra/network.tf`, `infra/user_data.sh`
- **Risk:** low (new resources only) | **Effort:** M | **Depends on:** S41

### S43. Terraform: S3 buckets and CloudFront
- **What changes:** Add:
  - a private `web` bucket and a private `media` bucket, both with Block Public Access on and versioning on `media`
  - CORS rules on `media`, if direct browser uploads are added later
  - one CloudFront distribution with OAC and three behaviors: `/*` goes to the web bucket, `/media/*` goes to the media bucket (cached), and `/api/*` goes to the EC2 origin (no caching; forwards cookies, `XSRF-Token` and query strings)
  - a custom origin header secret, so EC2 only accepts traffic that came through CloudFront
  - SPA fallback: a CloudFront Function that rewrites non-file paths to `/index.html` for the web origin only, so a 404 from the API is not turned into HTML
  - optional ACM certificate and DNS record for the custom domain
- **Files:** `infra/s3.tf`, `infra/cloudfront.tf`, `infra/cf-function.js`
- **Risk:** med (CloudFront config has many settings) | **Effort:** M-L | **Depends on:** S41, S42, S20, open question 2

### S44. Deploy scripts
- **What changes:** Add two scripts:
  - `scripts/deploy-frontend.sh`: runs `npm ci && npm run build`, then `aws s3 sync dist/ s3://web --delete` with the cache headers from S29, then `aws cloudfront create-invalidation --paths /index.html`.
  - `scripts/deploy-backend.sh`: builds the image and pushes it to **ECR** (AWS's private Docker registry; a small Terraform addition). It then runs `docker compose pull && docker compose up -d` on the instance through `aws ssm send-command`.

  A simpler first step is building on the instance with `git pull && docker compose up -d --build`.
- **Files:** new `scripts/*.sh`, optional `infra/ecr.tf`
- **Risk:** low | **Effort:** S-M | **Depends on:** S40, S42, S43

### S45. Backups
- **What changes:** Add a nightly `pg_dump`, run by a cron job or a tiny compose service, that gzips the dump and uploads it to a `backups/` prefix with a lifecycle rule (keep 14 days). Add a Data Lifecycle Manager policy for daily EBS snapshots (7 retained).
- **Why:** With Postgres in a container on one server, losing the instance means losing the data unless you back it up.
- **Files:** `docker-compose.yml`, `scripts/backup.sh`, `infra/backup.tf`
- **Risk:** low | **Effort:** S | **Depends on:** S40, S42

---

## Testing & CI

### S46. Backend API tests
- **What changes:** Add Vitest (or Jest) with `supertest`, running against an in-memory SQLite DB that is migrated and seeded per run. Cover:
  - login, including the demo user
  - signup with and without an image (S3 mocked)
  - CSRF required on writes
  - ownership: editing someone else's song or album returns 403 (regression tests for S2/S3)
  - validation returns 400s
  - pagination
  - no email or token in responses
- **Files:** new `backend/tests/**`, `backend/package.json`, small refactor so `app.js` can be imported without starting a server (it already can)
- **Risk:** low | **Effort:** M | **Depends on:** none (write the tests alongside S1 to S11)

### S47. Lint and format
- **What changes:** Add an ESLint flat config for the backend and frontend (with the `react-hooks` and `jsx-a11y` plugins) and Prettier. Fix the 14 current build warnings: unused imports, missing hook dependencies and missing `alt`.
- **Files:** new `eslint.config.js` files, `.prettierrc`, touched source files
- **Risk:** low | **Effort:** S | **Depends on:** S13

### S48. Frontend tests
- **What changes:** Add Vitest and React Testing Library smoke tests. Cover:
  - the app renders logged out
  - the demo button logs in (API mocked with MSW, which fakes the server inside tests)
  - album and playlist pages render for a logged-out visitor (regression test for S12)
  - the songs list renders
- **Files:** new `frontend/src/**/*.test.jsx`, `frontend/vite.config.js`
- **Risk:** low | **Effort:** M | **Depends on:** S21

### S49. GitHub Actions CI
- **What changes:** Add `.github/workflows/ci.yml`. On every push and pull request it runs `npm ci`, lint, the backend tests, the frontend tests and the frontend build, and runs `docker build` for the backend. It also runs `terraform fmt -check` and `terraform validate` in `infra/`.
- **Files:** new `.github/workflows/ci.yml`
- **Risk:** low | **Effort:** S | **Depends on:** S46, S47 (S48 and S39 steps are added as they land)

### S50. End-to-end smoke test
- **What changes:** Add one Playwright test that opens the site, clicks Demo, opens Songs, presses play and checks that the player has a source. Run it in CI against `docker compose up`.
- **Files:** new `e2e/**`, CI workflow
- **Risk:** low | **Effort:** M | **Depends on:** S40, S49

### S51. Continuous deployment (optional)
- **What changes:** Add a GitHub Actions workflow that deploys on push to `main`. It uses **GitHub OIDC**: GitHub proves its identity to AWS and gets short-lived credentials, so **no AWS keys are stored in GitHub**. It runs the S44 scripts.
- **Files:** new `.github/workflows/deploy.yml`, `infra/github-oidc.tf`
- **Risk:** med | **Effort:** M | **Depends on:** S44, S49, open question 7

---

## Docs/README

### S52. `.env.example` files and `.gitignore` hardening
- **What changes:**
  - Add `backend/.env.example` with placeholder values (`PORT`, `DB_FILE`, `DATABASE_URL`, `DB_SSL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `S3_BUCKET`, `AWS_REGION`, `MEDIA_BASE_URL`).
  - Add a root `.env.example` for compose (`POSTGRES_PASSWORD` and so on).
  - Extend `.gitignore` with `.env.*` (but keep `!.env.example`), `dist/`, `coverage/`, `infra/**/.terraform/`, `*.tfstate*`, `*.tfvars` (but keep `!*.tfvars.example`) and `playwright-report/`.
- **Why:** The README currently shows the env file only as a screenshot. Terraform state and tfvars can hold secrets.
- **Files:** `.gitignore`, new `backend/.env.example`, new `.env.example`
- **Risk:** low | **Effort:** S | **Depends on:** none (do early)

### S53. Rewrite the README
- **What changes:**
  - Remove the dead Heroku link.
  - Update the tech list: Vite, Docker, AWS.
  - Add a short architecture diagram (the one above).
  - Add a "Run locally" section (`docker compose up` plus `npm run dev` in `frontend/`).
  - Add an env var table, the demo credentials, a features list and fresh screenshots.
  - Fix typos ("sight", "Rum", "folderds", "implentations").
- **Files:** `README.md`, `backend/README.md` (currently a 30 KB API spec; move it to `docs/API.md`), `frontend/README.md` (CRA boilerplate; delete or replace)
- **Risk:** low | **Effort:** S | **Depends on:** best after S40

### S54. AWS deployment walkthrough
- **What changes:** Add `docs/DEPLOY.md`, a step-by-step guide written for learning. It covers:
  - installing the AWS CLI and Terraform, and creating a profile
  - `terraform apply`
  - the first deploy
  - opening a shell with SSM
  - reading logs (`docker compose logs -f api`)
  - restoring a backup
  - tearing everything down
  - a rough monthly cost breakdown to check against AWS pricing
- **Files:** new `docs/DEPLOY.md`
- **Risk:** low | **Effort:** S | **Depends on:** S41 to S45

### S55. Fix project metadata and naming
- **What changes:** Rename the root package from `authenticate-me` (the App Academy template name) to `soundhaze`. Fix the repository and homepage URLs, which point to `tyler-tor/API-Project` while the actual remote is `tyler-tor/SoundCloud-API-Project`. Fill in `description`, add a `LICENSE`, and set `manifest.json` names.
- **Files:** `package.json`, `frontend/public/manifest.json`, new `LICENSE`
- **Risk:** low | **Effort:** S | **Depends on:** S13
