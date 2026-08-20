import { Toggle } from '@interface/components/general/Toggle/Toggle';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('toggle', () => {
  afterEach(() => {
    cleanup();
  });

  it('is a switch named by its label', () => {
    render(
      <Toggle
        id="from-lesson"
        checked={false}
        onChange={vi.fn()}
        label="Set a starting lesson"
      />,
    );

    expect(
      screen.getByRole('switch', { name: 'Set a starting lesson' }),
    ).not.toBeChecked();
  });

  it('reports the new state when switched on', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(checked: boolean) => void>();
    render(
      <Toggle
        id="from-lesson"
        checked={false}
        onChange={onChange}
        label="Set a starting lesson"
      />,
    );

    await user.click(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('is switched on by clicking its label text', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(checked: boolean) => void>();
    render(
      <Toggle
        id="from-lesson"
        checked={false}
        onChange={onChange}
        label="Set a starting lesson"
      />,
    );

    await user.click(screen.getByText('Set a starting lesson'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('is on when checked', () => {
    render(<Toggle id="from-lesson" checked onChange={vi.fn()} label="On" />);

    expect(screen.getByRole('switch', { name: 'On' })).toBeChecked();
  });

  it('keeps a hidden label available to assistive technology', () => {
    render(
      <Toggle
        id="from-lesson"
        checked={false}
        onChange={vi.fn()}
        label="Set a starting lesson"
        labelHidden
      />,
    );

    expect(
      screen.getByRole('switch', { name: 'Set a starting lesson' }),
    ).toBeInTheDocument();
  });

  it('does not report changes while disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(checked: boolean) => void>();
    render(
      <Toggle
        id="from-lesson"
        checked={false}
        onChange={onChange}
        label="Set a starting lesson"
        disabled
      />,
    );

    await user.click(screen.getByRole('switch'));

    expect(onChange).not.toHaveBeenCalled();
  });
});
