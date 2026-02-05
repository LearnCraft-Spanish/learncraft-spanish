import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { ColumnDisplayConfig } from '@interface/components/EditableTable/types';
import { EditableTableRow } from '@interface/components/EditableTable/components/EditableTableRow';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('editableTableRow', () => {
  const columns: ColumnDefinition[] = [
    { id: 'name', type: 'text' },
    { id: 'active', type: 'boolean' },
  ];

  const row: TableRow = {
    id: 'row-1',
    cells: {
      name: 'Test Name',
      active: 'true',
    },
  };

  const displayConfig: Record<string, ColumnDisplayConfig> = {
    name: { id: 'name', label: 'Name' },
    active: { id: 'active', label: 'Active' },
  };

  const getDisplay = (columnId: string) => displayConfig[columnId];

  it('should call renderCell with correct props for each column', () => {
    const mockRenderCell = vi.fn(() => <div>Cell</div>);

    render(
      <table>
        <tbody>
          <EditableTableRow
            row={row}
            rowIndex={0}
            columns={columns}
            getDisplay={getDisplay}
            dirtyRowIds={new Set()}
            validationErrors={{}}
            activeCell={null}
            onCellChange={vi.fn()}
            onFocus={vi.fn()}
            onBlur={vi.fn()}
            createCellRef={vi.fn(() => vi.fn())}
            renderCell={mockRenderCell}
          />
        </tbody>
      </table>,
    );

    expect(mockRenderCell).toHaveBeenCalledTimes(2);

    // Check first cell (name)
    expect(mockRenderCell).toHaveBeenCalledWith(
      expect.objectContaining({
        row,
        column: columns[0],
        display: displayConfig.name,
        value: 'Test Name',
        isDirty: false,
        error: undefined,
        isActive: false,
        isEditable: true,
      }),
    );

    // Check second cell (active)
    expect(mockRenderCell).toHaveBeenCalledWith(
      expect.objectContaining({
        row,
        column: columns[1],
        display: displayConfig.active,
        value: 'true',
        isDirty: false,
        error: undefined,
        isActive: false,
        isEditable: true,
      }),
    );
  });

  it('should pass error and isActive when cell matches activeCell', () => {
    const mockRenderCell = vi.fn(() => <div>Cell</div>);
    const validationErrors = {
      'row-1': {
        name: 'This field is required',
      },
    };

    render(
      <table>
        <tbody>
          <EditableTableRow
            row={row}
            rowIndex={0}
            columns={columns}
            getDisplay={getDisplay}
            dirtyRowIds={new Set()}
            validationErrors={validationErrors}
            activeCell={{ rowId: 'row-1', columnId: 'name' }}
            onCellChange={vi.fn()}
            onFocus={vi.fn()}
            onBlur={vi.fn()}
            createCellRef={vi.fn(() => vi.fn())}
            renderCell={mockRenderCell}
          />
        </tbody>
      </table>,
    );

    // First cell should be active and have error
    expect(mockRenderCell).toHaveBeenCalledWith(
      expect.objectContaining({
        column: columns[0],
        isActive: true,
        error: 'This field is required',
      }),
    );

    // Second cell should not be active
    expect(mockRenderCell).toHaveBeenCalledWith(
      expect.objectContaining({
        column: columns[1],
        isActive: false,
        error: undefined,
      }),
    );
  });
});
