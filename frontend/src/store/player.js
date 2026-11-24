import { createSlice } from '@reduxjs/toolkit';

// State: { song, queue, index }  (S28)
//   song   the song in the player bar (or null)
//   queue  the list next/previous move through
//   index  position of `song` in `queue`
const playerSlice = createSlice({
    name: 'player',
    initialState: {
        song: null,
        queue: [],
        index: -1
    },
    reducers: {
        // dispatch(playSong(song, list?, artistName?)) -- see the prepare callback.
        playSong: {
            reducer: (state, action) => {
                const { song, queue, artistName } = action.payload;
                const withArtist = (s) => (artistName ? { ...s, artistName } : s);
                const list = (queue.length ? queue : [song]).map(withArtist);
                const found = list.findIndex((s) => s.id === song.id);
                const index = found < 0 ? 0 : found;
                state.queue = list;
                state.index = index;
                state.song = list[index] ?? withArtist(song);
            },
            prepare: (song, queue = [], artistName = null) => ({
                payload: { song, queue, artistName }
            })
        },
        playNext: (state) => {
            const index = state.index + 1;
            if (index >= state.queue.length) return; // end of the queue: stay put
            state.index = index;
            state.song = state.queue[index];
        },
        playPrevious: (state) => {
            const index = state.index - 1;
            if (index < 0) return;
            state.index = index;
            state.song = state.queue[index];
        }
    }
});

export const { playSong, playNext, playPrevious } = playerSlice.actions;

export default playerSlice.reducer;
