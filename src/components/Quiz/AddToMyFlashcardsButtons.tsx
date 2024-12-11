import React from 'react';

import { useStudentFlashcards } from '../../hooks/useStudentFlashcards';
import type { Flashcard } from '../../interfaceDefinitions';

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
}: AddToMyFlashcardsButtonsProps): JSX.Element | null {
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
  function add() {
    if (!example) {
      return;
    }
    addFlashcardMutation.mutate(example);
    if (incrementOnAdd) incrementExampleNumber();
  }
  function remove() {
    onRemove();
    if (!example) {
      return;
    }
    removeFlashcardMutation.mutate(example.recordId);
  }
  const isCollected = exampleIsCollected(example.recordId);
  const isCustom = exampleIsCustom(example.recordId);
  const isPending = exampleIsPending(example.recordId);

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
  } else {
    console.error('Failed to parse flashcard status');
    return null;
  }
}
