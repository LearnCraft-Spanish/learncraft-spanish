import type { Flashcard } from 'src/types/interfaceDefinitions';
import { useActiveStudent } from 'src/hooks/UserData/useActiveStudent';
import { useStudentFlashcards } from 'src/hooks/UserData/useStudentFlashcards';
import { useUserData } from 'src/hooks/UserData/useUserData';

export default function AddAddingRemoveCustom({
  example,
}: {
  example: Flashcard;
}) {
  const userDataQuery = useUserData();
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
        {isCollected &&
          !isPending &&
          (!isCustom ||
            userDataQuery.data?.roles.adminRole === 'coach' ||
            userDataQuery.data?.roles.adminRole === 'admin') && (
            <button
              type="button"
              className="removeButton"
              value={example.recordId}
              onClick={() => removeFlashcardMutation.mutate(example.recordId)}
            >
              Remove
            </button>
          )}
      </>
    )
  );
}
