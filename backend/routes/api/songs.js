const express = require('express');
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { Song, User, Album, Comment } = require('../../db/models');
const { check, query, matchedData } = require('express-validator');
const { handleValidationErrors, validateIdParam } = require('../../utils/validation');
const { requireOwner } = require('../../utils/ownership');
const { pick } = require('../../utils/pick');
const app = require('../../app');
const song = require('../../db/models/song');

const router = express.Router();
router.param('songId', validateIdParam);

const validateComment = [
    check('body')
        .exists({ checkFalsy: true })
        .withMessage('Comment body text is required')
        .bail()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Comment body text is required')
        .isLength({ max: 256 })
        .withMessage('Comment must be 256 characters or less.'),
    handleValidationErrors
];

// Fields are optional on update, but if sent they must be valid.
const validateSongUpdate = [
    check('title')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Song title cannot be empty.')
        .isLength({ max: 30 })
        .withMessage('Song title must be 30 characters or less.'),
    check('description')
        .optional()
        .isString()
        .isLength({ max: 256 })
        .withMessage('Song description must be 256 characters or less.'),
    check('previewImage')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Song image cannot be empty.')
        .isLength({ max: 255 })
        .withMessage('Song image URL must be 255 characters or less.'),
    handleValidationErrors
];

// Query params for GET /api/songs. All optional:
//   page      integer >= 1          (default 1)
//   size      integer 1..MAX_SIZE   (default DEFAULT_SIZE)
//   title     exact song title
//   createdAt a date/time
const DEFAULT_SIZE = 20;
const MAX_SIZE = 100;

const validateQueryParams = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be an integer greater than or equal to 1.')
        .toInt(),
    query('size')
        .optional()
        .isInt({ min: 1, max: MAX_SIZE })
        .withMessage(`Size must be an integer between 1 and ${MAX_SIZE}.`)
        .toInt(),
    query('title')
        .optional()
        .isString()
        .isLength({ max: 30 })
        .withMessage('Title must be 30 characters or less.'),
    query('createdAt')
        .optional()
        .isISO8601()
        .withMessage('CreatedAt is invalid'),
    handleValidationErrors
];

const songCouldNotBeFound = (next) => {
    const e = new Error();
    e.message = "Song couldn't be found.";
    e.status = 404;
    next(e)
}

router.post('/:songId/comments', requireAuth, validateComment, async(req, res, next) => {
    const { songId } = req.params;
    const { user } = req;
    const { body } = req.body

    // Any logged-in user can comment on any song (not just their own).
    const song = await Song.findByPk(songId);

    if(song){
        const comment = await Comment.create({
            body,
            songId: song.id,
            userId: user.id
        });

        return res.json(comment)
    }else{
        songCouldNotBeFound(next)
    }
});

router.get('/:songId/comments', async(req, res, next) => {
    const { songId } = req.params;

    const song = await Song.findByPk(songId);

    if(song){
        const Comments = await Comment.findAll({
            where: {
                songId: song.id
            },
            include: {
                model: User.scope('includedInComment')
            }
        })

        return res.json({Comments})
    }else{
        songCouldNotBeFound(next)
    }
})

router.put('/:songId', requireAuth, requireOwner(Song, 'songId'), validateSongUpdate, async (req, res, next) => {
    const song = res.locals.record;

    // Only these fields can be edited. previewImage is included because the
    // Update Song form lets the owner change the cover image.
    await song.update(pick(req.body, ['title', 'description', 'previewImage']));
    return res.json(song)
})

router.get('/:songId', async (req, res, next) => {
    const { songId } = req.params;

    // One query: the song, its album and its artist (S26; before, the artist
    // was a second query).
    const song = await Song.findByPk(songId, {
        include: [
            { model: Album.scope('includedAlbum') },
            { model: User.scope('includedArtist') }
        ]
    });
    if (song) {
        // The response keeps the same shape as before: the artist is `Artist`.
        const json = song.toJSON();
        json.Artist = json.User;
        delete json.User;
        return res.json(json)
    } else {
        songCouldNotBeFound(next);
    }
});

router.delete('/:songId', requireAuth, async(req, res, next) => {
    const { user } = req;
    const { songId } = req.params;

    const song = await Song.findOne({
        where: {
            id: songId,
            userId: user.id
        }
    });

    if(song){
        await song.destroy();

        res.status(200)
        return res.json({
            message: "Successfully deleted.",
            statusCode: 200
        })
    }else{
        songCouldNotBeFound(next);
    }
})

router.get('/', validateQueryParams, async (req, res, next) => {
    // matchedData returns the validated values, with page/size already
    // converted to numbers by toInt(). (In Express 5 req.query is re-parsed
    // on every access, so sanitizers cannot change it in place.)
    const params = matchedData(req, { locations: ['query'] });
    const page = params.page || 1;
    const size = params.size || DEFAULT_SIZE;
    const { title, createdAt } = params;

    const where = {};
    if (title) where.title = title;
    if (createdAt) where.createdAt = new Date(createdAt);

    // findAndCountAll runs the page query plus a COUNT(*) with the same
    // filters, so the client knows how many songs there are in total.
    const { rows: Songs, count: total } = await Song.findAndCountAll({
        where,
        order: [['id', 'ASC']], // stable order so pages don't overlap
        limit: size,
        offset: (page - 1) * size
    });

    return res.json({
        Songs,
        page,
        size,
        total
    });
})

module.exports = router
