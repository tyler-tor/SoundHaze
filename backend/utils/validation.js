const { validationResult } = require('express-validator');

//middleware for formatting errors from express-validator middleware
const handleValidationErrors = (req, _res, next) => {
    const validationErrors = validationResult(req);

    if(!validationErrors.isEmpty()) {
        const errors = validationErrors
        .array()
        .map((error) => `${error.msg}`);

        const err = Error('Bad request.');
        err.errors = errors;
        err.status = 400;
        err.title = 'Bad request.';
        // `return` matters: without it the route handler would still run
        // after a validation error.
        return next(err);
    }
    return next();
};

// Use with router.param('songId', validateIdParam) so every route with a
// :songId (etc.) URL param rejects non-integer ids with a 400 instead of
// passing junk like "abc" or "1;drop" to the database.
const validateIdParam = (req, _res, next, value, name) => {
    if (/^[1-9][0-9]{0,9}$/.test(String(value))) return next();

    const err = new Error('Bad request.');
    err.title = 'Bad request.';
    err.errors = [`${name} must be a positive integer.`];
    err.status = 400;
    return next(err);
};

module.exports = {
    handleValidationErrors,
    validateIdParam
}
