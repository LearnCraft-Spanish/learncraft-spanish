import {
  Combobox,
  filterComboboxOptions,
} from '@interface/components/general/Combobox/Combobox';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

const OPTIONS = Array.from({ length: 15 }, (_, index) => ({
  value: String(index + 1),
  label: `Lesson ${index + 1}`,
}));

describe('filterComboboxOptions', () => {
  it('returns everything for an empty query', () => {
    expect(filterComboboxOptions(OPTIONS, '  ')).toEqual(OPTIONS);
  });

  it('matches case-insensitively on the label', () => {
    const labels = filterComboboxOptions(OPTIONS, 'lesson 1').map(
      (option) => option.label,
    );
    expect(labels).toContain('Lesson 1');
    expect(labels).toContain('Lesson 12');
    expect(labels).not.toContain('Lesson 2');
  });

  it('floats whole-word matches above substring matches', () => {
    const labels = filterComboboxOptions(OPTIONS, '1').map(
      (option) => option.label,
    );
    expect(labels[0]).toBe('Lesson 1');
    expect(labels.slice(1)).toEqual([
      'Lesson 10',
      'Lesson 11',
      'Lesson 12',
      'Lesson 13',
      'Lesson 14',
      'Lesson 15',
    ]);
  });

  it('matches on the raw value too', () => {
    const options = [{ value: '7', label: 'Seventh' }];
    expect(filterComboboxOptions(options, '7')).toEqual(options);
  });
});

describe('combobox', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows the committed label while closed', () => {
    render(
      <Combobox id="from" value="3" options={OPTIONS} onChange={vi.fn()} />,
    );

    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('Lesson 3');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens on focus with the committed option highlighted', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">before</button>
        <Combobox id="from" value="3" options={OPTIONS} onChange={vi.fn()} />
      </>,
    );

    await user.tab();
    await user.tab();

    const input = screen.getByRole('combobox');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-activedescendant', 'from-option-3');
    expect(screen.getAllByRole('option')).toHaveLength(15);
    expect(screen.getByRole('option', { name: 'Lesson 3' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('opens on click', async () => {
    const user = userEvent.setup();
    render(
      <Combobox id="from" value="3" options={OPTIONS} onChange={vi.fn()} />,
    );

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('narrows the list as the learner types', async () => {
    const user = userEvent.setup();
    render(
      <Combobox id="from" value="3" options={OPTIONS} onChange={vi.fn()} />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('12');

    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'Lesson 12' })).toBeVisible();
  });

  it('commits a clicked option and shows its label', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: string) => void>();
    render(
      <Combobox id="from" value="3" options={OPTIONS} onChange={onChange} />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Lesson 7' }));

    expect(onChange).toHaveBeenCalledWith('7');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('commits the first match on Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: string) => void>();
    render(
      <Combobox id="from" value="3" options={OPTIONS} onChange={onChange} />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('1{Enter}');

    expect(onChange).toHaveBeenCalledWith('1');
  });

  it('walks the list with the arrow keys', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: string) => void>();
    render(
      <Combobox id="from" value="3" options={OPTIONS} onChange={onChange} />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', 'from-option-4');

    await user.keyboard('{ArrowDown}{ArrowUp}{ArrowUp}{Enter}');

    expect(onChange).toHaveBeenCalledWith('3');
  });

  it('stops at both ends of the list', async () => {
    const user = userEvent.setup();
    render(
      <Combobox id="from" value="1" options={OPTIONS} onChange={vi.fn()} />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-activedescendant', 'from-option-1');

    await user.keyboard('1');
    expect(screen.getAllByRole('option')).toHaveLength(7);
    await user.keyboard(
      '{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}',
    );
    expect(input).toHaveAttribute('aria-activedescendant', 'from-option-15');
  });

  it('reverts typed text on Escape without changing the value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: string) => void>();
    render(
      <Combobox id="from" value="3" options={OPTIONS} onChange={onChange} />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('12{Escape}');

    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('Lesson 3');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('reopens from the keyboard after Escape', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: string) => void>();
    render(
      <Combobox id="from" value="5" options={OPTIONS} onChange={onChange} />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{Escape}');
    // Closed but focused: Enter and Escape are no-ops.
    await user.keyboard('{Enter}{Escape}');
    expect(onChange).not.toHaveBeenCalled();

    await user.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-activedescendant', 'from-option-5');

    await user.keyboard('{Escape}{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', 'from-option-5');
  });

  it('reverts and closes when focus leaves', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Combobox id="from" value="3" options={OPTIONS} onChange={vi.fn()} />
        <button type="button">elsewhere</button>
      </>,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('9');
    await user.tab();

    expect(input).toHaveValue('Lesson 3');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('reopens on click after Escape closed it', async () => {
    const user = userEvent.setup();
    render(
      <Combobox id="from" value="3" options={OPTIONS} onChange={vi.fn()} />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.click(input);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('keeps the list open when the focused field is clicked again', async () => {
    const user = userEvent.setup();
    render(
      <Combobox id="from" value="3" options={OPTIONS} onChange={vi.fn()} />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.click(input);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('explains an empty list in the caller’s words', async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        id="from"
        value="3"
        options={OPTIONS}
        onChange={vi.fn()}
        emptyLabel="No lessons match"
      />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('zz');

    expect(screen.getByText('No lessons match “zz”')).toBeInTheDocument();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('does nothing on Enter or arrows when the filter has no matches', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: string) => void>();
    render(
      <Combobox id="from" value="1" options={OPTIONS} onChange={onChange} />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('zz{ArrowDown}{ArrowUp}{Enter}');

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).not.toHaveAttribute(
      'aria-activedescendant',
    );
  });

  it('stays closed when there is nothing to choose', async () => {
    const user = userEvent.setup();
    render(<Combobox id="from" value="" options={[]} onChange={vi.fn()} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{ArrowDown}');

    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/No matches/)).not.toBeInTheDocument();
  });

  it('highlights the first option when the value matches nothing', async () => {
    const user = userEvent.setup();
    render(
      <Combobox id="from" value="" options={OPTIONS} onChange={vi.fn()} />,
    );

    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('');
    await user.click(input);

    expect(input).toHaveAttribute('aria-activedescendant', 'from-option-1');
  });

  it('follows the pointer as it moves over rows', async () => {
    const user = userEvent.setup();
    render(
      <Combobox id="from" value="1" options={OPTIONS} onChange={vi.fn()} />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.hover(screen.getByRole('option', { name: 'Lesson 9' }));

    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      'from-option-9',
    );
  });

  it('passes accessibility attributes through', () => {
    render(
      <Combobox
        id="from"
        value="3"
        options={OPTIONS}
        onChange={vi.fn()}
        invalid
        describedBy="from-error"
        disabled
        placeholder="Type a lesson"
      />,
    );

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'from-error');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('placeholder', 'Type a lesson');
  });
});
