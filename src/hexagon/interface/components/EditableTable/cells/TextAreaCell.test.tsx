import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { CellRenderProps } from '@interface/components/EditableTable/types';
import { TextAreaCell } from '@interface/components/EditableTable/cells/TextAreaCell';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

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

  describe('auto-resize', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    // jsdom has no layout, so scrollHeight is simulated the way a browser
    // reports it: never less than the box's current height, otherwise the
    // height of the content (here, 2px per character).
    function simulateBrowserScrollHeight() {
      return vi
        .spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get')
        .mockImplementation(function (this: HTMLTextAreaElement) {
          const currentHeight = Number.parseFloat(this.style.height) || 0;
          return Math.max(currentHeight, this.value.length * 2);
        });
    }

    it('sizes the textarea to fit its content when first shown', () => {
      simulateBrowserScrollHeight();
      render(<TextAreaCell {...createMockProps({ value: 'x'.repeat(50) })} />);

      expect(screen.getByLabelText('Test TextArea Field')).toHaveStyle({
        height: '100px',
      });
    });

    it('grows when the value gets longer and shrinks when it gets shorter', () => {
      simulateBrowserScrollHeight();
      const { rerender } = render(
        <TextAreaCell {...createMockProps({ value: 'x'.repeat(50) })} />,
      );
      const textarea = screen.getByLabelText('Test TextArea Field');

      rerender(
        <TextAreaCell {...createMockProps({ value: 'x'.repeat(80) })} />,
      );
      expect(textarea).toHaveStyle({ height: '160px' });

      rerender(
        <TextAreaCell {...createMockProps({ value: 'x'.repeat(10) })} />,
      );
      expect(textarea).toHaveStyle({ height: '20px' });
    });
  });

  it('shows the column placeholder', () => {
    render(
      <TextAreaCell
        {...createMockProps({
          value: '',
          display: {
            id: 'test-column',
            label: 'Notes',
            placeholder: 'Add notes',
          },
        })}
      />,
    );

    expect(screen.getByLabelText('Notes')).toHaveAttribute(
      'placeholder',
      'Add notes',
    );
  });

  it('reports the whole new text when it changes', () => {
    const onChange = vi.fn();
    render(<TextAreaCell {...createMockProps({ value: '', onChange })} />);

    fireEvent.change(screen.getByLabelText('Test TextArea Field'), {
      target: { value: 'Pasted line one\nPasted line two' },
    });

    expect(onChange).toHaveBeenCalledExactlyOnceWith(
      'Pasted line one\nPasted line two',
    );
  });

  it('reports focus and blur of the textarea', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<TextAreaCell {...createMockProps({ onFocus, onBlur })} />);

    await user.click(screen.getByLabelText('Test TextArea Field'));
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).not.toHaveBeenCalled();

    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('registers the textarea with cellRef so the table can focus it', () => {
    const cellRef = vi.fn();
    render(<TextAreaCell {...createMockProps({ cellRef })} />);

    expect(cellRef).toHaveBeenCalledWith(
      screen.getByLabelText('Test TextArea Field'),
    );
  });
});
