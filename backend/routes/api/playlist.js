const express = require('express');
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { Song, User, Album, Playlist, Comment, PlaylistSong } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors, validateIdParam } = require('../../utils/validation');
const { requireOwner } = require('../../utils/ownership');
const { pick } = require('../../utils/pick');

const router = express.Router();
router.param('playlistId', validateIdParam);
router.param('songId', validateIdParam);

const playlistCouldNotBeFound = (next) => {
    const e = new Error();
    e.message = "Playlist couldn't be found.";
    e.status = 404;
    next(e)
};
const songCouldNotBeFound = (next) => {
    const e = new Error();
    e.message = "Song couldn't be found.";
    e.status = 404;
    next(e)
};

const validatePlaylist = [
    check('name')
        .exists({ checkFalsy: true })
        .withMessage('Playlist name is required')
        .bail()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Playlist name is required')
        .isLength({ max: 30 })
        .withMessage('Playlist name must be 30 characters or less.'),
    check('imageUrl')
        .optional()
        .isString()
        .isLength({ max: 256 })
        .withMessage('Playlist imageUrl must be 256 characters or less.'),
    handleValidationErrors
];

router.delete('/:playlistId/songs/:songId', requireAuth, requireOwner(Playlist, 'playlistId'), async (req, res, next) => {
    const playlist = res.locals.record;
    const { songId } = req.params;

    const playlistSong = await PlaylistSong.findOne({
        where: {
            playlistId: playlist.id,
            songId: songId
        }
    });

    if(playlistSong) {
        await playlistSong.destroy();

        res.status(200);
        return res.json({
            message: "Successfully deleted.",
            statusCode: 200
        })
    }else {
        songCouldNotBeFound(next)
    }
})

const validatePlaylistSong = [
    check('songId')
        .isInt({ min: 1 })
        .withMessage('songId must be a positive integer.'),
    handleValidationErrors
];

router.post('/:playlistId/songs', requireAuth, validatePlaylistSong, async (req, res, next) => {
    const { user } = req;
    const { playlistId } = req.params;
    const { songId } = req.body;

    const playlist = await Playlist.findOne({
        where: {
            userId: user.id,
            id: playlistId
        }
    });
    const song = await Song.findByPk(songId);

    if (playlist && song) {
        // The (playlistId, songId) pair is unique (S25): a duplicate is a clear 409, not a 500.
        const [newPlaylistSong, created] = await PlaylistSong.findOrCreate({
            where: { playlistId: playlist.id, songId: song.id }
        });
        if (!created) {
            const err = new Error('That song is already in this playlist.');
            err.title = 'Conflict';
            err.errors = [err.message];
            err.status = 409;
            return next(err);
        }

        const playlistSong = await PlaylistSong.scope('addSongs').findOne({
            where: {
                id: newPlaylistSong.id
            }
        })

        return res.json(playlistSong)
    } else {
        if (!playlist) playlistCouldNotBeFound(next)
        if (!song) songCouldNotBeFound(next)
    }
});

// router.get('/:playlistId/songs', requireAuth, async (req, res, next) => {
//     const { user } = req;
//     const { playlistId } = req.params;

//     const playlist = await Playlist.findOne({
//         where: {
//             userId: user.id,
//             id: playlistId
//         }
//     });

//     if (playlist) {
//         const newPlaylistSong = await PlaylistSong.create({
//             playlistId: playlist.id,
//             songId: song.id
//         });

//         const playlistSong = await PlaylistSong.scope('addSongs').findOne({
//             where: {
//                 id: newPlaylistSong.id
//             }
//         })

//         return res.json(playlistSong)
//     } else {
//         if (!playlist) playlistCouldNotBeFound(next)
//     }
// })

router.put('/:playlistId', requireAuth, validatePlaylist, async(req, res, next) => {
    const { playlistId } = req.params;
    const { user } = req;

    const playlist = await Playlist.findOne({
        where: {
            id: playlistId,
            userId: user.id
        }
    });

    if(playlist){
        // `imageUrl` is what the frontend sends (same as the create route).
        const updates = pick(req.body, ['name', 'previewImage']);
        if (req.body.imageUrl !== undefined) updates.previewImage = req.body.imageUrl;
        await playlist.update(updates);
        return res.json(playlist)
    }else{
        playlistCouldNotBeFound(next)
    }
})

router.get('/:playlistId', async (req, res, next) => {
    const { playlistId } = req.params;

    // const playlist = await PlaylistSong.findOne({
    //     where: {
    //         playlistId
    //     }
    // })

    const playlistSongs = await Playlist.findOne({
        where: {
            id: playlistId
        },
        include: [
            {model: Song},
            {model: User.scope('includedArtist')}
        ]
    });
    // console.log('-------------------', playlistSongs)
    if (playlistSongs) {
        // console.log(playlistSongs)
        return res.json(playlistSongs)
    } else {
        playlistCouldNotBeFound(next)
    }
});

router.delete('/:playlistId', requireAuth, async(req, res, next) => {
    const { user } = req;
    const { playlistId } = req.params;

    const playlist = await Playlist.findOne({
        where: {
            id: playlistId,
            userId: user.id
        }
    });

    if(playlist){
        await playlist.destroy();

        res.status(200)
        return res.json({
            message: "Successfully deleted.",
            statusCode: 200
        })
    }else {
        playlistCouldNotBeFound(next)
    }
})

router.post('/', requireAuth, validatePlaylist, async (req, res, next) => {
    const { user } = req;
    const { name, imageUrl } = req.body;

    const playlist = await Playlist.create({
        name,
        previewImage: imageUrl,
        userId: user.id
    });

    if (playlist) {
        res.status(201);
        return res.json(playlist)
    } else {
        playlistCouldNotBeFound(next)
    }
});

// Public on purpose: the /playlists page is a "browse all playlists" page, like
// GET /api/albums. A user's own playlists come from GET /api/my/playlists.
router.get('/', async (req, res, next) => {
    const playlists = await Playlist.findAll();

    return res.json(playlists);
})


module.exports = router;
