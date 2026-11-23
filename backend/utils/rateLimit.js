// backend/utils/rateLimit.js
//
// Slows down password guessing and signup spam: at most 10 requests per
// minute per client IP, counted separately for login and for signup. Over
// the limit the client gets a 429 in the same JSON error shape as the rest
// of the API. Counters are kept in memory, so they reset when the server
// restarts and are per-process (fine for a single server).

const { rateLimit } = require('express-rate-limit');

const makeAuthLimiter = () => rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7', // sends RateLimit / RateLimit-Policy headers
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            title: 'Too many requests',
            message: 'Too many attempts. Please wait a minute and try again.',
            errors: ['Too many attempts. Please wait a minute and try again.']
        });
    }
});

const loginLimiter = makeAuthLimiter();
const signupLimiter = makeAuthLimiter();

module.exports = { loginLimiter, signupLimiter };
