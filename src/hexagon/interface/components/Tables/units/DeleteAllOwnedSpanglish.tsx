import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { useMemo } from 'react';
import { showErrorToast } from 'src/functions/showToast';
import { useModal } from 'src/hexagon/interface/hooks/useModal';

export default function DeleteAllOwnedSpanglish() {
  const { deleteFlashcards, flashcards } = useStudentFlashcards();
  const { openModal, closeModal } = useModal();

  const spanglishFlashcards = useMemo(() => {
    return flashcards?.filter((flashcard) => flashcard.example.spanglish);
  }, [flashcards]);

  return (
    <button
      type="button"
      onClick={() => {
        if (spanglishFlashcards?.length === 0) {
          showErrorToast('You do not have any spanglish flashcards.', {
            autoClose: 3000,
          });
          return;
        }
        openModal({
          title: 'Delete All Owned Spanglish Flashcards?',
          body: `You have ${spanglishFlashcards?.length} spanglish flashcard${
            spanglishFlashcards?.length === 1 ? '' : 's'
          }. Are you sure you want to delete them?`,
          type: 'confirm',
          confirmFunction: () => {
            const spanglishFlashcards = flashcards?.filter(
              (flashcard) => flashcard.example.spanglish,
            );
            if (spanglishFlashcards) {
              deleteFlashcards(
                spanglishFlashcards.map((flashcard) => flashcard.example.id),
              );

              closeModal();
            }
          },
        });
      }}
    >
      <p>Delete All Owned Spanglish</p>
    </button>
  );
}
