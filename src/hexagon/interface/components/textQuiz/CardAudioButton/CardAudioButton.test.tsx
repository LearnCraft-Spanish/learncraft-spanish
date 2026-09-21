import type { CardAudioHandle } from '@interface/components/textQuiz/CardAudioButton/CardAudioButton';
import { CardAudioButton } from '@interface/components/textQuiz/CardAudioButton/CardAudioButton';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('card audio button', () => {
  const originalPaused = Object.getOwnPropertyDescriptor(
    HTMLMediaElement.prototype,
    'paused',
  );

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    if (originalPaused) {
      Object.defineProperty(
        HTMLMediaElement.prototype,
        'paused',
        originalPaused,
      );
    }
  });

  it('renders nothing when audioUrl is null', () => {
    render(<CardAudioButton audioUrl={null} label="Play sentence audio" />);

    expect(
      screen.queryByRole('button', { name: 'Play sentence audio' }),
    ).toBeNull();
  });

  it('renders an enabled button when audioUrl is present', () => {
    render(
      <CardAudioButton
        audioUrl="https://example.com/audio.mp3"
        label="Play sentence audio"
      />,
    );

    const button = screen.getByRole('button', { name: 'Play sentence audio' });
    expect(button).toBeTruthy();
    expect(button.hasAttribute('disabled')).toBe(false);
  });

  it('plays on click when audio is paused', async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);

    render(
      <CardAudioButton
        audioUrl="https://example.com/audio.mp3"
        label="Play sentence audio"
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Play sentence audio' }),
    );

    expect(play).toHaveBeenCalled();
  });

  it('pauses on click when audio is playing', async () => {
    Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
      configurable: true,
      get: () => false,
    });
    const pause = vi
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => {});

    render(
      <CardAudioButton
        audioUrl="https://example.com/audio.mp3"
        label="Play sentence audio"
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Play sentence audio' }),
    );

    expect(pause).toHaveBeenCalled();
  });

  it('exposes togglePlayback that plays when paused', () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);
    const ref: { current: CardAudioHandle | null } = { current: null };

    render(
      <CardAudioButton
        audioUrl="https://example.com/audio.mp3"
        label="Play sentence audio"
        ref={ref}
      />,
    );

    ref.current?.togglePlayback();

    expect(play).toHaveBeenCalled();
  });
});
