import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createPlaylist } from '../../store/playlists';
import ImageComponent from '../ImageComponent';
import './CreatePlaylist.css';
import { getErrorMessages } from "../../store/csrf";

function CreatePlaylist({ setShowModal }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [errors, setErrors] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);

    const data = {
      name,
      imageUrl: url
    };

    return dispatch(createPlaylist(data))
      .then(() => {
        setShowModal(false)
        navigate('/playlists');
      }).catch(async (response) => {
        setErrors(await getErrorMessages(response));
      })
  }
  return (
    <div className='create-playlist-container'>
      <div className="npf-item">
        <ImageComponent setUrl={setUrl} />
      </div>
      <form
        onSubmit={handleSubmit}
        className='create-playlist-form'>
        <ul>
          {errors.map((error, idx) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
        <label>
          Name
          <input
            type='text'
            name='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required />
        </label>
        <button type='submit'
        className='create-playlist-btn'>Create Playlist</button>
      </form>
    </div>
  )
}

export default CreatePlaylist
