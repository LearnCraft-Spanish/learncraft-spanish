/**
 * Audio URL Adapter
 * Converts boolean hasAudio field to English and Spanish audio URLs
 *
 * This is domain logic for generating audio URLs based on a boolean flag.
 * The actual URL generation logic is domain-specific and may involve
 * external services or file paths.
 */

export interface AudioUrlAdapter {
  /**
   * Generate audio URLs from hasAudio boolean
   * @param hasAudio - Boolean flag indicating if audio should be generated
   * @param recordId - The record ID to use for URL generation
   * @returns Object with spanishAudioLa and englishAudio URLs, or empty strings if hasAudio is false
   */
  generateAudioUrls: (
    hasAudio: boolean,
    recordId: number,
  ) => {
    spanishAudioLa: string;
    englishAudio: string;
  };
}

/**
 * Create an audio URL adapter
 * Generates URLs based on recordId and a base URL pattern
 *
 * This is a domain function - pure business logic for URL generation.
 * Infrastructure concerns (actual URL fetching, S3 access, etc.) should be
 * handled in the infrastructure layer.
 *
 * @param baseUrl - Optional base URL for audio files (defaults to S3 bucket)
 * @returns AudioUrlAdapter implementation
 */
export function createAudioUrlAdapter(baseUrl?: string): AudioUrlAdapter {
  const defaultBaseUrl =
    baseUrl || 'https://dbexamples.s3.us-east-2.amazonaws.com/dbexamples';

  return {
    generateAudioUrls: (hasAudio: boolean, recordId: number) => {
      if (!hasAudio) {
        return {
          spanishAudioLa: '',
          englishAudio: '',
        };
      }

      // Generate URLs based on recordId
      // This is domain logic - the pattern for URL generation
      return {
        spanishAudioLa: `${defaultBaseUrl}/ex${recordId}la.mp3`,
        englishAudio: `${defaultBaseUrl}/ex${recordId}en.mp3`,
      };
    },
  };
}
