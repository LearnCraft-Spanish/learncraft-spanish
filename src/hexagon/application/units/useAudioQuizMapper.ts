/**
 * Audio Quiz Mapper Hook
 *
 * Application unit hook that handles the business logic of mapping ExampleWithVocabulary
 * domain objects to audio quiz examples. This hook orchestrates the audio transcoding
 * operations and applies quiz-specific business rules.
 *
 * This hook separates business logic from infrastructure concerns by:
 * - Using the AudioTranscodingPort for raw audio operations
 * - Applying quiz-specific mapping rules
 * - Handling buffer duration decisions
 * - Managing quiz type-specific logic
 *
 * USAGE:
 * ======
 *
 * ```typescript
 * function AudioQuizComponent() {
 *   const audioTranscoder = useFfmpegAudio();
 *   const { parseExampleForQuiz } = useAudioQuizMapper(audioTranscoder);
 *
 *   const handleQuiz = async (example: ExampleWithVocabulary, quizType: AudioQuizType) => {
 *     const quizExample = await parseExampleForQuiz(example, quizType);
 *     // quizExample is ready for use in the quiz
 *   };
 * }
 * ```
 *
 * ARCHITECTURE:
 * ============
 *
 * - Pure application layer business logic
 * - Depends on AudioTranscodingPort interface
 * - No direct infrastructure dependencies
 * - Testable with mock transcoding ports
 * - Handles quiz-specific audio processing rules
 */

import type {
  AudioQuizExample,
  ListeningQuizExample,
  SpeakingQuizExample,
} from '@domain/audioQuizzing';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { useAudioTranscoderAdapter } from '@application/adapters/audioTranscoderAdapter';
import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';
import { useCallback } from 'react';

export interface AudioQuizMapperReturn {
  /**
   * Parse an example for audio quizzing
   *
   * Converts ExampleWithVocabulary to both SpeakingQuizExample and ListeningQuizExample
   * by applying business rules about audio processing, buffer durations,
   * and quiz-specific requirements.
   */
  parseExampleForQuiz: (example: ExampleWithVocabulary) => Promise<{
    speaking: SpeakingQuizExample;
    listening: ListeningQuizExample;
  }>;

  /**
   * Check if the audio transcoder is currently loading/initializing
   */
  isAudioTranscoderLoading: () => boolean;

  /**
   * Get the current loading progress (0-100)
   */
  audioTranscoderLoadingProgress: () => number;
}

/**
 * Audio Quiz Mapper Hook
 * ======================
 *
 * APPLICATION LAYER - Business Logic for Audio Quiz Preparation
 *
 * This hook contains the business logic for converting ExampleWithVocabulary
 * objects into audio quiz examples. It bridges the gap between raw audio
 * transcoding and domain-specific quiz requirements.
 *
 * RESPONSIBILITIES:
 * - Apply business rules for audio processing
 * - Determine appropriate buffer durations
 * - Create both Speaking and Listening quiz examples
 * - Handle quiz-specific audio requirements
 *
 * BUSINESS RULES:
 * - 3-second silence buffer between audio segments
 * - Spanish audio for speaking practice
 * - English audio for listening practice
 * - Consistent audio format (WAV, 22050 Hz, mono)
 *
 * ARCHITECTURAL POSITION:
 * - Layer: Application (Business Logic)
 * - Uses: AudioTranscoderAdapter (infrastructure)
 * - Used by: useAudioQuiz (application orchestration)
 * - Domain: AudioQuizzing (domain objects)
 *
 * AUDIO PROCESSING PIPELINE:
 * 1. Extract Spanish/English audio URLs from example
 * 2. Convert MP3s to WAV using transcoder
 * 3. Generate 3-second silence buffer
 * 4. Concatenate audio + silence for each language
 * 5. Create domain objects for both quiz types
 *
 * ERROR HANDLING:
 * - Propagates transcoding errors to calling code
 * - Allows graceful handling of audio failures
 * - Maintains quiz integrity on audio errors
 */
