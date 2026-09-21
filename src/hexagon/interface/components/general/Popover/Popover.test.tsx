import { Popover } from '@interface/components/general/Popover/Popover';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './Popover.module.scss';

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

  it('shows the panel with the menu shadow', () => {
    render(
      <Popover
        open
        shadow="menu"
        onDismiss={vi.fn()}
        trigger={<button>Open</button>}
      >
        <span>panel</span>
      </Popover>,
    );

    expect(screen.getByText('panel')).toBeInTheDocument();
  });

  it('shows the panel with the menu offset', () => {
    render(
      <Popover
        open
        offset="menu"
        onDismiss={vi.fn()}
        trigger={<button>Open</button>}
      >
        <span>panel</span>
      </Popover>,
    );

    expect(screen.getByText('panel')).toBeInTheDocument();
  });

  it('shows the panel with an explicit popover shadow', () => {
    render(
      <Popover
        open
        shadow="popover"
        onDismiss={vi.fn()}
        trigger={<button>Open</button>}
      >
        <span>panel</span>
      </Popover>,
    );

    expect(screen.getByText('panel')).toBeInTheDocument();
  });

  it('anchors on mobile by default', () => {
    const { container } = render(
      <Popover open onDismiss={vi.fn()} trigger={<button>Open</button>}>
        <span>panel</span>
      </Popover>,
    );

    const root = container.firstElementChild;
    const panel = screen.getByText('panel').parentElement;

    expect(root).toHaveClass(styles.root);
    expect(root).not.toHaveClass(styles.mobileCenteredRoot);
    expect(panel).toHaveClass(styles.panel);
    expect(panel).not.toHaveClass(styles.mobileCentered);
  });

  it('centers on mobile when placement is centered', () => {
    const { container } = render(
      <Popover
        open
        mobilePlacement="centered"
        skin="dark"
        align="end"
        shadow="menu"
        offset="menu"
        onDismiss={vi.fn()}
        trigger={<button>Open</button>}
      >
        <span>panel</span>
      </Popover>,
    );

    const root = container.firstElementChild;
    const panel = screen.getByText('panel').parentElement;

    expect(root).toHaveClass(styles.root);
    expect(root).toHaveClass(styles.mobileCenteredRoot);
    expect(panel).toHaveClass(styles.panel);
    expect(panel).toHaveClass(styles.dark);
    expect(panel).toHaveClass(styles.alignEnd);
    expect(panel).toHaveClass(styles.shadowMenu);
    expect(panel).toHaveClass(styles.offsetMenu);
    expect(panel).toHaveClass(styles.mobileCentered);
  });

  it('keeps the panel gated on open when centered', () => {
    render(
      <Popover
        open={false}
        mobilePlacement="centered"
        onDismiss={vi.fn()}
        trigger={<button>Open</button>}
      >
        <span>panel</span>
      </Popover>,
    );

    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
    expect(screen.queryByText('panel')).not.toBeInTheDocument();
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

  it('dismisses on a click outside when centered', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn<() => void>();
    render(
      <div>
        <span>outside</span>
        <Popover
          open
          mobilePlacement="centered"
          onDismiss={onDismiss}
          trigger={<button>Open</button>}
        >
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

  it('dismisses on Escape when centered', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn<() => void>();
    render(
      <Popover
        open
        mobilePlacement="centered"
        onDismiss={onDismiss}
        trigger={<button>Open</button>}
      >
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

  it('stops listening for dismiss once it has closed', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn<() => void>();
    const { rerender } = render(
      <div>
        <span>outside</span>
        <Popover open onDismiss={onDismiss} trigger={<button>Open</button>}>
          <span>panel</span>
        </Popover>
      </div>,
    );

    rerender(
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
    await user.keyboard('{Escape}');

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
