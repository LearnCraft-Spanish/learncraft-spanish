import type { AddToMyFlashcardsButtonsProps } from './AddToMyFlashcardsButtons.types';
import { ContextualMenuProvider } from '@composition/providers/ContextualMenuProvider';
import { ModalProvider } from '@composition/providers/ModalProvider';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AddToMyFlashcardsButtons } from './AddToMyFlashcardsButtons';

function renderComponentWithOverrides(
  overrideProps?: Partial<AddToMyFlashcardsButtonsProps>,
) {
  const defaultProps: AddToMyFlashcardsButtonsProps = {
    exampleIsCollected: false,
    exampleIsCustom: false,
    exampleIsAdding: false,
    exampleIsRemoving: false,
    addFlashcard: () => {},
    removeFlashcard: () => {},
  };
  const props = { ...defaultProps, ...overrideProps };
  return render(
    <ContextualMenuProvider>
      <ModalProvider>
        <AddToMyFlashcardsButtons {...props} />
      </ModalProvider>
    </ContextualMenuProvider>,
  );
}
describe('component AddToMyFlashcardsButtons', () => {
  describe('user is student', () => {
    it('flashcard is collected: shows "Remove from my flashcards"', async () => {
      renderComponentWithOverrides({
        exampleIsCollected: true,
      });
      await waitFor(() => {
        expect(screen.getByText(/remove/i)).toBeInTheDocument();
      });
    });
    it('flashcard is NOT collected: shows "Add To My Flashcards"', async () => {
      renderComponentWithOverrides();
      await waitFor(() => {
        expect(screen.getByText(/add /i)).toBeInTheDocument();
      });
    });
    it('when adding: shows "Adding to Flashcards..."', async () => {
      const incrementExampleFunction = vi.fn();
      renderComponentWithOverrides({
        exampleIsAdding: true,
        exampleIsCollected: true,
        addFlashcard: incrementExampleFunction,
      });

      expect(screen.getByText(/adding/i)).toBeInTheDocument();
    });
    it('when removing: shows "Removing from Flashcards..."', async () => {
      const incrementExampleFunction = vi.fn();
      renderComponentWithOverrides({
        exampleIsRemoving: true,
        exampleIsCollected: true,
        addFlashcard: incrementExampleFunction,
      });

      expect(screen.getByText(/removing/i)).toBeInTheDocument();
    });
    it('when custom: shows "Custom Flashcard"', async () => {
      renderComponentWithOverrides({
        exampleIsCustom: true,
        exampleIsCollected: true,
      });
      expect(screen.getByText(/custom/i)).toBeInTheDocument();
    });
    it('when clicking add, calls addFlashcard', async () => {
      const addFlashcard = vi.fn();
      renderComponentWithOverrides({
        addFlashcard,
      });
      fireEvent.click(screen.getByText(/add/i));
      expect(addFlashcard).toHaveBeenCalled();
    });
    it('when clicking remove, calls removeFlashcard', async () => {
      const removeFlashcard = vi.fn();
      renderComponentWithOverrides({
        exampleIsCollected: true,
        removeFlashcard,
      });
      fireEvent.click(screen.getByText(/remove/i));
      expect(removeFlashcard).toHaveBeenCalled();
    });

    it('clicking remove on custom flashcard shows modal', async () => {
      renderComponentWithOverrides({
        exampleIsCollected: true,
        exampleIsCustom: true,
      });
      fireEvent.click(screen.getByText(/remove/i));
      expect(screen.getByText(/remove custom example/i)).toBeInTheDocument();
    });
  });
});
