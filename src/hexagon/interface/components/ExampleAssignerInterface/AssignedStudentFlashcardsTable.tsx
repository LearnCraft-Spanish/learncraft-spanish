import type { AssignedStudentFlashcardsProps } from '@application/useCases/useExampleAssigner/useExampleAssigner';

import SimpleExampleTable from '@interface/components/Tables/SimpleExampleTable';
// interface AssignedStudentFlashcardsTableProps {
//   studentFlashcards: Flashcard[];
//   unassignedExamples: ExampleWithVocabulary[];
//   isLoading: boolean;
//   error: Error | null;
//   targetName: string;
//   lessonPopup: LessonPopup;
// }

export function AssignedStudentFlashcardsTable({
  studentFlashcards,
  isLoading,
  error,
  targetName,
  lessonPopup,
}: AssignedStudentFlashcardsProps) {
  // Show loading state even when no flashcards yet (to provide real-time feedback)
  if (isLoading) {
    return (
      <>
        {/* <h4>Examples Already Assigned to {targetName}</h4> */}
        <div>Loading assigned flashcards...</div>
      </>
    );
  }

  // Don't show table if no flashcards and not loading
  if (studentFlashcards.length === 0 && !isLoading) {
    return null;
  }
  const examples = studentFlashcards.map((flashcard) => flashcard.example);

  return (
    <>
      <h4>
        Examples Already Assigned to {targetName} ({studentFlashcards.length})
      </h4>
      {error && (
        <div className="error">
          Error loading assigned flashcards: {error.message}
        </div>
      )}
      <SimpleExampleTable examples={examples} lessonPopupProps={lessonPopup} />
    </>
  );
}
