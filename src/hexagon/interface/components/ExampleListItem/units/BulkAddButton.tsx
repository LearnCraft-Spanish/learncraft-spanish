import { useMemo } from 'react';
import '@interface/components/ExampleListItem/units/BulkAddRemove.scss';

export default function BulkAddButton({
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
    if (isPending && isCollected) {
      return {
        text: 'Removing...',
        className: 'pendingButton',
        onClickFunction: () => {},
      };
    } else if (isPending && !isCollected) {
      return {
        text: 'Adding...',
        className: 'pendingButton',
        onClickFunction: () => {},
      };
    } else if (isCollected) {
      return {
        text: 'Owned',
        className: 'disabledButton',
        onClickFunction: handleRemoveSelected,
      };
    } else if (!isCollected && !isSelected) {
      return {
        text: 'Select',
        className: 'selectAddButton',
        onClickFunction: handleSelect,
      };
    } else if (isSelected) {
      return {
        text: 'Selected',
        className: 'selectedAddButton',
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
