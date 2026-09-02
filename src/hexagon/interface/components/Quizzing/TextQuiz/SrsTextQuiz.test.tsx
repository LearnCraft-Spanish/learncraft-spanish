import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { createMockTextQuizReturn } from '@application/units/useTextQuiz/useTextQuiz.mock';
import {
  mockUseSrsTextQuiz,
  overrideMockUseSrsTextQuiz,
  resetMockUseSrsTextQuiz,
} from '@application/useCases/TextQuiz/useSrsTextQuiz.mock';
import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import { SrsTextQuiz } from '@interface/components/Quizzing/TextQuiz/SrsTextQuiz';
import { render, screen } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the useCase
vi.mock('@application/useCases/TextQuiz/useSrsTextQuiz', () => ({
  useSrsTextQuiz: () => mockUseSrsTextQuiz,
}));

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

describe('srsTextQuiz', () => {
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
    resetMockUseSrsTextQuiz();
    resetMockUseStudentUiVersion();
    // Set up as student for SRS features
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
        isStudent: true,
      },
      {
        isOwnUser: true,
      },
    );
  });

  it('should render TextQuiz component with SRS props', () => {
    overrideMockUseSrsTextQuiz({
      TextQuizReturn: createMockTextQuizReturn({
        quizLength: 3,
        exampleNumber: 1,
      }),
    });

    render(
      <MockAllProviders>
        <SrsTextQuiz {...defaultProps} />
      </MockAllProviders>,
    );

    expect(screen.getByText(/1 of 3/)).toBeInTheDocument();
  });

  it('should pass quizTitle to TextQuiz', () => {
    overrideMockUseSrsTextQuiz({
      TextQuizReturn: createMockTextQuizReturn({
        quizLength: 4,
        exampleNumber: 1,
      }),
    });

    render(
      <MockAllProviders>
        <SrsTextQuiz {...defaultProps} quizTitle="SRS Review" />
      </MockAllProviders>,
    );

    expect(screen.getByText(/SRS Review/)).toBeInTheDocument();
    expect(screen.getByText(/1 of 4/)).toBeInTheDocument();
  });

  it('renders the redesigned TextQuizV2Screen with tallies on v2', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });
    overrideMockUseSrsTextQuiz({
      TextQuizReturn: createMockTextQuizReturn({
        quizLength: 3,
        exampleNumber: 1,
      }),
    });

    render(
      <MockAllProviders>
        <SrsTextQuiz {...defaultProps} />
      </MockAllProviders>,
    );

    expect(screen.getAllByText('1 / 3').length).toBeGreaterThan(0);
    expect(screen.queryByText(/1 of 3/)).toBeNull();
  });

  it('falls back to the legacy TextQuiz on v1', () => {
    overrideMockUseStudentUiVersion({ version: 'v1' });
    overrideMockUseSrsTextQuiz({
      TextQuizReturn: createMockTextQuizReturn({
        quizLength: 3,
        exampleNumber: 1,
      }),
    });

    render(
      <MockAllProviders>
        <SrsTextQuiz {...defaultProps} />
      </MockAllProviders>,
    );

    expect(screen.getByText(/1 of 3/)).toBeInTheDocument();
  });
});
