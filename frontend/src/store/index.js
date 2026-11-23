import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import sessionReducer from './session';
import songsReducer from './songs';
import albumsReducer from './albums';
import playerReducer from './player';
import artistsReducer from './artists';
import playlistsReducer from './playlists';

let enhancer;

// import.meta.env.PROD / DEV replace process.env.NODE_ENV under Vite (S21).
if (import.meta.env.PROD) {
  enhancer = applyMiddleware(thunk);
} else {
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const rootReducer = combineReducers({
  session: sessionReducer,
  songs: songsReducer,
  albums: albumsReducer,
  player: playerReducer,
  artists: artistsReducer,
  playlists: playlistsReducer
});


const configureStore = (preloadedState) => {
    return createStore(rootReducer, preloadedState, enhancer);
  };

  export default configureStore;
