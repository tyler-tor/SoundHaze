import { createSlice } from '@reduxjs/toolkit';
import { csrfFetch } from './csrf';

// Comments, grouped by song: { bySong: { [songId]: [comment, ...] } }, newest first.
// A comment looks like { id, body, songId, userId, createdAt, User: { id, username, previewImage } }.
const commentsSlice = createSlice({
    name: 'comments',
    initialState: { bySong: {} },
    reducers: {
        setComments: (state, action) => {
            const { songId, comments } = action.payload;
            state.bySong[songId] = comments;
        },
        addComment: (state, action) => {
            const comment = action.payload;
            const list = state.bySong[comment.songId] || [];
            state.bySong[comment.songId] = [comment, ...list];
        },
        replaceComment: (state, action) => {
            const comment = action.payload;
            const list = state.bySong[comment.songId] || [];
            const i = list.findIndex((c) => c.id === comment.id);
            if (i !== -1) list[i] = { ...list[i], ...comment };
        },
        deleteComment: (state, action) => {
            const { songId, commentId } = action.payload;
            state.bySong[songId] = (state.bySong[songId] || []).filter((c) => c.id !== commentId);
        }
    }
});

const { setComments, addComment, replaceComment, deleteComment } = commentsSlice.actions;

export const getComments = (songId) => async (dispatch) => {
    const res = await csrfFetch(`/api/songs/${songId}/comments`);
    const { Comments } = await res.json();
    dispatch(setComments({ songId: Number(songId), comments: Comments }));
    return Comments;
};

export const createComment = ({ songId, body }) => async (dispatch, getState) => {
    const res = await csrfFetch(`/api/songs/${songId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body })
    });
    const comment = await res.json();
    // The API returns the bare comment; attach the author for display.
    const { id, username, previewImage } = getState().session.user;
    const withUser = { ...comment, User: { id, username, previewImage } };
    dispatch(addComment(withUser));
    return withUser;
};

export const updateComment = ({ commentId, body }) => async (dispatch) => {
    const res = await csrfFetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ body })
    });
    const comment = await res.json();
    dispatch(replaceComment(comment));
    return comment;
};

export const removeComment = ({ songId, commentId }) => async (dispatch) => {
    const res = await csrfFetch(`/api/comments/${commentId}`, { method: 'DELETE' });
    const data = await res.json();
    dispatch(deleteComment({ songId: Number(songId), commentId }));
    return data;
};

export default commentsSlice.reducer;
