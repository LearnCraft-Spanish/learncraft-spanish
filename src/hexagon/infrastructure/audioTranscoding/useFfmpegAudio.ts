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
import { useCallback, useRef, useState } from 'react';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check browser compatibility for FFmpeg.wasm
 */
const checkBrowserCompatibility = (): {
  isSupported: boolean;
  errorMessage?: string;
} => {
  // Check for WebAssembly support (required)
  if (typeof WebAssembly === 'undefined') {
    return {
      isSupported: false,
      errorMessage:
        'WebAssembly is not supported in this browser. FFmpeg.wasm requires WebAssembly support. ' +
        'Please use a modern browser that supports WebAssembly.',
    };
  }

  // Check for required APIs (required)
  if (typeof Worker === 'undefined') {
    return {
      isSupported: false,
      errorMessage:
        'Web Workers are not supported in this browser. FFmpeg.wasm requires Web Worker support. ' +
        'Please use a modern browser that supports Web Workers.',
    };
  }

  return { isSupported: true };
};

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

  // Use actual file size minus WAV header (44 bytes) instead of potentially incorrect header field
  const actualDataSize = wavBytes.length - 44;

  const durationFromActualSize =
    actualDataSize / ((sampleRate * channels * bitsPerSample) / 8);

  return durationFromActualSize;
};

/**
 * Clean up temporary files from FFmpeg's virtual filesystem
 */
