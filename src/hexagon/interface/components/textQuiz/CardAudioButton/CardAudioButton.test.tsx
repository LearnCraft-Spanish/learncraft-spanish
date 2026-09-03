import { CardAudioButton } from '@interface/components/textQuiz/CardAudioButton/CardAudioButton';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

describe('card audio button', () => {
  afterEach(() => {
    cleanup();
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
});
