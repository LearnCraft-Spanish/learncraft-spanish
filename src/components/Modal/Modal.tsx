/* ------------------ Types of Modals This will Replace ------------------ */

export interface ModalProps {
  title: string;
  body: string;
  type: 'error' | 'confirm' | 'info';
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
      case 'info':
        return null;
    }
  };
  return (
    <div className="modal">
      <h2>{title}</h2>
      <p>{body}</p>
      <div className="buttonBox">{renderButtons()}</div>
    </div>
  );
}
