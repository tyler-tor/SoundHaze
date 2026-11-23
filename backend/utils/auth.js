const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

// Checked once when the app starts, so a missing secret fails loudly at
// startup instead of at the first login.
const secret = jwtConfig.secret;
if (!secret) {
    throw new Error('JWT_SECRET is not set. Add it to backend/.env (any long random string).');
}
// Lifetime in seconds, as a number. Used for both the token and the cookie.
const expiresIn = Number(jwtConfig.expiresIn);
if (!Number.isInteger(expiresIn) || expiresIn <= 0) {
    throw new Error(`JWT_EXPIRES_IN must be a whole number of seconds (got "${jwtConfig.expiresIn}").`);
}

const setTokenCookie = (res,user) => {
    const token = jwt.sign(
        { data: user.toSafeObject() },
        secret,
        { expiresIn } // number = seconds
    );

    const isProduction = process.env.NODE_ENV === 'production';

    //set the token cookie
    res.cookie('token', token, {
        maxAge: expiresIn * 1000, // cookie maxAge is in milliseconds
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction && 'Lax'
    });

    return token;
};

const restoreUser = (req, res, next) => {
    const { token } = req.cookies;
    req.user = null;

    if (!token) return next();

    // Only accept the algorithm we sign with (HS256 is jsonwebtoken's default).
    return jwt.verify(token, secret, { algorithms: ['HS256'] }, async(err, jwtPayload) => {
        if(err){
            return next();
        }

        try{
            const { id } = jwtPayload.data;
            req.user = await User.scope('currentUser').findByPk(id);
        } catch (e) {
            res.clearCookie('token');
            return next();
        }

        if(!req.user) res.clearCookie('token');

        return next();
    });
};

const requireAuth = [restoreUser,
    function(req, _res, next) {
    if(req.user) return next();

    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    err.errors = ['Authentication required'];
    err.status = 401;
    return next(err);
}];

const requireProperAuthorize = [

]

module.exports = { setTokenCookie, restoreUser, requireAuth };
