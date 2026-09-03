import type { UseTextQuizProps } from '@application/units/useTextQuiz';
import type { JSX } from 'react';
import { useSrsTextQuiz } from '@application/useCases/TextQuiz/useSrsTextQuiz';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz/TextQuiz';
import { TextQuizV2Screen } from '@interface/components/Quizzing/TextQuiz/TextQuizV2Screen';

interface SrsTextQuizProps {
  quizTitle?: string;
  textQuizProps: UseTextQuizProps;
}

/**
 * Only `useStudentUiVersion` lives here — each version branch owns
 * `useSrsTextQuiz`, matching Home / CustomQuiz / FlashcardFinder.
 */
export function SrsTextQuiz({
  quizTitle,
  textQuizProps,
}: SrsTextQuizProps): JSX.Element {
  const { version } = useStudentUiVersion('ui.student.textquiz.v2');

  return version === 'v2' ? (
    <SrsTextQuizV2 quizTitle={quizTitle} textQuizProps={textQuizProps} />
  ) : (
    <SrsTextQuizV1 quizTitle={quizTitle} textQuizProps={textQuizProps} />
  );
}

function SrsTextQuizV1({
  quizTitle,
  textQuizProps,
}: SrsTextQuizProps): JSX.Element {
  const { TextQuizReturn, srsQuizProps } = useSrsTextQuiz(textQuizProps);
  return (
    <TextQuiz
      useTextQuizReturn={TextQuizReturn}
      srsQuizProps={srsQuizProps}
      quizTitle={quizTitle}
    />
  );
}

function SrsTextQuizV2({
  quizTitle,
  textQuizProps,
}: SrsTextQuizProps): JSX.Element {
  const { TextQuizReturn, srsQuizProps } = useSrsTextQuiz(textQuizProps);
  return (
    <TextQuizV2Screen
      useTextQuizReturn={TextQuizReturn}
      srsQuizProps={srsQuizProps}
      quizTitle={quizTitle}
    />
  );
}
