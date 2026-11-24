import React, { useState } from 'react';
import { Modal } from '../../context/Modal';
import DeletePlaylistSong from './DeletePlaylistSong';

function DeletePlaylistSongModal({ songId, songTitle, playlistId }) {
    const [showModal, setShowModal] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        setShowModal(true);
    }

    return (
        <>
            <button type="button" onClick={handleClick}
            aria-label={songTitle ? `Remove from playlist: ${songTitle}` : undefined}
            className="btn btn-ghost btn-sm">
                Remove from playlist
            </button>
            {showModal && (
                <Modal onClose={() => setShowModal(false)} title="Remove from playlist">
                    <DeletePlaylistSong songId={songId} playlistId={playlistId} setShowModal={setShowModal} />
                </Modal>
            )}
        </>
    )
}

export default DeletePlaylistSongModal
