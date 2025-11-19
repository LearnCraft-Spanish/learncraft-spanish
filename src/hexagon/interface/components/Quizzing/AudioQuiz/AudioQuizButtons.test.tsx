import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';
import AudioQuizButtons from '@interface/components/Quizzing/AudioQuiz/AudioQuizButtons';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const incrementCurrentStep = vi.fn();
const decrementExample = vi.fn();
const incrementExample = vi.fn();
const unReadyQuiz = vi.fn();
const restartCurrentStep = vi.fn();

describe('initial render', () => {
  it('renders without crashing', () => {
    render(
      <AudioQuizButtons
        audioQuizType={AudioQuizType.Speaking}
        currentStep={AudioQuizStep.Question}
        nextStep={incrementCurrentStep}
        autoplay={false}
        nextExample={incrementExample}
        previousExample={decrementExample}
        goToQuestion={() => {}}
        goToHint={() => {}}
        restartCurrentStep={restartCurrentStep}
        closeQuiz={unReadyQuiz}
        isFirstExample={true}
        isLastExample={false}
        nextExampleReady={true}
        previousExampleReady={true}
      />,
    );
    expect(screen.getByText('Previous')).toBeTruthy();
    expect(screen.getByText('Next')).toBeTruthy();
    expect(screen.getByText('Back')).toBeTruthy();
  });
});

describe('audioOrComprehension is audio', () => {
  it('displays correct text when currentStep is question & autoplay is true', () => {
    render(
      <AudioQuizButtons
        audioQuizType={AudioQuizType.Speaking}
        currentStep={AudioQuizStep.Question}
        nextStep={incrementCurrentStep}
        autoplay
        nextExample={incrementExample}
        previousExample={decrementExample}
        goToQuestion={() => {}}
        goToHint={() => {}}
        restartCurrentStep={restartCurrentStep}
        closeQuiz={unReadyQuiz}
        isFirstExample={true}
        isLastExample={false}
        nextExampleReady={true}
        previousExampleReady={true}
      />,
    );
    expect(screen.getByText('Skip to Guess')).toBeTruthy();
    expect(screen.getByText('Replay English')).toBeTruthy();
  });
});
describe('audioOrComprehension is comprehension', () => {
  it('displays correct text when currentStep is question & autoplay is true', () => {
    render(
      <AudioQuizButtons
        audioQuizType={AudioQuizType.Listening}
        currentStep={AudioQuizStep.Question}
        nextStep={incrementCurrentStep}
        autoplay
        nextExample={incrementExample}
        previousExample={decrementExample}
        goToQuestion={() => {}}
        goToHint={() => {}}
        restartCurrentStep={restartCurrentStep}
        closeQuiz={unReadyQuiz}
        isFirstExample={true}
        isLastExample={false}
        nextExampleReady={true}
        previousExampleReady={true}
      />,
    );
    expect(screen.getByText('Skip to Guess')).toBeTruthy();
    expect(screen.getByText('Replay Spanish')).toBeTruthy();
  });
});
