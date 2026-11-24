import React, { useState } from 'react';
import { useToast } from '../common';
import { Modal } from '../../context/Modal';
import UpdateSong from './UpdateSong';

const UpdateSongModal = ({song, userId}) => {
    const toast = useToast();
    const [showModal, setShowModal] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        if (song.userId === userId) {
            setShowModal(true)
        } else {
            toast.error('You can only edit your own songs.')
        }
    };

    return (
        <>
            <button type="button" onClick={handleClick}
            aria-label={`Update Song: ${song.title}`}
            className="btn btn-ghost btn-sm">Update Song</button>
            {showModal && (
                <Modal onClose={() => setShowModal(false)} title="Edit song">
                    <UpdateSong song={song}
                    setShowModal={setShowModal} />
                </Modal>
            )}
        </>
    )
};

export default UpdateSongModal;
