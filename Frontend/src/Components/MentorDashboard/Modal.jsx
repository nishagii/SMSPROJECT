import React from 'react';
import './Modal.css';

function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          {title}
            <i className="fa-solid fa-xmark" onClick={onClose}></i> 
        </div>
        
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
