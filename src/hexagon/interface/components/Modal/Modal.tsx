import { useRef, useState } from 'react';
import './modal.scss';

export interface ModalProps {
  title: string;
  body: string;
  type: 'error' | 'confirm' | 'notice';
  confirmFunction?: () => void;
  cancelFunction?: () => void;
  closeModal: () => void;
}
export default function Modal(props: ModalProps) {
  const { title, body, type, confirmFunction, cancelFunction, closeModal } =
    props;

  // Ref prevents double-fire within the same synchronous event cycle (before re-render).
  // State drives the disabled attribute for the render after the first click.
  const hasConfirmedRef = useRef(false);
  const [isConfirming, setIsConfirming] = useState(false);

  function handleConfirm() {
    if (confirmFunction && !hasConfirmedRef.current) {
      hasConfirmedRef.current = true;
      setIsConfirming(true);
      try {
        confirmFunction();
      } catch {
        hasConfirmedRef.current = false;
        setIsConfirming(false);
      }
    }
  }

  function handleCancel() {
    if (cancelFunction) {
      cancelFunction();
    }
    closeModal();
  }

  const renderButtons = () => {
    switch (type) {
      case 'error':
        return (
          <button type="button" className="redButton" onClick={handleCancel}>
            Go Back
          </button>
        );
      case 'confirm':
        return (
          <>
            <button
              className="removeButton"
              type="button"
              onClick={handleCancel}
            >
              Go Back
            </button>
            <button
              type="button"
              className="addButton"
              onClick={handleConfirm}
              disabled={isConfirming}
            >
              Confirm
            </button>
          </>
        );
      case 'notice':
        return (
          <button
            type="button"
            className="addButton"
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            Accept
          </button>
        );
      default:
        return (
          <button type="button" className="addButton" onClick={handleCancel}>
            unknown modal type, please go back
          </button>
        );
    }
  };
  return (
    <div className="modal">
      <h2 className="modal-title">{title}</h2>
      <p className="modal-body">{body}</p>
      <div className="buttonBox">{renderButtons()}</div>
    </div>
  );
}
