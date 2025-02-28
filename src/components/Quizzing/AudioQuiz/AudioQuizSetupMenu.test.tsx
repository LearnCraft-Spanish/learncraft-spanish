import { cleanup, render, screen } from '@testing-library/react';
// import { MemoryRouter } from 'react-router-dom';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AudioQuizSetupMenu from './AudioQuizSetupMenu';
const readyQuiz = vi.fn();
const updateAutoplay = vi.fn();

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
          autoplay
          examplesToPlayLength={5}
          readyQuiz={readyQuiz}
          updateAutoplay={updateAutoplay}
        />
      </MockAllProviders>,
    );
    expect(screen.getByText('Start')).toBeTruthy();
  });
  it('shows no examples found message', () => {
    render(
      <MockAllProviders>
        <AudioQuizSetupMenu
          autoplay
          examplesToPlayLength={0}
          readyQuiz={readyQuiz}
          updateAutoplay={updateAutoplay}
        />
      </MockAllProviders>,
    );
    expect(
      screen.getByText('There are no audio examples for this lesson range'),
    ).toBeTruthy();
  });
  it('toggle autoplay off', () => {
    render(
      <MockAllProviders>
        <AudioQuizSetupMenu
          autoplay
          examplesToPlayLength={5}
          readyQuiz={readyQuiz}
          updateAutoplay={updateAutoplay}
        />
      </MockAllProviders>,
    );
    screen.getByLabelText('toggleAutoplay').click();
    expect(updateAutoplay).toHaveBeenCalledWith(false);
  });
  it('toggle autoplay on', () => {
    render(
      <MockAllProviders>
        <AudioQuizSetupMenu
          autoplay={false}
          examplesToPlayLength={5}
          readyQuiz={readyQuiz}
          updateAutoplay={updateAutoplay}
        />
      </MockAllProviders>,
    );
    screen.getByLabelText('toggleAutoplay').click();
    expect(updateAutoplay).toHaveBeenCalledWith(true);
  });
});
