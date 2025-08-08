import { useMemo } from 'react';

export default function AddPendingRemove({
  id,
  isCollected,
  isPending,
  handleAdd,
  handleRemove,
}: {
  id: number;
  isCollected: boolean;
  isPending: boolean;
  handleAdd: () => void;
  handleRemove: () => void;
}) {
  interface ButtonParams {
    text: string;
    className: string;
    onClickFunction: () => void;
  }

  const buttonParams: ButtonParams = useMemo(() => {
    if (isPending && isCollected) {
      return {
        text: 'Removing...',
        className: 'disabledButton',
        onClickFunction: () => {},
      };
    } else if (isPending && !isCollected) {
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
  }, [handleAdd, handleRemove, isCollected, isPending]);

  return (
    <button
      type="button"
      className={buttonParams.className}
      value={id}
      onClick={buttonParams.onClickFunction}
    >
      {buttonParams.text}
    </button>
  );
}
