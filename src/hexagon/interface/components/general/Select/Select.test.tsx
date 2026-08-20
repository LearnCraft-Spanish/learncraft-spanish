import { Select } from '@interface/components/general/Select/Select';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

const OPTIONS = [
  { value: '1', label: 'Lesson 1' },
  { value: '2', label: 'Lesson 2' },
];

describe('select', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders every option', () => {
    render(
      <Select id="lesson" value="1" options={OPTIONS} onChange={vi.fn()} />,
    );

    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('reports the chosen value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: string) => void>();
    render(
      <Select id="lesson" value="1" options={OPTIONS} onChange={onChange} />,
    );

    await user.selectOptions(screen.getByRole('combobox'), '2');

    expect(onChange).toHaveBeenCalledWith('2');
  });

  it('marks itself invalid for assistive technology', () => {
    render(
      <Select
        id="lesson"
        value="1"
        options={OPTIONS}
        onChange={vi.fn()}
        invalid
      />,
    );

    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('shows a readout instead of a disabled dropdown', () => {
    render(
      <Select
        id="lesson"
        value="2"
        options={OPTIONS}
        onChange={vi.fn()}
        readout
      />,
    );

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Lesson 2')).toHaveAttribute('readonly');
  });

  it('renders an empty readout when the value matches no option', () => {
    render(
      <Select
        id="lesson"
        value="99"
        options={OPTIONS}
        onChange={vi.fn()}
        readout
      />,
    );

    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });
});
