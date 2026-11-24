import React, { useState } from 'react';
import { useToast } from '../common';
import { Modal } from '../../context/Modal';
import CreateSong from './CreateSong';

const CreateSongModal = ({album, userId, className = 'btn btn-primary'}) => {
    const toast = useToast();
    const [showModal, setShowModal] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        // Only the owner of an album may add songs to it. Say so and stop;
        // the modal must not open after the alert.
        if (album && album.userId !== userId) {
            toast.error('You can only add songs to your own albums.');
            return;
        }
        setShowModal(true);
    }

    return (
        <>
            <button type="button" onClick={handleClick}
            aria-label={album ? `Create Song in ${album.title}` : undefined}
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
