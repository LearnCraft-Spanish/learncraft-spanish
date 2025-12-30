import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { CellRenderProps } from '@interface/components/EditableTable/types';
import { DateCell } from '@interface/components/EditableTable/cells/DateCell';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Helper function to create mock props
function createMockProps(
  overrides: Partial<CellRenderProps> = {},
): CellRenderProps {
  const defaultColumn: ColumnDefinition = {
    id: 'test-column',
    type: 'date',
  };

  const defaultRow: TableRow = {
    id: 'test-row',
    cells: {}, // Unused in this component
  };

  const defaultDisplay = {
    id: 'test-column',
    label: 'Test Date Field',
    placeholder: 'Select date',
  };

  return {
    column: defaultColumn,
    row: defaultRow,
    display: defaultDisplay,
    value: '2025-01-15',
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

describe('dateCell', () => {
  it('should render a date input', () => {
    const props = createMockProps();

    const { container } = render(<DateCell {...props} />);

    const input = container.querySelector(
      'input[type="date"]',
    ) as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });

  it('should display the current value', () => {
    const props = createMockProps({
      value: '2025-12-25',
    });

    render(<DateCell {...props} />);

    const input = screen.getByLabelText('Test Date Field') as HTMLInputElement;
    expect(input.value).toBe('2025-12-25');
  });

  it('should display empty value when no date is set', () => {
    const props = createMockProps({
      value: '',
    });

    render(<DateCell {...props} />);

    const input = screen.getByLabelText('Test Date Field') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should call onChange with the new date value when input changes', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    const props = createMockProps({
      value: '',
      onChange: mockOnChange,
    });

    render(<DateCell {...props} />);

    const input = screen.getByLabelText('Test Date Field');
    await user.type(input, '2025-03-20');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should have proper accessibility label', () => {
    const props = createMockProps({
      display: {
        id: 'test-column',
        label: 'Birth Date',
        placeholder: 'Select date',
      },
    });

    render(<DateCell {...props} />);

    const input = screen.getByLabelText('Birth Date');
    expect(input).toBeInTheDocument();
  });

  it('should display placeholder text when provided', () => {
    const props = createMockProps({
      value: '',
      display: {
        id: 'test-column',
        label: 'Test Date Field',
        placeholder: 'YYYY-MM-DD',
      },
    });

    render(<DateCell {...props} />);

    const input = screen.getByLabelText('Test Date Field') as HTMLInputElement;
    expect(input.placeholder).toBe('YYYY-MM-DD');
  });
});
