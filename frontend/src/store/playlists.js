import { createSlice } from '@reduxjs/toolkit';
import { csrfFetch } from "./csrf";

// State shape (unchanged): { currentPlaylist: { [id]: playlist }, playlists: { [id]: playlist } }
// Same idea as the albums slice: `playlists` is the list, `currentPlaylist`
// holds playlists opened on their own page (with Songs and User).
const playlistsSlice = createSlice({
    name: 'playlists',
    initialState: {
        currentPlaylist: {},
        playlists: {}
    },
    reducers: {
        getPlaylistsAction: (state, action) => {
            state.currentPlaylist = {};
            state.playlists = {};
            action.payload.forEach((playlist) => {
                state.playlists[playlist.id] = playlist;
            });
        },
        createPlaylistAction: (state, action) => {
            state.playlists[action.payload.id] = action.payload;
        },
        updatePlaylistAction: (state, action) => {
            const playlist = action.payload;
            state.playlists[playlist.id] = playlist;
            if (state.currentPlaylist[playlist.id]) {
                state.currentPlaylist[playlist.id] = { ...state.currentPlaylist[playlist.id], ...playlist };
            }
        },
        deletePlaylistAction: (state, action) => {
            delete state.playlists[action.payload];
            delete state.currentPlaylist[action.payload];
        },
        showPlaylistAction: (state, action) => {
            state.currentPlaylist[action.payload.id] = action.payload;
        }
    }
});

export const {
    getPlaylistsAction,
    createPlaylistAction,
    updatePlaylistAction,
    deletePlaylistAction,
    showPlaylistAction
} = playlistsSlice.actions;

export const getPlaylists = () => async (dispatch) => {
    const res = await csrfFetch('/api/playlists');

    if (res.ok) {
        const playlists = await res.json();
        dispatch(getPlaylistsAction(playlists));
        return playlists;
    }
};

export const createPlaylist = (playlist) => async (dispatch) => {
    const res = await csrfFetch('/api/playlists', {
        method: 'POST',
        body: JSON.stringify(playlist)
    });

    if (res.ok) {
        const newPlaylist = await res.json();
        dispatch(createPlaylistAction(newPlaylist));
        return newPlaylist;
    }
};

export const updatePlaylist = (data) => async (dispatch) => {
    const { playlistId } = data;
    const res = await csrfFetch(`/api/playlists/${playlistId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });

    if (res.ok) {
        const updatedPlaylist = await res.json();
        dispatch(updatePlaylistAction(updatedPlaylist));
        return updatedPlaylist;
    }
};

export const deletePlaylist = (playlistId) => async (dispatch) => {
    const res = await csrfFetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE'
    });

    if (res.ok) {
        const deletedPlaylist = await res.json();
        dispatch(deletePlaylistAction(playlistId));
        return deletedPlaylist;
    }
};

export const showPlaylist = (playlistId) => async (dispatch) => {
    const res = await csrfFetch(`/api/playlists/${playlistId}`);

    if (res.ok) {
        const playlist = await res.json();
        dispatch(showPlaylistAction(playlist));
        return playlist;
    }
};

export default playlistsSlice.reducer;
