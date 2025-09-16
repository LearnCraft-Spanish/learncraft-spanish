import { useMemo } from 'react';
import './BulkAddRemove.scss';

export default function BulkRemoveButton({
  id,
  isCollected,
  handleSelect,
  isSelected,
  isAdding,
  isRemoving,
  handleDeselect,
}: {
  id: number;
  isCollected: boolean;
  handleSelect: () => void;
  handleDeselect: () => void;
  isSelected: boolean;
  isAdding: boolean;
  isRemoving: boolean;
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
        className: 'pendingButton',
        onClickFunction: () => {},
      };
    } else if (isAdding) {
      return {
        text: 'Adding...',
        className: 'pendingButton',
        onClickFunction: () => {},
      };
    } else if (!isCollected) {
      return {
        text: 'Not Owned',
        className: 'disabledButton',
        onClickFunction: () => {},
      };
    } else if (isCollected && !isSelected) {
      return {
        text: 'Select',
        className: 'selectRemoveButton',
        onClickFunction: handleSelect,
      };
    } else if (isSelected) {
      return {
        text: 'Selected',
        className: 'selectedRemoveButton',
        onClickFunction: handleDeselect,
      };
    }
    return {
      text: 'unknown',
      className: 'unknownButton',
      onClickFunction: () => {},
    };
  }, [
    isCollected,
    isSelected,
    handleSelect,
    handleDeselect,
    isAdding,
    isRemoving,
  ]);

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
