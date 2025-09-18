import { useContext } from 'react';
import { AudioParserContext } from '@composition/context/AudioParserContext';
import type { AudioParserPort } from '@application/ports/audioParserPort';

/**
 * Hook to access the AudioParser singleton from context
 *
 * Provides access to the shared FFmpeg instance for audio processing.
 * FFmpeg is lazily initialized on first use (downloads ~25MB when needed).
 *
 * @returns AudioParserPort instance
 * @throws Error if used outside of AudioParserProvider
 *
 * @example
 * ```typescript
 * function AudioQuiz() {
 *   const audioParser = useAudioParser();
 *
 *   const processExample = async (example: ExampleWithVocabulary) => {
 *     // FFmpeg downloads automatically on first use
 *     return await audioParser.parseExampleAudio(example, AudioQuizType.Speaking);
 *   };
 * }
 * ```
 */
export function useAudioParser(): AudioParserPort {
  const context = useContext(AudioParserContext);

  if (!context) {
    throw new Error(
      'useAudioParser must be used within an AudioParserProvider',
    );
  }

  return context;
}
