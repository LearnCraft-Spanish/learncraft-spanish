import { IconButton } from '@interface/components/general/IconButton/IconButton';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('icon button', () => {
  afterEach(() => {
    cleanup();
  });

  it('names itself with the given label', () => {
    render(<IconButton icon="chevronDown" label="Expand row" />);

    expect(
      screen.getByRole('button', { name: 'Expand row' }),
    ).toBeInTheDocument();
  });

  it('calls onClick when pressed', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn<() => void>();
    render(<IconButton icon="x" label="Remove tag" onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'Remove tag' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn<() => void>();
    render(
      <IconButton
        icon="chevronLeft"
        label="Previous page"
        disabled
        onClick={onClick}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Previous page' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('is not a toggle unless an active state is given', () => {
    render(<IconButton icon="chevronRight" label="Next page" />);

    expect(
      screen.getByRole('button', { name: 'Next page' }),
    ).not.toHaveAttribute('aria-pressed');
  });

  it('reports its pressed state when it is a toggle', () => {
    render(<IconButton icon="volume" label="Play Spanish" active={false} />);

    expect(
      screen.getByRole('button', { name: 'Play Spanish' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('reports that it is pressed when active', () => {
    render(<IconButton icon="volume" label="Play Spanish" active />);

    expect(
      screen.getByRole('button', { name: 'Play Spanish' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
