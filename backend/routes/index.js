// backend/routes/index.js
const express = require('express');
const router = express.Router();
const apiRouter = require('./api');
const { restoreCsrf } = require('../utils/csrf');

// CSRF token for the frontend, in every environment. The React app calls
// this on startup and after login/signup/logout (S20). Before S20 it only
// existed in development, because in production Express set the cookie when
// it served index.html; that does not happen once the build is on S3.
// API answers are per-user (who is logged in) or change when anyone edits
// something, so browsers and CDNs must never reuse them (S29).
const noStore = (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
};

router.get('/api/csrf/restore', noStore, restoreCsrf);

router.use('/api', noStore, apiRouter);
// Static routes
// Serve the React build (frontend/dist, built by Vite since S21) in production,
// with long-lived caching for hashed assets and no-cache for index.html (S29).
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const { serveFrontend } = require('../utils/staticFrontend');
  serveFrontend(router, path.resolve(__dirname, '../../frontend/dist'));
}
module.exports = router;
