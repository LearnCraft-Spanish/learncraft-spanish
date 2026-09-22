import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';
import AudioQuizButtons from '@interface/components/Quizzing/AudioQuiz/AudioQuizButtons';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const incrementCurrentStep = vi.fn();
const decrementExample = vi.fn();
const incrementExample = vi.fn();
const unReadyQuiz = vi.fn();
const replay = vi.fn();

function renderButtons({
  audioQuizType,
  currentStep,
  autoplay = true,
}: {
  audioQuizType: AudioQuizType;
  currentStep: AudioQuizStep;
  autoplay?: boolean;
}): void {
  render(
    <AudioQuizButtons
      audioQuizType={audioQuizType}
      currentStep={currentStep}
      nextStep={incrementCurrentStep}
      autoplay={autoplay}
      nextExample={incrementExample}
      previousExample={decrementExample}
      replay={replay}
      closeQuiz={unReadyQuiz}
      isFirstExample
      isLastExample={false}
      nextExampleReady
      previousExampleReady
    />,
  );
}

describe('initial render', () => {
  it('renders without crashing', () => {
    renderButtons({
      audioQuizType: AudioQuizType.Speaking,
      currentStep: AudioQuizStep.Question,
      autoplay: false,
    });
    expect(screen.getByText('Previous')).toBeTruthy();
    expect(screen.getByText('Next')).toBeTruthy();
    expect(screen.getByText('Back')).toBeTruthy();
  });
});

describe('audioOrComprehension is audio', () => {
  it('displays correct text when currentStep is question & autoplay is true', () => {
    renderButtons({
      audioQuizType: AudioQuizType.Speaking,
      currentStep: AudioQuizStep.Question,
    });
    expect(screen.getByText('Skip to Guess')).toBeTruthy();
    expect(screen.getByText('Replay English')).toBeTruthy();
  });

  it('labels the speaking answer replay as Replay Spanish', () => {
    renderButtons({
      audioQuizType: AudioQuizType.Speaking,
      currentStep: AudioQuizStep.Answer,
    });
    expect(screen.getByText('Replay Spanish')).toBeTruthy();
  });
});

describe('audioOrComprehension is comprehension', () => {
  it('displays correct text when currentStep is question & autoplay is true', () => {
    renderButtons({
      audioQuizType: AudioQuizType.Listening,
      currentStep: AudioQuizStep.Question,
    });
    expect(screen.getByText('Skip to Guess')).toBeTruthy();
    expect(screen.getByText('Replay Spanish')).toBeTruthy();
  });
});

describe('replay button', () => {
  it('calls replay when the replay button is clicked', async () => {
    replay.mockClear();
    renderButtons({
      audioQuizType: AudioQuizType.Speaking,
      currentStep: AudioQuizStep.Guess,
    });

    await userEvent.click(screen.getByText('Replay English'));

    expect(replay).toHaveBeenCalledOnce();
  });
});
