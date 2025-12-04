import type { AudioQuizExample } from '@domain/audioQuizzing';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

/**
 * Creates a mock AudioQuizExample from an ExampleWithVocabulary
 */
export function createMockParsedAudioQuizExample(
  example: ExampleWithVocabulary,
): AudioQuizExample {
  return {
    speaking: {
      type: AudioQuizType.Speaking,
      question: {
        step: AudioQuizStep.Question,
        spanish: false,
        displayText: example.english,
        mp3AudioUrl: example.englishAudio ?? 'http://example.com/english.mp3',
        duration: 1.0,
      },
      guess: {
        step: AudioQuizStep.Guess,
        spanish: false,
        displayText: 'Make a guess',
        mp3AudioUrl: 'http://example.com/silence.mp3',
        duration: 0,
      },
      hint: {
        step: AudioQuizStep.Hint,
        spanish: true,
        displayText: example.english,
        mp3AudioUrl: example.englishAudio ?? 'http://example.com/english.mp3',
        duration: 1.0,
      },
      answer: {
        step: AudioQuizStep.Answer,
        spanish: true,
        displayText: example.spanish,
        mp3AudioUrl: example.spanishAudio ?? 'http://example.com/spanish.mp3',
        duration: 1.0,
      },
    },
    listening: {
      type: AudioQuizType.Listening,
      question: {
        step: AudioQuizStep.Question,
        spanish: true,
        displayText: 'Listen to audio',
        mp3AudioUrl: example.spanishAudio ?? 'http://example.com/spanish.mp3',
        duration: 1.0,
      },
      guess: {
        step: AudioQuizStep.Guess,
        spanish: false,
        displayText: 'Make a guess',
        mp3AudioUrl: 'http://example.com/silence.mp3',
        duration: 0,
      },
      hint: {
        step: AudioQuizStep.Hint,
        spanish: true,
        displayText: example.spanish,
        mp3AudioUrl: example.spanishAudio ?? 'http://example.com/spanish.mp3',
        duration: 1.0,
      },
      answer: {
        step: AudioQuizStep.Answer,
        spanish: false,
        displayText: example.english,
        mp3AudioUrl: example.englishAudio ?? 'http://example.com/english.mp3',
        duration: 1.0,
      },
    },
  };
}

export interface UseAudioQuizMapperReturn {
  parseExampleForQuiz: (
    example: ExampleWithVocabulary,
  ) => Promise<AudioQuizExample>;
}

const defaultMockUseAudioQuizMapper: UseAudioQuizMapperReturn = {
  parseExampleForQuiz: vi.fn<
    (example: ExampleWithVocabulary) => Promise<AudioQuizExample>
  >((example) => Promise.resolve(createMockParsedAudioQuizExample(example))),
};

export const {
  mock: mockUseAudioQuizMapper,
  override: overrideMockUseAudioQuizMapper,
  reset: resetMockUseAudioQuizMapper,
} = createOverrideableMock<UseAudioQuizMapperReturn>(
  defaultMockUseAudioQuizMapper,
);

export default mockUseAudioQuizMapper;
