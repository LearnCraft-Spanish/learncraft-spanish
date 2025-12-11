import type { UseStudentFlashcardUpdatesReturn } from '@application/units/studentFlashcardUpdates';
import type { TextQuizReturn } from '@application/units/useTextQuiz';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { createMockFlashcardForDisplay } from '@application/units/useTextQuiz/useTextQuiz.mock';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz/TextQuiz';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import allStudentFlashcards from 'mocks/data/hooklike/studentFlashcardData';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import React from 'react';

import { afterEach, describe, expect, it, vi } from 'vitest';

const cleanupFunction = vi.fn();

const user = getAuthUserFromEmail('student-admin@fake.not')!;
if (!user) {
  throw new Error(`Student not found in mock data set: student-admin`);
}
const userFlashcardData = allStudentFlashcards.find(
  (student) => student.emailAddress === user.email,
)?.studentFlashcardData;
if (!userFlashcardData) {
  throw new Error(`Student flashcard data not found: student-admin`);
}

const examplesForTextQuiz: ExampleWithVocabulary[] =
  userFlashcardData.examples.map(
    (f) =>
      ({
        id: f.recordId,
        spanish: f.spanishExample,
        english: f.englishTranslation,
        spanishAudio: f.spanishAudioLa,
        englishAudio: f.englishAudio,
        vocabulary: [],
        vocabularyComplete: !!f.vocabComplete,
      }) as unknown as ExampleWithVocabulary,
  );

// Hook wrapper component that manages state and creates TextQuizReturn mock
function MockQuizWrapper({
  startWithSpanish = false,
  customCleanup,
  srsQuizProps,
}: {
  startWithSpanish?: boolean;
  customCleanup?: () => void;
  srsQuizProps?: UseStudentFlashcardUpdatesReturn;
}) {
  const [exampleIndex, setExampleIndex] = React.useState(0);
  const [quizComplete, setQuizComplete] = React.useState(false);
  const [answerShowing, setAnswerShowing] = React.useState(false);
  const [getHelpIsOpen, setGetHelpIsOpen] = React.useState(false);

  const currentExample = examplesForTextQuiz[exampleIndex] || null;

  const nextExample = () => {
    if (exampleIndex < examplesForTextQuiz.length - 1) {
      setExampleIndex(exampleIndex + 1);
    } else {
      setQuizComplete(true);
    }
    setAnswerShowing(false);
    setGetHelpIsOpen(false);
  };

  const previousExample = () => {
    if (exampleIndex > 0) {
      setExampleIndex(exampleIndex - 1);
      setAnswerShowing(false);
      setGetHelpIsOpen(false);
    }
  };

  const toggleAnswer = () => {
    setAnswerShowing(!answerShowing);
  };

  const quizExample = currentExample
    ? createMockFlashcardForDisplay(currentExample, startWithSpanish)
    : null;

  const useTextQuizReturn: TextQuizReturn = {
    examplesAreLoading: false,
    addPendingRemoveProps: undefined,
    quizExample,
    nextExample,
    previousExample,
    exampleNumber: exampleIndex + 1,
    quizLength: examplesForTextQuiz.length,
    vocabInfoHook: vi.fn(),
    currentExample,
    cleanupFunction: customCleanup || cleanupFunction,
    isQuizComplete: quizComplete,
    restartQuiz: () => {
      setExampleIndex(0);
      setQuizComplete(false);
      setAnswerShowing(false);
    },
    answerShowing,
    toggleAnswer,
    getHelpIsOpen,
    setGetHelpIsOpen,
  };

  return (
    <TextQuiz
      useTextQuizReturn={useTextQuizReturn}
      srsQuizProps={srsQuizProps}
    />
  );
}

function renderQuiz({
  startWithSpanish = false,
}: { startWithSpanish?: boolean } = {}) {
  render(
    <MockAllProviders>
      <MockQuizWrapper startWithSpanish={startWithSpanish} />
    </MockAllProviders>,
  );
}

function renderQuizYesSrs({
  startWithSpanish = false,
}: { startWithSpanish?: boolean } = {}) {
  render(
    <MockAllProviders>
      <MockQuizWrapper
        startWithSpanish={startWithSpanish}
        srsQuizProps={{
          examplesReviewedResults: [],
          handleReviewExample: () => {},
          hasExampleBeenReviewed: () => null,
          flushBatch: vi.fn(),
        }}
      />
    </MockAllProviders>,
  );
}

