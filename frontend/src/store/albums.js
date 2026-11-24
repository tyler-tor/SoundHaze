import { createSlice } from '@reduxjs/toolkit';
import { csrfFetch } from "./csrf";

// State shape (unchanged): { currentAlbum: { [id]: album }, albums: { [id]: album } }
//   albums        the list shown on /albums (no songs inside)
//   currentAlbum  full albums (with Songs and Artist) that were opened on
//                 their own page; despite the name it is a map keyed by id.
const albumsSlice = createSlice({
    name: 'albums',
    initialState: {
        currentAlbum: {},
        albums: {}
    },
    reducers: {
        getAlbumsAction: (state, action) => {
            state.currentAlbum = {};
            state.albums = {};
            action.payload.forEach((album) => {
                state.albums[album.id] = album;
            });
        },
        createAlbumAction: (state, action) => {
            state.albums[action.payload.id] = action.payload;
        },
        updateAlbumAction: (state, action) => {
            const album = action.payload;
            state.albums[album.id] = album;
            // The update response has no Songs/Artist: keep them if the full
            // album was already loaded.
            if (state.currentAlbum[album.id]) {
                state.currentAlbum[album.id] = { ...state.currentAlbum[album.id], ...album };
            }
        },
        removeAlbumAction: (state, action) => {
            delete state.albums[action.payload];
            delete state.currentAlbum[action.payload];
        },
        showAlbumAction: (state, action) => {
            state.currentAlbum[action.payload.id] = action.payload;
        }
    }
});

export const {
    getAlbumsAction,
    createAlbumAction,
    updateAlbumAction,
    removeAlbumAction,
    showAlbumAction
} = albumsSlice.actions;

export const getAlbums = () => async (dispatch) => {
    const res = await csrfFetch('/api/albums');

    if (res.ok) {
        const albums = await res.json();
        dispatch(getAlbumsAction(albums));
        return albums;
    }
};

export const createAlbum = (data) => async (dispatch) => {
    const res = await csrfFetch('/api/albums', {
        method: 'POST',
        body: JSON.stringify(data)
    });

    if (res.ok) {
        const newAlbum = await res.json();
        dispatch(createAlbumAction(newAlbum));
        return newAlbum;
    };
};

export const updateAlbum = (data) => async (dispatch) => {
    const { albumId } = data;
    const res = await csrfFetch(`/api/albums/${albumId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });

    if (res.ok) {
        const updatedAlbum = await res.json();
        dispatch(updateAlbumAction(updatedAlbum));
        return updatedAlbum;
    }
};

export const removeAlbum = (albumId) => async (dispatch) => {
    const res = await csrfFetch(`/api/albums/${albumId}`, {
        method: 'DELETE'
    });

    if (res.ok) {
        const deletedAlbum = await res.json();
        dispatch(removeAlbumAction(albumId));
        return deletedAlbum
    };
};

export const showAlbum = (albumId) => async (dispatch) => {
    const res = await csrfFetch(`/api/albums/${albumId}`);

    if (res.ok) {
        const album = await res.json();
        dispatch(showAlbumAction(album));
        return album
    }
}

export default albumsSlice.reducer;
