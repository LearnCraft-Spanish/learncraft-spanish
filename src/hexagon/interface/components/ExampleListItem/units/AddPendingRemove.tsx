import { useMemo } from 'react';
import addIcon from 'src/assets/icons/add-button.svg';
import trash from 'src/assets/icons/trashcan-dark.svg';
import './AddPendingRemove.scss';

export default function AddPendingRemove({
  isAdding,
  isRemoving,
  isCollected,
  handleAdd,
  handleRemove,
}: {
  isAdding: boolean;
  isRemoving: boolean;
  isCollected: boolean;
  handleAdd: () => void;
  handleRemove: () => void;
}) {
  interface ButtonParams {
    text: string;
    buttonClass: string;
    textClass: string;
    iconClass: string;
    onClickFunction: () => void;
    icon: string | null;
  }

  const buttonParams: ButtonParams = useMemo(() => {
    if (isRemoving) {
      return {
        text: 'Removing...',
        buttonClass: 'disabledButton',
        textClass: 'disabledText',
        iconClass: 'disabledIcon',
        onClickFunction: () => {},
        icon: null,
      };
    } else if (isAdding) {
      return {
        text: 'Adding...',
        buttonClass: 'disabledButton',
        textClass: 'disabledText',
        iconClass: 'disabledIcon',

        onClickFunction: () => {},
        icon: null,
      };
    }
    if (!isCollected) {
      return {
        text: 'Add',
        buttonClass: 'addButton',
        textClass: 'addText',
        iconClass: 'addIcon',
        onClickFunction: handleAdd,
        icon: addIcon,
      };

      // } else if (isCollected && !isPending) {
    } else {
      return {
        text: 'Remove',
        buttonClass: 'removeButton',
        textClass: 'removeText',
        iconClass: 'removeIcon',
        onClickFunction: handleRemove,
        icon: trash,
      };
    }
  }, [handleAdd, handleRemove, isCollected, isAdding, isRemoving]);

  return (
    <button
      type="button"
      className={`addPendingRemoveButton ${buttonParams.buttonClass}`}
      onClick={buttonParams.onClickFunction}
    >
      <span className={buttonParams.textClass}>{buttonParams.text}</span>
      {buttonParams.icon && (
        <img
          className={buttonParams.iconClass}
          src={buttonParams.icon}
          alt={buttonParams.text}
        />
      )}
    </button>
  );
}
