import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import {
  createMockTextQuizReturn,
  mockUseTextQuiz,
  overrideMockUseTextQuiz,
  resetMockUseTextQuiz,
} from '@application/units/useTextQuiz/useTextQuiz.mock';
import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import { RegularTextQuiz } from '@interface/components/Quizzing/TextQuiz/RegularTextQuiz';
import { render, screen } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the useTextQuiz hook
vi.mock('@application/units/useTextQuiz', () => ({
  useTextQuiz: () => mockUseTextQuiz,
}));

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

describe('regularTextQuiz', () => {
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
    resetMockUseTextQuiz();
    resetMockUseStudentUiVersion();
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

  it('renders the redesigned TextQuizV2Screen on v2', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });
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

    // Rendered in both the mobile and desktop rows of QuizProgressHeader.
    expect(screen.getAllByText('1 / 3').length).toBeGreaterThan(0);
    expect(screen.queryByText(/1 of 3/)).toBeNull();
  });

  it('falls back to the legacy TextQuiz on v1', () => {
    overrideMockUseStudentUiVersion({ version: 'v1' });
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
    expect(screen.queryAllByText('1 / 3').length).toBe(0);
  });
});
