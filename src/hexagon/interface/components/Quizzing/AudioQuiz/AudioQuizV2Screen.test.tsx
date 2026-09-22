import { createMockAudioQuizReturn } from '@application/units/AudioQuiz/useAudioQuiz.mock';
import { AudioQuizV2Screen } from '@interface/components/Quizzing/AudioQuiz/AudioQuizV2Screen';
import { setMobileStackOverride } from '@interface/hooks/useMobileStackChrome';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('audioQuizV2Screen', () => {
  afterEach(() => {
    cleanup();
    setMobileStackOverride(null);
  });

  it('shows the loading screen before the first card is ready', () => {
    render(
      <MockAllProviders>
        <AudioQuizV2Screen
          quizCategory="custom"
          audioQuizReturn={createMockAudioQuizReturn({
            currentExampleNumber: 0,
          })}
        />
      </MockAllProviders>,
    );

    expect(screen.getByText('Setting up Quiz...')).toBeInTheDocument();
  });

  it('shows the loading screen when the current step has no text', () => {
    render(
      <MockAllProviders>
        <AudioQuizV2Screen
          quizCategory="custom"
          audioQuizReturn={createMockAudioQuizReturn({
            currentExampleNumber: 1,
            currentStepValue: {
              ...createMockAudioQuizReturn().currentStepValue!,
              displayText: '',
            },
          })}
        />
      </MockAllProviders>,
    );

    expect(screen.getByText('Setting up Quiz...')).toBeInTheDocument();
  });

  it('shows the complete screen when the quiz is finished', () => {
    render(
      <MockAllProviders>
        <AudioQuizV2Screen
          quizCategory="custom"
          audioQuizReturn={createMockAudioQuizReturn({
            isQuizComplete: true,
            quizLength: 3,
          })}
        />
      </MockAllProviders>,
    );

    expect(screen.getByText('Speaking Quiz Complete!')).toBeInTheDocument();
  });

  it('keeps the card up when play or pause is rejected', async () => {
    const user = userEvent.setup();
    const play = vi.fn(async () => {
      throw new Error('autoplay blocked');
    });
    const pause = vi.fn(async () => {
      throw new Error('pause failed');
    });

    const { rerender } = render(
      <MockAllProviders>
        <AudioQuizV2Screen
          quizCategory="myFlashcards"
          audioQuizReturn={createMockAudioQuizReturn({
            currentExampleNumber: 1,
            quizLength: 3,
            isPlaying: false,
            play,
          })}
        />
      </MockAllProviders>,
    );

    await user.click(screen.getByRole('button', { name: 'Play audio' }));
    expect(play).toHaveBeenCalledOnce();
    expect(screen.getByText('My Flashcards Quiz')).toBeInTheDocument();

    rerender(
      <MockAllProviders>
        <AudioQuizV2Screen
          quizCategory="myFlashcards"
          audioQuizReturn={createMockAudioQuizReturn({
            currentExampleNumber: 1,
            quizLength: 3,
            isPlaying: true,
            pause,
          })}
        />
      </MockAllProviders>,
    );

    await user.click(screen.getByRole('button', { name: 'Pause audio' }));
    expect(pause).toHaveBeenCalledOnce();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });
});
