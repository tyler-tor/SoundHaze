import React, { useState } from 'react';
import { Modal } from '../../context/Modal';
import CreateSong from './CreateSong';

const CreateSongModal = ({album, userId}) => {
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
            <button onClick={handleClick}
            className="create-song-btn">Create Song</button>
            {showModal && (
                <Modal onClose={() => setShowModal(false)}>
                    <CreateSong albumId={album ? album.id : ''}
                    setShowModal={setShowModal} />
                </Modal>
            )}
        </>
    )
};

export default CreateSongModal;
