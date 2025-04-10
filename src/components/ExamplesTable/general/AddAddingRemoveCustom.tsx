import type { Flashcard } from 'src/types/interfaceDefinitions';
import { useModal } from 'src/hooks/useModal';
import { useActiveStudent } from 'src/hooks/UserData/useActiveStudent';
import { useStudentFlashcards } from 'src/hooks/UserData/useStudentFlashcards';

export default function AddAddingRemoveCustom({
  example,
}: {
  example: Flashcard;
}) {
  const { openModal, closeModal } = useModal();
  const { activeStudentQuery } = useActiveStudent();
  const {
    flashcardDataQuery,
    addFlashcardMutation,
    removeFlashcardMutation,
    exampleIsCollected,
    exampleIsPending,
    exampleIsCustom,
  } = useStudentFlashcards();

  const isCollected = exampleIsCollected(example.recordId);
  const isPending = exampleIsPending(example.recordId);
  const isCustom = exampleIsCustom(example.recordId);

  const dataReady =
    flashcardDataQuery.isSuccess && activeStudentQuery.isSuccess;

  const handleRemove = () => {
    if (isCustom) {
      openModal({
        title: 'Remove Custom Example',
        body: 'This is one of your custom flashcards! Are you sure you want to delete it?',
        type: 'confirm',
        confirmFunction: () => {
          removeFlashcardMutation.mutate(example.recordId);
          closeModal();
        },
      });
    } else {
      removeFlashcardMutation.mutate(example.recordId);
    }
  };
  return (
    dataReady && (
      <>
        {isCollected && !isPending && isCustom && (
          <button
            type="button"
            className="label customLabel"
            value={example.recordId}
          >
            Custom
          </button>
        )}
        {/* Not a fan of this logic, it should be updated at some point */}
        {!isCollected && (
          <button
            type="button"
            className="addButton"
            value={example.recordId}
            onClick={() => addFlashcardMutation.mutate(example)}
          >
            Add
          </button>
        )}
        {isCollected && isPending && (
          <button
            type="button"
            className="disabledButton"
            value={example.recordId}
          >
            Adding...
          </button>
        )}
        {isCollected && !isPending && (
          <button
            type="button"
            className="removeButton"
            value={example.recordId}
            onClick={handleRemove}
          >
            Remove
          </button>
        )}
      </>
    )
  );
}
