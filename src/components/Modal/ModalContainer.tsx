import React, { useRef, useState } from 'react';
import Modal from './Modal';
import './ModalContainer.css';

export default function ModalContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const 


  // Use effect to capture user clicks outside the modal, & dont allow it

  // way to populate active modal content

  return (
    <div ref={containerRef} className="modal-container">
      {/* Modal content */}
    </div>
  );
}
