/**
 * Audio Parser Adapter
 *
 * Connects the application layer to the FFmpeg infrastructure implementation.
 * Follows the established adapter pattern used throughout the codebase.
 */

import type { AudioParserPort } from '@application/ports/audioParserPort';
import { useFfmpegAudio } from '@infrastructure/audioParse/useFfmpegAudio';

/**
 * Adapter hook for audio parsing operations.
 * Connects the application layer to the FFmpeg infrastructure implementation.
 */
export function useAudioParserAdapter(): AudioParserPort {
  const { isReady, parseExampleAudio } = useFfmpegAudio();

  return {
    kind: 'ffmpeg',
    isReady: () => isReady,
    parseExampleAudio,
    dispose: () => {
      // Cleanup handled by hook's useEffect cleanup
    },
  };
}
