import { createSlice } from '@reduxjs/toolkit';
import { csrfFetch, restoreCSRF } from "./csrf";

// State shape (unchanged): the logged-in user plus *their own* content, kept
// as arrays (not id maps): { user, playlists: [], songs: [], albums: [] }.
const initialState = {
    user: null,
    playlists: [],
    songs: [],
    albums: []
};

const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setSessionUser: (state, action) => {
            state.user = action.payload;
        },
        signUpNewUser: (state, action) => {
            state.user = action.payload;
        },
        removeSessionUser: () => initialState,
        getMyPlaylists: (state, action) => {
            state.playlists = action.payload;
        },
        getMyAlbums: (state, action) => {
            state.albums = action.payload;
        },
        getMySongs: (state, action) => {
            state.songs = action.payload;
        }
    }
});

const { setSessionUser, signUpNewUser, removeSessionUser, getMyPlaylists, getMyAlbums, getMySongs } =
    sessionSlice.actions;

export const loginUser = (user) => async (dispatch) => {
    const res = await csrfFetch('/api/session/login', {
        method: 'POST',
        body: JSON.stringify(user)
    });

    if (res.ok) {
        const user = await res.json();
        // The CSRF token is tied to the login cookie: get a new one.
        await restoreCSRF();
        dispatch(setSessionUser(user));
        return user;
    }
    return res;
};

export const getCurrUser = () => async (dispatch) => {
    const res = await csrfFetch('/api/my');

    if (res.ok) {
        const { currUser } = await res.json();
        dispatch(setSessionUser(currUser));
        return res
    };
};

export const signUpUser = (user) => async (dispatch) => {
    const { image, images, username, email, password, firstName, lastName } = user;
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);

    // for multiple files
    if (images && images.length !== 0) {
        for (var i = 0; i < images.length; i++) {
            formData.append("images", images[i]);
        }
    }

    // for single file
    if (image) formData.append("image", image);
    const res = await csrfFetch('/api/users/signup', {
        method: 'POST',
        headers: {
            "Content-Type": "multipart/form-data",
        },
        body: formData
    });

    if (res.ok) {
        const newUser = await res.json();
        await restoreCSRF(); // new login cookie -> new CSRF token
        dispatch(signUpNewUser(newUser));
        return newUser;
    };
};


export const myPlaylists = () => async (dispatch) => {
    const res = await csrfFetch('/api/my/playlists');

    if (res.ok) {
        const data = await res.json();
        dispatch(getMyPlaylists(data.Playlists));
        return data;
    };
};

export const mySongs = () => async (dispatch) => {
    const res = await csrfFetch('/api/my/songs');

    if (res.ok) {
        const data = await res.json();
        dispatch(getMySongs(data.Songs));
        return data;
    };
};

export const myAlbums = () => async (dispatch) => {
    const res = await csrfFetch('/api/my/albums');

    if (res.ok) {
        const data = await res.json();
        dispatch(getMyAlbums(data.Albums));
        return data;
    };
};


export const logoutUser = () => async (dispatch) => {
    const res = await csrfFetch('/api/session/logout', {
        method: 'DELETE'
    });

    if (res.ok) {
        const loggedOut = await res.json();
        await restoreCSRF(); // logged out -> new CSRF token
        dispatch(removeSessionUser())
        return loggedOut;
    };
};

export default sessionSlice.reducer;
