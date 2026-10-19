import type { JSX } from 'react';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { LimitedAudioQuizV2 } from '@interface/pages/LimitedAudioQuiz/LimitedAudioQuizV2';
import LimitedCustomQuiz from '@interface/pages/LimitedCustomQuiz';

export default function LimitedAudioQuiz(): JSX.Element {
  const { version } = useStudentUiVersion();

  return version === 'v2' ? <LimitedAudioQuizV2 /> : <LimitedCustomQuiz />;
}
