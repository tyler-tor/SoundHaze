const PLAY_SONG = 'player/PLAY_SONG';
const PLAY_NEXT = 'player/PLAY_NEXT';
const PLAY_PREVIOUS = 'player/PLAY_PREVIOUS';

// playSong(song)                      play one song
// playSong(song, list)                play `song` and make `list` the queue, so
//                                     next / previous move through that list
// playSong(song, list, artistName)    same; artistName is shown in the player
export const playSong = (song, queue = [], artistName = null) => ({
    type: PLAY_SONG,
    payload: { song, queue, artistName }
});
export const playNext = () => ({ type: PLAY_NEXT });
export const playPrevious = () => ({ type: PLAY_PREVIOUS });

const initialState = {
    song: null,
    queue: [],
    index: -1
};

const playerReducer = (state = initialState, action) => {
    switch (action.type) {
        case PLAY_SONG: {
            const { song, queue, artistName } = action.payload;
            const withArtist = (s) => (artistName ? { ...s, artistName } : s);
            const list = (queue.length ? queue : [song]).map(withArtist);
            const found = list.findIndex((s) => s.id === song.id);
            const index = found < 0 ? 0 : found;
            return { song: list[index] ?? withArtist(song), queue: list, index };
        }
        case PLAY_NEXT: {
            const index = state.index + 1;
            if (index >= state.queue.length) return state; // end of queue: stay put
            return { ...state, song: state.queue[index], index };
        }
        case PLAY_PREVIOUS: {
            const index = state.index - 1;
            if (index < 0) return state;
            return { ...state, song: state.queue[index], index };
        }
        default:
            return state;
    }
};

export default playerReducer;
