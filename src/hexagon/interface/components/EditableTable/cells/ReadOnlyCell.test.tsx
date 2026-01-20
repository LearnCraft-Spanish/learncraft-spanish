import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { CellRenderProps } from '@interface/components/EditableTable/types';
import { ReadOnlyCell } from '@interface/components/EditableTable/cells/ReadOnlyCell';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
// Helper function to create mock props
function createMockProps(
  overrides: Partial<CellRenderProps> = {},
): CellRenderProps {
  const defaultColumn: ColumnDefinition = {
    id: 'test-column',
    type: 'read-only',
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

describe('readOnlyCell', () => {
  it('should render a read-only cell', () => {
    const props = createMockProps({
      value: 'test',
    });
    const { container } = render(<ReadOnlyCell {...props} />);
    const cell = container.querySelector('.paste-table__cell-readonly');
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveTextContent('test');
  });
});
