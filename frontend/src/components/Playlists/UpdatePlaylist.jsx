import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updatePlaylist } from '../../store/playlists';
import './Playlists.css'
import { getErrorMessages } from "../../store/csrf";

function UpdatePlaylist({ playlist, setShowModal }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState(playlist.name);
  const [url, setUrl] = useState(playlist.previewImage);
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const data = {
      ...playlist,
      playlistId: playlist.id,
      name,
      imageUrl: url,
    };

    await dispatch(updatePlaylist(data))
      .then(() => {
        setShowModal(false)
        navigate('/playlists')
      }).catch(async (response) => {
        setErrors(await getErrorMessages(response));
      })

  }
  return (
    <form
    onSubmit={handleSubmit}
    className='update-playlist-form'>
      <ul>
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
      <label>
        Name
        <input
          type='text'
          name='name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          />
      </label>
      <button type='submit'
      className='update-playlist-btn'>Update Playlist</button>
    </form>
  )
}

export default UpdatePlaylist
