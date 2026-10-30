import type { JSX } from 'react';
import type { MultiSelectSearchOption } from './MultiSelectSearch';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MultiSelectSearch } from './MultiSelectSearch';
import { SelectedOptionChips } from './SelectedOptionChips';

const OPTIONS: MultiSelectSearchOption[] = [
  { value: 'Group Coaching', label: 'Group Coaching' },
  { value: 'Premier Coaching', label: 'Premier Coaching' },
  { value: 'Regular Coaching', label: 'Regular Coaching' },
  { value: '', label: 'Unknown type' },
];

const NONE: readonly string[] = [];

function Harness({
  initial = NONE,
}: {
  initial?: readonly string[];
}): JSX.Element {
  const [selected, setSelected] = useState<readonly string[]>(initial);
  return (
    <>
      <label htmlFor="types">Types</label>
      <MultiSelectSearch
        id="types"
        options={OPTIONS}
        selected={selected}
        onChange={setSelected}
        listLabel="Types"
        placeholder="Search types"
      />
      <SelectedOptionChips
        label="Selected types"
        options={OPTIONS}
        selected={selected}
        onChange={setSelected}
      />
      <button type="button">Elsewhere</button>
    </>
  );
}

function optionNames(): string[] {
  return screen
    .queryAllByRole('option')
    .map((option) => option.textContent ?? '');
}

function chipNames(): string[] {
  const group = screen.queryByRole('group', { name: 'Selected types' });
  if (group === null) {
    return [];
  }
  return Array.from(group.querySelectorAll('button[aria-label]')).map(
    (button) => button.getAttribute('aria-label') ?? '',
  );
}

describe('multiSelectSearch', () => {
  it('lists every unselected option on focus', () => {
    render(<Harness initial={['Premier Coaching']} />);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.focus(screen.getByLabelText('Types'));

    expect(screen.getByRole('listbox', { name: 'Types' })).toBeInTheDocument();
    expect(optionNames()).toEqual([
      'Group Coaching',
      'Regular Coaching',
      'Unknown type',
    ]);
  });

  it('adds a clicked option, clears the search, and stays open for the next pick', () => {
    render(<Harness />);
    const input = screen.getByLabelText('Types');

    fireEvent.change(input, { target: { value: 'reg' } });
    expect(optionNames()).toEqual(['Regular Coaching']);
    fireEvent.click(screen.getByRole('option', { name: 'Regular Coaching' }));

    expect(input).toHaveValue('');
    expect(chipNames()).toEqual(['Remove Regular Coaching']);
    expect(optionNames()).toEqual([
      'Group Coaching',
      'Premier Coaching',
      'Unknown type',
    ]);
  });

  it('moves the highlight with the arrow keys and adds it on Enter', () => {
    render(<Harness />);
    const input = screen.getByLabelText('Types');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { selected: true })).toHaveTextContent(
      'Group Coaching',
    );

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { selected: true })).toHaveTextContent(
      'Unknown type',
    );

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(chipNames()).toEqual(['Remove Regular Coaching']);

    fireEvent.mouseEnter(
      screen.getByRole('option', { name: 'Group Coaching' }),
    );
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(chipNames()).toEqual([
      'Remove Regular Coaching',
      'Remove Group Coaching',
    ]);
  });

  it('ignores Enter while the list is closed', () => {
    render(<Harness />);
    const input = screen.getByLabelText('Types');

    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'Tab' });

    expect(chipNames()).toEqual([]);
  });

  it('says when nothing matches and when everything is chosen', () => {
    render(<Harness initial={['Group Coaching', 'Regular Coaching']} />);
    const input = screen.getByLabelText('Types');

    fireEvent.change(input, { target: { value: ' zzz ' } });
    expect(screen.getByText('No matches “zzz”')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByRole('option', { name: 'Premier Coaching' }));
    fireEvent.click(screen.getByRole('option', { name: 'Unknown type' }));
    expect(
      screen.getByText('Everything is already selected'),
    ).toBeInTheDocument();
  });

  it('clears the search from its clear button', () => {
    render(<Harness />);
    const input = screen.getByLabelText('Types');

    fireEvent.change(input, { target: { value: 'prem' } });
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(input).toHaveValue('');
    expect(optionNames()).toHaveLength(4);
  });

  it('closes on Escape, an outside click, or focus leaving the field', () => {
    render(<Harness />);
    const input = screen.getByLabelText('Types');

    fireEvent.focus(input);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.focus(input);
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.focus(input);
    fireEvent.blur(input, {
      relatedTarget: screen.getByRole('button', { name: 'Elsewhere' }),
    });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('keeps the list open when a press lands inside the panel', () => {
    render(<Harness />);
    const input = screen.getByLabelText('Types');

    fireEvent.focus(input);
    const option = screen.getByRole('option', { name: 'Group Coaching' });

    expect(fireEvent.mouseDown(option)).toBe(false);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});

describe('selectedOptionChips', () => {
  it('renders nothing when nothing is selected', () => {
    render(<Harness />);

    expect(
      screen.queryByRole('group', { name: 'Selected types' }),
    ).not.toBeInTheDocument();
  });

  it('shows option labels, and falls back to the value for an unknown one', () => {
    render(<Harness initial={['', 'Retired Course']} />);

    expect(chipNames()).toEqual([
      'Remove Unknown type',
      'Remove Retired Course',
    ]);
  });

  it('removes one chip or clears them all', () => {
    const onChange = vi.fn();
    render(
      <SelectedOptionChips
        label="Selected types"
        options={OPTIONS}
        selected={['Group Coaching', 'Premier Coaching']}
        onChange={onChange}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Remove Group Coaching' }),
    );
    expect(onChange).toHaveBeenLastCalledWith(['Premier Coaching']);

    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});
