import React, { useState } from 'react';
import { Modal } from '../../context/Modal';
import LoginForm  from './LoginForm'

const LoginFormModal = ({ className = 'btn btn-ghost', children = 'Log in' }) => {
    const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button type='button' onClick={() => setShowModal(true)} className={className}>{children}</button>
      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="Log in">
          <LoginForm />
        </Modal>
      )}
    </>
  );
};

export default LoginFormModal;
