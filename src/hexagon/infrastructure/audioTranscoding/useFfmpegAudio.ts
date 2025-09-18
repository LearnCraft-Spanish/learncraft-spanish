/**
 * FFmpeg Audio Transcoding Hook
 * =============================
 *
 * INFRASTRUCTURE LAYER - Pure Audio Transcoding Operations
 *
 * This is the lowest-level audio processing hook in the hexagonal architecture.
 * It provides raw audio transcoding capabilities using FFmpeg.wasm without any
 * business logic, domain knowledge, or application-specific concerns.
 *
 * RESPONSIBILITIES:
 * - Convert MP3 audio files to WAV format
 * - Generate silence audio of specified duration
 * - Concatenate multiple audio blobs into single blobs
 * - Manage FFmpeg.wasm initialization and cleanup
 * - Provide loading state for UI feedback
 *
 * ARCHITECTURAL POSITION:
 * - Layer: Infrastructure (bottom layer)
 * - Implements: AudioTranscodingPort interface
 * - Used by: AudioTranscoderAdapter (application layer)
 * - Dependencies: FFmpeg.wasm (~25MB download on first use)
 *
 * INITIALIZATION STRATEGY:
 * - Lazy initialization: Only downloads FFmpeg when first needed
 * - Ref-based state management: Avoids useEffect for stability
 * - Race condition prevention: Uses refs to prevent multiple concurrent initializations
 * - Timeout protection: 30-second timeout prevents infinite loading
 *
 * MEMORY MANAGEMENT:
 * - Creates blob URLs for audio playback
 * - Provides dispose() methods for cleanup
 * - Automatic cleanup of FFmpeg virtual filesystem
 *
 * USAGE EXAMPLE:
 * ```typescript
 * function AudioProcessor() {
 *   const { isReady, isLoading, mp3ToWav, generateSilence, concatenateAudio } = useFfmpegAudio();
 *
 *   const handleAudio = async () => {
 *     if (!isReady()) return;
 *
 *     const wavBlob = await mp3ToWav('audio.mp3');
 *     const silenceBlob = await generateSilence(3);
 *     const combinedBlob = await concatenateAudio([wavBlob, silenceBlob]);
 *     // combinedBlob.url is ready for <audio> element
 *     // combinedBlob.dispose() cleans up memory
 *   };
 * }
 * ```
 *
 * ERROR HANDLING:
 * - Throws descriptive errors for initialization failures
 * - Provides timeout protection for hanging loads
 * - Graceful cleanup on errors
 *
 * PERFORMANCE CONSIDERATIONS:
 * - FFmpeg.wasm is cached by browser after first download
 * - Uses transferable objects for memory efficiency
 * - Blob URLs are iOS-compatible for audio playback
 */

import type {
  AudioBlob,
  AudioTranscodingPort,
} from '@application/ports/audioTranscodingPort';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { useCallback, useRef, useState } from 'react';

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

