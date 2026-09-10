import type { UseTextQuizProps } from '@application/units/useTextQuiz';
import type { JSX } from 'react';
import { useSrsTextQuiz } from '@application/useCases/TextQuiz/useSrsTextQuiz';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { textQuizTitle } from '@domain/functions/quizTitle';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz/TextQuiz';
import { TextQuizV2Screen } from '@interface/components/Quizzing/TextQuiz/TextQuizV2Screen';

interface SrsTextQuizProps {
  textQuizProps: UseTextQuizProps;
}

/**
 * Always the My Flashcards SRS quiz — there is no other page that mounts
 * this component, so its title is fixed rather than threaded through as a
 * prop (unlike `RegularTextQuiz`, which is shared between Official and
 * Custom quizzes).
 *
 * Only `useStudentUiVersion` lives here — each version branch owns
 * `useSrsTextQuiz`, matching Home / CustomQuiz / FlashcardFinder.
 */
export function SrsTextQuiz({ textQuizProps }: SrsTextQuizProps): JSX.Element {
  const { version } = useStudentUiVersion('ui.student.textquiz.v2');

  return version === 'v2' ? (
    <SrsTextQuizV2 textQuizProps={textQuizProps} />
  ) : (
    <SrsTextQuizV1 textQuizProps={textQuizProps} />
  );
}

function SrsTextQuizV1({ textQuizProps }: SrsTextQuizProps): JSX.Element {
  const { TextQuizReturn, srsQuizProps } = useSrsTextQuiz(textQuizProps);
  const title = textQuizTitle('myFlashcards', true);
  return (
    <TextQuiz
      useTextQuizReturn={TextQuizReturn}
      srsQuizProps={srsQuizProps}
      quizTitle={title.subtitle}
    />
  );
}

function SrsTextQuizV2({ textQuizProps }: SrsTextQuizProps): JSX.Element {
  const { TextQuizReturn, srsQuizProps } = useSrsTextQuiz(textQuizProps);
  const title = textQuizTitle('myFlashcards', true);
  return (
    <TextQuizV2Screen
      useTextQuizReturn={TextQuizReturn}
      srsQuizProps={srsQuizProps}
      eyebrow={title.eyebrow}
      subtitle={title.subtitle}
    />
  );
}
