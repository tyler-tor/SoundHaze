import { csrfFetch } from "./csrf";

// Thunks for the songs inside a playlist. They only call the API and return
// the JSON. (They used to dispatch playlistSongs/* actions that no reducer
// handled, which did nothing. Pages re-fetch the playlist with showPlaylist()
// after a change instead.)

export const addSongToPlaylist = ({ playlistId, songId }) => async () => {
    const res = await csrfFetch(`/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        body: JSON.stringify({ playlistId, songId })
    });
    return res.json();
};

export const removeSongFromPlaylist = ({ playlistId, songId }) => async () => {
    const res = await csrfFetch(`/api/playlists/${playlistId}/songs/${songId}`, {
        method: 'DELETE'
    });
    return res.json();
};
