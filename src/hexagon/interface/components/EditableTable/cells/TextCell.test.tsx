import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { CellRenderProps } from '@interface/components/EditableTable/types';
import { TextCell } from '@interface/components/EditableTable/cells/TextCell';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Helper function to create mock props
function createMockProps(
  overrides: Partial<CellRenderProps> = {},
): CellRenderProps {
  const defaultColumn: ColumnDefinition = {
    id: 'test-column',
    type: 'text',
  };

  const defaultRow: TableRow = {
    id: 'test-row',
    cells: {}, // Unused in this component
  };

  const defaultDisplay = {
    id: 'test-column',
    label: 'Test Text Field',
    placeholder: 'Enter text',
  };

  return {
    column: defaultColumn,
    row: defaultRow,
    display: defaultDisplay,
    value: 'Initial value',
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

describe('textCell', () => {
  it('should display placeholder text when provided', () => {
    const props = createMockProps({
      value: '',
      display: {
        id: 'test-column',
        label: 'Test Text Field',
        placeholder: 'Enter your name',
      },
    });

    render(<TextCell {...props} />);

    const input = screen.getByLabelText('Test Text Field') as HTMLInputElement;
    expect(input.placeholder).toBe('Enter your name');
  });

  it('should display the current value', () => {
    const props = createMockProps({
      value: 'Hello World',
    });

    render(<TextCell {...props} />);

    const input = screen.getByLabelText('Test Text Field') as HTMLInputElement;
    expect(input.value).toBe('Hello World');
  });

  it('should call onChange with the new value when text is typed', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    const props = createMockProps({
      value: '',
      onChange: mockOnChange,
    });

    render(<TextCell {...props} />);

    const input = screen.getByLabelText('Test Text Field');
    await user.type(input, 'test');

    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledWith('t');
    expect(mockOnChange).toHaveBeenCalledWith('e');
    expect(mockOnChange).toHaveBeenCalledWith('s');
    expect(mockOnChange).toHaveBeenCalledWith('t');
  });
});
