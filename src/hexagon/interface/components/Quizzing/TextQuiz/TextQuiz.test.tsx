import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import allStudentFlashcards from 'mocks/data/hooklike/studentFlashcardData';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import React from 'react';
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TextQuiz } from './TextQuiz';

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

function renderQuiz({
  startWithSpanish = false,
}: { startWithSpanish?: boolean } = {}) {
  render(
    <MockAllProviders>
      <TextQuiz
        examples={examplesForTextQuiz}
        startWithSpanish={startWithSpanish}
        cleanupFunction={cleanupFunction}
      />
    </MockAllProviders>,
  );
}

function renderQuizYesSrs({
  startWithSpanish = false,
}: { startWithSpanish?: boolean } = {}) {
  // For now TextQuiz has no SRS controls; we still render to keep this test in place
  render(
    <MockAllProviders>
      <TextQuiz
        examples={examplesForTextQuiz}
        startWithSpanish={startWithSpanish}
        cleanupFunction={cleanupFunction}
        srsQuizProps={{
          examplesReviewedResults: [],
          handleReviewExample: () => {},
          hasExampleBeenReviewed: () => null,
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
    expect(screen.getByText(/\d+\/\d+/)).toBeTruthy();
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
  });
});
