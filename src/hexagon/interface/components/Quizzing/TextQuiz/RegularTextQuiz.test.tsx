import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import {
  createMockTextQuizReturn,
  mockUseTextQuiz,
  overrideMockUseTextQuiz,
  resetMockUseTextQuiz,
} from '@application/units/useTextQuiz/useTextQuiz.mock';
import { RegularTextQuiz } from '@interface/components/Quizzing/TextQuiz/RegularTextQuiz';
import { render, screen } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the useTextQuiz hook
vi.mock('@application/units/useTextQuiz', () => ({
  useTextQuiz: () => mockUseTextQuiz,
}));

describe('regularTextQuiz', () => {
  const mockExamples: ExampleWithVocabulary[] =
    createMockExampleWithVocabularyList()(3);
  const mockCleanupFunction = vi.fn();

  const defaultProps = {
    textQuizProps: {
      examples: mockExamples,
      startWithSpanish: false,
      cleanupFunction: mockCleanupFunction,
    },
  };

  beforeEach(() => {
    resetMockUseTextQuiz();
  });

  it('should render TextQuiz component', () => {
    overrideMockUseTextQuiz(
      createMockTextQuizReturn({
        quizLength: 3,
        exampleNumber: 1,
      }),
    );

    render(
      <MockAllProviders>
        <RegularTextQuiz {...defaultProps} />
      </MockAllProviders>,
    );

    expect(screen.getByText(/1 of 3/)).toBeInTheDocument();
  });

  it('should pass quizTitle to TextQuiz', () => {
    overrideMockUseTextQuiz(
      createMockTextQuizReturn({
        quizLength: 5,
        exampleNumber: 2,
      }),
    );

    render(
      <MockAllProviders>
        <RegularTextQuiz {...defaultProps} quizTitle="Practice Quiz" />
      </MockAllProviders>,
    );

    expect(screen.getByText(/Practice Quiz/)).toBeInTheDocument();
    expect(screen.getByText(/2 of 5/)).toBeInTheDocument();
  });
});
