import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type {
  CellRenderProps,
  ColumnDisplayConfig,
} from '@interface/components/EditableTable/types';
import type React from 'react';
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

  it('applies the pinned class and style to pinned cells only', () => {
    const getPinnedCell = (columnId: string) =>
      columnId === 'active'
        ? { className: 'pinnedRight', style: { right: '0px' } }
        : undefined;

    const { container } = render(
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
            renderCell={() => <div>Cell</div>}
            getPinnedCell={getPinnedCell}
          />
        </tbody>
      </table>,
    );

    const [nameCell, activeCell] = container.querySelectorAll('td');
    expect(nameCell).not.toHaveClass('pinnedRight');
    expect(activeCell).toHaveClass(
      'paste-table__cell-container',
      'pinnedRight',
    );
    expect(activeCell).toHaveStyle({ right: '0px' });
  });

  describe('cell state and handlers', () => {
    type RowProps = React.ComponentProps<typeof EditableTableRow>;

    function renderRow(overrides: Partial<RowProps> = {}) {
      const renderCell = vi.fn((_props: CellRenderProps) => <div>Cell</div>);
      const props: RowProps = {
        row,
        rowIndex: 0,
        columns,
        getDisplay,
        dirtyRowIds: new Set(),
        validationErrors: {},
        activeCell: null,
        onCellChange: vi.fn(),
        onFocus: vi.fn(),
        onBlur: vi.fn(),
        createCellRef: vi.fn(() => vi.fn()),
        renderCell,
        ...overrides,
      };
      const view = render(
        <table>
          <tbody>
            <EditableTableRow {...props} />
          </tbody>
        </table>,
      );
      return { ...view, props, renderCell };
    }

    function propsFor(
      renderCell: ReturnType<typeof renderRow>['renderCell'],
      columnId: string,
    ): CellRenderProps {
      const call = renderCell.mock.calls.find(
        ([cellProps]) => cellProps.column.id === columnId,
      );
      if (!call) throw new Error(`No cell rendered for ${columnId}`);
      return call[0];
    }

    it('marks every cell of a row listed in dirtyRowIds as dirty, and no others', () => {
      const dirty = renderRow({ dirtyRowIds: new Set(['row-1']) });
      expect(propsFor(dirty.renderCell, 'name').isDirty).toBe(true);
      expect(propsFor(dirty.renderCell, 'active').isDirty).toBe(true);

      const other = renderRow({ dirtyRowIds: new Set(['row-2']) });
      expect(propsFor(other.renderCell, 'name').isDirty).toBe(false);
    });

    it('gives a cell only the error for its own row and column', () => {
      const { renderCell } = renderRow({
        validationErrors: {
          'row-1': { active: 'Must be true or false' },
          'row-2': { name: 'Belongs to another row' },
        },
      });

      expect(propsFor(renderCell, 'active').error).toBe(
        'Must be true or false',
      );
      expect(propsFor(renderCell, 'name').error).toBeUndefined();
    });

    it('gives a cell an empty value when the row has nothing for its column', () => {
      const { renderCell } = renderRow({
        row: { id: 'row-1', cells: { name: 'Test Name' } },
      });

      expect(propsFor(renderCell, 'name').value).toBe('Test Name');
      expect(propsFor(renderCell, 'active').value).toBe('');
    });

    it('treats a column as read-only only when it says editable: false', () => {
      const { renderCell } = renderRow({
        columns: [
          { id: 'name', type: 'text', editable: false },
          { id: 'active', type: 'boolean', editable: true },
          { id: 'other', type: 'text' },
        ],
        getDisplay: (id) => ({ id, label: id }),
      });

      expect(propsFor(renderCell, 'name').isEditable).toBe(false);
      expect(propsFor(renderCell, 'active').isEditable).toBe(true);
      expect(propsFor(renderCell, 'other').isEditable).toBe(true);
    });

    it('marks only the active cell as selected', () => {
      const { container } = renderRow({
        activeCell: { rowId: 'row-1', columnId: 'active' },
      });

      const [nameCell, activeCell] = container.querySelectorAll('td');
      expect(nameCell).not.toHaveAttribute('aria-selected');
      expect(activeCell).toHaveAttribute('aria-selected', 'true');
    });

    it('does not mark a cell active when the same column is active in another row', () => {
      const { renderCell, container } = renderRow({
        activeCell: { rowId: 'row-2', columnId: 'name' },
      });

      expect(propsFor(renderCell, 'name').isActive).toBe(false);
      expect(container.querySelector('[aria-selected]')).toBeNull();
    });

    it('does not mark a cell active when another column of its row is active', () => {
      const { renderCell } = renderRow({
        activeCell: { rowId: 'row-1', columnId: 'active' },
      });

      expect(propsFor(renderCell, 'name').isActive).toBe(false);
      expect(propsFor(renderCell, 'active').isActive).toBe(true);
    });

    it('reports an edit with the row id, column id and new value', () => {
      const { renderCell, props } = renderRow();

      propsFor(renderCell, 'active').onChange('false');

      expect(props.onCellChange).toHaveBeenCalledExactlyOnceWith(
        'row-1',
        'active',
        'false',
      );
    });

    it('reports focus with the row id and column id', () => {
      const { renderCell, props } = renderRow();

      propsFor(renderCell, 'active').onFocus();

      expect(props.onFocus).toHaveBeenCalledExactlyOnceWith('row-1', 'active');
    });

    it('reports blur when the blurred cell is the active one', () => {
      const { renderCell, props } = renderRow({
        activeCell: { rowId: 'row-1', columnId: 'name' },
      });

      propsFor(renderCell, 'name').onBlur();

      expect(props.onBlur).toHaveBeenCalledTimes(1);
    });

    it('ignores blur from a cell that is not the active one', () => {
      const { renderCell, props } = renderRow({
        activeCell: { rowId: 'row-1', columnId: 'name' },
      });

      // Focus already moved to another column; the old cell's late blur must
      // not clear the new active cell.
      propsFor(renderCell, 'active').onBlur();

      expect(props.onBlur).not.toHaveBeenCalled();
    });

    it('ignores blur when no cell is active, or the active cell is in another row', () => {
      const idle = renderRow({ activeCell: null });
      propsFor(idle.renderCell, 'name').onBlur();
      expect(idle.props.onBlur).not.toHaveBeenCalled();

      const elsewhere = renderRow({
        activeCell: { rowId: 'row-2', columnId: 'name' },
      });
      propsFor(elsewhere.renderCell, 'name').onBlur();
      expect(elsewhere.props.onBlur).not.toHaveBeenCalled();
    });

    it('asks for a cell ref per cell, keyed by row id and column id', () => {
      const cellRefFor = vi.fn(() => vi.fn());
      renderRow({ createCellRef: cellRefFor });

      expect(cellRefFor).toHaveBeenCalledWith('row-1', 'name');
      expect(cellRefFor).toHaveBeenCalledWith('row-1', 'active');
    });

    it('renders what renderCell returns inside each cell', () => {
      const { container } = renderRow({
        renderCell: ({ value }) => <span>{`value: ${value}`}</span>,
      });

      const [nameCell, activeCell] = container.querySelectorAll('td');
      expect(nameCell).toHaveTextContent('value: Test Name');
      expect(activeCell).toHaveTextContent('value: true');
    });
  });
});
