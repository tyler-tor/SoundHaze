import React, {useState} from 'react';
import { Modal } from '../../context/Modal';
import AddSong from './AddSong';

function AddSongModal({songId, songTitle}) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e => {
    e.preventDefault();
    setShowModal(true);
  })
  return (
    <>
      <button type="button" onClick={handleClick} className="btn btn-ghost btn-sm" aria-label={songTitle ? `Add to playlist: ${songTitle}` : undefined}>Add to playlist</button>
      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="Add to a playlist">
          <AddSong songId={songId} setShowModal={setShowModal} />
        </Modal>
      )}
    </>
  )
}

export default AddSongModal
