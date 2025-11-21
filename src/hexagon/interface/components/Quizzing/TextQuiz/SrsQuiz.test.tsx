import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { overrideMockUseStudentFlashcards } from '@application/units/useStudentFlashcards.mock';
import { SrsQuiz } from '@interface/components/Quizzing/TextQuiz/SrsQuiz';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createMockFlashcardList } from '@testing/factories/flashcardFactory';
import allStudentFlashcards from 'mocks/data/hooklike/studentFlashcardData';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
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

describe('component SrsQuiz', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders TextQuiz with SRS functionality', async () => {
    const mockFlashcards = createMockFlashcardList(5)();
    const mockUpdateFlashcards = vi.fn().mockResolvedValue(mockFlashcards);
    overrideMockUseStudentFlashcards({
      flashcards: mockFlashcards,
      updateFlashcards: mockUpdateFlashcards,
    });

    render(
      <MockAllProviders>
        <SrsQuiz
          textQuizProps={{
            examples: examplesForTextQuiz,
            startWithSpanish: false,
            cleanupFunction,
          }}
        />
      </MockAllProviders>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('flashcard')).toBeInTheDocument();
    });
  });

  it('calls flushBatch on unmount', async () => {
    const mockFlashcards = createMockFlashcardList(5)();
    const mockUpdateFlashcards = vi.fn().mockResolvedValue(mockFlashcards);
    overrideMockUseStudentFlashcards({
      flashcards: mockFlashcards,
      updateFlashcards: mockUpdateFlashcards,
    });

    const { unmount } = render(
      <MockAllProviders>
        <SrsQuiz
          textQuizProps={{
            examples: examplesForTextQuiz,
            startWithSpanish: false,
            cleanupFunction,
          }}
        />
      </MockAllProviders>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('flashcard')).toBeInTheDocument();
    });

    // Unmount the component - this should trigger flushBatch
    unmount();

    // Wait for async operations to complete
    await waitFor(() => {
      // No batch to flush (no reviews yet), so updateFlashcards should not be called
      expect(mockUpdateFlashcards).not.toHaveBeenCalled();
    });
  });
});
