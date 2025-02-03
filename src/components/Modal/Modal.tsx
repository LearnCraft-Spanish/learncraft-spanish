import './modal.scss';

export interface ModalProps {
  title: string;
  body: string;
  type: 'error' | 'confirm';
  confirmFunction?: () => void;
  cancelFunction?: () => void;
  closeModal: () => void;
}
export default function Modal(props: ModalProps) {
  const { title, body, type, confirmFunction, cancelFunction, closeModal } =
    props;

  function handleConfirm() {
    if (confirmFunction) {
      confirmFunction();
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
            <button type="button" className="addButton" onClick={handleConfirm}>
              Confirm
            </button>
          </>
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
