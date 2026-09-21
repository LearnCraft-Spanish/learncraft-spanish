import { AudioQuizDock } from '@interface/components/audioQuiz/AudioQuizDock/AudioQuizDock';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('AudioQuizDock', () => {
  it('fires the primary, replay, and next actions', async () => {
    const user = userEvent.setup();
    const onPrimary = vi.fn();
    const onReplay = vi.fn();
    const onNext = vi.fn();
    render(
      <AudioQuizDock
        primaryLabel="Show answer"
        replayLabel="Replay"
        isFirst={false}
        onPrimary={onPrimary}
        onReplay={onReplay}
        onPrevious={vi.fn()}
        onNext={onNext}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show answer' }));
    await user.click(screen.getByRole('button', { name: 'Replay' }));
    await user.click(screen.getByRole('button', { name: 'Next card' }));

    expect(onPrimary).toHaveBeenCalledOnce();
    expect(onReplay).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('disables previous on the first card', () => {
    render(
      <AudioQuizDock
        primaryLabel="Show answer"
        replayLabel="Replay"
        isFirst
        onPrimary={vi.fn()}
        onReplay={vi.fn()}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Previous card' }),
    ).toBeDisabled();
  });
});
