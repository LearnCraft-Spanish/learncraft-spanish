import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { CellRenderProps } from '@interface/components/EditableTable/types';
import { SelectCell } from '@interface/components/EditableTable/cells/SelectCell';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Helper function to create mock props
function createMockProps(
  overrides: Partial<CellRenderProps> = {},
): CellRenderProps {
  const defaultColumn: ColumnDefinition = {
    id: 'test-column',
    type: 'select',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
  };

  const defaultRow: TableRow = {
    id: 'test-row',
    cells: {}, // Unused in this component
  };

  const defaultDisplay = {
    id: 'test-column',
    label: 'Test Select Field',
    placeholder: 'Select an option',
  };

  return {
    column: defaultColumn,
    row: defaultRow,
    display: defaultDisplay,
    value: 'option1',
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

describe('selectCell', () => {
  describe('with options', () => {
    it('should display the current value', () => {
      const props = createMockProps({
        value: 'option2',
      });

      render(<SelectCell {...props} />);

      const select = screen.getByLabelText(
        'Test Select Field',
      ) as HTMLSelectElement;
      expect(select.value).toBe('option2');
    });

    it('should display empty value when no option is selected', () => {
      const props = createMockProps({
        value: '',
      });

      render(<SelectCell {...props} />);

      const select = screen.getByLabelText(
        'Test Select Field',
      ) as HTMLSelectElement;
      expect(select.value).toBe('');
    });

    it('should call onChange with the new value when selection changes', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      const props = createMockProps({
        value: '',
        onChange: mockOnChange,
      });

      render(<SelectCell {...props} />);

      const select = screen.getByLabelText('Test Select Field');
      await user.selectOptions(select, 'option2');

      expect(mockOnChange).toHaveBeenCalledWith('option2');
    });

    it('should display all provided options', () => {
      const props = createMockProps();

      render(<SelectCell {...props} />);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should display a default "Select..." option', () => {
      const props = createMockProps();

      render(<SelectCell {...props} />);

      expect(screen.getByText('Select...')).toBeInTheDocument();
    });

    it('should handle single option', () => {
      const props = createMockProps({
        column: {
          id: 'test-column',
          type: 'select',
          options: [{ value: 'only', label: 'Only Option' }],
        },
      });

      render(<SelectCell {...props} />);

      expect(screen.getByText('Only Option')).toBeInTheDocument();
      expect(screen.getByText('Select...')).toBeInTheDocument();
    });
  });

  describe('without options (fallback)', () => {
    it('should render a text input when no options are provided', () => {
      const props = createMockProps({
        column: {
          id: 'test-column',
          type: 'select',
          // No options
        },
      });

      const { container } = render(<SelectCell {...props} />);

      const input = container.querySelector(
        'input[type="text"]',
      ) as HTMLInputElement;
      expect(input).toBeInTheDocument();
    });

    it('should display the value in text input when no options', () => {
      const props = createMockProps({
        value: 'custom-value',
        column: {
          id: 'test-column',
          type: 'select',
        },
      });

      render(<SelectCell {...props} />);

      const input = screen.getByLabelText(
        'Test Select Field',
      ) as HTMLInputElement;
      expect(input.value).toBe('custom-value');
    });

    it('should call onChange when text input changes', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      const props = createMockProps({
        value: '',
        onChange: mockOnChange,
        column: {
          id: 'test-column',
          type: 'select',
        },
      });

      render(<SelectCell {...props} />);

      const input = screen.getByLabelText('Test Select Field');
      await user.type(input, 'abc');

      expect(mockOnChange).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalledWith('a');
      expect(mockOnChange).toHaveBeenCalledWith('b');
      expect(mockOnChange).toHaveBeenCalledWith('c');
    });

    it('should display placeholder in text input fallback', () => {
      const props = createMockProps({
        value: '',
        display: {
          id: 'test-column',
          label: 'Test Select Field',
          placeholder: 'Enter value',
        },
        column: {
          id: 'test-column',
          type: 'select',
        },
      });

      render(<SelectCell {...props} />);

      const input = screen.getByLabelText(
        'Test Select Field',
      ) as HTMLInputElement;
      expect(input.placeholder).toBe('Enter value');
    });
  });
});
