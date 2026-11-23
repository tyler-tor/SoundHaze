import { Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import SignupFormPage from './components/SignupFormPage/SignupFormPage';
import Player from './components/Player';
import * as sessionActions from './store/session';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Songs from './components/Songs/Songs';
import Albums from './components/Albums/Albums';
import Playlists from './components/Playlists/Playlists';
import HomePage from './components/HomePage';
import DisplaySongInfo from './components/Songs/DisplaySongInfo';
import { myPlaylists, myAlbums } from './store/session';
import DisplayAlbumInfo from './components/Albums/DisplayAlbumInfo';
import DisplayPlaylistInfo from './components/Playlists/DisplayPlaylistInfo';
import PageNotFound from './components/PageNotFound';
import './index.css'

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const user = useSelector(state => state.session.user);

  useEffect(() => {
    dispatch(sessionActions.getCurrUser())
      .then(() => setIsLoaded(true));
  }, [dispatch])

  useEffect(() => {
    if (user) {
      dispatch(myPlaylists())
      dispatch(myAlbums())
    }
  }, [user]);
  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        // react-router v7 (S23): <Routes> picks the best match by itself, so
        // the order and "exact" no longer matter. "*" is the 404 page.
        <Routes>
          <Route path='/songs/:songId' element={<DisplaySongInfo />} />
          <Route path='/albums/:albumId' element={<DisplayAlbumInfo />} />
          <Route path='/playlists/:playlistId' element={<DisplayPlaylistInfo />} />
          <Route path='/albums' element={<Albums />} />
          <Route path='/playlists' element={<Playlists />} />
          <Route path='/songs' element={<Songs />} />
          <Route path='/signup' element={<SignupFormPage />} />
          <Route path='/' element={<HomePage />} />
          <Route path='*' element={<PageNotFound />} />
        </Routes>)}
      <Player />
    </>
  );
}

export default App;
