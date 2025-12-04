import type { AudioQuizProps } from '@application/units/AudioQuiz/useAudioQuiz';
import { useReviewMyFlashcardsAudioQuiz } from '@application/units/AudioQuiz/useReviewMyFlashcardsAudioQuiz';
import AudioQuiz from '@interface/components/Quizzing/AudioQuiz/AudioQuiz';
export function ReviewMyFlashcardsAudioQuiz({
  audioQuizProps,
}: {
  audioQuizProps: AudioQuizProps;
}) {
  const useReviewMyFlashcardsAudioQuizReturn = useReviewMyFlashcardsAudioQuiz({
    audioQuizProps,
  });
  return <AudioQuiz audioQuizReturn={useReviewMyFlashcardsAudioQuizReturn} />;
}
