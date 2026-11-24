import React from 'react';
import { useToast } from "../common";
import { useDispatch } from 'react-redux';
import { deletePlaylist } from '../../store/playlists';
import { useNavigate } from 'react-router-dom';
import { getErrorMessages } from '../../store/csrf';

function DeletePlaylist({ playlist, userId }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useToast();

    const handleClick = async (e) => {
        if(playlist.userId === userId){
            try {
                // playlist.id comes from props; the old code read it from
                // currentPlaylist, which is empty on the /playlists list page.
                await dispatch(deletePlaylist(playlist.id));
                navigate('/playlists');
                toast.success(`Deleted "${playlist.name}".`);
            } catch (response) {
                toast.error((await getErrorMessages(response)).join(' '));
            }
        }else {
            toast.error('You can only delete your own playlists.');
        }
    }
    return (
        <button
        type="button"
        onClick={handleClick}
        aria-label={`Delete Playlist: ${playlist.name}`}
        className="btn btn-ghost btn-sm text-danger">
            Delete Playlist
        </button>
    )
}

export default DeletePlaylist
