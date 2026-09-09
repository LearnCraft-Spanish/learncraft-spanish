import { AudioQuizEndV2 } from '@interface/components/audioQuiz/AudioQuizEndV2/AudioQuizEndV2';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('audioQuizEndV2 — autoplay on', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('shows the speaking label, the drilled count, and the countdown', () => {
    render(
      <AudioQuizEndV2
        speakingOrListening="speaking"
        isAutoplay
        quizLength={20}
        restartQuiz={vi.fn()}
        returnToQuizSetup={vi.fn()}
        countdown={14}
      />,
    );

    expect(screen.getByText('Speaking quiz')).toBeTruthy();
    expect(screen.getByText('20 cards drilled.')).toBeTruthy();
    expect(screen.getByText('Restarting in 14s')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Restart now' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Return to quiz setup' }),
    ).toBeTruthy();
  });

  it('folds contextLine into the body copy when provided', () => {
    render(
      <AudioQuizEndV2
        speakingOrListening="listening"
        isAutoplay
        quizLength={20}
        restartQuiz={vi.fn()}
        returnToQuizSetup={vi.fn()}
        countdown={20}
        contextLine="lessons 1–111"
      />,
    );

    expect(screen.getByText(/You worked through lessons 1–111\./)).toBeTruthy();
  });

  it('shows the navy "Skipped this run" card only when skippedCount is set', () => {
    const { rerender } = render(
      <AudioQuizEndV2
        speakingOrListening="speaking"
        isAutoplay
        quizLength={20}
        restartQuiz={vi.fn()}
        returnToQuizSetup={vi.fn()}
        countdown={14}
      />,
    );

    expect(screen.queryByText('Skipped this run')).toBeNull();

    rerender(
      <AudioQuizEndV2
        speakingOrListening="speaking"
        isAutoplay
        quizLength={20}
        restartQuiz={vi.fn()}
        returnToQuizSetup={vi.fn()}
        countdown={14}
        skippedCount={1}
      />,
    );

    expect(screen.getByText('Skipped this run')).toBeTruthy();
    expect(
      screen.getByText(
        '1 card was dropped because its audio would not load. It stays in your deck.',
      ),
    ).toBeTruthy();
  });

  it('pluralizes the skipped-card copy for more than one card', () => {
    render(
      <AudioQuizEndV2
        speakingOrListening="speaking"
        isAutoplay
        quizLength={20}
        restartQuiz={vi.fn()}
        returnToQuizSetup={vi.fn()}
        countdown={14}
        skippedCount={3}
      />,
    );

    expect(
      screen.getByText(
        '3 cards were dropped because their audio would not load. They stay in your deck.',
      ),
    ).toBeTruthy();
  });

  it('calls restartQuiz when "Restart now" is clicked', async () => {
    const restartQuiz = vi.fn();
    render(
      <AudioQuizEndV2
        speakingOrListening="speaking"
        isAutoplay
        quizLength={20}
        restartQuiz={restartQuiz}
        returnToQuizSetup={vi.fn()}
        countdown={14}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Restart now' }));

    expect(restartQuiz).toHaveBeenCalledOnce();
  });

  it('calls returnToQuizSetup when "Return to quiz setup" is clicked', async () => {
    const returnToQuizSetup = vi.fn();
    render(
      <AudioQuizEndV2
        speakingOrListening="speaking"
        isAutoplay
        quizLength={20}
        restartQuiz={vi.fn()}
        returnToQuizSetup={returnToQuizSetup}
        countdown={14}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Return to quiz setup' }),
    );

    expect(returnToQuizSetup).toHaveBeenCalledOnce();
  });

  it('auto-restarts once the uncontrolled countdown reaches zero', async () => {
    vi.useFakeTimers();
    const restartQuiz = vi.fn();
    render(
      <AudioQuizEndV2
        speakingOrListening="speaking"
        isAutoplay
        quizLength={20}
        restartQuiz={restartQuiz}
        returnToQuizSetup={vi.fn()}
        countdownSeconds={2}
      />,
    );

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

  it('shows the listening label, the drilled count, and no countdown', () => {
    render(
      <AudioQuizEndV2
        speakingOrListening="listening"
        isAutoplay={false}
        quizLength={20}
        restartQuiz={vi.fn()}
        returnToQuizSetup={vi.fn()}
      />,
    );

    expect(screen.getByText('Listening quiz')).toBeTruthy();
    expect(screen.getByText('20 cards drilled.')).toBeTruthy();
    expect(screen.queryByText(/Restarting in/)).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Run this deck again' }),
    ).toBeTruthy();
  });

  it('shows "Added while quizzing" only when addedCount is set', () => {
    const { rerender } = render(
      <AudioQuizEndV2
        speakingOrListening="listening"
        isAutoplay={false}
        quizLength={20}
        restartQuiz={vi.fn()}
        returnToQuizSetup={vi.fn()}
      />,
    );

    expect(screen.queryByText('Added while quizzing')).toBeNull();

    rerender(
      <AudioQuizEndV2
        speakingOrListening="listening"
        isAutoplay={false}
        quizLength={20}
        restartQuiz={vi.fn()}
        returnToQuizSetup={vi.fn()}
        addedCount={3}
      />,
    );

    expect(screen.getByText('Added while quizzing')).toBeTruthy();
    expect(screen.getByText('3 flashcards')).toBeTruthy();
  });

  it('singularizes the added-card count', () => {
    render(
      <AudioQuizEndV2
        speakingOrListening="listening"
        isAutoplay={false}
        quizLength={20}
        restartQuiz={vi.fn()}
        returnToQuizSetup={vi.fn()}
        addedCount={1}
      />,
    );

    expect(screen.getByText('1 flashcard')).toBeTruthy();
  });

  it('calls restartQuiz when "Run this deck again" is clicked', async () => {
    const restartQuiz = vi.fn();
    render(
      <AudioQuizEndV2
        speakingOrListening="listening"
        isAutoplay={false}
        quizLength={20}
        restartQuiz={restartQuiz}
        returnToQuizSetup={vi.fn()}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Run this deck again' }),
    );

    expect(restartQuiz).toHaveBeenCalledOnce();
  });

  it('never auto-restarts while autoplay is off', async () => {
    vi.useFakeTimers();
    const restartQuiz = vi.fn();
    render(
      <AudioQuizEndV2
        speakingOrListening="listening"
        isAutoplay={false}
        quizLength={20}
        restartQuiz={restartQuiz}
        returnToQuizSetup={vi.fn()}
        countdownSeconds={2}
      />,
    );

    await vi.advanceTimersByTimeAsync(5000);

    expect(restartQuiz).not.toHaveBeenCalled();
  });
});
