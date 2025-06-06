import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import AudioQuizButtons from './AudioQuizButtons';

const incrementCurrentStep = vi.fn();
const customIncrementCurrentStep = vi.fn();
const decrementExample = vi.fn();
const incrementExample = vi.fn();
const unReadyQuiz = vi.fn();

/*
  It is my understanding that further testing of this component is not
  necessary as it is a simple component that renders buttons based on the props
  passed to it.
  It would be testing implementation instead of behavior.
*/
describe('initial render', () => {
  it('renders without crashing', () => {
    render(
      <AudioQuizButtons
        audioOrComprehension="audio"
        currentStep="question"
        incrementCurrentStep={incrementCurrentStep}
        autoplay={false}
        customIncrementCurrentStep={customIncrementCurrentStep}
        decrementExample={decrementExample}
        incrementExample={incrementExample}
        unReadyQuiz={unReadyQuiz}
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
        audioOrComprehension="audio"
        currentStep="question"
        incrementCurrentStep={incrementCurrentStep}
        autoplay
        customIncrementCurrentStep={customIncrementCurrentStep}
        decrementExample={decrementExample}
        incrementExample={incrementExample}
        unReadyQuiz={unReadyQuiz}
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
        audioOrComprehension="comprehension"
        currentStep="question"
        incrementCurrentStep={incrementCurrentStep}
        autoplay
        customIncrementCurrentStep={customIncrementCurrentStep}
        decrementExample={decrementExample}
        incrementExample={incrementExample}
        unReadyQuiz={unReadyQuiz}
      />,
    );
    expect(screen.getByText('Skip to Guess')).toBeTruthy();
    expect(screen.getByText('Replay Spanish')).toBeTruthy();
  });
});
