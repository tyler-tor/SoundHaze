import React, { useState } from 'react';
import { Modal } from '../../context/Modal';
import CreateSong from './CreateSong';

const CreateSongModal = ({album, userId, className = 'btn btn-primary'}) => {
    const [showModal, setShowModal] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        // Only the owner of an album may add songs to it. Say so and stop;
        // the modal must not open after the alert.
        if (album && album.userId !== userId) {
            window.alert('You do not have access to add a song');
            return;
        }
        setShowModal(true);
    }

    return (
        <>
            <button type="button" onClick={handleClick}
            className={className}>Create Song</button>
            {showModal && (
                <Modal onClose={() => setShowModal(false)} title="Add a song">
                    <CreateSong albumId={album ? album.id : ''}
                    setShowModal={setShowModal} />
                </Modal>
            )}
        </>
    )
};

export default CreateSongModal;
