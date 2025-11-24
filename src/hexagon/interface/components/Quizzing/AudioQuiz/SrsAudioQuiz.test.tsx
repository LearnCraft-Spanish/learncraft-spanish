import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { overrideMockUseStudentFlashcards } from '@application/units/useStudentFlashcards.mock';
import { AudioQuizType } from '@domain/audioQuizzing';
import { SrsAudioQuiz } from '@interface/components/Quizzing/AudioQuiz/SrsAudioQuiz';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { createMockFlashcardList } from '@testing/factories/flashcardFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { afterEach, describe, expect, it, vi } from 'vitest';

const cleanupFunction = vi.fn();

const mockExamples: ExampleWithVocabulary[] =
  createMockExampleWithVocabularyList(5)();

describe.skip('component SrsAudioQuiz', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders AudioQuiz with SRS functionality', async () => {
    const mockFlashcards = createMockFlashcardList(5)();
    const mockUpdateFlashcards = vi.fn().mockResolvedValue(mockFlashcards);
    overrideMockUseStudentFlashcards({
      flashcards: mockFlashcards,
      updateFlashcards: mockUpdateFlashcards,
    });

    render(
      <MockAllProviders>
        <SrsAudioQuiz
          audioQuizProps={{
            examplesToQuiz: mockExamples,
            audioQuizType: AudioQuizType.Speaking,
            autoplay: false,
            ready: true,
            cleanupFunction,
          }}
        />
      </MockAllProviders>,
    );

    // Wait for quiz to initialize
    await waitFor(
      () => {
        expect(
          screen.queryByText('Setting up Quiz...'),
        ).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
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
        <SrsAudioQuiz
          audioQuizProps={{
            examplesToQuiz: mockExamples,
            audioQuizType: AudioQuizType.Speaking,
            autoplay: false,
            ready: true,
            cleanupFunction,
          }}
        />
      </MockAllProviders>,
    );

    // Wait for quiz to initialize
    await waitFor(
      () => {
        expect(
          screen.queryByText('Setting up Quiz...'),
        ).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Unmount the component - this should trigger flushBatch
    unmount();

    // Wait for async operations to complete
    await waitFor(() => {
      // No batch to flush (no reviews yet), so updateFlashcards should not be called
      expect(mockUpdateFlashcards).not.toHaveBeenCalled();
    });
  });
});
