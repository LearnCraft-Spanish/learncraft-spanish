import type { Flashcard } from 'src/types/interfaceDefinitions';
import { useMemo } from 'react';

export default function AddPendingRemove({
  example,
  isCollected,
  isPending,
  handleAdd,
  handleRemove,
}: {
  example: Flashcard;
  isCollected: boolean;
  isPending: boolean;
  handleAdd: () => void;
  handleRemove: () => void;
}) {
  // const handleRemove = () => {
  //   if (isCustom) {
  //     openModal({
  //       title: 'Remove Custom Example',
  //       body: 'This is one of your custom flashcards! Are you sure you want to delete it?',
  //       type: 'confirm',
  //       confirmFunction: () => {
  //         removeFlashcardMutation.mutate(example.recordId);
  //         closeModal();
  //       },
  //     });
  //   } else {
  //     removeFlashcardMutation.mutate(example.recordId);
  //   }
  // };

  interface ButtonParams {
    text: string;
    className: string;
    onClickFunction: () => void;
  }

  const buttonParams: ButtonParams = useMemo(() => {
    if (!isCollected) {
      return {
        text: 'Add',
        className: 'addButton',
        onClickFunction: handleAdd,
      };
    } else if (isCollected && isPending) {
      return {
        text: 'Adding...',
        className: 'disabledButton',
        onClickFunction: () => {},
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
      value={example.recordId}
      onClick={buttonParams.onClickFunction}
    >
      {buttonParams.text}
    </button>
  );
}
