import React, { useState } from 'react';
import { Modal } from '../../context/Modal';
import UpdatePlaylist from './UpdatePlaylist';

function UpdatePlaylistModal({ playlist, userId }) {
    const [showModal, setShowModal] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        if (playlist.userId === userId) {
            setShowModal(true);
        } else {
            window.alert('You are not the owner of this playlist');
        }
    };

    return (
        <>
            <button type="button" onClick={handleClick} aria-label={`Update Playlist: ${playlist.name}`} className="btn btn-ghost btn-sm">Update Playlist</button>
            {showModal && (
                <Modal onClose={() => setShowModal(false)} title="Edit playlist">
                    <UpdatePlaylist playlist={playlist} setShowModal={setShowModal} />
                </Modal>
            )}
        </>
    )
}

export default UpdatePlaylistModal
