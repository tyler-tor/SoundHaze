import React, {useState} from 'react';
import { Modal } from '../../context/Modal';
import AddSong from './AddSong';

function AddSongModal({songId}) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e => {
    e.preventDefault();
    setShowModal(true);
  })
  return (
    <div>
      <button onClick={handleClick} className="btn btn-ghost btn-sm">+ to Playlist</button>
      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="Add to a playlist">
          <AddSong songId={songId} setShowModal={setShowModal} />
        </Modal>
      )}
    </div>
  )
}

export default AddSongModal