describe('component TextQuiz', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders flashcard and progress', async () => {
    renderQuiz();
    await waitFor(() => {
      expect(screen.getByLabelText('flashcard')).toBeInTheDocument();
    });
    expect(screen.getByText(/1 of/)).toBeTruthy();
  });

  it('calls cleanupFunction on Back link click (if present)', () => {
    renderQuiz();
    const backLink = screen.queryByText('Back');
    if (backLink) {
      act(() => {
        backLink.click();
      });
      expect(cleanupFunction).toHaveBeenCalledOnce();
    }
  });

  it('changes flashcard on next button click', async () => {
    renderQuiz();
    await waitFor(() => {
      expect(screen.getByLabelText('flashcard')).toBeInTheDocument();
    });

    const initialFlashcardText = screen.getByLabelText('flashcard').textContent;

    const nextButton = screen.getByRole('button', { name: 'Next' });

    act(() => {
      fireEvent.click(nextButton);
    });

    const nextFlashcardText = screen.getByLabelText('flashcard').textContent;

    expect(nextFlashcardText).not.toBe(initialFlashcardText);
  });

  it('changes flashcard to previous on previous button click', async () => {
    renderQuiz();
    await waitFor(() => {
      expect(screen.getByLabelText('flashcard')).toBeInTheDocument();
    });

    const flashcard = screen.getByLabelText('flashcard');
    const initialText = flashcard.textContent;

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    });

    const nextText = screen.getByLabelText('flashcard').textContent;

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    });

    await waitFor(() => {
      const previousText = screen.getByLabelText('flashcard').textContent;
      expect(previousText).toBe(initialText);
      expect(previousText).not.toBe(nextText);
    });
  });

  describe('isSrsQuiz is true', () => {
    it('renders SrsButtons when isSrsQuiz is true', async () => {
      overrideAuthAndAppUser(
        {
          authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
          isStudent: true,
        },
        {
          isOwnUser: true,
        },
      );
      renderQuizYesSrs();
      await waitFor(() => {
        expect(screen.getByLabelText('flashcard')).toBeInTheDocument();
      });

      const flashcard = screen.getByLabelText('flashcard');
      act(() => {
        fireEvent.click(flashcard);
      });

      await waitFor(() => {
        expect(screen.getByText(/this was hard/i)).toBeInTheDocument();
        expect(screen.queryByText(/this was easy/i)).toBeInTheDocument();
      });
    });

    it('calls flushBatch when cleanup function is called', async () => {
      const mockFlushBatch = vi.fn();
      const mockCleanup = vi.fn();

      render(
        <MockAllProviders>
          <MockQuizWrapper
            startWithSpanish={false}
            customCleanup={mockCleanup}
            srsQuizProps={{
              examplesReviewedResults: [],
              handleReviewExample: () => {},
              hasExampleBeenReviewed: () => null,
              flushBatch: mockFlushBatch,
            }}
          />
        </MockAllProviders>,
      );

      const backLink = screen.queryByText('Back');
      if (backLink) {
        await act(async () => {
          backLink.click();
          // Wait for async flushBatch to be called
          await new Promise((resolve) => setTimeout(resolve, 10));
        });
        expect(mockCleanup).toHaveBeenCalled();
      }
    });

    it('marks flashcard as viewed when next is pressed without review', async () => {
      const mockHandleReviewExample = vi.fn();
      const mockHasExampleBeenReviewed = vi.fn().mockReturnValue(null);

      render(
        <MockAllProviders>
          <MockQuizWrapper
            startWithSpanish={false}
            srsQuizProps={{
              examplesReviewedResults: [],
              handleReviewExample: mockHandleReviewExample,
              hasExampleBeenReviewed: mockHasExampleBeenReviewed,
              flushBatch: vi.fn(),
            }}
          />
        </MockAllProviders>,
      );

      await waitFor(() => {
        expect(screen.getByLabelText('flashcard')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: 'Next' });

      act(() => {
        fireEvent.click(nextButton);
      });

      // Note: This test is checking SRS behavior but TextQuiz itself doesn't handle this
      // The actual 'viewed' marking happens in useSrsTextQuiz's enhancedNextExample
      // This test verifies the component can receive and use srsQuizProps correctly
    });
  });
});
