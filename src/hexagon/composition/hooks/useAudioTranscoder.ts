import type { AudioTranscodingPort } from '@application/ports/audioTranscodingPort';
import { AudioTranscodingContext } from '@composition/context/AudioTranscodingContext';
import { use } from 'react';

/**
 * Hook to access the AudioTranscoder singleton from context
 *
 * Provides access to the shared FFmpeg instance for audio processing.
 * FFmpeg is lazily initialized on first use (downloads ~25MB when needed).
 *
 * @returns AudioTranscodingPort instance
 * @throws Error if used outside of AudioTranscodingProvider
 *
 * @example
 * ```typescript
 * function AudioQuiz() {
 *   const audioTranscoder = useAudioTranscoder();
 *
 *   const processExample = async (example: ExampleWithVocabulary) => {
 *     // FFmpeg downloads automatically on first use
 *     return await audioTranscoder.parseExampleAudio(example, AudioQuizType.Speaking);
 *   };
 * }
 * ```
 */
export function useAudioTranscoder(): AudioTranscodingPort {
  const context = use(AudioTranscodingContext);

  if (!context) {
    throw new Error(
      'useAudioTranscoder must be used within an AudioTranscodingProvider',
    );
  }

  return context;
}
