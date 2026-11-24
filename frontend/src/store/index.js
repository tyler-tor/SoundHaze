// frontend/src/store/index.js
//
// Redux Toolkit store (S24). configureStore replaces the old createStore +
// applyMiddleware + compose setup:
//   - thunk middleware is included by default (our async action creators
//     such as getSongs() keep working unchanged);
//   - the Redux DevTools browser extension is enabled automatically in
//     development and off in production builds;
//   - in development it also checks that reducers never mutate state and
//     that state/actions are serializable, and warns in the console if not.
// redux-logger is gone: use the Redux DevTools extension instead.
//
// Every store/*.js file is a createSlice slice (X4). Each file exports its
// reducer as the default export and its thunks / action creators by name.
import { configureStore as configureRtkStore } from '@reduxjs/toolkit';
import sessionReducer from './session';
import songsReducer from './songs';
import albumsReducer from './albums';
import playerReducer from './player';
import playlistsReducer from './playlists';

const reducer = {
  session: sessionReducer,
  songs: songsReducer,
  albums: albumsReducer,
  player: playerReducer,
  playlists: playlistsReducer
};

const configureStore = (preloadedState) =>
  configureRtkStore({
    reducer,
    preloadedState,
    devTools: import.meta.env.DEV
  });

export default configureStore;
