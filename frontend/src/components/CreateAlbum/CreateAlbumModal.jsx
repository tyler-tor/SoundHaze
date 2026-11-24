import React, { useState } from 'react';
import { Modal } from '../../context/Modal';
import CreateAlbum from './CreateAlbum';

const CreateAlbumModal = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button onClick={() => setShowModal(true)}
            className="btn btn-primary">Create Album</button>
            {showModal && (
                <Modal onClose={() => setShowModal(false)} title="Create an album">
                    <CreateAlbum setShowModal={setShowModal} />
                </Modal>
            )}
        </>
    )
};

export default CreateAlbumModal;
