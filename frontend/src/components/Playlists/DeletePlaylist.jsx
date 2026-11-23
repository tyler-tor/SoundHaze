import React from 'react';
import { useDispatch } from 'react-redux';
import { deletePlaylist } from '../../store/playlists';
import { useHistory } from 'react-router-dom';
import { getErrorMessages } from '../../store/csrf';

function DeletePlaylist({ playlist, userId }) {
    const dispatch = useDispatch();
    const history = useHistory();

    const handleClick = async (e) => {
        if(playlist.userId === userId){
            try {
                // playlist.id comes from props; the old code read it from
                // currentPlaylist, which is empty on the /playlists list page.
                await dispatch(deletePlaylist(playlist.id));
                history.push('/playlists');
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
        className='playlist-btns'>
            Delete Playlist
        </button>
    )
}

export default DeletePlaylist
