export default function FormControls({
  editMode,
  cancelEdit,
  captureSubmitForm,
}: {
  editMode: boolean;
  cancelEdit: () => void;
  captureSubmitForm: () => void;
}) {
  return (
    editMode && (
      <div className="buttonBox">
        <button type="button" className="redButton" onClick={cancelEdit}>
          Cancel
        </button>
        <button
          type="button"
          className="greenButton"
          onClick={captureSubmitForm}
        >
          Save
        </button>
      </div>
    )
  );
}
