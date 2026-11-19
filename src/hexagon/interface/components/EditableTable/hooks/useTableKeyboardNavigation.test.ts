import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type React from 'react';
import { useTableKeyboardNavigation } from '@interface/components/EditableTable/hooks/useTableKeyboardNavigation';
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// A 3 x 3 grid:
//            first   hours   last
//   row-a    a1      a2      a3
//   row-b    b1      b2      b3
//   row-c    c1      c2      c3
const rows: TableRow[] = [
  { id: 'row-a', cells: {} },
  { id: 'row-b', cells: {} },
  { id: 'row-c', cells: {} },
];

const columns: ColumnDefinition[] = [
  { id: 'first', type: 'text' },
  { id: 'hours', type: 'number' },
  { id: 'last', type: 'text' },
];

interface KeyOptions {
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  target?: EventTarget;
}

interface FakeKeyEvent {
  event: React.KeyboardEvent;
  preventDefault: ReturnType<typeof vi.fn>;
}

function keyEvent(key: string, options: KeyOptions = {}): FakeKeyEvent {
  const preventDefault = vi.fn();
  const event = {
    key,
    shiftKey: options.shiftKey ?? false,
    ctrlKey: options.ctrlKey ?? false,
    metaKey: options.metaKey ?? false,
    target: options.target ?? document.body,
    preventDefault,
  } as unknown as React.KeyboardEvent;
  return { event, preventDefault };
}

function textInput(value: string, caretStart: number, caretEnd = caretStart) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value;
  document.body.append(input);
  input.setSelectionRange(caretStart, caretEnd);
  return input;
}

function numberInput(value: string) {
  const input = document.createElement('input');
  input.type = 'number';
  input.value = value;
  document.body.append(input);
  return input;
}

function setup(activeCell: { rowId: string; columnId: string } | null) {
  const focusCell = vi.fn();
  const { result } = renderHook(() =>
    useTableKeyboardNavigation({
      rows,
      columns,
      activeCell,
      focusCell,
    }),
  );
  const press = (key: string, options?: KeyOptions) => {
    const fake = keyEvent(key, options);
    result.current.handleKeyDown(fake.event);
    return fake;
  };
  return { focusCell, press };
}

