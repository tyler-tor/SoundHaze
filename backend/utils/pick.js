// backend/utils/pick.js
//
// Copy only the allowed keys from an object (usually req.body).
// Keys that are missing/undefined are skipped, so partial updates work.
// This prevents "mass assignment": a client can't sneak in userId, albumId,
// id, createdAt, etc. just by adding them to the JSON body.

const pick = (source = {}, allowed = []) => {
    const out = {};
    for (const key of allowed) {
        if (source[key] !== undefined) out[key] = source[key];
    }
    return out;
};

module.exports = { pick };