const cleanupFiles = async (ffmpeg: FFmpeg, files: string[]): Promise<void> => {
  for (const file of files) {
    try {
      await ffmpeg.deleteFile(file);
    } catch {
      // Ignore errors - file might not exist
    }
  }
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);
  const isInitializingRef = useRef(false);
  const retryCountRef = useRef(0);

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
      return;
    }

    // If initialization is in progress, wait for it to complete
    if (isInitializingRef.current && initPromiseRef.current) {
      return initPromiseRef.current;
    }
    isInitializingRef.current = true;
    setIsLoading(true);

    initPromiseRef.current = (async () => {
      try {
        // Check browser compatibility before attempting to initialize FFmpeg
        const compatibility = checkBrowserCompatibility();
        if (!compatibility.isSupported) {
          console.error(
            'Browser compatibility check failed:',
            compatibility.errorMessage,
          );
          throw new Error(compatibility.errorMessage);
        }

        const ffmpeg = new FFmpeg();

        // Add progress callback for real FFmpeg progress tracking
        ffmpeg.on('progress', ({ progress }) => {
          const progressPercent = Math.round(progress * 100);
          setLoadingProgress(progressPercent);
        });

        // Try the simplest possible approach - let FFmpeg handle everything
        const loadPromise = ffmpeg.load();

        // Set initial progress
        setLoadingProgress(0);

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => {
              reject(
                new Error(
                  'FFmpeg load timeout after 30 seconds - this may be a browser compatibility issue',
                ),
              );
            },
            30000, // 30 seconds for default loading
          );
        });

        try {
          await Promise.race([loadPromise, timeoutPromise]);
          setLoadingProgress(100);
        } catch (error) {
          setLoadingProgress(0);
          throw error;
        }

        ffmpegRef.current = ffmpeg;
        setIsReady(true);
        setIsLoading(false);
        retryCountRef.current = 0; // Reset retry count on success
      } catch (error) {
        console.error('Failed to initialize FFmpeg:', error);
        ffmpegRef.current = null;
        setIsReady(false);
        setIsLoading(false);
        setLoadingProgress(0);

        // Retry logic with exponential backoff - only retry on network/CDN issues, not timeout issues
        const maxRetries = 2; // Reduced retries
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const isTimeoutError = errorMessage.includes('timeout');
        const isNetworkError = errorMessage.includes(
          'Failed to load FFmpeg core from any CDN',
        );

        if (
          retryCountRef.current < maxRetries &&
          (isNetworkError || !isTimeoutError)
        ) {
          retryCountRef.current += 1;
          const delay = 2 ** retryCountRef.current * 1000; // 2s, 4s

          setTimeout(() => {
            isInitializingRef.current = false;
            initPromiseRef.current = null;
            init(); // Retry initialization
          }, delay);

          return;
        }

        // Provide more detailed error information after all retries failed
        const detailedError = new Error(
          `FFmpeg initialization failed after ${maxRetries} attempts: ${errorMessage}. ` +
            `This may be due to network issues, CORS restrictions, or browser compatibility. ` +
            `Please check your internet connection and try refreshing the page.`,
        );

        throw detailedError;
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
        await ffmpeg.writeFile('input.mp3', new Uint8Array(mp3Bytes));

        // Convert MP3 to WAV
        await ffmpeg.exec([
          '-i',
          'input.mp3',
          '-ac',
          String(channels), // Channel count
          '-ar',
          String(sampleRate), // Sample rate
          '-c:a',
          'pcm_s16le', // 16-bit PCM
          'output.wav',
        ]);

        // Read result and create blob URL
        const wavData = await ffmpeg.readFile('output.wav');
        const wavBytes =
          wavData instanceof Uint8Array
            ? wavData
            : new Uint8Array(wavData as unknown as ArrayBuffer);
        const blob = new Blob([new Uint8Array(wavBytes)], {
          type: 'audio/wav',
        });
        const url = URL.createObjectURL(blob);

        // Calculate duration from WAV header
        const durationSec = calculateWavDuration(wavBytes);

        // Cleanup temporary files
        if (ffmpegRef.current) {
          await cleanupFiles(ffmpegRef.current, ['input.mp3', 'output.wav']);
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
          await cleanupFiles(ffmpegRef.current, ['input.mp3', 'output.wav']);
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
        await ffmpeg.exec([
          '-f',
          'lavfi',
          '-i',
          `anullsrc=r=${sampleRate}:cl=${channels === 1 ? 'mono' : 'stereo'}`,
          '-t',
          String(durationSec),
          '-c:a',
          'pcm_s16le',
          'silence.wav',
        ]);

        // Read result and create blob URL
        const wavData = await ffmpeg.readFile('silence.wav');
        const wavBytes =
          wavData instanceof Uint8Array
            ? wavData
            : new Uint8Array(wavData as unknown as ArrayBuffer);
        const blob = new Blob([new Uint8Array(wavBytes)], {
          type: 'audio/wav',
        });
        const url = URL.createObjectURL(blob);

        // Calculate duration from WAV header
        const duration = calculateWavDuration(wavBytes);

        // Cleanup temporary files
        if (ffmpegRef.current) {
          await cleanupFiles(ffmpegRef.current, ['silence.wav']);
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
          await cleanupFiles(ffmpegRef.current, ['silence.wav']);
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
          await ffmpeg.writeFile(fileName, new Uint8Array(arrayBuffer));
        }

        // Create concat file list
        const concatContent = fileNames
          .map((name) => `file '${name}'\n`)
          .join('');
        await ffmpeg.writeFile(
          'concat.txt',
          new TextEncoder().encode(concatContent),
        );

        // Concatenate files
        await ffmpeg.exec([
          '-f',
          'concat',
          '-safe',
          '0',
          '-i',
          'concat.txt',
          '-c',
          'copy',
          'output.wav',
        ]);

        // Read result and create blob URL
        const wavData = await ffmpeg.readFile('output.wav');
        const wavBytes =
          wavData instanceof Uint8Array
            ? wavData
            : new Uint8Array(wavData as unknown as ArrayBuffer);
        const blob = new Blob([new Uint8Array(wavBytes)], {
          type: 'audio/wav',
        });
        const url = URL.createObjectURL(blob);

        // Calculate duration from WAV header
        const durationSec = calculateWavDuration(wavBytes);

        // Cleanup temporary files
        if (ffmpegRef.current) {
          await cleanupFiles(ffmpegRef.current, [
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
          await cleanupFiles(ffmpegRef.current, [
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

  /**
   * Check if the browser supports FFmpeg.wasm requirements
   */
  const checkCompatibility = useCallback(() => {
    return checkBrowserCompatibility();
  }, []);

  return {
    kind: 'ffmpeg',
    isReady: () => isReady,
    isLoading: () => isLoading,
    loadingProgress: () => loadingProgress,
    checkCompatibility,
    mp3ToWav,
    generateSilence,
    concatenateAudio,
    dispose: async () => {
      // Cleanup FFmpeg files if needed
      if (ffmpegRef.current) {
        try {
          // In FFmpeg.wasm 0.12.x, we don't have direct FS access for listing files
          // The cleanup is now handled by individual function cleanup calls
          // This is a no-op for now, but kept for interface compatibility
        } catch {
          // Ignore cleanup errors
        }
      }
    },
  };
};
