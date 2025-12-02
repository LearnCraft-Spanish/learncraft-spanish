import type { UseTextQuizProps } from '@application/units/useTextQuiz';
import { useSrsTextQuiz } from '@application/useCases/TextQuiz/useSrsTextQuiz';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz/TextQuiz';
export function SrsTextQuiz({
  quizTitle,
  textQuizProps,
}: {
  quizTitle?: string;
  textQuizProps: UseTextQuizProps;
}) {
  const { TextQuizReturn, srsQuizProps } = useSrsTextQuiz(textQuizProps);
  return (
    <TextQuiz
      useTextQuizReturn={TextQuizReturn}
      srsQuizProps={srsQuizProps}
      quizTitle={quizTitle}
    />
  );
}
