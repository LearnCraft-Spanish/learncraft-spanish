import type { Flashcard } from 'src/types/interfaceDefinitions';
import React from 'react';
import { useModal } from 'src/hexagon/interface/hooks/useModal';
import { useStudentFlashcards } from 'src/hooks/UserData/useStudentFlashcards';
// THIS IS THE OLD COMPONENT. Please delete this one when ready.

interface AddToMyFlashcardsButtonsProps {
  example: Flashcard | undefined;
  incrementExampleNumber: () => void;
  onRemove: () => void;
  incrementOnAdd?: boolean;
}
// THIS IS THE OLD COMPONENT. Please delete this one when ready.
export default function AddToMyFlashcardsButtons({
  example,
  incrementExampleNumber,
  onRemove,
  incrementOnAdd = true,
}: AddToMyFlashcardsButtonsProps): React.JSX.Element | undefined {
  const {
    flashcardDataQuery,
    addFlashcardMutation,
    removeFlashcardMutation,
    exampleIsCollected,
    exampleIsCustom,
    exampleIsPending,
  } = useStudentFlashcards();
  const { openModal, closeModal } = useModal();
  const dataSuccess = flashcardDataQuery.isSuccess;
  if (!example) {
    throw new Error('No Flashcard passed to AddToMyFlashcardsButtons');
  }

  function add() {
    if (!example) {
      throw new Error('No Flashcard passed to AddToMyFlashcardsButtons');
    }
    addFlashcardMutation.mutate(example);
    if (incrementOnAdd) incrementExampleNumber();
  }
  function remove() {
    onRemove();
    if (!example) {
      throw new Error('No Flashcard passed to AddToMyFlashcardsButtons');
    }
    removeFlashcardMutation.mutate(example.recordId);
  }
  const isCollected = exampleIsCollected(example.recordId);
  const isCustom = exampleIsCustom(example.recordId);
  const isPending = exampleIsPending(example.recordId);

  const handleRemoveCustom = () => {
    openModal({
      title: 'Remove Custom Example',
      body: 'This is one of your custom flashcards! Are you sure you want to delete it?',
      type: 'confirm',
      confirmFunction: () => {
        remove();
        closeModal();
      },
    });
  };
  if (dataSuccess) {
    if (!isCollected) {
      return (
        <button
          type="button"
          className="addFlashcardButton"
          onClick={() => add()}
        >
          Add to my flashcards
        </button>
      );
    } else if (isCollected && !isPending) {
      return (
        <>
          {isCustom && (
            <button
              type="button"
              className="customFlashcardButton onFlashcard"
              onClick={(e) => e.preventDefault()}
            >
              Custom Flashcard
            </button>
          )}
          <button
            type="button"
            className="removeFlashcardButton"
            onClick={() => {
              if (isCustom) {
                handleRemoveCustom();
              } else {
                remove();
              }
            }}
          >
            Remove from my flashcards
          </button>
        </>
      );
    } else if (isCollected && isPending) {
      return (
        <button type="button" className="pendingFlashcardButton">
          Adding to Flashcards...
        </button>
      );
      // } else if (isCollected && isCustom) {
      //   return (
      //     <button
      //       type="button"
      //       className="customFlashcardButton"
      //       onClick={handleRemoveCustom}
      //     >
      //       Custom Flashcard
      //     </button>
      //   );
    } else {
      throw new Error('Failed to parse flashcard status');
    }
  }
}
