import React from 'react';
import { useUserData } from '../../hooks/UserData/useUserData';
import { useStudentFlashcards } from '../../hooks/UserData/useStudentFlashcards';
import type { Flashcard } from '../../types/interfaceDefinitions';

interface AddToMyFlashcardsButtonsProps {
  example: Flashcard | undefined;
  incrementExampleNumber: () => void;
  onRemove: () => void;
  incrementOnAdd?: boolean;
}
export default function AddToMyFlashcardsButtons({
  example,
  incrementExampleNumber,
  onRemove,
  incrementOnAdd = true,
}: AddToMyFlashcardsButtonsProps): JSX.Element | undefined {
  const {
    flashcardDataQuery,
    addFlashcardMutation,
    removeFlashcardMutation,
    exampleIsCollected,
    exampleIsCustom,
    exampleIsPending,
  } = useStudentFlashcards();
  const userData = useUserData();

  const dataSuccess = userData.isSuccess && flashcardDataQuery.isSuccess;
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
    } else if (isCollected && !isCustom && !isPending) {
      return (
        <button
          type="button"
          className="removeFlashcardButton"
          onClick={() => remove()}
        >
          Remove from my flashcards
        </button>
      );
    } else if (isCollected && isPending) {
      return (
        <button type="button" className="pendingFlashcardButton">
          Adding to Flashcards...
        </button>
      );
    } else if (isCollected && isCustom) {
      return (
        <button type="button" className="customFlashcardButton">
          Custom Flashcard
        </button>
      );
    } else {
      throw new Error('Failed to parse flashcard status');
    }
  }
}
