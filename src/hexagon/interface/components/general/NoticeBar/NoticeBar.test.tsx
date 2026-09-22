import { NoticeBar } from '@interface/components/general/NoticeBar/NoticeBar';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('notice bar', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows its message', () => {
    render(
      <NoticeBar
        message="12 flashcards added"
        onDismiss={vi.fn()}
        autoDismissMs={0}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('12 flashcards added');
  });

  it('dismisses by hand', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn<() => void>();
    render(
      <NoticeBar
        message="12 flashcards added"
        onDismiss={onDismiss}
        autoDismissMs={0}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('offers a recovery action when given one', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn<() => void>();
    render(
      <NoticeBar
        message="12 flashcards added"
        onDismiss={vi.fn()}
        actionLabel="Undo"
        onAction={onAction}
        autoDismissMs={0}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(onAction).toHaveBeenCalledOnce();
  });

  it('has no recovery action by default', () => {
    render(
      <NoticeBar
        message="12 flashcards added"
        onDismiss={vi.fn()}
        autoDismissMs={0}
      />,
    );

    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});

describe('notice bar auto-dismissal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('dismisses itself after six seconds', () => {
    const onDismiss = vi.fn<() => void>();
    render(<NoticeBar message="12 flashcards added" onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(5999);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('stays until dismissed when auto-dismissal is switched off', () => {
    const onDismiss = vi.fn<() => void>();
    render(
      <NoticeBar
        message="12 flashcards added"
        onDismiss={onDismiss}
        autoDismissMs={0}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('restarts the countdown when the message is replaced', () => {
    const onDismiss = vi.fn<() => void>();
    const { rerender } = render(
      <NoticeBar message="12 flashcards added" onDismiss={onDismiss} />,
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    rerender(
      <NoticeBar message="3 flashcards removed" onDismiss={onDismiss} />,
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
