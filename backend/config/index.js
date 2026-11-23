//backend/config/index.js

module.exports = {
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    dbFile: process.env.DB_FILE,
    jwtConfig: {
        secret: process.env.JWT_SECRET,
        // Token lifetime in seconds (a string from the env, e.g. "604800").
        // Parsed and checked in utils/auth.js. Default: 7 days.
        expiresIn: process.env.JWT_EXPIRES_IN || '604800'
    }
};
