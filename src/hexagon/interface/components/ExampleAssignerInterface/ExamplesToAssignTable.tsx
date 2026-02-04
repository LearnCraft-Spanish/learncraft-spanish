import type { LessonPopup } from '@application/units/useLessonPopup';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';

import SimpleExampleTable from '@interface/components/Tables/SimpleExampleTable';

interface ExamplesToAssignTableProps {
  examples: ExampleWithVocabulary[];
  lessonPopup: LessonPopup;
}

export function ExamplesToAssignTable({
  examples,
  lessonPopup,
}: ExamplesToAssignTableProps) {
  return (
    <>
      <h4>Examples to be Assigned ({examples.length} remaining)</h4>
      <SimpleExampleTable examples={examples} lessonPopupProps={lessonPopup} />
    </>
  );
}
