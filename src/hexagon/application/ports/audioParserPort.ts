import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import type {
  AudioQuizType,
  ListeningQuizExample,
  SpeakingQuizExample,
} from 'src/hexagon/domain/audioQuizzing';

// audioParserPort.ts
export interface BuiltWav {
  url: string; // blob: URL to WAV
  durationSec: number; // exact PCM duration
  bytes: number; // blob size
  dispose: () => void; // revokeObjectURL
}

export interface AudioParserPort {
  readonly kind: 'ffmpeg' | 'webaudio';
  isReady: () => boolean;

  parseExampleAudio: {
    (
      example: ExampleWithVocabulary,
      quizType: AudioQuizType.Speaking,
    ): Promise<SpeakingQuizExample>;
    (
      example: ExampleWithVocabulary,
      quizType: AudioQuizType.Listening,
    ): Promise<ListeningQuizExample>;
    (
      example: ExampleWithVocabulary,
      quizType: AudioQuizType.Speaking | AudioQuizType.Listening,
    ): Promise<SpeakingQuizExample | ListeningQuizExample>;
  };

  dispose: () => void; // free adapter resources (e.g., terminate Worker)
}
