const router = require('express').Router();
const { restoreUser } = require('../../utils/auth');
const sessionRouter = require('./session');
const usersRouter = require('./users');
const songsRouter = require('./songs');
const myRouter = require('./my');
const albumRouter = require('./album');
const artistRouter = require('./artist');
const commentRouter = require('./comment');
const playlistRouter = require('./playlist');
const imagesRouter = require('./images');

router.use(restoreUser);
router.use('/session', sessionRouter);
router.use('/users', usersRouter);
router.use('/songs', songsRouter);
router.use('/my', myRouter);
router.use('/albums', albumRouter);
router.use('/artists', artistRouter);
router.use('/comments', commentRouter);
router.use('/playlists', playlistRouter);
router.use('/images', imagesRouter);

module.exports = router;
