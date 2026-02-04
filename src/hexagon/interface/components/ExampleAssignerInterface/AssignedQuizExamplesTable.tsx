import type { AssignedQuizExamplesProps } from '@application/useCases/useExampleAssigner/useExampleAssigner';

import SimpleExampleTable from '@interface/components/Tables/SimpleExampleTable';
// interface AssignedQuizExamplesTableProps {
//   examples: ExampleWithVocabulary[] | undefined;
//   isLoading: boolean;
//   error: Error | null;
//   targetName: string;
//   lessonPopup: LessonPopup;
// }

export function AssignedQuizExamplesTable({
  examples,
  isLoading,
  error,
  targetName,
  lessonPopup,
}: AssignedQuizExamplesProps) {
  // Show loading state even when no examples yet (to provide real-time feedback)
  if (isLoading && !examples) {
    return (
      <>
        <h4>Examples Already Assigned to {targetName}</h4>
        <div>Loading assigned examples...</div>
      </>
    );
  }

  // Don't show table if no examples and not loading
  if (!examples || examples.length === 0) {
    return null;
  }

  return (
    <>
      <h4>
        Examples Already Assigned to {targetName} ({examples.length})
      </h4>
      {error && (
        <div className="error">
          Error loading assigned examples: {error.message}
        </div>
      )}
      {isLoading ? (
        <div>Loading assigned examples...</div>
      ) : (
        <SimpleExampleTable
          examples={examples}
          lessonPopupProps={lessonPopup}
        />
      )}
    </>
  );
}
