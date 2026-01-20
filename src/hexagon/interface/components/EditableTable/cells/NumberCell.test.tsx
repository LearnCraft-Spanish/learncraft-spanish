import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { CellRenderProps } from '@interface/components/EditableTable/types';
import { NumberCell } from '@interface/components/EditableTable/cells/NumberCell';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Helper function to create mock props
function createMockProps(
  overrides: Partial<CellRenderProps> = {},
): CellRenderProps {
  const defaultColumn: ColumnDefinition = {
    id: 'test-column',
    type: 'number',
  };

  const defaultRow: TableRow = {
    id: 'test-row',
    cells: {}, // Unused in this component
  };

  const defaultDisplay = {
    id: 'test-column',
    label: 'Test Number Field',
    placeholder: 'Enter number',
  };

  return {
    column: defaultColumn,
    row: defaultRow,
    display: defaultDisplay,
    value: '42',
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

describe('numberCell', () => {
  it('should display the current value', () => {
    const props = createMockProps({
      value: '123',
    });

    render(<NumberCell {...props} />);

    const input = screen.getByLabelText(
      'Test Number Field',
    ) as HTMLInputElement;
    expect(input.value).toBe('123');
  });

  it('should display empty value when no number is set', () => {
    const props = createMockProps({
      value: '',
    });

    render(<NumberCell {...props} />);

    const input = screen.getByLabelText(
      'Test Number Field',
    ) as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should call onChange with the new value when input changes', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    const props = createMockProps({
      value: '',
      onChange: mockOnChange,
    });

    render(<NumberCell {...props} />);

    const input = screen.getByLabelText('Test Number Field');
    await user.type(input, '789');

    expect(mockOnChange).toHaveBeenCalled();
    // Check that it was called with each character
    expect(mockOnChange).toHaveBeenCalledWith('7');
    expect(mockOnChange).toHaveBeenCalledWith('8');
    expect(mockOnChange).toHaveBeenCalledWith('9');
  });

  it('should set both min and max attributes when both are defined', () => {
    const props = createMockProps({
      column: {
        id: 'test-column',
        type: 'number',
        min: 10,
        max: 90,
      },
    });

    render(<NumberCell {...props} />);

    const input = screen.getByLabelText(
      'Test Number Field',
    ) as HTMLInputElement;
    expect(input.min).toBe('10');
    expect(input.max).toBe('90');
  });

  it('should not set min attribute when column has no min defined', () => {
    const props = createMockProps({
      column: {
        id: 'test-column',
        type: 'number',
      },
    });

    render(<NumberCell {...props} />);

    const input = screen.getByLabelText(
      'Test Number Field',
    ) as HTMLInputElement;
    expect(input.min).toBe('');
  });

  it('should not set max attribute when column has no max defined', () => {
    const props = createMockProps({
      column: {
        id: 'test-column',
        type: 'number',
      },
    });

    render(<NumberCell {...props} />);

    const input = screen.getByLabelText(
      'Test Number Field',
    ) as HTMLInputElement;
    expect(input.max).toBe('');
  });

  it('should display placeholder text when provided', () => {
    const props = createMockProps({
      value: '',
      display: {
        id: 'test-column',
        label: 'Test Number Field',
        placeholder: 'Enter a number',
      },
    });

    render(<NumberCell {...props} />);

    const input = screen.getByLabelText(
      'Test Number Field',
    ) as HTMLInputElement;
    expect(input.placeholder).toBe('Enter a number');
  });
});
