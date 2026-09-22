import type { JSX } from 'react';
import { AudioQuizPlayButton } from '@interface/components/audioQuiz/AudioQuizPlayButton/AudioQuizPlayButton';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

function renderButton(
  isPlaying: boolean,
  onPlay = vi.fn(),
  onPause = vi.fn(),
): { parentClick: ReturnType<typeof vi.fn> } {
  const parentClick = vi.fn();
  function Harness(): JSX.Element {
    return (
      <div onClick={parentClick}>
        <AudioQuizPlayButton
          isPlaying={isPlaying}
          onPlay={onPlay}
          onPause={onPause}
        />
      </div>
    );
  }
  render(<Harness />);
  return { parentClick };
}

describe('audioQuizPlayButton', () => {
  it('plays when the audio is paused and does not advance the card', () => {
    const onPlay = vi.fn();
    const { parentClick } = renderButton(false, onPlay);

    fireEvent.click(screen.getByRole('button', { name: 'Play audio' }));

    expect(onPlay).toHaveBeenCalledOnce();
    expect(parentClick).not.toHaveBeenCalled();
  });

  it('pauses when the audio is already playing', () => {
    const onPause = vi.fn();
    renderButton(true, vi.fn(), onPause);

    fireEvent.click(screen.getByRole('button', { name: 'Pause audio' }));

    expect(onPause).toHaveBeenCalledOnce();
  });
});
