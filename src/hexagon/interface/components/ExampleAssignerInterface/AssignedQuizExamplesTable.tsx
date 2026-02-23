import type { AssignedQuizExamplesProps } from '@application/useCases/useExampleAssigner/useExampleAssigner';
import { InlineLoading } from '@interface/components/Loading';
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
  if (isLoading) {
    return (
      <>
        <InlineLoading message="Loading quiz examples..." />
      </>
    );
  }

  // Don't show table if no examples and not loading
  if (!examples && !isLoading) {
    return null;
  }

  return (
    <>
      <h4>
        Examples Already Assigned to {targetName} ({examples?.length || 0})
      </h4>
      {error && (
        <div className="error">
          Error loading assigned examples: {error.message}
        </div>
      )}

      <SimpleExampleTable
        examples={examples || []}
        lessonPopupProps={lessonPopup}
      />
    </>
  );
}
