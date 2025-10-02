import trash from 'src/assets/icons/trashcan-dark.svg';
import './DeleteFlashcard.scss';

export default function DeleteFlashcard({
  handleRemove,
}: {
  handleRemove: () => void;
}) {
  return (
    <button type="button" className="removeButton" onClick={handleRemove}>
      <span className="removeButtonText">Remove</span>
      <img src={trash} alt="Remove" className="removeButtonIcon" />
    </button>
  );
}
