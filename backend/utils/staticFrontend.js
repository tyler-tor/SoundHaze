// backend/utils/staticFrontend.js
//
// Serves the built React app (frontend/dist) with sensible cache headers (S29):
//   /assets/*   file names contain a content hash, so they never change:
//               cache for a year, "immutable".
//   index.html  must always be re-checked, otherwise visitors keep an old
//               page that points at deleted assets: "no-cache" (the browser
//               may store it but must ask the server if it is still current).
//   other files (favicon, default avatar, images): cache for a day.
//
// Used by routes/index.js in production. Kept separate so it can be tested
// without a database.
const express = require('express');
const path = require('path');

const ONE_YEAR = 60 * 60 * 24 * 365;
const ONE_DAY = 60 * 60 * 24;

const cacheControlFor = (filePath) => {
  const normalized = filePath.split(path.sep).join('/');
  if (normalized.endsWith('/index.html')) return 'no-cache';
  if (normalized.includes('/dist/assets/')) return `public, max-age=${ONE_YEAR}, immutable`;
  return `public, max-age=${ONE_DAY}`;
};

const serveFrontend = (router, distDir) => {
  const indexFile = path.join(distDir, 'index.html');
  const sendIndex = (_req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(indexFile);
  };

  router.get('/', sendIndex);
  router.use(
    express.static(distDir, {
      index: false,
      setHeaders: (res, filePath) => res.set('Cache-Control', cacheControlFor(filePath)),
    })
  );
  // Every other path that is not /api gets index.html so React Router can
  // handle it. Express 5 syntax: "/{*splat}". Unknown /api paths fall through
  // to the JSON 404 handler in app.js.
  router.get('/{*splat}', (req, res, next) => {
    if (req.path === '/api' || req.path.startsWith('/api/')) return next();
    return sendIndex(req, res);
  });
};

module.exports = { serveFrontend, cacheControlFor };
