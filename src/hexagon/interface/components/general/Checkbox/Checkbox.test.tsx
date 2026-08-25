import { Checkbox } from '@interface/components/general/Checkbox/Checkbox';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('checkbox', () => {
  afterEach(() => {
    cleanup();
  });

  it('is named by its label', () => {
    render(
      <Checkbox
        id="row-1"
        checked={false}
        onChange={vi.fn()}
        label="Select this example"
      />,
    );

    expect(
      screen.getByRole('checkbox', { name: 'Select this example' }),
    ).toBeInTheDocument();
  });

  it('reports the new state when toggled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(checked: boolean) => void>();
    render(
      <Checkbox
        id="row-1"
        checked={false}
        onChange={onChange}
        label="Select this example"
      />,
    );

    await user.click(screen.getByRole('checkbox'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('shows a check only when checked', () => {
    const { container, rerender } = render(
      <Checkbox id="row-1" checked={false} onChange={vi.fn()} label="Select" />,
    );

    expect(container.querySelector('svg')).not.toBeInTheDocument();

    rerender(<Checkbox id="row-1" checked onChange={vi.fn()} label="Select" />);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('keeps a hidden label available to assistive technology', () => {
    render(
      <Checkbox
        id="row-1"
        checked={false}
        onChange={vi.fn()}
        label="Select this example"
        labelHidden
      />,
    );

    expect(
      screen.getByRole('checkbox', { name: 'Select this example' }),
    ).toBeInTheDocument();
  });

  it('does not report changes while disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(checked: boolean) => void>();
    render(
      <Checkbox
        id="row-1"
        checked={false}
        onChange={onChange}
        label="Select"
        disabled
      />,
    );

    await user.click(screen.getByRole('checkbox'));

    expect(onChange).not.toHaveBeenCalled();
  });
});