describe('useTableKeyboardNavigation', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  describe('when there is no cell to navigate from', () => {
    it('does nothing when no cell is active', () => {
      const { focusCell, press } = setup(null);

      const { preventDefault } = press('ArrowDown');

      expect(focusCell).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it('does nothing when the active row is not in the table', () => {
      const { focusCell, press } = setup({
        rowId: 'removed-row',
        columnId: 'hours',
      });

      const { preventDefault } = press('ArrowDown');

      expect(focusCell).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it('does nothing when the active column is not in the table', () => {
      const { focusCell, press } = setup({
        rowId: 'row-b',
        columnId: 'removed-column',
      });

      const { preventDefault } = press('Tab');

      expect(focusCell).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('arrow up and down', () => {
    it('arrowUp moves to the same column in the row above', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'hours' });

      const { preventDefault } = press('ArrowUp');

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-a', 'hours');
      expect(preventDefault).toHaveBeenCalled();
    });

    it('arrowUp in the top row stays put and leaves the key alone', () => {
      const { focusCell, press } = setup({ rowId: 'row-a', columnId: 'hours' });

      const { preventDefault } = press('ArrowUp');

      expect(focusCell).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it('arrowDown moves to the same column in the row below', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'hours' });

      const { preventDefault } = press('ArrowDown');

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-c', 'hours');
      expect(preventDefault).toHaveBeenCalled();
    });

    it('arrowDown in the bottom row stays put and leaves the key alone', () => {
      const { focusCell, press } = setup({ rowId: 'row-c', columnId: 'hours' });

      const { preventDefault } = press('ArrowDown');

      expect(focusCell).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('arrow left', () => {
    it('with Ctrl moves to the previous column', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'hours' });

      const { preventDefault } = press('ArrowLeft', {
        ctrlKey: true,
        target: textInput('Mornings', 4),
      });

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-b', 'first');
      expect(preventDefault).toHaveBeenCalled();
    });

    it('with Cmd (meta) moves to the previous column', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'hours' });

      press('ArrowLeft', {
        metaKey: true,
        target: textInput('Mornings', 4),
      });

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-b', 'first');
    });

    it('in a number input moves to the previous column', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'hours' });

      const { preventDefault } = press('ArrowLeft', {
        target: numberInput('1.25'),
      });

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-b', 'first');
      expect(preventDefault).toHaveBeenCalled();
    });

    it('in a text input with the cursor at the start moves to the previous column', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'last' });

      const { preventDefault } = press('ArrowLeft', {
        target: textInput('Mornings', 0),
      });

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-b', 'hours');
      expect(preventDefault).toHaveBeenCalled();
    });

    it('in a text input with the cursor inside the text lets the cursor move instead', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'last' });

      const { preventDefault } = press('ArrowLeft', {
        target: textInput('Mornings', 3),
      });

      expect(focusCell).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it('in a text input with text selected from the start lets the selection collapse instead', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'last' });

      const { preventDefault } = press('ArrowLeft', {
        target: textInput('Mornings', 0, 3),
      });

      expect(focusCell).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it('from the first column wraps to the last column of the row above', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'first' });

      const { preventDefault } = press('ArrowLeft', { ctrlKey: true });

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-a', 'last');
      expect(preventDefault).toHaveBeenCalled();
    });

    it('from the first cell of the table stays put and leaves the key alone', () => {
      const { focusCell, press } = setup({ rowId: 'row-a', columnId: 'first' });

      const { preventDefault } = press('ArrowLeft', { ctrlKey: true });

      expect(focusCell).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('arrow right', () => {
    it('with Ctrl moves to the next column', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'hours' });

      const { preventDefault } = press('ArrowRight', {
        ctrlKey: true,
        target: textInput('Mornings', 4),
      });

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-b', 'last');
      expect(preventDefault).toHaveBeenCalled();
    });

    it('with Cmd (meta) moves to the next column', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'hours' });

      press('ArrowRight', {
        metaKey: true,
        target: textInput('Mornings', 4),
      });

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-b', 'last');
    });

    it('in a number input moves to the next column', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'hours' });

      const { preventDefault } = press('ArrowRight', {
        target: numberInput('1.25'),
      });

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-b', 'last');
      expect(preventDefault).toHaveBeenCalled();
    });

    it('in a text input with the cursor at the end moves to the next column', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'first' });

      const { preventDefault } = press('ArrowRight', {
        target: textInput('Mornings', 8),
      });

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-b', 'hours');
      expect(preventDefault).toHaveBeenCalled();
    });

    it('in a text input with the cursor inside the text lets the cursor move instead', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'first' });

      const { preventDefault } = press('ArrowRight', {
        target: textInput('Mornings', 3),
      });

      expect(focusCell).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it('in a text input with text selected up to the end lets the selection collapse instead', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'first' });

      const { preventDefault } = press('ArrowRight', {
        target: textInput('Mornings', 3, 8),
      });

      expect(focusCell).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it('from the last column wraps to the first column of the row below', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'last' });

      const { preventDefault } = press('ArrowRight', { ctrlKey: true });

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-c', 'first');
      expect(preventDefault).toHaveBeenCalled();
    });

    it('from the last cell of the table stays put and leaves the key alone', () => {
      const { focusCell, press } = setup({ rowId: 'row-c', columnId: 'last' });

      const { preventDefault } = press('ArrowRight', { ctrlKey: true });

      expect(focusCell).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('tab', () => {
    it('tab moves to the next column', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'first' });

      const { preventDefault } = press('Tab');

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-b', 'hours');
      expect(preventDefault).toHaveBeenCalled();
    });

    it('tab from the last column wraps to the first column of the row below', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'last' });

      press('Tab');

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-c', 'first');
    });

    it('tab from the last cell of the table lets focus leave the table', () => {
      const { focusCell, press } = setup({ rowId: 'row-c', columnId: 'last' });

      const { preventDefault } = press('Tab');

      expect(focusCell).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it('shift+Tab moves to the previous column', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'last' });

      const { preventDefault } = press('Tab', { shiftKey: true });

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-b', 'hours');
      expect(preventDefault).toHaveBeenCalled();
    });

    it('shift+Tab from the first column wraps to the last column of the row above', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'first' });

      press('Tab', { shiftKey: true });

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-a', 'last');
    });

    it('shift+Tab from the first cell of the table lets focus leave the table', () => {
      const { focusCell, press } = setup({ rowId: 'row-a', columnId: 'first' });

      const { preventDefault } = press('Tab', { shiftKey: true });

      expect(focusCell).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('enter', () => {
    it('enter moves to the same column in the row below', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'hours' });

      const { preventDefault } = press('Enter');

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-c', 'hours');
      expect(preventDefault).toHaveBeenCalled();
    });

    it('enter in the bottom row stays put and leaves the key alone', () => {
      const { focusCell, press } = setup({ rowId: 'row-c', columnId: 'hours' });

      const { preventDefault } = press('Enter');

      expect(focusCell).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it('shift+Enter moves to the same column in the row above', () => {
      const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'hours' });

      const { preventDefault } = press('Enter', { shiftKey: true });

      expect(focusCell).toHaveBeenCalledExactlyOnceWith('row-a', 'hours');
      expect(preventDefault).toHaveBeenCalled();
    });

    it('shift+Enter in the top row stays put and leaves the key alone', () => {
      const { focusCell, press } = setup({ rowId: 'row-a', columnId: 'hours' });

      const { preventDefault } = press('Enter', { shiftKey: true });

      expect(focusCell).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });
  });

  it('ignores keys that are not navigation keys', () => {
    const { focusCell, press } = setup({ rowId: 'row-b', columnId: 'hours' });

    const { preventDefault } = press('a');

    expect(focusCell).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
