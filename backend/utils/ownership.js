// backend/utils/ownership.js
//
// Middleware factory that makes sure the logged-in user owns a record before
// a write route runs. Use it AFTER requireAuth.
//
//   router.put('/:songId', requireAuth, requireOwner(Song, 'songId'), handler)
//
// - 404 if no record has that id
// - 403 if the record belongs to someone else
// - otherwise the record is stored on res.locals.record and next() is called,
//   so the handler does not need to look it up again.

const notFound = (Model) => {
    const err = new Error(`${Model.name} couldn't be found.`);
    err.title = 'Not Found';
    err.errors = [err.message];
    err.status = 404;
    return err;
};

const forbidden = () => {
    const err = new Error('Forbidden');
    err.title = 'Forbidden';
    err.errors = ['You do not have permission to change this resource.'];
    err.status = 403;
    return err;
};

const requireOwner = (Model, param, ownerField = 'userId') =>
    async (req, res, next) => {
        const record = await Model.findByPk(req.params[param]);

        if (!record) return next(notFound(Model));
        if (!req.user || record[ownerField] !== req.user.id) return next(forbidden());

        res.locals.record = record;
        return next();
    };

module.exports = { requireOwner };
