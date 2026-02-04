import type { LessonPopup } from '@application/units/useLessonPopup';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';

import { InlineLoading } from '@interface/components/Loading';
import SimpleExampleTable from '@interface/components/Tables/SimpleExampleTable';

interface ExamplesToAssignTableProps {
  examples: ExampleWithVocabulary[];
  totalSelectedExamplesCount: number;
  lessonPopup: LessonPopup;
  isLoading: boolean;
}

export function ExamplesToAssignTable({
  examples,
  totalSelectedExamplesCount,
  lessonPopup,
  isLoading,
}: ExamplesToAssignTableProps) {
  if (isLoading) {
    return <InlineLoading message="Just a moment..." />;
  }
  return (
    <>
      <h4>
        Examples to be Assigned ({examples.length} reamining of{' '}
        {totalSelectedExamplesCount} selected)
      </h4>
      <SimpleExampleTable examples={examples} lessonPopupProps={lessonPopup} />
    </>
  );
}
