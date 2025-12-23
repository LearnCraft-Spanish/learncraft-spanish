import type {
  ColumnDefinition,
  TableRow as TableRowType,
  ValidationState,
} from '@domain/PasteTable';
import type { ColumnDisplayConfig } from '@interface/components/EditableTable/types';
import { TableRow } from '@interface/components/PasteTable/TableRow';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Helper to create test props
const createTestProps = (overrides?: {
  row?: Partial<TableRowType>;
  activeCell?: { rowId: string; columnId: string } | null;
  validationState?: Partial<ValidationState>;
}) => {
  const defaultRow: TableRowType = {
    id: 'row-1',
    cells: {
      col1: 'value1',
      col2: 'value2',
    },
  };

  const defaultColumns: ColumnDefinition[] = [
    { id: 'col1', type: 'text' },
    { id: 'col2', type: 'text' },
  ];

  const defaultDisplayConfig: ColumnDisplayConfig[] = [
    { id: 'col1', label: 'Column 1', width: '1fr' },
    { id: 'col2', label: 'Column 2', width: '1fr' },
  ];

  const defaultValidationState: ValidationState = {
    isValid: true,
    errors: {},
  };

  return {
    row: { ...defaultRow, ...overrides?.row } as TableRowType,
    columns: defaultColumns,
    displayConfig: defaultDisplayConfig,
    activeCell: overrides?.activeCell ?? null,
    validationState: {
      ...defaultValidationState,
      ...overrides?.validationState,
    } as ValidationState,
    getAriaLabel: vi.fn((columnId: string, rowId: string) => {
      return `${columnId} input for row ${rowId}`;
    }),
    cellHandlers: {
      onChange: vi.fn(),
      onFocus: vi.fn(),
      onBlur: vi.fn(),
    },
    registerCellRef: vi.fn(),
    rowIndex: 2,
  };
};

describe('tableRow', () => {
  it('should display error message when cell has error AND is active', () => {
    // Given: A TableRow with validation errors and active cell
    const props = createTestProps({
      validationState: {
        isValid: false,
        errors: { 'row-1': { col2: 'This field is required' } },
      },
      activeCell: { rowId: 'row-1', columnId: 'col2' },
    });

    // When: Component renders
    render(<TableRow {...props} />);

    // Then: Error message is visible
    const errorDiv = screen.getByText('This field is required');
    expect(errorDiv).toBeInTheDocument();
    expect(errorDiv).toHaveClass('paste-table__cell-error');
  });

  it('should NOT display error message when cell has error but is NOT active', () => {
    // Given: A TableRow with validation errors but different active cell
    const props = createTestProps({
      validationState: {
        isValid: false,
        errors: { 'row-1': { col2: 'This field is required' } },
      },
      activeCell: { rowId: 'row-1', columnId: 'col1' },
    });

    // When: Component renders
    render(<TableRow {...props} />);

    // Then: Error message is NOT visible
    expect(
      screen.queryByText('This field is required'),
    ).not.toBeInTheDocument();
  });

  it('should hide error message when cell becomes inactive', () => {
    // Given: A TableRow with error showing
    const props = createTestProps({
      validationState: {
        isValid: false,
        errors: { 'row-1': { col2: 'This field is required' } },
      },
      activeCell: { rowId: 'row-1', columnId: 'col2' },
    });

    const { rerender } = render(<TableRow {...props} />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();

    // When: Active cell changes
    rerender(
      <TableRow {...props} activeCell={{ rowId: 'row-1', columnId: 'col1' }} />,
    );

    // Then: Error message disappears
    expect(
      screen.queryByText('This field is required'),
    ).not.toBeInTheDocument();
  });

  it('should render all cells with correct values', () => {
    // Given: A row with cell values
    const props = createTestProps({
      row: { id: 'row-1', cells: { col1: 'Alice', col2: 'Smith' } },
    });

    // When: Component renders
    render(<TableRow {...props} />);

    // Then: Cell values are displayed
    const cells = screen.getAllByRole('gridcell');
    const col1Input = within(cells[0]).getByRole('textbox') as HTMLInputElement;
    const col2Input = within(cells[1]).getByRole('textbox') as HTMLInputElement;

    expect(col1Input.value).toBe('Alice');
    expect(col2Input.value).toBe('Smith');
  });

  it('should apply active class to active cell container', () => {
    // Given: A TableRow with an active cell
    const props = createTestProps({
      activeCell: { rowId: 'row-1', columnId: 'col1' },
    });

    // When: Component renders
    render(<TableRow {...props} />);

    // Then: Active cell has active class, inactive cell does not
    const cells = screen.getAllByRole('gridcell');
    expect(cells[0]).toHaveClass('paste-table__cell-container--active');
    expect(cells[1]).not.toHaveClass('paste-table__cell-container--active');
  });
});
