import type { JSX } from 'react';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import CombinedCustomQuiz from '@interface/pages/CombinedCustomQuiz';
import { CustomQuizV2 } from '@interface/pages/CustomQuiz/CustomQuizV2';

/**
 * Route entry for `/customquiz`. The legacy setup menu stays the fallback
 * until `ui.student.customquiz.v2` is on everywhere.
 */
export default function CustomQuiz(): JSX.Element {
  const { version } = useStudentUiVersion('ui.student.customquiz.v2');

  return version === 'v2' ? <CustomQuizV2 /> : <CombinedCustomQuiz />;
}
