import React from 'react';

import { useStudentFlashcards } from '../../hooks/useStudentFlashcards';
import type { Flashcard } from '../../interfaceDefinitions';

interface AddToMyFlashcardsButtonsProps {
  example: Flashcard | undefined;
  incrementExampleNumber: () => void;
  onRemove: () => void;
}
export default function AddToMyFlashcardsButtons({
  example,
  incrementExampleNumber,
  onRemove,
}: AddToMyFlashcardsButtonsProps): JSX.Element {
  const {
    addFlashcardMutation,
    removeFlashcardMutation,
    exampleIsCollected,
    exampleIsCustom,
    exampleIsPending,
  } = useStudentFlashcards();
  if (!example) {
    return <div>Error Parsing Flashcard</div>;
  }
  function addAndAdvance() {
    if (!example) {
      return;
    }
    addFlashcardMutation.mutate(example);
    incrementExampleNumber();
  }
  function removeAndAdvance() {
    if (!example) {
      return;
    }
    removeFlashcardMutation.mutate(example.recordId);
    onRemove();
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
