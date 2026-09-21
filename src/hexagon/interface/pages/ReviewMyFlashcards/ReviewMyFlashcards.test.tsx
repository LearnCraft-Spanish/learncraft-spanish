import type * as QuizMyFlashcardsUseCase from '@application/useCases/useQuizMyFlashcards';
import {
  defaultMockTextQuizSetup,
  mockUseQuizMyFlashcards,
  overrideMockUseQuizMyFlashcards,
  resetMockUseQuizMyFlashcards,
} from '@application/useCases/useQuizMyFlashcards/useQuizMyFlashcards.mock';
import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import ReviewMyFlashcards from '@interface/pages/ReviewMyFlashcards';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn<(to: string) => void>();

vi.mock('@application/useCases/useQuizMyFlashcards', async () => {
  const actual = await vi.importActual<typeof QuizMyFlashcardsUseCase>(
    '@application/useCases/useQuizMyFlashcards',
  );
  return {
    ...actual,
    useQuizMyFlashcards: mockUseQuizMyFlashcards,
  };
});

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@interface/pages/ReviewMyFlashcards/ReviewMyFlashcardsV1', () => ({
  ReviewMyFlashcardsV1: () => <div data-testid="legacy-my-flashcards" />,
}));

vi.mock('@interface/components/Loading', () => ({
  Loading: ({ message }: { message: string }) => <div>{message}</div>,
}));

vi.mock('@interface/components/Quizzing/TextQuiz', () => ({
  ReviewMyFlashcardsTextQuiz: () => <div data-testid="text-quiz" />,
  SrsTextQuiz: () => <div data-testid="srs-text-quiz" />,
}));

vi.mock(
  '@interface/components/Quizzing/AudioQuiz/ReviewMyFlashcardsAudioQuiz',
  () => ({
    ReviewMyFlashcardsAudioQuiz: () => <div data-testid="audio-quiz" />,
  }),
);

function renderPage(): void {
  render(
    <MemoryRouter>
      <ReviewMyFlashcards />
    </MemoryRouter>,
  );
}

function renderV2(): void {
  overrideMockUseStudentUiVersion({ version: 'v2' });
  renderPage();
}

describe('review my flashcards page', () => {
  afterEach(() => {
    resetMockUseQuizMyFlashcards();
    resetMockUseStudentUiVersion();
    mockNavigate.mockReset();
    cleanup();
  });

  it('falls back to the legacy setup menu on v1', () => {
    renderPage();

    expect(screen.getByTestId('legacy-my-flashcards')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Set up your quiz' }),
    ).toBeNull();
  });

  it('renders the redesigned setup on v2', () => {
    renderV2();

    expect(
      screen.getAllByRole('heading', { name: 'Set up your quiz' }).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByTestId('legacy-my-flashcards')).toBeNull();
  });

  it('shows a loading message while flashcard data loads', () => {
    overrideMockUseQuizMyFlashcards({ isLoading: true });

    renderV2();

    expect(screen.getByText('Loading Flashcard Data...')).toBeInTheDocument();
  });

  it('surfaces a load failure', () => {
    overrideMockUseQuizMyFlashcards({ error: new Error('no flashcards') });

    renderV2();

    expect(screen.getByRole('alert')).toHaveTextContent('Error: no flashcards');
  });

  it('shows the empty state when there is nothing to quiz', () => {
    overrideMockUseQuizMyFlashcards({ noFlashcards: true });

    renderV2();

    expect(screen.getByText(/no flashcards found/i)).toBeInTheDocument();
  });

  it('hands off to the text quiz once readied', () => {
    overrideMockUseQuizMyFlashcards({ quizReady: true, isAudioQuiz: false });

    renderV2();

    expect(screen.getByTestId('text-quiz')).toBeInTheDocument();
  });

  it('hands off to the SRS quiz when SRS is on', () => {
    overrideMockUseQuizMyFlashcards({
      quizReady: true,
      isAudioQuiz: false,
      textQuizSetup: { ...defaultMockTextQuizSetup, srsQuiz: true },
    });

    renderV2();

    expect(screen.getByTestId('srs-text-quiz')).toBeInTheDocument();
  });

  it('hands off to the audio quiz when the type is audio', () => {
    overrideMockUseQuizMyFlashcards({ quizReady: true, isAudioQuiz: true });

    renderV2();

    expect(screen.getByTestId('audio-quiz')).toBeInTheDocument();
  });

  it('readies the quiz from the CTA', async () => {
    const readyQuiz = vi.fn();
    overrideMockUseQuizMyFlashcards({ readyQuiz });

    renderV2();

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Quiz 20 flashcards' })[0],
    );

    expect(readyQuiz).toHaveBeenCalled();
  });

  it('the back affordance leaves for home', async () => {
    renderV2();

    await userEvent.click(
      screen.getAllByRole('button', { name: /back to home/i })[0],
    );

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