export function useAudioQuizMapper(): AudioQuizMapperReturn {
  /**
   * Parse an example for audio quizzing
   *
   * Business logic for converting ExampleWithVocabulary to quiz examples:
   * - Determines which audio URL to use based on quiz type
   * - Applies appropriate buffer durations
   * - Handles quiz-specific audio processing requirements
   */

  const {
    mp3ToWav,
    generateSilence,
    concatenateAudio,
    isLoading,
    loadingProgress,
  } = useAudioTranscoderAdapter();
  // Create function with useCallback
  const parseExampleForQuiz = useCallback(
    async (
      example: ExampleWithVocabulary,
    ): Promise<{
      speaking: SpeakingQuizExample;
      listening: ListeningQuizExample;
    }> => {
      // Business rule: Determine which audio to use based on quiz type
      const spanishText = example.spanish;
      const englishText = example.english;
      const guessText = 'Make a guess!';
      const hintText = 'Listen to Audio';
      const listeningQuestionText = 'Listen to Audio';
      const spanishAudioUrl = example.spanishAudio;
      const englishAudioUrl = example.englishAudio;

      // Business rule: Apply appropriate buffer duration
      const BUFFER_LENGTH_SECONDS = 3;

      // Use transcoding port for raw audio operations
      const spanishAudioBlob = await mp3ToWav(spanishAudioUrl);
      const englishAudioBlob = await mp3ToWav(englishAudioUrl);
      const silenceBlob = await generateSilence(BUFFER_LENGTH_SECONDS);
      const combinedSpanishAudioBlob = await concatenateAudio([
        spanishAudioBlob,
        silenceBlob,
      ]);
      const combinedEnglishAudioBlob = await concatenateAudio([
        englishAudioBlob,
        silenceBlob,
      ]);

      // Create a silence blob that matches the total duration of the English audio
      const guessSilenceBlob = await generateSilence(
        combinedEnglishAudioBlob.durationSec,
      );

      // Create both quiz examples using the same audio blobs
      const speakingExample: SpeakingQuizExample = {
        type: AudioQuizType.Speaking,
        question: {
          step: AudioQuizStep.Question,
          spanish: false,
          displayText: englishText,
          blobUrl: combinedEnglishAudioBlob.url,
          duration: combinedEnglishAudioBlob.durationSec,
        },
        guess: {
          step: AudioQuizStep.Guess,
          spanish: false,
          displayText: guessText,
          blobUrl: guessSilenceBlob.url, // Use full-duration silence for guess step
          duration: guessSilenceBlob.durationSec,
        },
        hint: {
          step: AudioQuizStep.Hint,
          spanish: true,
          displayText: hintText,
          blobUrl: combinedSpanishAudioBlob.url,
          duration: combinedSpanishAudioBlob.durationSec,
        },
        answer: {
          step: AudioQuizStep.Answer,
          spanish: true,
          displayText: spanishText,
          blobUrl: combinedSpanishAudioBlob.url,
          duration: combinedSpanishAudioBlob.durationSec,
        },
      };

      const listeningExample: ListeningQuizExample = {
        type: AudioQuizType.Listening,
        question: {
          step: AudioQuizStep.Question,
          spanish: true,
          displayText: listeningQuestionText,
          blobUrl: combinedSpanishAudioBlob.url,
          duration: combinedSpanishAudioBlob.durationSec,
        },
        guess: {
          step: AudioQuizStep.Guess,
          spanish: false,
          displayText: guessText,
          blobUrl: guessSilenceBlob.url, // Use full-duration silence for guess step
          duration: guessSilenceBlob.durationSec,
        },
        hint: {
          step: AudioQuizStep.Hint,
          spanish: true,
          displayText: hintText,
          blobUrl: combinedSpanishAudioBlob.url,
          duration: combinedSpanishAudioBlob.durationSec,
        },
        answer: {
          step: AudioQuizStep.Answer,
          spanish: false,
          displayText: spanishText,
          blobUrl: combinedSpanishAudioBlob.url,
          duration: combinedSpanishAudioBlob.durationSec,
        },
      };

      const audioQuizExample: AudioQuizExample = {
        speaking: speakingExample,
        listening: listeningExample,
      };

      return audioQuizExample;
    },
    [mp3ToWav, generateSilence, concatenateAudio],
  );

  return {
    parseExampleForQuiz,
    isAudioTranscoderLoading: isLoading,
    audioTranscoderLoadingProgress: loadingProgress,
  };
}
