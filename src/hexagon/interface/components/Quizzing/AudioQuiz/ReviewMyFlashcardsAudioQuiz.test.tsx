import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import {
  mockUseReviewMyFlashcardsAudioQuiz,
  overrideMockUseReviewMyFlashcardsAudioQuiz,
  resetMockUseReviewMyFlashcardsAudioQuiz,
} from '@application/units/AudioQuiz/useReviewMyFlashcardsAudioQuiz.mock';
import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import { AudioQuizType } from '@domain/audioQuizzing';
import { ReviewMyFlashcardsAudioQuiz } from '@interface/components/Quizzing/AudioQuiz/ReviewMyFlashcardsAudioQuiz';
import { cleanup, render, screen } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/units/AudioQuiz/useReviewMyFlashcardsAudioQuiz', () => ({
  useReviewMyFlashcardsAudioQuiz: () => mockUseReviewMyFlashcardsAudioQuiz,
}));

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

const examples: ExampleWithVocabulary[] =
  createMockExampleWithVocabularyList(3);

describe('ReviewMyFlashcardsAudioQuiz', () => {
  const audioQuizProps = {
    examplesToQuiz: examples,
    audioQuizType: AudioQuizType.Listening,
    autoplay: false,
    ready: true,
    cleanupFunction: vi.fn(),
  };

  beforeEach(() => {
    resetMockUseReviewMyFlashcardsAudioQuiz();
    resetMockUseStudentUiVersion();
    overrideMockUseReviewMyFlashcardsAudioQuiz({
      audioQuizType: AudioQuizType.Listening,
      currentExampleNumber: 1,
      quizLength: 3,
      currentStepValue: {
        ...mockUseReviewMyFlashcardsAudioQuiz.currentStepValue!,
        displayText: 'Playing English',
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the redesigned screen for a v2 student', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });

    render(
      <MockAllProviders>
        <ReviewMyFlashcardsAudioQuiz audioQuizProps={audioQuizProps} />
      </MockAllProviders>,
    );

    expect(screen.getAllByText('My Flashcards Quiz').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Listening Quiz').length).toBeGreaterThan(0);
  });

  it('keeps the legacy audio quiz for a v1 student', () => {
    overrideMockUseStudentUiVersion({ version: 'v1' });

    render(
      <MockAllProviders>
        <ReviewMyFlashcardsAudioQuiz audioQuizProps={audioQuizProps} />
      </MockAllProviders>,
    );

    expect(screen.getByText('Playing English')).toBeInTheDocument();
    expect(screen.queryByText('My Flashcards Quiz')).not.toBeInTheDocument();
  });
});
