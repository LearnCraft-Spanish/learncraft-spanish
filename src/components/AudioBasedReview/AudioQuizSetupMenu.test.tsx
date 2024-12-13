import { cleanup, render, screen } from '@testing-library/react';

import { afterEach, describe, expect, it, vi } from 'vitest';
import MockAllProviders from '../../../mocks/Providers/MockAllProviders';
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
      <MockAllProviders route="/audioquiz">
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
      <MockAllProviders route="/audioquiz">
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
    ).toBeInTheDocument();
  });
  it('toggle autoplay off', async () => {
    render(
      <MockAllProviders route="/audioquiz">
        <AudioQuizSetupMenu
          autoplay
          examplesToPlayLength={5}
          readyQuiz={readyQuiz}
          updateAutoplay={updateAutoplay}
        />
      </MockAllProviders>,
    );
    const autoplayCheckbox = screen.getByRole('checkbox', {
      name: 'toggleAutoplay',
    });
    autoplayCheckbox.click();
    expect(updateAutoplay).toHaveBeenCalledWith(false);
  });
  it('toggle autoplay on', async () => {
    render(
      <MockAllProviders route="/audioquiz">
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
