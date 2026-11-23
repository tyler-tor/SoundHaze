// backend/utils/csrf.js
//
// CSRF protection with the "double-submit" pattern (csrf-csrf package),
// replacing the deprecated csurf (S20).
//
// How it works:
//   1. The frontend calls GET /api/csrf/restore when it starts, and again
//      after login, signup and logout.
//   2. The server answers { csrfToken } and also sets an httpOnly cookie
//      holding a matching HMAC hash. JavaScript cannot read that cookie.
//   3. For every POST/PUT/PATCH/DELETE the frontend sends the token in the
//      X-CSRF-Token header. The server checks that header against the cookie.
// A malicious site can make the browser send our cookies, but it cannot read
// the token, so it cannot fill in the header.
//
// The token is bound to the login cookie (`token`), so a new CSRF token is
// needed whenever the user logs in or out. The frontend handles that, and
// also retries once with a fresh token if the server says the token is bad.
//
// This works the same whether Express serves the React build or the build
// lives on S3/CloudFront with /api routed to this server (same origin).

const crypto = require('crypto');
const { doubleCsrf } = require('csrf-csrf');
const { environment, jwtConfig, csrfSecret } = require('../config');

const isProduction = environment === 'production';

// CSRF_SECRET if set, otherwise a separate key derived from JWT_SECRET, so no
// extra env var is required.
if (!csrfSecret && !jwtConfig.secret) {
    throw new Error('JWT_SECRET is not set. Add it to backend/.env (any long random string).');
}
const secret = csrfSecret
    || crypto.createHash('sha256').update(`soundhaze-csrf:${jwtConfig.secret}`).digest('hex');

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
    getSecret: () => secret,
    // Ties the CSRF token to the current login (or to "anonymous").
    getSessionIdentifier: (req) => (req.cookies && req.cookies.token) || 'anonymous',
    // The __Host- prefix makes browsers insist on Secure + Path=/ + no Domain.
    // It needs HTTPS, so it is only used in production.
    cookieName: isProduction ? '__Host-soundhaze.x-csrf-token' : 'soundhaze.x-csrf-token',
    cookieOptions: {
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        httpOnly: true
    },
    getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token']
});

// Checks the token on POST/PUT/PATCH/DELETE (GET/HEAD/OPTIONS are skipped)
// and turns a failure into the API's usual JSON error shape.
const csrfProtection = (req, res, next) =>
    doubleCsrfProtection(req, res, (err) => {
        if (!err) return next();
        if (err.code === 'EBADCSRFTOKEN') {
            const e = new Error('Invalid CSRF token');
            e.status = 403;
            e.title = 'Invalid CSRF token';
            e.errors = ['Invalid or missing CSRF token. Please refresh the page and try again.'];
            return next(e);
        }
        return next(err);
    });

// GET /api/csrf/restore: issues a fresh token (and its cookie).
const restoreCsrf = (req, res) => {
    const csrfToken = generateCsrfToken(req, res, { overwrite: true });
    res.set('Cache-Control', 'no-store');
    res.status(200).json({ csrfToken });
};

module.exports = { csrfProtection, restoreCsrf };