// AudioBlob is imported from the port interface

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export const useFfmpegAudio = (): AudioTranscodingPort => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);
  const isInitializingRef = useRef(false);

  /**
   * Initialize FFmpeg.wasm
   * =====================
   *
   * CRITICAL INITIALIZATION FUNCTION - Handles FFmpeg.wasm setup
   *
   * This function manages the complex process of downloading and initializing
   * FFmpeg.wasm (~25MB) for audio transcoding. It uses ref-based state management
   * to prevent race conditions and multiple concurrent initializations.
   *
   * INITIALIZATION FLOW:
   * 1. Check if already initialized (ffmpegRef.current exists)
   * 2. Check if initialization is in progress (isInitializingRef.current)
   * 3. Set loading state and create initialization promise
   * 4. Download FFmpeg core from CDN
   * 5. Load FFmpeg with timeout protection
   * 6. Set ready state and clear loading
   *
   * RACE CONDITION PREVENTION:
   * - Uses isInitializingRef to prevent multiple concurrent calls
   * - Uses initPromiseRef to allow waiting for existing initialization
   * - Ref-based checks are more reliable than state-based checks
   *
   * TIMEOUT PROTECTION:
   * - 30-second timeout prevents infinite loading states
   * - Common issue with FFmpeg.wasm in certain environments
   *
   * ERROR HANDLING:
   * - Catches initialization failures and clears state
   * - Throws descriptive errors for debugging
   * - Ensures cleanup even on failure
   *
   * PERFORMANCE NOTES:
   * - FFmpeg.wasm is cached by browser after first download
   * - Subsequent initializations are much faster
   * - Uses CDN for reliable delivery
   */
  const init = useCallback(async () => {
    // If already initialized, return immediately
    if (ffmpegRef.current) {
      console.log('FFmpeg already initialized');
      return;
    }

    // If initialization is in progress, wait for it to complete
    if (isInitializingRef.current && initPromiseRef.current) {
      console.log('FFmpeg initialization already in progress, waiting...');
      return initPromiseRef.current;
    }

    console.log('Starting FFmpeg initialization...');
    isInitializingRef.current = true;
    setIsLoading(true);

    initPromiseRef.current = (async () => {
      try {
        console.log('Creating FFmpeg instance...');
        const ffmpeg = new FFmpeg();

        console.log('Getting FFmpeg core URL...');
        const url = await toBlobURL(
          'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
          'text/javascript',
        );

        console.log('Loading FFmpeg core...');

        // Add a timeout to prevent infinite loading
        const loadPromise = ffmpeg.load({ coreURL: url });
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error('FFmpeg load timeout after 30 seconds')),
            30000,
          );
        });

        await Promise.race([loadPromise, timeoutPromise]);

        console.log('FFmpeg loaded successfully');
        ffmpegRef.current = ffmpeg;
        setIsReady(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize FFmpeg:', error);
        ffmpegRef.current = null;
        setIsReady(false);
        setIsLoading(false);
        throw new Error(`FFmpeg initialization failed: ${error}`);
      } finally {
        isInitializingRef.current = false;
        initPromiseRef.current = null;
      }
    })();

    return initPromiseRef.current;
  }, []);

  /**
   * Convert MP3 audio to WAV format
   * ===============================
   *
   * CORE TRANSCODING FUNCTION - MP3 to WAV conversion
   *
   * This function handles the conversion of MP3 audio files to WAV format
   * using FFmpeg.wasm. It's the primary transcoding operation used by the
   * audio quiz system.
   *
   * PROCESS FLOW:
   * 1. Lazy initialization of FFmpeg if not already done
   * 2. Fetch MP3 file from URL
   * 3. Write MP3 to FFmpeg virtual filesystem
   * 4. Convert MP3 to WAV using FFmpeg command line
   * 5. Read WAV data and create blob URL
   * 6. Calculate duration from WAV header
   * 7. Cleanup temporary files
   *
   * AUDIO PARAMETERS:
   * - sampleRate: Default 22050 Hz (optimized for speech)
   * - channels: Default 1 (mono) for smaller file sizes
   * - format: PCM 16-bit for compatibility
   *
   * MEMORY MANAGEMENT:
   * - Creates blob URLs for immediate playback
   * - Provides dispose() method for cleanup
   * - Cleans up FFmpeg virtual filesystem
   *
   * ERROR HANDLING:
   * - Handles network fetch failures
   * - Handles FFmpeg conversion errors
   * - Ensures cleanup on any failure
   *
   * USAGE IN AUDIO QUIZ:
   * - Converts Spanish and English MP3s to WAV
   * - Used by AudioQuizMapper for quiz preparation
   */
  const mp3ToWav = useCallback(
    async (
      mp3Url: string,
      options: { sampleRate?: number; channels?: number } = {},
    ): Promise<AudioBlob> => {
      // Lazy initialization - only download when actually needed
      if (!ffmpegRef.current) {
        await init();
      }

      // Double-check that initialization succeeded
      if (!ffmpegRef.current) {
        throw new Error('FFmpeg failed to initialize');
      }

      const ffmpeg = ffmpegRef.current;
      const sampleRate = options.sampleRate ?? 22050;
      const channels = options.channels ?? 1;

      try {
        // Fetch MP3 file
        const response = await fetch(mp3Url, {
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
          String(channels), // Channel count
          '-ar',
          String(sampleRate), // Sample rate
          '-c:a',
          'pcm_s16le', // 16-bit PCM
          'output.wav',
        );

        // Read result and create blob URL
        const wavBytes = (ffmpeg as any).FS('readFile', 'output.wav');
        const blob = new Blob([wavBytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);

        // Calculate duration from WAV header
        const durationSec = calculateWavDuration(wavBytes);

        // Cleanup temporary files
        if (ffmpegRef.current) {
          cleanupFiles(ffmpegRef.current, ['input.mp3', 'output.wav']);
        }

        return {
          url,
          durationSec,
          bytes: blob.size,
          dispose: () => URL.revokeObjectURL(url),
        };
      } catch (error) {
        // Cleanup on error
        if (ffmpegRef.current) {
          cleanupFiles(ffmpegRef.current, ['input.mp3', 'output.wav']);
        }
        throw error;
      }
    },
    [init],
  );

  /**
   * Generate silence audio of specified duration
   */
  const generateSilence = useCallback(
    async (
      durationSec: number,
      options: { sampleRate?: number; channels?: number } = {},
    ): Promise<AudioBlob> => {
      // Lazy initialization - only download when actually needed
      if (!ffmpegRef.current) {
        await init();
      }

      // Double-check that initialization succeeded
      if (!ffmpegRef.current) {
        throw new Error('FFmpeg failed to initialize');
      }

      const ffmpeg = ffmpegRef.current;
      const sampleRate = options.sampleRate ?? 22050;
      const channels = options.channels ?? 1;

      try {
        // Generate silence
        await (ffmpeg as any).run(
          '-f',
          'lavfi',
          '-i',
          `anullsrc=r=${sampleRate}:cl=${channels === 1 ? 'mono' : 'stereo'}`,
          '-t',
          String(durationSec),
          '-c:a',
          'pcm_s16le',
          'silence.wav',
        );

        // Read result and create blob URL
        const wavBytes = (ffmpeg as any).FS('readFile', 'silence.wav');
        const blob = new Blob([wavBytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);

        // Calculate duration from WAV header
        const duration = calculateWavDuration(wavBytes);

        // Cleanup temporary files
        if (ffmpegRef.current) {
          cleanupFiles(ffmpegRef.current, ['silence.wav']);
        }

        return {
          url,
          durationSec: duration,
          bytes: blob.size,
          dispose: () => URL.revokeObjectURL(url),
        };
      } catch (error) {
        // Cleanup on error
        if (ffmpegRef.current) {
          cleanupFiles(ffmpegRef.current, ['silence.wav']);
        }
        throw error;
      }
    },
    [init],
  );

  /**
   * Concatenate multiple audio blobs into a single blob
   */
  const concatenateAudio = useCallback(
    async (audioBlobs: AudioBlob[]): Promise<AudioBlob> => {
      if (audioBlobs.length === 0) {
        throw new Error('Cannot concatenate empty array of audio blobs');
      }

      if (audioBlobs.length === 1) {
        return audioBlobs[0];
      }

      // Lazy initialization - only download when actually needed
      if (!ffmpegRef.current) {
        await init();
      }

      // Double-check that initialization succeeded
      if (!ffmpegRef.current) {
        throw new Error('FFmpeg failed to initialize');
      }

      const ffmpeg = ffmpegRef.current;

      try {
        // Write each audio blob to FFmpeg's virtual filesystem
        const fileNames: string[] = [];
        for (let i = 0; i < audioBlobs.length; i++) {
          const fileName = `input${i}.wav`;
          fileNames.push(fileName);

          // Fetch the blob data
          const response = await fetch(audioBlobs[i].url);
          const arrayBuffer = await response.arrayBuffer();
          (ffmpeg as any).FS(
            'writeFile',
            fileName,
            new Uint8Array(arrayBuffer),
          );
        }

        // Create concat file list
        const concatContent = fileNames
          .map((name) => `file '${name}'\n`)
          .join('');
        (ffmpeg as any).FS(
          'writeFile',
          'concat.txt',
          new TextEncoder().encode(concatContent),
        );

        // Concatenate files
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
        if (ffmpegRef.current) {
          cleanupFiles(ffmpegRef.current, [
            ...fileNames,
            'concat.txt',
            'output.wav',
          ]);
        }

        return {
          url,
          durationSec,
          bytes: blob.size,
          dispose: () => URL.revokeObjectURL(url),
        };
      } catch (error) {
        // Cleanup on error
        if (ffmpegRef.current) {
          const fileNames = audioBlobs.map((_, i) => `input${i}.wav`);
          cleanupFiles(ffmpegRef.current, [
            ...fileNames,
            'concat.txt',
            'output.wav',
          ]);
        }
        throw error;
      }
    },
    [init],
  );

  return {
    kind: 'ffmpeg',
    isReady: () => isReady,
    isLoading: () => isLoading,
    mp3ToWav,
    generateSilence,
    concatenateAudio,
    dispose: () => {
      // Cleanup FFmpeg files if needed
      if (ffmpegRef.current) {
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
    },
  };
};
