import { useMemo } from 'react';
import './BulkAddRemove.scss';

export default function AddPendingRemove({
  id,
  isCollected,
  handleAdd,
  handleRemove,

  isSelected,
}: {
  id: number;
  isCollected: boolean;
  handleAdd: () => void;
  handleRemove: () => void;

  isSelected: boolean;
}) {
  interface ButtonParams {
    text: string;
    className: string;
    onClickFunction: () => void;
  }

  const buttonParams: ButtonParams = useMemo(() => {
    if (!isCollected && !isSelected) {
      return {
        text: 'Select',
        className: 'selectButton',
        onClickFunction: handleAdd,
      };
    } else if (isCollected) {
      return {
        text: 'Owned',
        className: 'disabledButton',
        onClickFunction: () => {},
      };
    } else if (isSelected) {
      return {
        text: 'Selected',
        className: 'selectedButton',
        onClickFunction: handleRemove,
      };
    }
    return {
      text: 'unknown',
      className: 'unknownButton',
      onClickFunction: () => {},
    };
  }, [handleAdd, handleRemove, isCollected, isSelected]);

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
