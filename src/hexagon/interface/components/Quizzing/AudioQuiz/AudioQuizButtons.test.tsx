import { render, screen } from '@testing-library/react';
import { AudioQuizStep, AudioQuizType } from 'src/hexagon/domain/audioQuizzing';

import { describe, expect, it, vi } from 'vitest';
import AudioQuizButtons from './AudioQuizButtons';

const incrementCurrentStep = vi.fn();
const decrementExample = vi.fn();
const incrementExample = vi.fn();
const unReadyQuiz = vi.fn();

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
        closeQuiz={unReadyQuiz}
        isFirstExample={true}
        isLastExample={false}
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
        closeQuiz={unReadyQuiz}
        isFirstExample={true}
        isLastExample={false}
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
        closeQuiz={unReadyQuiz}
        isFirstExample={true}
        isLastExample={false}
      />,
    );
    expect(screen.getByText('Skip to Guess')).toBeTruthy();
    expect(screen.getByText('Replay Spanish')).toBeTruthy();
  });
});
