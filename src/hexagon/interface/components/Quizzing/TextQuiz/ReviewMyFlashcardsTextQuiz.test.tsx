import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { createMockTextQuizReturn } from '@application/units/useTextQuiz/useTextQuiz.mock';
import {
  mockUseReviewMyFlashcardsTextQuiz,
  overrideMockUseReviewMyFlashcardsTextQuiz,
  resetMockUseReviewMyFlashcardsTextQuiz,
} from '@application/useCases/TextQuiz/useReviewMyFlashcardsTextQuiz.mock';
import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import { ReviewMyFlashcardsTextQuiz } from '@interface/components/Quizzing/TextQuiz/ReviewMyFlashcardsTextQuiz';
import { render, screen } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the useCase
vi.mock('@application/useCases/TextQuiz/useReviewMyFlashcardsTextQuiz', () => ({
  useReviewMyFlashcardsTextQuiz: () => mockUseReviewMyFlashcardsTextQuiz,
}));

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

describe('reviewMyFlashcardsTextQuiz', () => {
  const mockExamples: ExampleWithVocabulary[] =
    createMockExampleWithVocabularyList(3);
  const mockCleanupFunction = vi.fn();

  const defaultProps = {
    textQuizProps: {
      examples: mockExamples,
      startWithSpanish: false,
      cleanupFunction: mockCleanupFunction,
    },
  };

  beforeEach(() => {
    resetMockUseReviewMyFlashcardsTextQuiz();
    resetMockUseStudentUiVersion();
  });

  it('should render TextQuiz component', () => {
    overrideMockUseReviewMyFlashcardsTextQuiz(
      createMockTextQuizReturn({
        quizLength: 3,
        exampleNumber: 1,
      }),
    );

    render(
      <MockAllProviders>
        <ReviewMyFlashcardsTextQuiz {...defaultProps} />
      </MockAllProviders>,
    );

    expect(screen.getByText(/1 of 3/)).toBeInTheDocument();
  });

  it('should pass quizTitle to TextQuiz', () => {
    overrideMockUseReviewMyFlashcardsTextQuiz(
      createMockTextQuizReturn({
        quizLength: 3,
        exampleNumber: 1,
      }),
    );

    render(
      <MockAllProviders>
        <ReviewMyFlashcardsTextQuiz
          {...defaultProps}
          quizTitle="Review My Flashcards"
        />
      </MockAllProviders>,
    );

    expect(screen.getByText(/Review My Flashcards/)).toBeInTheDocument();
  });

  it('renders the redesigned TextQuizV2Screen on v2', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });
    overrideMockUseReviewMyFlashcardsTextQuiz(
      createMockTextQuizReturn({
        quizLength: 3,
        exampleNumber: 1,
      }),
    );

    render(
      <MockAllProviders>
        <ReviewMyFlashcardsTextQuiz {...defaultProps} />
      </MockAllProviders>,
    );

    expect(screen.getAllByText('1 / 3').length).toBeGreaterThan(0);
    expect(screen.queryByText(/1 of 3/)).toBeNull();
  });

  it('falls back to the legacy TextQuiz on v1', () => {
    overrideMockUseStudentUiVersion({ version: 'v1' });
    overrideMockUseReviewMyFlashcardsTextQuiz(
      createMockTextQuizReturn({
        quizLength: 3,
        exampleNumber: 1,
      }),
    );

    render(
      <MockAllProviders>
        <ReviewMyFlashcardsTextQuiz {...defaultProps} />
      </MockAllProviders>,
    );

    expect(screen.getByText(/1 of 3/)).toBeInTheDocument();
  });
});
