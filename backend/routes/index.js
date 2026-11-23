// backend/routes/index.js
const express = require('express');
const router = express.Router();
const apiRouter = require('./api');
const { restoreCsrf } = require('../utils/csrf');

// CSRF token for the frontend, in every environment. The React app calls
// this on startup and after login/signup/logout (S20). Before S20 it only
// existed in development, because in production Express set the cookie when
// it served index.html; that does not happen once the build is on S3.
router.get('/api/csrf/restore', restoreCsrf);

router.use('/api', apiRouter);
// Static routes
// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  // Serve the frontend's index.html file at the root route
  router.get('/', (req, res) => {
    res.sendFile(
      path.resolve(__dirname, '../../frontend', 'dist', 'index.html')
    );
  });
  // Serve the static assets in the frontend's dist folder
  // Vite builds into frontend/dist (S21; CRA used frontend/build).
  router.use(express.static(path.resolve(__dirname, "../../frontend/dist")));
  // Serve the frontend's index.html file at all other routes NOT starting with /api.
  // Express 5 path syntax: "/{*splat}" matches any path (the old regex route
  // is not supported the same way). Unknown /api paths fall through to the
  // JSON 404 handler in app.js.
  router.get('/{*splat}', (req, res, next) => {
    if (req.path === '/api' || req.path.startsWith('/api/')) return next();
    res.sendFile(
      path.resolve(__dirname, '../../frontend', 'dist', 'index.html')
    );
  });
}
module.exports = router;
