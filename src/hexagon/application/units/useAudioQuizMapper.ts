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
import { useAudioAdapter } from '@application/adapters/audioAdapter';
import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';
import { useCallback } from 'react';

// Import silence audio files so Vite can process them at build time
import silence1s from 'src/assets/audio/1s.mp3';
import silence2s from 'src/assets/audio/2s.mp3';
import silence3s from 'src/assets/audio/3s.mp3';
import silence4s from 'src/assets/audio/4s.mp3';
import silence5s from 'src/assets/audio/5s.mp3';
import silence6s from 'src/assets/audio/6s.mp3';
import silence7s from 'src/assets/audio/7s.mp3';
import silence8s from 'src/assets/audio/8s.mp3';
import silence9s from 'src/assets/audio/9s.mp3';
import silence10s from 'src/assets/audio/10s.mp3';
import silence11s from 'src/assets/audio/11s.mp3';
import silence12s from 'src/assets/audio/12s.mp3';
import silence13s from 'src/assets/audio/13s.mp3';
import silence14s from 'src/assets/audio/14s.mp3';
import silence15s from 'src/assets/audio/15s.mp3';
import silence16s from 'src/assets/audio/16s.mp3';
import silence17s from 'src/assets/audio/17s.mp3';
import silence18s from 'src/assets/audio/18s.mp3';
import silence19s from 'src/assets/audio/19s.mp3';
import silence20s from 'src/assets/audio/20s.mp3';
import silence21s from 'src/assets/audio/21s.mp3';
import silence22s from 'src/assets/audio/22s.mp3';
import silence23s from 'src/assets/audio/23s.mp3';
import silence24s from 'src/assets/audio/24s.mp3';
import silence25s from 'src/assets/audio/25s.mp3';
import silence26s from 'src/assets/audio/26s.mp3';
import silence27s from 'src/assets/audio/27s.mp3';
import silence28s from 'src/assets/audio/28s.mp3';
import silence29s from 'src/assets/audio/29s.mp3';
import silence30s from 'src/assets/audio/30s.mp3';

// Map duration (in seconds) to imported audio file URL
const SILENCE_AUDIO_MAP: Record<number, string> = {
  1: silence1s,
  2: silence2s,
  3: silence3s,
  4: silence4s,
  5: silence5s,
  6: silence6s,
  7: silence7s,
  8: silence8s,
  9: silence9s,
  10: silence10s,
  11: silence11s,
  12: silence12s,
  13: silence13s,
  14: silence14s,
  15: silence15s,
  16: silence16s,
  17: silence17s,
  18: silence18s,
  19: silence19s,
  20: silence20s,
  21: silence21s,
  22: silence22s,
  23: silence23s,
  24: silence24s,
  25: silence25s,
  26: silence26s,
  27: silence27s,
  28: silence28s,
  29: silence29s,
  30: silence30s,
};

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
  const { getAudioDurationSeconds } = useAudioAdapter();

  /**
   * Parse an example for audio quizzing
   *
   * Business logic for converting ExampleWithVocabulary to quiz examples:
   * - Determines which audio URL to use based on quiz type
   * - Applies appropriate buffer durations
   * - Handles quiz-specific audio processing requirements
   */

  // Create function with useCallback
  const parseExampleForQuiz = useCallback(
    async (
      example: ExampleWithVocabulary,
    ): Promise<{
      speaking: SpeakingQuizExample;
      listening: ListeningQuizExample;
    }> => {
      try {
        // Business rule: Determine which audio to use based on quiz type
        const spanishText = example.spanish;
        const englishText = example.english;
        const guessText = 'Make a guess!';
        const hintText = 'Listen to Audio';
        const listeningQuestionText = 'Listen to Audio';
        const spanishAudioUrl = example.spanishAudio;
        const englishAudioUrl = example.englishAudio;

        let englishAudioDurationSeconds: number;
        let spanishAudioDurationSeconds: number;
        try {
          englishAudioDurationSeconds =
            await getAudioDurationSeconds(englishAudioUrl);
          spanishAudioDurationSeconds =
            await getAudioDurationSeconds(spanishAudioUrl);
        } catch (error) {
          console.error(error);
          throw new Error('Failed to parse audio durations', { cause: error });
        }

        // Business rule: Calculate silence duration and get the appropriate audio file
        const guessSilenceLengthSeconds = englishAudioDurationSeconds * 1.5;
        const guessSilenceLengthRounded = Math.ceil(guessSilenceLengthSeconds);

        // Clamp to available silence durations (1-30 seconds)
        const clampedSilenceDuration = Math.max(
          1,
          Math.min(30, guessSilenceLengthRounded),
        );

        // Get the imported audio URL from the map
        const guessMp3Path = SILENCE_AUDIO_MAP[clampedSilenceDuration];

        if (!guessMp3Path) {
          throw new Error(
            `No silence audio file found for ${clampedSilenceDuration} seconds`,
          );
        }

        // Create both quiz examples using the same audio blobs
        const speakingExample: SpeakingQuizExample = {
          type: AudioQuizType.Speaking,
          question: {
            step: AudioQuizStep.Question,
            spanish: false,
            displayText: englishText,
            mp3AudioUrl: englishAudioUrl,
            duration: englishAudioDurationSeconds,
          },
          guess: {
            step: AudioQuizStep.Guess,
            spanish: false,
            displayText: guessText,
            mp3AudioUrl: guessMp3Path, // Use full-duration silence for guess step
            duration: clampedSilenceDuration,
          },
          hint: {
            step: AudioQuizStep.Hint,
            spanish: true,
            displayText: hintText,
            mp3AudioUrl: spanishAudioUrl,
            duration: spanishAudioDurationSeconds,
          },
          answer: {
            step: AudioQuizStep.Answer,
            spanish: true,
            displayText: spanishText,
            mp3AudioUrl: spanishAudioUrl,
            duration: spanishAudioDurationSeconds,
          },
        };

        const listeningExample: ListeningQuizExample = {
          type: AudioQuizType.Listening,
          question: {
            step: AudioQuizStep.Question,
            spanish: true,
            displayText: listeningQuestionText,
            mp3AudioUrl: spanishAudioUrl,
            duration: spanishAudioDurationSeconds,
          },
          guess: {
            step: AudioQuizStep.Guess,
            spanish: false,
            displayText: guessText,
            mp3AudioUrl: guessMp3Path, // Use full-duration silence for guess step
            duration: clampedSilenceDuration,
          },
          hint: {
            step: AudioQuizStep.Hint,
            spanish: true,
            displayText: spanishText,
            mp3AudioUrl: spanishAudioUrl,
            duration: spanishAudioDurationSeconds,
          },
          answer: {
            step: AudioQuizStep.Answer,
            spanish: false,
            displayText: englishText,
            mp3AudioUrl: englishAudioUrl,
            duration: englishAudioDurationSeconds,
          },
        };

        const audioQuizExample: AudioQuizExample = {
          speaking: speakingExample,
          listening: listeningExample,
        };

        return audioQuizExample;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to parse example for quiz', { cause: error });
      }
    },
    [getAudioDurationSeconds],
  );

  return {
    parseExampleForQuiz,
  };
}
