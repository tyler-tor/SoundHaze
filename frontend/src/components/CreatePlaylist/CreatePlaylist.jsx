import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createPlaylist } from '../../store/playlists';
import ImageComponent from '../ImageComponent';
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
    <div className="form modal-stack">
      <div className="upload-slot">
        <ImageComponent setUrl={setUrl} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="form">
        <ul className="error-list" aria-live="polite">
          {errors.map((error, idx) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
        <label className="field">
          Name
          <input
            type='text'
            name='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required />
        </label>
        <button type='submit'
        className="btn btn-primary">Create Playlist</button>
      </form>
    </div>
  )
}

export default CreatePlaylist
