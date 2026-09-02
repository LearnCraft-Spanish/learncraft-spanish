import type { UseTextQuizProps } from '@application/units/useTextQuiz';
import { useTextQuiz } from '@application/units/useTextQuiz';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz/TextQuiz';
import { TextQuizV2Screen } from '@interface/components/Quizzing/TextQuiz/TextQuizV2Screen';

/**
 * Used by Official Quizzes and both Custom Quiz implementations. Gating the
 * redesign here, rather than in each page, covers all three at once.
 */
export function RegularTextQuiz({
  quizTitle,
  textQuizProps,
}: {
  quizTitle?: string;
  textQuizProps: UseTextQuizProps;
}) {
  const useTextQuizReturn = useTextQuiz(textQuizProps);
  const { version } = useStudentUiVersion('ui.student.textquiz.v2');

  return version === 'v2' ? (
    <TextQuizV2Screen
      useTextQuizReturn={useTextQuizReturn}
      quizTitle={quizTitle}
    />
  ) : (
    <TextQuiz useTextQuizReturn={useTextQuizReturn} quizTitle={quizTitle} />
  );
}
