/**
 * FFmpeg Audio Processing Hook
 *
 * A React hook that provides audio transcoding capabilities using FFmpeg.wasm.
 * Handles MP3 to WAV conversion with silence padding for iOS-compatible audio playback.
 *
 * This hook manages the FFmpeg worker internally and provides a clean, functional
 * interface that feels natural in React. No message protocols or complex adapters needed.
 *
 * USAGE:
 * ======
 *
 * ```typescript
 * function AudioQuiz() {
 *   const { isReady, mp3ToWavWithTail, makeSilenceWav, init } = useFfmpegAudio();
 *
 *   useEffect(() => {
 *     init(); // Initialize FFmpeg (downloads ~25MB once)
 *   }, []);
 *
 *   const handleAudio = async () => {
 *     if (!isReady) return;
 *
 *     const result = await mp3ToWavWithTail('audio.mp3', { tailSec: 3 });
 *     // result.url is ready for <audio> element
 *     // result.dispose() cleans up memory
 *   };
 * }
 * ```
 *
 * ARCHITECTURE:
 * ============
 *
 * - Hook manages FFmpeg worker lifecycle internally
 * - Simple function calls instead of message protocols
 * - Automatic cleanup and error handling
 * - iOS-compatible blob URLs for audio playback
 * - Memory efficient with transferable objects
 */

import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import type {
  ListeningQuizExample,
  SpeakingQuizExample,
} from 'src/hexagon/domain/audioQuizzing';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioQuizType } from 'src/hexagon/domain/audioQuizzing';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate WAV file duration from raw bytes
 */
const calculateWavDuration = (wavBytes: Uint8Array): number => {
  if (wavBytes.length < 44) return 0;

  const dv = new DataView(
    wavBytes.buffer,
    wavBytes.byteOffset,
    wavBytes.byteLength,
  );
  const sampleRate = dv.getUint32(24, true);
  const channels = dv.getUint16(22, true);
  const bitsPerSample = dv.getUint16(34, true);
  const dataSize = dv.getUint32(40, true);

  return dataSize / ((sampleRate * channels * bitsPerSample) / 8);
};

/**
 * Clean up temporary files from FFmpeg's virtual filesystem
 */
const cleanupFiles = (ffmpeg: FFmpeg, files: string[]): void => {
  files.forEach((file) => {
    try {
      (ffmpeg as any).FS('unlink', file);
    } catch {
      // Ignore errors - file might not exist
    }
  });
};

// ============================================================================
// TYPES
// ============================================================================

export interface BuiltWav {
  url: string; // blob: URL to WAV
  durationSec: number; // exact PCM duration
  bytes: number; // blob size
  dispose: () => void; // revokeObjectURL
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export const useFfmpegAudio = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  /**
   * Initialize FFmpeg.wasm
   *
   * Downloads and loads FFmpeg.wasm into memory. This is a one-time operation
   * that happens when the hook is first used. The ~25MB download is cached by
   * the browser for subsequent visits.
   */
  const init = useCallback(async () => {
    if (isReady || isLoading) return;

    setIsLoading(true);

    try {
      const ffmpeg = new FFmpeg();
      const url = await toBlobURL(
        'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
        'text/javascript',
      );

      await ffmpeg.load({ coreURL: url });
      ffmpegRef.current = ffmpeg;
      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize FFmpeg:', error);
      throw new Error(`FFmpeg initialization failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }, [isReady, isLoading]);

  /**
   * Parse example audio for quiz types
   *
   * Converts MP3 audio to WAV format with silence padding for audio quizzing.
   * Returns the appropriate quiz example type based on the quiz type.
   */
  const parseExampleAudio = useCallback(
    async (
      example: ExampleWithVocabulary,
      quizType: AudioQuizType.Speaking | AudioQuizType.Listening,
    ): Promise<SpeakingQuizExample | ListeningQuizExample> => {
      // Lazy initialization - only download when actually needed
      if (!ffmpegRef.current) {
        await init();
      }

      const ffmpeg = ffmpegRef.current!; // Safe after init() call above
      const tailSec = 3;
      const rate = 22050;

      try {
        // Fetch MP3 file
        const response = await fetch(example.audioUrl, {
          cache: 'force-cache',
          credentials: 'omit',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.statusText}`);
        }

        const mp3Bytes = await response.arrayBuffer();

        // Write input file
        (ffmpeg as any).FS('writeFile', 'input.mp3', new Uint8Array(mp3Bytes));

        // Convert MP3 to WAV
        await (ffmpeg as any).run(
          '-i',
          'input.mp3',
          '-ac',
          '1', // Mono
          '-ar',
          String(rate), // Sample rate
          '-c:a',
          'pcm_s16le', // 16-bit PCM
          'main.wav',
        );

        // Generate silence padding
        await (ffmpeg as any).run(
          '-f',
          'lavfi',
          '-i',
          `anullsrc=r=${rate}:cl=mono`,
          '-t',
          String(tailSec),
          '-c:a',
          'pcm_s16le',
          'tail.wav',
        );

        // Concatenate main audio with silence
        (ffmpeg as any).FS(
          'writeFile',
          'concat.txt',
          new TextEncoder().encode("file 'main.wav'\nfile 'tail.wav'\n"),
        );

        await (ffmpeg as any).run(
          '-f',
          'concat',
          '-safe',
          '0',
          '-i',
          'concat.txt',
          '-c',
          'copy',
          'output.wav',
        );

        // Read result and create blob URL
        const wavBytes = (ffmpeg as any).FS('readFile', 'output.wav');
        const blob = new Blob([wavBytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);

        // Calculate duration from WAV header
        const durationSec = calculateWavDuration(wavBytes);

        // Cleanup temporary files
        cleanupFiles(ffmpegRef.current!, [
          'input.mp3',
          'main.wav',
          'tail.wav',
          'concat.txt',
          'output.wav',
        ]);

        const builtWav: BuiltWav = {
          url,
          durationSec,
          bytes: blob.size,
          dispose: () => URL.revokeObjectURL(url),
        };

        // Return appropriate quiz example type
        if (quizType === AudioQuizType.Speaking) {
          return {
            ...example,
            audioUrl: builtWav.url,
            durationSec: builtWav.durationSec,
          } as SpeakingQuizExample;
        } else {
          return {
            ...example,
            audioUrl: builtWav.url,
            durationSec: builtWav.durationSec,
          } as ListeningQuizExample;
        }
      } catch (error) {
        // Cleanup on error
        if (ffmpegRef.current) {
          cleanupFiles(ffmpegRef.current, [
            'input.mp3',
            'main.wav',
            'tail.wav',
            'concat.txt',
            'output.wav',
          ]);
        }
        throw error;
      }
    },
    [init],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ffmpegRef.current) {
        // Clean up any remaining files
        try {
          const files = (ffmpegRef.current as any).FS('readdir', '/');
          files.forEach((file: string) => {
            if (file !== '.' && file !== '..') {
              (ffmpegRef.current as any).FS('unlink', file);
            }
          });
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  return {
    isReady,
    isLoading,
    init,
    parseExampleAudio,
  };
};
