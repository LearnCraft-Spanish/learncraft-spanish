import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { CellRenderProps } from '@interface/components/EditableTable/types';
import { BooleanCell } from '@interface/components/EditableTable/cells/BooleanCell';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Helper function to create mock props
function createMockProps(
  overrides: Partial<CellRenderProps> = {},
): CellRenderProps {
  const defaultColumn: ColumnDefinition = {
    id: 'test-column',
    type: 'boolean',
    booleanFormat: 'auto',
  };

  const defaultRow: TableRow = {
    id: 'test-row',
    cells: {}, // Unused in this component
  };

  const defaultDisplay = {
    id: 'test-column',
    label: 'Test Boolean Field',
    placeholder: 'Enter value',
  };

  return {
    column: defaultColumn,
    row: defaultRow,
    display: defaultDisplay,
    value: 'true',
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

describe('booleanCell', () => {
  describe('format: auto', () => {
    it('should render a ToggleSwitch when booleanFormat is "auto"', () => {
      const props = createMockProps();

      render(<BooleanCell {...props} />);

      // ToggleSwitch renders a checkbox input
      const checkbox = screen.getAllByRole('checkbox')[1];
      expect(checkbox).toBeInTheDocument();
    });

    it('should display ToggleSwitch as checked when value is "true"', () => {
      const props = createMockProps({
        value: 'true',
      });

      render(<BooleanCell {...props} />);

      const checkbox = screen.getAllByRole('checkbox')[1] as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should display ToggleSwitch as unchecked when value is "false"', () => {
      const props = createMockProps({
        value: 'false',
      });

      render(<BooleanCell {...props} />);

      const checkbox = screen.getAllByRole('checkbox')[1] as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('should call onChange with "false" when ToggleSwitch is clicked and value is "true"', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      const props = createMockProps({
        value: 'true',
        onChange: mockOnChange,
      });

      render(<BooleanCell {...props} />);

      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith('false');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange with "true" when ToggleSwitch is clicked and value is "false"', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      const props = createMockProps({
        value: 'false',
        onChange: mockOnChange,
      });

      render(<BooleanCell {...props} />);

      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith('true');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should have proper accessibility attributes', () => {
      const props = createMockProps({
        value: 'true',
        display: {
          id: 'test-column',
          label: 'Is Active',
          placeholder: 'Enter value',
        },
      });

      render(<BooleanCell {...props} />);

      const wrapper = screen.getAllByRole('checkbox', { name: 'Is Active' })[0];
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('format: other (text input)', () => {
    it('should render a text input when booleanFormat is not "auto"', () => {
      const props = createMockProps({
        value: 'y',
        column: {
          id: 'test-column',
          type: 'boolean',
          booleanFormat: 'y-n',
        },
      });

      render(<BooleanCell {...props} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render a checkbox input when booleanFormat is undefined', () => {
      const props = createMockProps({
        column: {
          id: 'test-column',
          type: 'boolean',
        },
      });

      render(<BooleanCell {...props} />);

      const input = screen.getAllByRole('checkbox')[0];
      expect(input).toBeInTheDocument();
    });

    it('should display the current value in text input', () => {
      const props = createMockProps({
        value: 'y',
        column: {
          id: 'test-column',
          type: 'boolean',
          booleanFormat: 'y-n',
        },
      });

      render(<BooleanCell {...props} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('y');
    });

    it('should call onChange with the new value when text input changes', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      const props = createMockProps({
        value: '',
        onChange: mockOnChange,
        column: {
          id: 'test-column',
          type: 'boolean',
          booleanFormat: 'y-n',
        },
      });

      render(<BooleanCell {...props} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'y');

      expect(mockOnChange).toHaveBeenCalled();
      // Check that it was called with each character
      expect(mockOnChange).toHaveBeenCalledWith('y');
    });

    it('should display placeholder text when provided', () => {
      const props = createMockProps({
        value: '',
        display: {
          id: 'test-column',
          label: 'Test Boolean Field',
          placeholder: 'Enter y or n',
        },
        column: {
          id: 'test-column',
          type: 'boolean',
          booleanFormat: 'y-n',
        },
      });

      render(<BooleanCell {...props} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.placeholder).toBe('Enter y or n');
    });
  });
});
