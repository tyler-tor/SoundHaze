const express = require('express');
// Express 5 passes errors thrown in async route handlers (rejected promises)
// to the error handler by itself, so express-async-errors is no longer needed.
const morgan = require('morgan');
const cors = require('cors');
const { csrfProtection } = require('./utils/csrf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { environment } = require('./config');
const isProduction = environment === 'production';
const routes = require('./routes');
const { ValidationError } = require('sequelize');

const app = express();

// Behind a proxy (CloudFront, a load balancer, nginx) the client's real IP is
// in X-Forwarded-For. Trust exactly one proxy hop in production so
// req.ip (used by the rate limiter) is the real client IP. Not set in
// development, where there is no proxy and the header could be faked.
if (isProduction) {
    app.set('trust proxy', 1);
}

app.use(morgan('dev'));
app.use(cookieParser());
// Small body limits: JSON/form bodies here are tiny. File uploads are
// multipart and handled (with their own size limits) by multer in awsS3.js.
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(express.json({ limit: '100kb' }));
// Express 5 leaves req.body undefined when no body parser ran (e.g. a request
// without a JSON body). Several handlers destructure req.body, so keep the
// Express 4 behaviour of an empty object.
app.use((req, _res, next) => {
    if (req.body === undefined) req.body = {};
    next();
});

//Security Middleware
if (!isProduction) {
    //enable cors only in development
    app.use(cors());
};

//helmet sets a variety of security headers (HSTS, X-Content-Type-Options,
//X-Frame-Options, Referrer-Policy, Content-Security-Policy, ...)
app.use(
    helmet({
        // Allow other origins (e.g. the frontend on S3/CloudFront) to load
        // resources served by this API.
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        // Cross-Origin-Embedder-Policy stays off (helmet 7+ default). Turning
        // it on would block the S3 images and audio, which do not send
        // Cross-Origin-Resource-Policy headers.
        // The CSP mainly matters for the React build that Express serves in
        // production (routes/index.js). Extend helmet's defaults with what
        // the app actually loads: the Font Awesome kit, images and audio
        // from S3 (any https URL), and the player's blob: media.
        contentSecurityPolicy: {
            directives: {
                'script-src': ["'self'", 'https://kit.fontawesome.com'],
                'connect-src': ["'self'", 'https://ka-f.fontawesome.com'],
                'img-src': ["'self'", 'data:', 'blob:', 'https:'],
                'media-src': ["'self'", 'blob:', 'https:'],
                'font-src': ["'self'", 'data:', 'https:']
            }
        }
    })
);

// CSRF check for every POST/PUT/PATCH/DELETE (see utils/csrf.js).
// The token comes from GET /api/csrf/restore (routes/index.js).
app.use(csrfProtection);

app.use(routes);

//catch unhandles requests and forward to error handler
app.use((_req, _res, next) => {
    const err = new Error("The requested resource couldn't be found");
    err.title = "Resource Not Found";
    err.errors = ["The requested resource couldn't be found."];
    err.status = 404;
    next(err);
});

app.use((err, _req, _res, next) => {
    //check if error is Sequelize error;
    if (err instanceof ValidationError) {
        err.errors = err.errors.map((e) => e.message);
        err.title = 'Validation error';
    };
    next(err);
});

app.use((err, _req, res, next) => {
    res.status(err.status || 500);
    console.error(err);
    res.json({
        title: err.title || 'Server Error',
        message: err.message,
        errors: err.errors,
        stack: isProduction ? null : err.stack
    });
});


module.exports = app;
