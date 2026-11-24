import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { removeSongFromPlaylist } from '../../store/playlistSongs';
import { showPlaylist } from '../../store/playlists';
import { getErrorMessages } from '../../store/csrf';

function DeletePlaylistSong({ songId, playlistId, setShowModal }) {
    const dispatch = useDispatch();
    const [errors, setErrors] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        try {
            await dispatch(removeSongFromPlaylist({ songId, playlistId }));
            await dispatch(showPlaylist(playlistId));
            setShowModal(false);
        } catch (response) {
            setErrors(await getErrorMessages(response));
        }
    }

    return (
        <div className='confirm-delete-form'>
            <h2>Are you sure you want to remove this song?</h2>
            <ul className='error-list' role='alert'>
                {errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                ))}
            </ul>
            <button
                type="submit"
                className="btn btn-danger"
                onClick={handleSubmit}>
                Remove
            </button>
        </div>
    )
}

export default DeletePlaylistSong
