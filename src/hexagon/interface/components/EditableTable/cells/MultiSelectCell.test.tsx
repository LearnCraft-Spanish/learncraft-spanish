import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { CellRenderProps } from '@interface/components/EditableTable/types';
import { MultiSelectCell } from '@interface/components/EditableTable/cells/MultiSelectCell';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

function createMockProps(
  overrides: Partial<CellRenderProps> = {},
): CellRenderProps {
  const column: ColumnDefinition = { id: 'tags', type: 'multi-select' };
  const row: TableRow = { id: 'row-1', cells: {} };

  return {
    column,
    row,
    display: { id: 'tags', label: 'Tags' },
    value: 'travel, food',
    isDirty: false,
    isActive: false,
    isEditable: true,
    onChange: vi.fn(),
    onFocus: vi.fn(),
    onBlur: vi.fn(),
    cellRef: vi.fn(),
    ...overrides,
  };
}

describe('multiSelectCell', () => {
  it('shows the comma-separated value in a labelled text field', () => {
    render(<MultiSelectCell {...createMockProps()} />);

    expect(screen.getByRole('textbox', { name: 'Tags' })).toHaveValue(
      'travel, food',
    );
  });

  it('reports the whole new comma-separated text when it is edited', () => {
    const onChange = vi.fn();
    render(<MultiSelectCell {...createMockProps({ onChange })} />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Tags' }), {
      target: { value: 'travel, food, music' },
    });

    expect(onChange).toHaveBeenCalledExactlyOnceWith('travel, food, music');
  });

  it('reports focus and blur of the field', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<MultiSelectCell {...createMockProps({ onFocus, onBlur })} />);

    await user.click(screen.getByRole('textbox', { name: 'Tags' }));
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).not.toHaveBeenCalled();

    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('registers the field with cellRef so the table can focus it', () => {
    const cellRef = vi.fn();
    render(<MultiSelectCell {...createMockProps({ cellRef })} />);

    expect(cellRef).toHaveBeenCalledWith(
      screen.getByRole('textbox', { name: 'Tags' }),
    );
  });
});
