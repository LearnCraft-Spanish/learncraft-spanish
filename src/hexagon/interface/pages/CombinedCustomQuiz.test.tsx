import { CombinedCustomQuizType } from '@application/useCases/useCombinedCustomQuiz';
import {
  mockUseCombinedCustomQuiz,
  overrideMockUseCombinedCustomQuiz,
  resetMockUseCombinedCustomQuiz,
} from '@application/useCases/useCombinedCustomQuiz.mock';
import CombinedCustomQuiz from '@interface/pages/CombinedCustomQuiz';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/useCombinedCustomQuiz', async () => {
  const actual = await vi.importActual(
    '@application/useCases/useCombinedCustomQuiz',
  );
  return {
    ...actual,
    useCombinedCustomQuiz: () => mockUseCombinedCustomQuiz,
  };
});

vi.mock('@interface/components/Filters', () => ({
  FilterPanel: () => <div data-testid="filter-panel" />,
}));

vi.mock('@interface/components/general/Buttons', () => ({
  MenuButton: () => <button type="button">Back to Home</button>,
}));

vi.mock('@interface/components/Loading', () => ({
  Loading: ({ message }: { message: string }) => <div>{message}</div>,
}));

vi.mock('@interface/components/Quizzing/AudioQuiz/RegularAudioQuiz', () => ({
  RegularAudioQuiz: () => <div>Regular Audio Quiz</div>,
}));

vi.mock('@interface/components/Quizzing/general', () => ({
  MyTextQuizMenu: () => <div>Text Quiz Menu</div>,
  AudioQuizMenu: () => <div>Audio Quiz Menu</div>,
}));

vi.mock('@interface/components/Quizzing/TextQuiz', () => ({
  RegularTextQuiz: () => <div>Regular Text Quiz</div>,
}));

describe('combinedCustomQuizPage', () => {
  beforeEach(() => {
    resetMockUseCombinedCustomQuiz();
  });

  it('renders an error message when the quiz data fails to load', () => {
    overrideMockUseCombinedCustomQuiz({
      errorExamples: new Error('Network failed'),
    });

    render(<CombinedCustomQuiz />);

    expect(screen.getByText('Error: Network failed')).toBeInTheDocument();
  });

  it('renders initial loading state while prerequisites are loading', () => {
    overrideMockUseCombinedCustomQuiz({
      isInitialLoading: true,
    });

    render(<CombinedCustomQuiz />);

    expect(screen.getByText('Loading quiz setup...')).toBeInTheDocument();
  });

  it('renders the setup state and allows switching quiz type to audio', async () => {
    const user = userEvent.setup();

    render(<CombinedCustomQuiz />);

    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    expect(screen.getByText('Text Quiz Menu')).toBeInTheDocument();
    expect(screen.getByText('Custom Quiz')).toBeInTheDocument();

    await user.click(screen.getByText('Audio'));

    expect(mockUseCombinedCustomQuiz.setQuizType).toHaveBeenCalledWith(
      CombinedCustomQuizType.Audio,
    );
  });

  it('supports mobile stepper navigation and starts quiz at final step', async () => {
    const user = userEvent.setup();
    const { container } = render(<CombinedCustomQuiz />);

    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Next/i }));
    await user.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByText(/Step 3 of 3/i)).toBeInTheDocument();

    const mobileStartButton = container.querySelector(
      '.mobileStartQuizButton',
    ) as HTMLButtonElement;
    await user.click(mobileStartButton);

    expect(mockUseCombinedCustomQuiz.readyQuiz).toHaveBeenCalledTimes(1);
  });

  it('renders the active quiz component once quiz is ready', () => {
    overrideMockUseCombinedCustomQuiz({
      quizReady: true,
      quizType: CombinedCustomQuizType.Audio,
    });

    render(<CombinedCustomQuiz />);

    expect(screen.getByText('Regular Audio Quiz')).toBeInTheDocument();
    expect(screen.queryByText('Regular Text Quiz')).not.toBeInTheDocument();
  });
});
