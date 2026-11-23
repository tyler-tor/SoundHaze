const express = require('express');
const { singlePublicFileUpload, singleMulterUpload } = require('../../awsS3');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();

router.post('/upload', requireAuth, singleMulterUpload('image', 'image'), async (req, res, next) => {
    if (!req.file) {
        const err = new Error('Image file is required.');
        err.title = 'Bad request.';
        err.errors = ['Image file is required.'];
        err.status = 400;
        return next(err);
    }
    const profileImageUrl = await singlePublicFileUpload(req.file);

    return res.json({ profileImageUrl });
});

module.exports = router;
