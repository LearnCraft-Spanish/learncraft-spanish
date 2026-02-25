import { AudioQuizStep } from '@domain/audioQuizzing';
import AudioFlashcardComponent from '@interface/components/Quizzing/AudioQuiz/AudioFlashcard';
import { cleanup, render, screen } from '@testing-library/react';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const incrementCurrentStep = vi.fn(() => {});
const pausePlayback = vi.fn(() => {});
const resumePlayback = vi.fn(() => {});

const addFlashcard = vi.fn(() => {});
const removeFlashcard = vi.fn(() => {});

/*
  currentExample: Flashcard | undefined;
  incrementExample: () => void;
  isStudent: boolean;
  currentStep: string;
*/
const defaultProps = {
  currentExampleText: 'currentExampleText',
  currentStep: AudioQuizStep.Question,
  nextStep: incrementCurrentStep,
  autoplay: true,
  progressStatus: 0.5,
  pause: pausePlayback,
  play: resumePlayback,
  isPlaying: true,
  vocabComplete: false,
  vocabulary: [] as never[],
  getHelpIsOpen: false,
  setGetHelpIsOpen: () => {},
  isBuffering: false,
  bufferProgress: 0,
  addPendingRemoveProps: {
    addFlashcard,
    removeFlashcard,
    isAdding: false,
    isRemoving: false,
    isCollected: false,
    isCustom: false,
  },
};

function AudioFlashcardAutoplayOn() {
  return (
    <MockAllProviders>
      <AudioFlashcardComponent {...defaultProps} />
    </MockAllProviders>
  );
}
function AudioFlashcardAutoplayOff() {
  return (
    <MockAllProviders>
      <AudioFlashcardComponent {...defaultProps} autoplay={false} />
    </MockAllProviders>
  );
}

function AudioFlashcardPlaying() {
  return (
    <MockAllProviders>
      <AudioFlashcardComponent {...defaultProps} isPlaying />
    </MockAllProviders>
  );
}
function AudioFlashcardPaused() {
  return (
    <MockAllProviders>
      <AudioFlashcardComponent {...defaultProps} isPlaying={false} />
    </MockAllProviders>
  );
}

describe('component AudioFlashcard', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });
  it('should render the component', () => {
    render(<AudioFlashcardAutoplayOn />);
    expect(screen.getByText('currentExampleText')).toBeTruthy();
  });

  describe('autoplay is off', () => {
    it('on click, calls incrementCurrentStep', () => {
      render(<AudioFlashcardAutoplayOff />);
      screen.getByText('currentExampleText').click();
      expect(incrementCurrentStep).toHaveBeenCalledOnce();
    });
  });

  describe('autoplay is on', () => {
    it('on click does NOT call incrementCurrentStep', () => {
      render(<AudioFlashcardAutoplayOn />);
      screen.getByText('currentExampleText').click();
      expect(incrementCurrentStep).not.toHaveBeenCalled();
    });

    describe('toggling Play/Pause', () => {
      it('renders correctly', () => {
        render(<AudioFlashcardAutoplayOn />);
        expect(screen.getAllByLabelText('Play/Pause')).toBeTruthy();
      });
      it('isPlaying is true: on click, calls pausePlayback', () => {
        render(<AudioFlashcardPlaying />);
        screen.getAllByLabelText('Play/Pause')[0].click();
        expect(pausePlayback).toHaveBeenCalledOnce();
      });
      it('isPlaying is false: on click, calls resumePlayback', () => {
        render(<AudioFlashcardPaused />);
        screen.getAllByLabelText('Play/Pause')[0].click();
        expect(resumePlayback).toHaveBeenCalledOnce();
      });
    });
  });

  describe('buffer progress bar', () => {
    it('renders when isBuffering is true', () => {
      render(
        <MockAllProviders>
          <AudioFlashcardComponent
            {...defaultProps}
            isBuffering
            bufferProgress={0.5}
          />
        </MockAllProviders>,
      );
      expect(screen.getByTestId('buffer-progress-bar')).toBeTruthy();
    });

    it('does not render when isBuffering is false', () => {
      render(
        <MockAllProviders>
          <AudioFlashcardComponent
            {...defaultProps}
            isBuffering={false}
            bufferProgress={0}
          />
        </MockAllProviders>,
      );
      expect(screen.queryByTestId('buffer-progress-bar')).toBeNull();
    });

    it('reflects bufferProgress as width', () => {
      render(
        <MockAllProviders>
          <AudioFlashcardComponent
            {...defaultProps}
            isBuffering
            bufferProgress={0.75}
          />
        </MockAllProviders>,
      );
      const bar = screen.getByTestId('buffer-progress-bar');
      expect(bar.style.width).toBe('75%');
    });
  });
});
