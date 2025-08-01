import { useMemo } from 'react';
import './BulkAddRemove.scss';

export default function BulkRemoveButton({
  id,
  isCollected,
  handleSelect,
  isSelected,
  isPending,
  handleRemoveSelected,
}: {
  id: number;
  isCollected: boolean;
  handleSelect: () => void;
  handleRemoveSelected: () => void;
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
        text: 'Removing...',
        className: 'pendingButton',
        onClickFunction: () => {},
      };
    }
    if (isCollected && !isSelected) {
      return {
        text: 'Select',
        className: 'selectRemoveButton',
        onClickFunction: handleSelect,
      };
    } else if (isSelected) {
      return {
        text: 'Selected',
        className: 'selectedRemoveButton',
        onClickFunction: handleRemoveSelected,
      };
    }
    return {
      text: 'unknown',
      className: 'unknownButton',
      onClickFunction: () => {},
    };
  }, [isCollected, isSelected, isPending, handleSelect, handleRemoveSelected]);

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
