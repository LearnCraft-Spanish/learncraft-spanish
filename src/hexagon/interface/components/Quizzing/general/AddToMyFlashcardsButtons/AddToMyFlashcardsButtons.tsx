import type { AddToMyFlashcardsButtonsProps } from './AddToMyFlashcardsButtons.types';
import React from 'react';
import { useModal } from 'src/hexagon/interface/hooks/useModal';
import './AddToMyFlashcardsButtons.scss';

export function AddToMyFlashcardsButtons({
  exampleIsCollected,
  exampleIsCustom,
  exampleIsPending,
  addFlashcard,
  removeFlashcard,
}: AddToMyFlashcardsButtonsProps): React.JSX.Element | undefined {
  const { openModal, closeModal } = useModal();

  const handleRemoveCustom = () => {
    openModal({
      title: 'Remove Custom Example',
      body: 'This is one of your custom flashcards! Are you sure you want to delete it?',
      type: 'confirm',
      confirmFunction: () => {
        removeFlashcard();
        closeModal();
      },
    });
  };
  if (!exampleIsCollected) {
    // Not Owned Flashcard
    return (
      <button
        type="button"
        className="addFlashcardButton"
        onClick={(e) => {
          e.stopPropagation();
          addFlashcard();
        }}
      >
        Add to my flashcards
      </button>
    );
  } else if (exampleIsCollected && !exampleIsPending) {
    // Owned Flashcard
    // Will show custom tag if it is a custom flashcard, as well as a remove button
    return (
      <>
        {exampleIsCustom && (
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
          onClick={(e) => {
            e.stopPropagation();
            if (exampleIsCustom) {
              handleRemoveCustom();
            } else {
              removeFlashcard();
            }
          }}
        >
          Remove from my flashcards
        </button>
      </>
    );
  } else if (exampleIsCollected && exampleIsPending) {
    return (
      <button type="button" className="pendingFlashcardButton">
        Adding to Flashcards...
      </button>
    );
  } else {
    throw new Error('Failed to parse flashcard status');
  }
}
