import { Chip } from '@interface/components/general/Chip/Chip';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('chip', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a static label chip as plain text', () => {
    render(<Chip label="verbs" />);

    expect(screen.getByText('verbs')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders a leading icon as decoration', () => {
    const { container } = render(<Chip label="Audio" icon="volume" />);

    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('becomes a toggle when it can be selected', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn<() => void>();
    render(<Chip label="Beginner verbs" onSelect={onSelect} />);

    const chip = screen.getByRole('button', { name: 'Beginner verbs' });

    expect(chip).toHaveAttribute('aria-pressed', 'false');

    await user.click(chip);

    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('reports that it is selected', () => {
    render(<Chip label="Beginner verbs" onSelect={vi.fn()} selected />);

    expect(
      screen.getByRole('button', { name: 'Beginner verbs' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('offers a named remove control', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn<() => void>();
    render(<Chip label="verbs" onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: 'Remove verbs' }));

    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('does not nest a remove control inside a toggle', () => {
    render(<Chip label="verbs" onSelect={vi.fn()} onRemove={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Remove verbs' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'verbs' }),
    ).not.toBeInTheDocument();
  });

  it('applies a non-default tone', () => {
    render(<Chip label="Custom" tone="warning" />);

    expect(screen.getByText('Custom').className).toContain('warning');
  });
});
