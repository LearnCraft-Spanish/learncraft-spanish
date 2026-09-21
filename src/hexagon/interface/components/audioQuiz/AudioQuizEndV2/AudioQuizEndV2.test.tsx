import type { ComponentProps } from 'react';
import { AudioQuizEndV2 } from '@interface/components/audioQuiz/AudioQuizEndV2/AudioQuizEndV2';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

function renderEnd(props: ComponentProps<typeof AudioQuizEndV2>): void {
  render(
    <MemoryRouter>
      <AudioQuizEndV2 {...props} />
    </MemoryRouter>,
  );
}

describe('audioQuizEndV2 — autoplay on', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('shows the complete heading, congratulations, and countdown copy', () => {
    renderEnd({
      speakingOrListening: 'speaking',
      isAutoplay: true,
      quizLength: 20,
      restartQuiz: vi.fn(),
      returnToQuizSetup: vi.fn(),
      countdown: 14,
    });

    expect(screen.getByText('Speaking Quiz Complete!')).toBeTruthy();
    expect(
      screen.getByText("Congratulations! You've completed the quiz."),
    ).toBeTruthy();
    expect(
      screen.getByText(/The quiz will automatically restart in/),
    ).toBeTruthy();
    expect(screen.getByText('14')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Restart Quiz Now' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Return to Quiz Setup' }),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to Home' })).toBeTruthy();
  });

  it('shows Listening Quiz Complete! for listening quizzes', () => {
    renderEnd({
      speakingOrListening: 'listening',
      isAutoplay: true,
      quizLength: 20,
      restartQuiz: vi.fn(),
      returnToQuizSetup: vi.fn(),
      countdown: 20,
    });

    expect(screen.getByText('Listening Quiz Complete!')).toBeTruthy();
  });

  it('shows the navy "Skipped this run" card only when skippedCount is set', () => {
    const { rerender } = render(
      <MemoryRouter>
        <AudioQuizEndV2
          speakingOrListening="speaking"
          isAutoplay
          quizLength={20}
          restartQuiz={vi.fn()}
          returnToQuizSetup={vi.fn()}
          countdown={14}
        />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Skipped this run')).toBeNull();

    rerender(
      <MemoryRouter>
        <AudioQuizEndV2
          speakingOrListening="speaking"
          isAutoplay
          quizLength={20}
          restartQuiz={vi.fn()}
          returnToQuizSetup={vi.fn()}
          countdown={14}
          skippedCount={1}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Skipped this run')).toBeTruthy();
    expect(
      screen.getByText(
        '1 card was dropped because its audio would not load. It stays in your deck.',
      ),
    ).toBeTruthy();
  });

  it('pluralizes the skipped-card copy for more than one card', () => {
    renderEnd({
      speakingOrListening: 'speaking',
      isAutoplay: true,
      quizLength: 20,
      restartQuiz: vi.fn(),
      returnToQuizSetup: vi.fn(),
      countdown: 14,
      skippedCount: 3,
    });

    expect(
      screen.getByText(
        '3 cards were dropped because their audio would not load. They stay in your deck.',
      ),
    ).toBeTruthy();
  });

  it('calls restartQuiz when "Restart Quiz Now" is clicked', async () => {
    const restartQuiz = vi.fn();
    renderEnd({
      speakingOrListening: 'speaking',
      isAutoplay: true,
      quizLength: 20,
      restartQuiz,
      returnToQuizSetup: vi.fn(),
      countdown: 14,
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Restart Quiz Now' }),
    );

    expect(restartQuiz).toHaveBeenCalledOnce();
  });

  it('calls returnToQuizSetup when "Return to Quiz Setup" is clicked', async () => {
    const returnToQuizSetup = vi.fn();
    renderEnd({
      speakingOrListening: 'speaking',
      isAutoplay: true,
      quizLength: 20,
      restartQuiz: vi.fn(),
      returnToQuizSetup,
      countdown: 14,
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Return to Quiz Setup' }),
    );

    expect(returnToQuizSetup).toHaveBeenCalledOnce();
  });

  it('auto-restarts once the uncontrolled countdown reaches zero', async () => {
    vi.useFakeTimers();
    const restartQuiz = vi.fn();
    renderEnd({
      speakingOrListening: 'speaking',
      isAutoplay: true,
      quizLength: 20,
      restartQuiz,
      returnToQuizSetup: vi.fn(),
      countdownSeconds: 2,
    });

    expect(restartQuiz).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(2000);

    expect(restartQuiz).toHaveBeenCalledOnce();
  });
});

describe('audioQuizEndV2 — autoplay off', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('shows the complete heading with no countdown and no restart button', () => {
    renderEnd({
      speakingOrListening: 'listening',
      isAutoplay: false,
      quizLength: 20,
      restartQuiz: vi.fn(),
      returnToQuizSetup: vi.fn(),
    });

    expect(screen.getByText('Listening Quiz Complete!')).toBeTruthy();
    expect(
      screen.getByText("Congratulations! You've completed the quiz."),
    ).toBeTruthy();
    expect(
      screen.queryByText(/The quiz will automatically restart in/),
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Restart Quiz Now' }),
    ).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Return to Quiz Setup' }),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to Home' })).toBeTruthy();
  });

  it('shows "Added while quizzing" only when addedCount is set', () => {
    const { rerender } = render(
      <MemoryRouter>
        <AudioQuizEndV2
          speakingOrListening="listening"
          isAutoplay={false}
          quizLength={20}
          restartQuiz={vi.fn()}
          returnToQuizSetup={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Added while quizzing')).toBeNull();

    rerender(
      <MemoryRouter>
        <AudioQuizEndV2
          speakingOrListening="listening"
          isAutoplay={false}
          quizLength={20}
          restartQuiz={vi.fn()}
          returnToQuizSetup={vi.fn()}
          addedCount={3}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Added while quizzing')).toBeTruthy();
    expect(screen.getByText('3 flashcards')).toBeTruthy();
  });

  it('singularizes the added-card count', () => {
    renderEnd({
      speakingOrListening: 'listening',
      isAutoplay: false,
      quizLength: 20,
      restartQuiz: vi.fn(),
      returnToQuizSetup: vi.fn(),
      addedCount: 1,
    });

    expect(screen.getByText('1 flashcard')).toBeTruthy();
  });

  it('calls returnToQuizSetup when "Return to Quiz Setup" is clicked', async () => {
    const returnToQuizSetup = vi.fn();
    renderEnd({
      speakingOrListening: 'listening',
      isAutoplay: false,
      quizLength: 20,
      restartQuiz: vi.fn(),
      returnToQuizSetup,
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Return to Quiz Setup' }),
    );

    expect(returnToQuizSetup).toHaveBeenCalledOnce();
  });

  it('never auto-restarts while autoplay is off', async () => {
    vi.useFakeTimers();
    const restartQuiz = vi.fn();
    renderEnd({
      speakingOrListening: 'listening',
      isAutoplay: false,
      quizLength: 20,
      restartQuiz,
      returnToQuizSetup: vi.fn(),
      countdownSeconds: 2,
    });

    await vi.advanceTimersByTimeAsync(5000);

    expect(restartQuiz).not.toHaveBeenCalled();
  });
});
