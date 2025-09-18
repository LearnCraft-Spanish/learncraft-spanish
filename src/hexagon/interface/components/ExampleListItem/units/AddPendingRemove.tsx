import { useMemo } from 'react';

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
    className: string;
    onClickFunction: () => void;
  }

  const buttonParams: ButtonParams = useMemo(() => {
    if (isRemoving) {
      return {
        text: 'Removing...',
        className: 'disabledButton',
        onClickFunction: () => {},
      };
    } else if (isAdding) {
      return {
        text: 'Adding...',
        className: 'disabledButton',
        onClickFunction: () => {},
      };
    }
    if (!isCollected) {
      return {
        text: 'Add',
        className: 'addButton',
        onClickFunction: handleAdd,
      };

      // } else if (isCollected && !isPending) {
    } else {
      return {
        text: 'Remove',
        className: 'removeButton',
        onClickFunction: handleRemove,
      };
    }
  }, [handleAdd, handleRemove, isCollected, isAdding, isRemoving]);

  return (
    <button
      type="button"
      className={buttonParams.className}
      onClick={buttonParams.onClickFunction}
    >
      {buttonParams.text}
    </button>
  );
}
