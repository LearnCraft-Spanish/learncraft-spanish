import type * as CustomQuizUseCase from '@application/useCases/useCustomQuizV2';
import {
  mockUseCustomQuizV2,
  overrideMockUseCustomQuizV2,
  resetMockUseCustomQuizV2,
} from '@application/useCases/useCustomQuizV2/useCustomQuizV2.mock';
import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import CustomQuiz from '@interface/pages/CustomQuiz';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn<(to: string) => void>();

vi.mock('@application/useCases/useCustomQuizV2', async () => {
  const actual = await vi.importActual<typeof CustomQuizUseCase>(
    '@application/useCases/useCustomQuizV2',
  );
  return {
    ...actual,
    default: mockUseCustomQuizV2,
    useCustomQuizV2: mockUseCustomQuizV2,
  };
});

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@interface/pages/CombinedCustomQuiz', () => ({
  default: () => <div data-testid="legacy-custom-quiz" />,
}));

vi.mock('@interface/components/Loading', () => ({
  Loading: ({ message }: { message: string }) => <div>{message}</div>,
}));

vi.mock('@interface/components/Quizzing/TextQuiz', () => ({
  RegularTextQuiz: () => <div data-testid="text-quiz" />,
}));

vi.mock('@interface/components/Quizzing/AudioQuiz/RegularAudioQuiz', () => ({
  RegularAudioQuiz: () => <div data-testid="audio-quiz" />,
}));

function renderPage(): void {
  render(
    <MemoryRouter>
      <CustomQuiz />
    </MemoryRouter>,
  );
}

function renderV2(): void {
  overrideMockUseStudentUiVersion({ version: 'v2' });
  renderPage();
}

describe('custom quiz page', () => {
  afterEach(() => {
    resetMockUseCustomQuizV2();
    resetMockUseStudentUiVersion();
    mockNavigate.mockReset();
    cleanup();
  });

  it('falls back to the legacy setup menu on v1', () => {
    renderPage();

    expect(screen.getByTestId('legacy-custom-quiz')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Set up your quiz' }),
    ).toBeNull();
  });

  it('renders the redesigned setup on v2', () => {
    renderV2();

    expect(
      screen.getAllByRole('heading', { name: 'Set up your quiz' }).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByTestId('legacy-custom-quiz')).toBeNull();
  });

  it('shows a loading message while the first load runs', () => {
    overrideMockUseCustomQuizV2({ isInitialLoading: true });

    renderV2();

    expect(screen.getByText('Loading quiz setup...')).toBeInTheDocument();
  });

  it('surfaces a load failure', () => {
    overrideMockUseCustomQuizV2({ error: new Error('no examples') });

    renderV2();

    expect(screen.getByRole('alert')).toHaveTextContent('Error: no examples');
  });

  it('hands off to the text quiz once readied', () => {
    overrideMockUseCustomQuizV2({ quizReady: true, isAudioQuiz: false });

    renderV2();

    expect(screen.getByTestId('text-quiz')).toBeInTheDocument();
  });

  it('hands off to the audio quiz when the type is audio', () => {
    overrideMockUseCustomQuizV2({ quizReady: true, isAudioQuiz: true });

    renderV2();

    expect(screen.getByTestId('audio-quiz')).toBeInTheDocument();
  });

  it('readies the quiz from the CTA', async () => {
    const readyQuiz = vi.fn();
    overrideMockUseCustomQuizV2({ readyQuiz });

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
