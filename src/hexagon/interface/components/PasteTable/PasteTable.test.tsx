import type { TableColumn, TableRow } from '@domain/PasteTable/General';
import { createMockPasteTableResult } from '@application/units/pasteTable/usePasteTable.mock';
import { PasteTable } from '@interface/components/PasteTable/PasteTable';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

const createTestColumns = (types: Array<'text' | 'number'>): TableColumn[] => {
  return types.map((type, index) => ({
    id: `col${index + 1}`,
    label: `Column ${index + 1}`,
    type,
    width: '1fr',
  }));
};

const createTestRows = (numRows: number, numCols: number): TableRow[] => {
  return Array.from({ length: numRows }, (_, rowIndex) => ({
    id: `row-${rowIndex + 1}`,
    cells: Array.from({ length: numCols }, (_, colIndex) => [
      `col${colIndex + 1}`,
      `value-${rowIndex + 1}-${colIndex + 1}`,
    ]).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
  }));
};

describe('pasteTable', () => {
  it('should navigate left and right from number inputs immediately', async () => {
    // Given: A table with number input cells
    const mockHook = createMockPasteTableResult({
      columns: createTestColumns(['text', 'number', 'text']),
      rows: createTestRows(1, 3),
    });

    const user = userEvent.setup();
    render(<PasteTable hook={mockHook} />);

    const cells = screen.getAllByRole('gridcell');
    const numberInput = within(cells[1]).getByRole('spinbutton');

    // When: Focus on number input and press ArrowLeft
    await user.click(numberInput);
    await user.keyboard('{ArrowLeft}');

    // Then: Focus moves to previous cell
    expect(within(cells[0]).getByRole('textbox')).toHaveFocus();

    // When: Press ArrowRight twice
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowRight}');

    // Then: Focus moves through number input to next cell
    expect(within(cells[2]).getByRole('textbox')).toHaveFocus();
  });

  it('should only navigate from text inputs when cursor is at boundary', async () => {
    // Given: A table with text inputs
    const mockHook = createMockPasteTableResult({
      columns: createTestColumns(['text', 'text']),
      rows: createTestRows(1, 2),
    });

    const user = userEvent.setup();
    render(<PasteTable hook={mockHook} />);

    const cells = screen.getAllByRole('gridcell');
    const textInput = within(cells[1]).getByRole('textbox') as HTMLInputElement;

    // When: Cursor NOT at start, press ArrowLeft
    await user.click(textInput);
    textInput.setSelectionRange(textInput.value.length, textInput.value.length);
    await user.keyboard('{ArrowLeft}');

    // Then: Focus stays in same cell
    expect(textInput).toHaveFocus();

    // When: Cursor at start, press ArrowLeft
    textInput.setSelectionRange(0, 0);
    await user.keyboard('{ArrowLeft}');

    // Then: Focus moves to previous cell
    expect(within(cells[0]).getByRole('textbox')).toHaveFocus();
  });

  it('should navigate with Ctrl/Meta modifier keys', async () => {
    // Given: A table with mixed inputs
    const mockHook = createMockPasteTableResult({
      columns: createTestColumns(['text', 'number']),
      rows: createTestRows(1, 2),
    });

    const user = userEvent.setup();
    render(<PasteTable hook={mockHook} />);

    const cells = screen.getAllByRole('gridcell');
    const textInput = within(cells[0]).getByRole('textbox') as HTMLInputElement;

    // When: Ctrl+ArrowRight from text input (cursor in middle)
    await user.click(textInput);
    textInput.setSelectionRange(1, 1);
    await user.keyboard('{Control>}{ArrowRight}{/Control}');

    // Then: Focus moves regardless of cursor position
    expect(within(cells[1]).getByRole('spinbutton')).toHaveFocus();
  });

  it('should navigate up and down between rows', async () => {
    // Given: A table with multiple rows
    const mockHook = createMockPasteTableResult({
      columns: createTestColumns(['text']),
      rows: createTestRows(2, 1),
    });

    const user = userEvent.setup();
    render(<PasteTable hook={mockHook} />);

    const cells = screen.getAllByRole('gridcell');
    const row1Input = within(cells[0]).getByRole('textbox');

    // When: Press ArrowDown
    await user.click(row1Input);
    await user.keyboard('{ArrowDown}');

    // Then: Focus moves to next row
    const row2Input = within(cells[1]).getByRole('textbox');
    expect(row2Input).toHaveFocus();

    // When: Press ArrowUp
    await user.keyboard('{ArrowUp}');

    // Then: Focus moves back to first row
    expect(row1Input).toHaveFocus();
  });
});
