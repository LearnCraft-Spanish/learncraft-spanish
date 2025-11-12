import { AudioQuizType } from '@domain/audioQuizzing';

import AudioQuizSetupMenu from '@interface/components/Quizzing/AudioQuiz/AudioQuizSetupMenu';
import { cleanup, render, screen } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { afterEach, describe, expect, it, vi } from 'vitest';
const audioQuizSetupOptions = {
  availableQuizLengths: [10, 20, 30],
  selectedQuizLength: 10,
  setSelectedQuizLength: vi.fn(),
  totalExamples: 10,
  audioQuizType: AudioQuizType.Speaking,
  setAudioQuizType: vi.fn(),
  autoplay: true,
  setAutoplay: vi.fn(),
};
const startQuiz = vi.fn();

vi.mock('../LessonSelector', () => ({
  FromToLessonSelector: () => <div>FromToLessonSelector</div>,
}));

describe('component AudioQuizSetupMenu', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders without crashing', () => {
    render(
      <MockAllProviders>
        <AudioQuizSetupMenu
          audioQuizSetupOptions={audioQuizSetupOptions}
          startQuiz={startQuiz}
        />
      </MockAllProviders>,
    );
    expect(screen.getByText('Start')).toBeTruthy();
  });

  it('toggle autoplay off', () => {
    render(
      <MockAllProviders>
        <AudioQuizSetupMenu
          audioQuizSetupOptions={audioQuizSetupOptions}
          startQuiz={startQuiz}
        />
      </MockAllProviders>,
    );
    screen.getByLabelText('toggleAutoplay').click();
    expect(audioQuizSetupOptions.setAutoplay).toHaveBeenCalledWith(false);
  });
  it('toggle autoplay on', () => {
    render(
      <MockAllProviders>
        <AudioQuizSetupMenu
          audioQuizSetupOptions={{ ...audioQuizSetupOptions, autoplay: false }}
          startQuiz={startQuiz}
        />
      </MockAllProviders>,
    );

    screen.getByLabelText('toggleAutoplay').click();
    expect(audioQuizSetupOptions.setAutoplay).toHaveBeenCalledWith(true);
  });
});
