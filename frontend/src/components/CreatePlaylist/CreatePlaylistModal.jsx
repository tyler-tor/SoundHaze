import React, { useState } from 'react';
import { Modal } from '../../context/Modal';
import CreatePlaylist from './CreatePlaylist';

function CreatePlaylistModal() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">Create Playlist</button>
            {showModal && (
                <Modal onClose={() => setShowModal(false)} title="Create a playlist">
                    <CreatePlaylist setShowModal={setShowModal} />
                </Modal>
            )}
        </>
    )
}

export default CreatePlaylistModal
