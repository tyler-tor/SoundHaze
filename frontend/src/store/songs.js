import { createSlice } from '@reduxjs/toolkit';
import { csrfFetch } from "./csrf";
import { removeAlbumAction } from './albums';

// State shape (unchanged since the plain-Redux version): { [songId]: song }.
// createSlice (X4) lets the reducers "mutate" a draft copy; Immer turns that
// into a new immutable state, so there is no manual spreading.
const songsSlice = createSlice({
    name: 'songs',
    initialState: {},
    reducers: {
        // Replaces everything with the given list.
        getSongsAction: (_state, action) => {
            const byId = {};
            action.payload.forEach((song) => {
                byId[song.id] = song;
            });
            return byId;
        },
        createSongAction: (state, action) => {
            state[action.payload.id] = action.payload;
        },
        updateSongAction: (state, action) => {
            state[action.payload.id] = action.payload;
        },
        removeSongAction: (state, action) => {
            delete state[action.payload];
        },
        showSongAction: (state, action) => {
            state[action.payload.id] = action.payload;
        }
    },
    // Deleting an album deletes its songs on the server (X1): drop them here
    // too instead of waiting for a re-fetch.
    extraReducers: (builder) => {
        builder.addCase(removeAlbumAction, (state, action) => {
            Object.keys(state).forEach((id) => {
                if (state[id].albumId === action.payload) delete state[id];
            });
        });
    }
});

export const {
    getSongsAction,
    createSongAction,
    updateSongAction,
    removeSongAction,
    showSongAction
} = songsSlice.actions;

// GET /api/songs is paginated (max 100 per page). The UI still expects the
// full list, so fetch page after page until we have them all.
export const getSongs = () => async (dispatch) => {
    const size = 100;
    let songs = [];

    for (let page = 1; ; page++) {
        const res = await csrfFetch(`/api/songs?page=${page}&size=${size}`);
        if (!res.ok) return;

        const data = await res.json();
        songs = songs.concat(data.Songs);
        if (data.Songs.length < size || songs.length >= data.total) break;
    }

    dispatch(getSongsAction(songs));
    return songs;
};

export const createAddSong = (data) => async (dispatch) => {
    const { albumId, title, description, url } = data;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('url', url);
    formData.append('albumId', albumId);

    const res = await csrfFetch(`/api/albums/${albumId}/songs`, {
        method: 'POST',
        headers: {
            "Content-Type": "multipart/form-data"
        },
        body: formData
    });

    if (res.ok) {
        const newSong = await res.json();
        dispatch(createSongAction(newSong));
        return newSong;
    };
};

export const updateSong = (data) => async (dispatch) => {
    const { songId } = data;

    const res = await csrfFetch(`/api/songs/${songId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });

    if (res.ok) {
        const updatedSong = await res.json();
        dispatch(updateSongAction(updatedSong));
        return updatedSong;
    }
};

export const removeSong = (songId) => async (dispatch) => {
    const res = await csrfFetch(`/api/songs/${songId}`, {
        method: 'DELETE'
    });

    if (res.ok) {
        const deletedSong = await res.json();
        dispatch(removeSongAction(songId));
        return deletedSong;
    }
};

export const showSong = (songId) => async (dispatch) => {
    const res = await csrfFetch(`/api/songs/${songId}`);

    if (res.ok) {
        const song = await res.json();
        dispatch(showSongAction(song));
        return song;
    }
}

export default songsSlice.reducer;
