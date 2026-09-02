import type { UseTextQuizProps } from '@application/units/useTextQuiz';
import { useSrsTextQuiz } from '@application/useCases/TextQuiz/useSrsTextQuiz';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz/TextQuiz';
import { TextQuizV2Screen } from '@interface/components/Quizzing/TextQuiz/TextQuizV2Screen';

export function SrsTextQuiz({
  quizTitle,
  textQuizProps,
}: {
  quizTitle?: string;
  textQuizProps: UseTextQuizProps;
}) {
  const { TextQuizReturn, srsQuizProps } = useSrsTextQuiz(textQuizProps);
  const { version } = useStudentUiVersion('ui.student.textquiz.v2');

  return version === 'v2' ? (
    <TextQuizV2Screen
      useTextQuizReturn={TextQuizReturn}
      srsQuizProps={srsQuizProps}
      quizTitle={quizTitle}
    />
  ) : (
    <TextQuiz
      useTextQuizReturn={TextQuizReturn}
      srsQuizProps={srsQuizProps}
      quizTitle={quizTitle}
    />
  );
}
