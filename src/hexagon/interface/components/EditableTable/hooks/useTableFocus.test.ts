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
});
