import React from 'react';
import { useDispatch } from 'react-redux';
import { deletePlaylist } from '../../store/playlists';
import { useNavigate } from 'react-router-dom';
import { getErrorMessages } from '../../store/csrf';

function DeletePlaylist({ playlist, userId }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleClick = async (e) => {
        if(playlist.userId === userId){
            try {
                // playlist.id comes from props; the old code read it from
                // currentPlaylist, which is empty on the /playlists list page.
                await dispatch(deletePlaylist(playlist.id));
                navigate('/playlists');
                window.alert('Successfully deleted! Now create another!');
            } catch (response) {
                window.alert((await getErrorMessages(response)).join('\n'));
            }
        }else {
            window.alert('You are not authorized to delete this playlist!');
        }
    }
    return (
        <button
        onClick={handleClick}
        className="btn btn-ghost btn-sm">
            Delete Playlist
        </button>
    )
}

export default DeletePlaylist
