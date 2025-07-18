import { useMemo } from 'react';
import './BulkAddPendingRemove.scss';

export default function BulkAddPendingRemove({
  id,
  isCollected,
  handleAdd,
  handleRemove,
  isSelected,
  isPending,
}: {
  id: number;
  isCollected: boolean;
  handleAdd: () => void;
  handleRemove: () => void;

  isSelected: boolean;
  isPending: boolean;
}) {
  interface ButtonParams {
    text: string;
    className: string;
    onClickFunction: () => void;
  }

  const buttonParams: ButtonParams = useMemo(() => {
    if (isPending) {
      return {
        text: 'Adding...',
        className: 'pendingButton',
        onClickFunction: () => {},
      };
    }
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
