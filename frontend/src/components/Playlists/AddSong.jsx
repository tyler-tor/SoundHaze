import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addSongToPlaylist } from '../../store/playlistSongs';
import { getErrorMessages } from '../../store/csrf';


function AddSong({ songId, setShowModal }) {
  const dispatch = useDispatch();
  const [playlistId, setPlaylistId] = useState('');
  const [errors, setErrors] = useState([]);

  const myPlaylists = useSelector((state) => state.session.playlists);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    if (!playlistId) {
      return setErrors(['Choose a playlist first. You can create one from the Playlists page.']);
    }

    const data = {
      songId,
      playlistId: parseInt(playlistId)
    }
    try {
      await dispatch(addSongToPlaylist(data));
      setShowModal(false);
    } catch (response) {
      // For example: "That song is already in this playlist." (409)
      setErrors(await getErrorMessages(response));
    }
  }

  return myPlaylists && (
    <form
    onSubmit={handleSubmit}
    className="form">
      <ul className='error-list' aria-live='polite'>
        {errors.map((error, idx) => (
          <li key={idx}>{error}</li>
        ))}
      </ul>
      <label className="field">
        Playlists
        <select
        name='playlist'
        value={playlistId}
        onChange={(e) => setPlaylistId(e.target.value)}
        className='select-input'>
          <option value=''>Select Playlist</option>
          {Object.values(myPlaylists).map((playlist) => (
            <option key={playlist.id}
            value={playlist.id}
            >{playlist.name}</option>
          ))}
        </select>
      </label>
      <button
      type='submit'
      className="btn btn-ghost btn-sm">
        Add to Playlist
      </button>
    </form>
  )
}

export default AddSong
