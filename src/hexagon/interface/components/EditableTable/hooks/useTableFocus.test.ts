import { useTableFocus } from '@interface/components/EditableTable/hooks/useTableFocus';
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

function addInput(type: string, value: string): HTMLInputElement {
  const input = document.createElement('input');
  input.type = type;
  input.value = value;
  document.body.append(input);
  return input;
}

describe('useTableFocus', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('focuses a text cell with the cursor after its value', () => {
    const { result } = renderHook(() => useTableFocus());
    const input = addInput('text', 'Mornings');
    result.current.createCellRef('1', 'notes')(input);

    act(() => result.current.focusCell('1', 'notes'));

    expect(input).toHaveFocus();
    expect(input.selectionStart).toBe(8);
    expect(input.selectionEnd).toBe(8);
  });

  it('focuses a number cell, which cannot take a cursor position', () => {
    const { result } = renderHook(() => useTableFocus());
    const input = addInput('number', '1.25');
    result.current.createCellRef('1', 'projectsHours')(input);

    expect(() =>
      act(() => result.current.focusCell('1', 'projectsHours')),
    ).not.toThrow();
    expect(input).toHaveFocus();
  });

  it('does nothing for a cell that is not registered', () => {
    const { result } = renderHook(() => useTableFocus());
    const input = addInput('number', '1.25');
    result.current.createCellRef('1', 'projectsHours')(input);
    result.current.createCellRef('1', 'projectsHours')(null);

    act(() => result.current.focusCell('1', 'projectsHours'));

    expect(input).not.toHaveFocus();
  });

  it.each(['search', 'url', 'tel', 'password'])(
    'puts the cursor after the value of a %s cell',
    (type) => {
      const { result } = renderHook(() => useTableFocus());
      const input = addInput(type, 'abc');
      result.current.createCellRef('1', 'field')(input);

      act(() => result.current.focusCell('1', 'field'));

      expect(input).toHaveFocus();
      expect(input.selectionStart).toBe(3);
    },
  );

  it('focuses an email cell, which cannot take a cursor position', () => {
    const { result } = renderHook(() => useTableFocus());
    const input = addInput('email', 'ana@example.com');
    result.current.createCellRef('1', 'email')(input);

    expect(() =>
      act(() => result.current.focusCell('1', 'email')),
    ).not.toThrow();
    expect(input).toHaveFocus();
  });

  it('focuses an empty text cell', () => {
    const { result } = renderHook(() => useTableFocus());
    const input = addInput('text', '');
    result.current.createCellRef('1', 'notes')(input);

    act(() => result.current.focusCell('1', 'notes'));

    expect(input).toHaveFocus();
  });

  it('focuses cells that are not inputs, such as a focusable wrapper or a textarea', () => {
    const { result } = renderHook(() => useTableFocus());
    const wrapper = document.createElement('div');
    wrapper.tabIndex = 0;
    const textarea = document.createElement('textarea');
    document.body.append(wrapper, textarea);
    result.current.createCellRef('1', 'active')(wrapper);
    result.current.createCellRef('1', 'notes')(textarea);

    act(() => result.current.focusCell('1', 'active'));
    expect(wrapper).toHaveFocus();

    act(() => result.current.focusCell('1', 'notes'));
    expect(textarea).toHaveFocus();
  });

  it('focuses the cell that matches both the row and the column', () => {
    const { result } = renderHook(() => useTableFocus());
    const first = addInput('text', 'first');
    const sameRowOtherColumn = addInput('text', 'second');
    const otherRowSameColumn = addInput('text', 'third');
    result.current.createCellRef('1', 'name')(first);
    result.current.createCellRef('1', 'detail')(sameRowOtherColumn);
    result.current.createCellRef('2', 'name')(otherRowSameColumn);

    act(() => result.current.focusCell('2', 'name'));

    expect(otherRowSameColumn).toHaveFocus();
    expect(first).not.toHaveFocus();
    expect(sameRowOtherColumn).not.toHaveFocus();
  });

  it('does nothing for a cell that was never registered', () => {
    const { result } = renderHook(() => useTableFocus());
    const input = addInput('text', 'Mornings');
    result.current.createCellRef('1', 'notes')(input);

    expect(() =>
      act(() => result.current.focusCell('9', 'notes')),
    ).not.toThrow();
    expect(input).not.toHaveFocus();
  });

  it('focuses the new element when a cell is re-registered after remounting', () => {
    const { result } = renderHook(() => useTableFocus());
    const oldInput = addInput('text', 'old');
    const newInput = addInput('text', 'new');
    const ref = result.current.createCellRef('1', 'notes');
    ref(oldInput);
    ref(null);
    ref(newInput);

    act(() => result.current.focusCell('1', 'notes'));

    expect(newInput).toHaveFocus();
  });
});
