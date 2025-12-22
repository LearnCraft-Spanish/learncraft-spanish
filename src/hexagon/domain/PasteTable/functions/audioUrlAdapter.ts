/**
 * Audio URL Generation
 * Converts boolean hasAudio field to English and Spanish audio URLs
 *
 * This is domain logic for generating audio URLs based on a boolean flag.
 * The actual URL generation logic is domain-specific and may involve
 * external services or file paths.
 */

  /**
   * Generate audio URLs from hasAudio boolean
 * Pure domain function for URL generation based on record ID
 *
   * @param hasAudio - Boolean flag indicating if audio should be generated
   * @param recordId - The record ID to use for URL generation
 * @param baseUrl - Optional base URL for audio files (defaults to S3 bucket)
   * @returns Object with spanishAudioLa and englishAudio URLs, or empty strings if hasAudio is false
   */
export function generateAudioUrls(
    hasAudio: boolean,
    recordId: number,
  baseUrl?: string,
): {
    spanishAudioLa: string;
    englishAudio: string;
} {
      if (!hasAudio) {
        return {
          spanishAudioLa: '',
          englishAudio: '',
        };
      }

  const defaultBaseUrl =
    baseUrl || 'https://dbexamples.s3.us-east-2.amazonaws.com/dbexamples';

      // Generate URLs based on recordId
      // This is domain logic - the pattern for URL generation
      return {
        spanishAudioLa: `${defaultBaseUrl}/ex${recordId}la.mp3`,
        englishAudio: `${defaultBaseUrl}/ex${recordId}en.mp3`,
  };
}
