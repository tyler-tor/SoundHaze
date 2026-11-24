import React, { useState } from 'react';
import { useToast } from '../common';
import { Modal } from '../../context/Modal';
import UpdateAlbum from './UpdateAlbum';

const UpdateAlbumModal = ({album, userId}) => {
    const toast = useToast();
    const [showModal, setShowModal] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        if (album.userId === userId) {
            setShowModal(true)
        } else {
            toast.error('You can only edit your own albums.')
        }
    };

    return (
        <>
            <button type="button" onClick={handleClick}
            aria-label={`Update Album: ${album.title}`}
            className="btn btn-ghost btn-sm">Update Album</button>
            {showModal && (
                <Modal onClose={() => setShowModal(false)} title="Edit album">
                    <UpdateAlbum album={album}
                    setShowModal={setShowModal} />
                </Modal>
            )}
        </>
    )
};

export default UpdateAlbumModal;
