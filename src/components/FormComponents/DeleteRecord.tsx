import { useModal } from 'src/hexagon/interface/hooks/useModal';

interface DeleteRecordProps {
  deleteFunction: () => void;
}

export default function DeleteRecord({ deleteFunction }: DeleteRecordProps) {
  const { openModal, closeModal } = useModal();

  function captureDelete() {
    openModal({
      title: 'Are you sure you want to delete this record?',
      body: 'This action cannot be undone',
      type: 'confirm',
      confirmFunction: deleteFunction,
      cancelFunction: closeModal,
    });
  }

  return (
    <div className="lineWrapper deleteWrapper">
      <h3>Danger Zone!</h3>
      <div className="deleteBody">
        <p>Actions preformed here cannot be reversed</p>
        <div className="buttonBox">
          <button
            type="button"
            onClick={captureDelete}
            className="deleteButton redButton"
          >
            Delete Record
          </button>
        </div>
      </div>
    </div>
  );
}
