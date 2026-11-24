const express = require('express');
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { Song, User, Album } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors, validateIdParam } = require('../../utils/validation');
const {singlePublicFileUpload, singleMulterUpload} = require('../../awsS3')
const { requireOwner } = require('../../utils/ownership');
const { pick } = require('../../utils/pick');

const router = express.Router();
router.param('albumId', validateIdParam);

const validateSong = [
    check('title')
        .exists({ checkFalsy: true })
        .withMessage('Song title is required.')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('Song title is required.')
        .isLength({ max: 30 })
        .withMessage('Song title must be 30 characters or less.'),
    check('description')
        .optional()
        .isLength({ max: 256 })
        .withMessage('Song description must be 256 characters or less.'),
    // check('url')
    //     .exists({ checkFalsy: true })
    //     .withMessage('Audio is required'),
    handleValidationErrors
];

const validateAlbum = [
    check('title')
        .exists({ checkFalsy: true })
        .withMessage('Album title is required.')
        .bail()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Album title is required.')
        .isLength({ max: 30 })
        .withMessage('Album title must be 30 characters or less.'),
    check('description')
        .exists({ checkFalsy: true })
        .withMessage('Album description is required.')
        .bail()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Album description is required.')
        .isLength({ max: 256 })
        .withMessage('Album description must be 256 characters or less.'),
    check('imageUrl')
        .exists({ checkFalsy: true })
        .withMessage('Album imageUrl is required.')
        .bail()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Album imageUrl is required.')
        .isLength({ max: 256 })
        .withMessage('Album imageUrl must be 256 characters or less.'),
    handleValidationErrors
];

const albumCouldNotBeFound = (next) => {
    const e = new Error();
    e.message = "Album couldn't be found.";
    e.status = 404;
    next(e)
}

// Ownership is checked BEFORE multer/S3 so a non-owner's file is never uploaded.
router.post('/:albumId/songs', requireAuth, requireOwner(Album, 'albumId'), singleMulterUpload('url', 'audio'), validateSong, async(req, res, next) => {
    const { user } = req;
    const album = res.locals.record;
    const { title, description } = req.body;
    if (!req.file) {
        const err = new Error('Audio file is required.');
        err.title = 'Bad request.';
        err.errors = ['Audio file is required.'];
        err.status = 400;
        return next(err);
    }
    const url = await singlePublicFileUpload(req.file);

    const song = await Song.create({
        title,
        description,
        url,
        previewImage: album.previewImage,
        albumId: album.id,
        userId: user.id
    })
    return res.json(song)
});

router.get('/:albumId', async(req, res, next) => {
    const { albumId } = req.params;


    // One query for the album, its songs and its artist (S26).
    const album = await Album.findByPk(albumId, {
        include: [
            { model: Song },
            { model: User.scope('includedArtist') }
        ]
    });

    if(album){
        const json = album.toJSON();
        json.Artist = json.User;
        delete json.User;
        return res.json(json)
    }else{
        albumCouldNotBeFound(next)
    }
});

router.put('/:albumId', [requireAuth, requireOwner(Album, 'albumId'), validateAlbum], async(req, res, next) => {
    const album = res.locals.record;

    // The frontend sends the new image as `imageUrl` (same name the create
    // route uses), so accept it as an alias for previewImage.
    const updates = pick(req.body, ['title', 'description', 'previewImage']);
    if (req.body.imageUrl !== undefined) updates.previewImage = req.body.imageUrl;
    await album.update(updates);

    return res.json(album)
});

router.delete('/:albumId', requireAuth, async(req, res, next) => {
    const { user } = req;
    const { albumId } = req.params;

    const album = await Album.findOne({
        where: {
            userId: user.id,
            id: albumId
        }
    });

    if(album){
        await album.destroy();

        res.status(200);
        return res.json({
            message: "Successfully deleted.",
            statusCode: 200
        })
    }else {
        albumCouldNotBeFound(next)
    }
})

router.post('/', [requireAuth, validateAlbum], async(req, res, next) => {
    const { title, description, imageUrl } = req.body;
    const { user } = req;

    const album = await Album.create({
        title,
        description,
        previewImage: imageUrl,
        userId: user.id
    });

    return res.json(album)
});

router.get('/', async(req, res, next) => {

    const albums = await Album.findAll();

    return res.json(albums);
})

module.exports = router
