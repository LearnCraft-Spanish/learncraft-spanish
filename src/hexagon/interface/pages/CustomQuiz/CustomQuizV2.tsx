import type { JSX } from 'react';
import { useCustomQuizV2 } from '@application/useCases/useCustomQuizV2';
import { CustomQuizSetup } from '@interface/components/customQuiz/CustomQuizSetup';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { Loading } from '@interface/components/Loading';
import { RegularAudioQuiz } from '@interface/components/Quizzing/AudioQuiz/RegularAudioQuiz';
import { RegularTextQuiz } from '@interface/components/Quizzing/TextQuiz';
import { useNavigate } from 'react-router-dom';

export function CustomQuizV2(): JSX.Element {
  const quiz = useCustomQuizV2();
  const navigate = useNavigate();

  if (quiz.error) {
    return (
      <PageShell>
        <p role="alert">{`Error: ${quiz.error.message}`}</p>
      </PageShell>
    );
  }

  if (quiz.isInitialLoading) {
    return <Loading message="Loading quiz setup..." />;
  }

  if (quiz.quizReady) {
    return quiz.isAudioQuiz ? (
      <RegularAudioQuiz audioQuizProps={quiz.audioQuizProps} />
    ) : (
      <RegularTextQuiz textQuizProps={quiz.textQuizProps} />
    );
  }

  return (
    <PageShell>
      <CustomQuizSetup quiz={quiz} onLeave={() => navigate('/')} />
    </PageShell>
  );
}
