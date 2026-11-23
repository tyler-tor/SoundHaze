const express = require('express');
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');
const { UniqueConstraintError } = require('sequelize');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const {singlePublicFileUpload, singleMulterUpload} = require('../../awsS3');
const app = require('../../app');
const { route } = require('./my');

const router = express.Router();

const validateSignup = [
    check('email')
        .exists({ checkFalsy: true })
        .isEmail()
        .withMessage('Please provide a valid email.')
        .isLength({ max: 256 })
        .withMessage('Email must be 256 characters or less.'),
    check('username')
        .exists({ checkFalsy: true })
        .isLength({ min: 4, max: 30 })
        .withMessage('Username must be between 4 and 30 characters.'),
    check('username')
        .not()
        .isEmail()
        .withMessage('Username cannot be an email.'),
    check('password')
        .exists({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage('Password must be 6 characters or more.'),
    check('firstName')
        .optional()
        .isLength({ max: 30 })
        .withMessage('First name must be 30 characters or less.'),
    check('lastName')
        .optional()
        .isLength({ max: 30 })
        .withMessage('Last name must be 30 characters or less.'),
    handleValidationErrors
];

router.post('/signup', singleMulterUpload('image'), validateSignup, async(req, res, next) => {
    const { email, password, username, firstName, lastName } = req.body;
    try{
        // The profile image is optional. Without one, previewImage stays null
        // and the User model returns a default avatar URL instead.
        const profileImageUrl = req.file ? await singlePublicFileUpload(req.file) : null;
        const user = await User.signup({ email, username, password, profileImageUrl, firstName, lastName });

        // Token goes only in the httpOnly cookie, never in the JSON body.
        setTokenCookie(res, user);

        return res.json(
            user
        );
    }catch(e){
        // Only a duplicate username/email is a "user already exists" case.
        // Anything else (S3 failure, DB down, ...) is passed on unchanged and
        // becomes a 500, so the real cause shows up in the logs.
        if (e instanceof UniqueConstraintError) {
            const err = new Error('Username or email already taken.');
            err.title = 'Signup failed';
            err.errors = ['Username or email already taken.'];
            err.status = 409;
            return next(err);
        }
        return next(e);
    }
});


module.exports = router;
