import { Popover } from '@interface/components/general/Popover/Popover';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('popover', () => {
  afterEach(() => {
    cleanup();
  });

  it('keeps the trigger rendered while closed', () => {
    render(
      <Popover open={false} onDismiss={vi.fn()} trigger={<button>Open</button>}>
        <span>panel</span>
      </Popover>,
    );

    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
    expect(screen.queryByText('panel')).not.toBeInTheDocument();
  });

  it('shows the panel when open', () => {
    render(
      <Popover open onDismiss={vi.fn()} trigger={<button>Open</button>}>
        <span>panel</span>
      </Popover>,
    );

    expect(screen.getByText('panel')).toBeInTheDocument();
  });

  it('dismisses on a click outside', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn<() => void>();
    render(
      <div>
        <span>outside</span>
        <Popover open onDismiss={onDismiss} trigger={<button>Open</button>}>
          <span>panel</span>
        </Popover>
      </div>,
    );

    await user.click(screen.getByText('outside'));

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('stays open when the panel itself is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn<() => void>();
    render(
      <Popover open onDismiss={onDismiss} trigger={<button>Open</button>}>
        <span>panel</span>
      </Popover>,
    );

    await user.click(screen.getByText('panel'));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('dismisses on Escape', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn<() => void>();
    render(
      <Popover open onDismiss={onDismiss} trigger={<button>Open</button>}>
        <span>panel</span>
      </Popover>,
    );

    await user.keyboard('{Escape}');

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('ignores outside clicks while closed', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn<() => void>();
    render(
      <div>
        <span>outside</span>
        <Popover
          open={false}
          onDismiss={onDismiss}
          trigger={<button>Open</button>}
        >
          <span>panel</span>
        </Popover>
      </div>,
    );

    await user.click(screen.getByText('outside'));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('applies the dark skin and end alignment when asked', () => {
    render(
      <Popover
        open
        onDismiss={vi.fn()}
        trigger={<button>Open</button>}
        skin="dark"
        align="end"
      >
        <span>panel</span>
      </Popover>,
    );

    const panel = screen.getByText('panel').parentElement;

    expect(panel?.className).toContain('dark');
    expect(panel?.className).toContain('alignEnd');
  });
});
