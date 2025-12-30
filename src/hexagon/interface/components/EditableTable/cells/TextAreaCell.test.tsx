import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { CellRenderProps } from '@interface/components/EditableTable/types';
import { TextAreaCell } from '@interface/components/EditableTable/cells/TextAreaCell';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Helper function to create mock props
function createMockProps(
  overrides: Partial<CellRenderProps> = {},
): CellRenderProps {
  const defaultColumn: ColumnDefinition = {
    id: 'test-column',
    type: 'textarea',
  };

  const defaultRow: TableRow = {
    id: 'test-row',
    cells: {}, // Unused in this component
  };

  const defaultDisplay = {
    id: 'test-column',
    label: 'Test TextArea Field',
    placeholder: 'Enter text',
  };

  return {
    column: defaultColumn,
    row: defaultRow,
    display: defaultDisplay,
    value: 'Initial text',
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

describe('textAreaCell', () => {
  it('should display the current value', () => {
    const props = createMockProps({
      value: 'This is a test value',
    });

    render(<TextAreaCell {...props} />);

    const textarea = screen.getByLabelText(
      'Test TextArea Field',
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe('This is a test value');
  });

  it('should resize textarea and call onChange when text is typed', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    const props = createMockProps({
      value: '',
      onChange: mockOnChange,
    });

    render(<TextAreaCell {...props} />);

    const textarea = screen.getByLabelText(
      'Test TextArea Field',
    ) as HTMLTextAreaElement;

    // Mock scrollHeight to simulate content requiring more space
    Object.defineProperty(textarea, 'scrollHeight', {
      configurable: true,
      value: 100,
    });

    const initialHeight = textarea.style.height;

    await user.type(textarea, 'Hello');

    // Verify onChange was called
    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledWith('H');
    expect(mockOnChange).toHaveBeenCalledWith('e');
    expect(mockOnChange).toHaveBeenCalledWith('l');
    expect(mockOnChange).toHaveBeenCalledWith('l');
    expect(mockOnChange).toHaveBeenCalledWith('o');

    // Verify height was set (resizeTextarea was triggered)
    // The height should be set to scrollHeight (100px in our mock)
    expect(textarea.style.height).not.toBe(initialHeight);
  });

  it('should resize textarea when value changes', () => {
    const props = createMockProps({
      value: 'Short text',
    });

    const { rerender } = render(<TextAreaCell {...props} />);

    const textarea = screen.getByLabelText(
      'Test TextArea Field',
    ) as HTMLTextAreaElement;

    // Mock scrollHeight to simulate different content sizes
    Object.defineProperty(textarea, 'scrollHeight', {
      configurable: true,
      get() {
        return textarea.value.length * 2; // Simulate height based on content
      },
    });

    // Initial render should set height
    const initialHeight = textarea.style.height;

    // Change value to longer text
    rerender(
      <TextAreaCell
        {...props}
        value="This is a much longer text that should require more vertical space in the textarea"
      />,
    );

    // Height should be updated
    expect(textarea.style.height).not.toBe(initialHeight);
  });
});
