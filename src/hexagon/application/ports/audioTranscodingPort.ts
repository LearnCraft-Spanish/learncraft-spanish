/**
 * Audio Transcoding Port Interface
 * ================================
 *
 * PORT INTERFACE - Defines contract for audio transcoding operations
 *
 * This interface defines the contract for low-level audio transcoding operations
 * in the hexagonal architecture. It separates the application layer from the
 * infrastructure layer, allowing for different implementations (FFmpeg, WebAudio, etc.).
 *
 * ARCHITECTURAL ROLE:
 * - Layer: Application (Port Interface)
 * - Purpose: Defines contract between application and infrastructure layers
 * - Implemented by: useFfmpegAudio (infrastructure layer)
 * - Used by: AudioTranscoderAdapter (application layer)
 *
 * DESIGN PRINCIPLES:
 * - Pure audio operations only (no business logic)
 * - No domain object mapping
 * - No quiz-specific concerns
 * - Focus on format conversion and audio manipulation
 *
 * INTERFACE METHODS:
 * - isReady(): Check if transcoding service is available
 * - isLoading(): Check if service is initializing (for UI feedback)
 * - mp3ToWav(): Convert MP3 files to WAV format
 * - generateSilence(): Create silence audio of specified duration
 * - concatenateAudio(): Combine multiple audio blobs
 * - dispose(): Clean up resources
 *
 * AUDIO BLOB CONTRACT:
 * - url: Blob URL for immediate playback
 * - durationSec: Exact duration in seconds
 * - bytes: File size in bytes
 * - dispose(): Cleanup method for memory management
 *
 * IMPLEMENTATION NOTES:
 * - FFmpeg implementation downloads ~25MB on first use
 * - Blob URLs are iOS-compatible for audio playback
 * - All operations are asynchronous
 * - Memory management is critical for large audio files
 *
 * USAGE PATTERN:
 * ```typescript
 * const transcoder = useAudioTranscoderAdapter();
 *
 * if (!transcoder.isReady()) {
 *   // Show loading UI
 *   return <Loading message="Initializing audio engine..." />;
 * }
 *
 * const wavBlob = await transcoder.mp3ToWav(mp3Url);
 * // Use wavBlob.url for <audio> element
 * wavBlob.dispose(); // Clean up when done
 * ```
 */

export interface AudioBlob {
  url: string; // blob: URL
  durationSec: number; // exact duration in seconds
  bytes: number; // blob size in bytes
  dispose: () => void; // revokeObjectURL cleanup
}

export interface AudioTranscodingPort {
  readonly kind: 'ffmpeg' | 'webaudio';

  /**
   * Check if the transcoding service is ready
   */
  isReady: () => boolean;

  /**
   * Check if the transcoding service is currently loading/initializing
   */
  isLoading: () => boolean;

  /**
   * Convert MP3 audio to WAV format
   * @param mp3Url - URL to the MP3 file
   * @param options - Conversion options
   * @returns Promise resolving to WAV blob
   */
  mp3ToWav: (
    mp3Url: string,
    options?: {
      sampleRate?: number; // default: 22050
      channels?: number; // default: 1 (mono)
    },
  ) => Promise<AudioBlob>;

  /**
   * Generate silence audio of specified duration
   * @param durationSec - Duration in seconds
   * @param options - Generation options
   * @returns Promise resolving to silence blob
   */
  generateSilence: (
    durationSec: number,
    options?: {
      sampleRate?: number; // default: 22050
      channels?: number; // default: 1 (mono)
    },
  ) => Promise<AudioBlob>;

  /**
   * Concatenate multiple audio blobs into a single blob
   * @param audioBlobs - Array of audio blobs to concatenate
   * @returns Promise resolving to concatenated blob
   */
  concatenateAudio: (audioBlobs: AudioBlob[]) => Promise<AudioBlob>;

  /**
   * Clean up resources (e.g., terminate workers)
   */
  dispose: () => void;
}
