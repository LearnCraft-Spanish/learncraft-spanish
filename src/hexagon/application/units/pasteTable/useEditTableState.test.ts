import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { ClipboardEvent } from 'react';
import { useEditTableState } from '@application/units/pasteTable/useEditTableState';
import { act, renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Test columns
const testColumns: ColumnDefinition[] = [
  {
    id: 'id',
    type: 'number',
  },
  {
    id: 'name',
    type: 'text',
  },
  {
    id: 'value',
    type: 'number',
  },
];

// Helper to create mock clipboard event
const createMockClipboardEvent = (text: string): ClipboardEvent<Element> => {
  return {
    preventDefault: vi.fn(),
    clipboardData: {
      getData: vi.fn().mockReturnValue(text),
    },
  } as unknown as ClipboardEvent<Element>;
};

describe('useEditTableState', () => {
  const sourceRows: TableRow[] = [
    {
      id: 'row-1',
      cells: { id: '1', name: 'Item 1', value: '10' },
    },
    {
      id: 'row-2',
      cells: { id: '2', name: 'Item 2', value: '20' },
    },
    {
      id: 'row-3',
      cells: { id: '3', name: 'Item 3', value: '30' },
    },
  ];

  describe('initialization', () => {
    it('should initialize with source rows (no ghost row)', () => {
      const { result } = renderHook(() =>
        useEditTableState({
          columns: testColumns,
          sourceRows,
        }),
      );

      expect(result.current.data.rows).toHaveLength(3);
      expect(result.current.data.rows[0].cells.name).toBe('Item 1');
    });

    it('should not have unsaved changes initially', () => {
      const { result } = renderHook(() =>
        useEditTableState({
          columns: testColumns,
          sourceRows,
        }),
      );

      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe('updateCell and dirty tracking', () => {
    it('should mark row as dirty when cell is modified', async () => {
      const { result } = renderHook(() =>
        useEditTableState({
          columns: testColumns,
          sourceRows,
        }),
      );

      const rowId = result.current.data.rows[0].id;

      act(() => {
        result.current.updateCell(rowId, 'name', 'Modified Name');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });
    });

    it('should clear dirty state when cell reverts to original value', async () => {
      const { result } = renderHook(() =>
        useEditTableState({
          columns: testColumns,
          sourceRows,
        }),
      );

      const rowId = result.current.data.rows[0].id;

      // Modify the cell
      act(() => {
        result.current.updateCell(rowId, 'name', 'Modified Name');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Revert to original value
      act(() => {
        result.current.updateCell(rowId, 'name', 'Item 1');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(false);
      });
    });
  });

  describe('discardChanges', () => {
    it('should revert all changes to source data', async () => {
      const { result } = renderHook(() =>
        useEditTableState({
          columns: testColumns,
          sourceRows,
        }),
      );

      const rowId = result.current.data.rows[0].id;

      // Make changes
      act(() => {
        result.current.updateCell(rowId, 'name', 'Modified Name');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Discard changes
      act(() => {
        result.current.discardChanges();
      });

      // Should be back to original
      expect(result.current.data.rows[0].cells.name).toBe('Item 1');
      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe('setRowsViaDiffs', () => {
    it('should compute diffs from new rows against source', async () => {
      const { result } = renderHook(() =>
        useEditTableState({
          columns: testColumns,
          sourceRows,
        }),
      );

      // Import rows with changes
      const newRows: TableRow[] = [
        {
          id: 'row-1',
          cells: { id: '1', name: 'Imported Item 1', value: '10' },
        },
        {
          id: 'row-2',
          cells: { id: '2', name: 'Item 2', value: '20' }, // Same as source - no diff
        },
        {
          id: 'row-3',
          cells: { id: '3', name: 'Imported Item 3', value: '30' },
        },
      ];

      act(() => {
        result.current.setRowsViaDiffs(newRows);
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Still 3 rows (from source)
      expect(result.current.data.rows).toHaveLength(3);
      // Row 1 has imported value (different from source)
      expect(result.current.data.rows[0].cells.name).toBe('Imported Item 1');
      // Row 2 matches source, so no diff
      expect(result.current.data.rows[1].cells.name).toBe('Item 2');
      // Row 3 has imported value
      expect(result.current.data.rows[2].cells.name).toBe('Imported Item 3');
    });
  });

  describe('handlePaste in edit mode', () => {
    it('should update existing rows by ID match', async () => {
      const { result } = renderHook(() =>
        useEditTableState({
          columns: testColumns,
          sourceRows,
        }),
      );

      // Paste data that matches ID 1
      const tsvData = '1\tUpdated Name\t100';
      const event = createMockClipboardEvent(tsvData);

      act(() => {
        result.current.handlePaste(event);
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // Row with ID 1 should be updated
      const row1 = result.current.data.rows.find((r) => r.cells.id === '1');
      expect(row1?.cells.name).toBe('Updated Name');
      expect(row1?.cells.value).toBe('100');
    });

    it('should not create new rows in edit mode', () => {
      const { result } = renderHook(() =>
        useEditTableState({
          columns: testColumns,
          sourceRows,
        }),
      );

      // Paste data with non-matching ID
      const tsvData = '999\tNew Item\t999';
      const event = createMockClipboardEvent(tsvData);

      act(() => {
        result.current.handlePaste(event);
      });

      // Should still have only 3 rows
      expect(result.current.data.rows).toHaveLength(3);
    });
  });

  describe('getDirtyRows', () => {
    it('should return only rows with changes', async () => {
      const { result } = renderHook(() =>
        useEditTableState({
          columns: testColumns,
          sourceRows,
        }),
      );

      const rowId1 = result.current.data.rows[0].id;

      // Modify row 1
      act(() => {
        result.current.updateCell(rowId1, 'name', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(true);
      });

      // getDirtyRows should return only row 1
      const dirtyRows = result.current.getDirtyRows();
      expect(dirtyRows).toHaveLength(1);
      expect(dirtyRows[0].id).toBe(rowId1);
      expect(dirtyRows[0].cells.name).toBe('Modified');
    });
  });

  describe('reactive source data updates', () => {
    it('should update non-dirty rows when sourceRows changes', async () => {
      const initialSourceRows: TableRow[] = [
        {
          id: 'row-1',
          cells: { id: '1', name: 'Original', value: '10' },
        },
      ];

      const { result, rerender } = renderHook(
        ({ sourceRows: sr }) =>
          useEditTableState({
            columns: testColumns,
            sourceRows: sr,
          }),
        { initialProps: { sourceRows: initialSourceRows } },
      );

      expect(result.current.data.rows[0].cells.name).toBe('Original');

      // Simulate React Query updating sourceRows
      const updatedSourceRows: TableRow[] = [
        {
          id: 'row-1',
          cells: { id: '1', name: 'Updated from Server', value: '10' },
        },
      ];

      rerender({ sourceRows: updatedSourceRows });

      // Non-dirty row should update
      await waitFor(() => {
        expect(result.current.data.rows[0].cells.name).toBe(
          'Updated from Server',
        );
      });
    });
  });

  describe('computeDerivedFields', () => {
    it('should recompute derived fields after merging', () => {
      const computeDerivedFields = vi.fn((row: TableRow) => {
        return {
          computed: `computed-${row.cells.name}`,
        };
      });

      const { result } = renderHook(() =>
        useEditTableState({
          columns: testColumns,
          sourceRows,
          computeDerivedFields,
        }),
      );

      // Derived fields should be computed
      expect(computeDerivedFields).toHaveBeenCalled();
      const row = result.current.data.rows[0];
      expect(row.cells.computed).toBe('computed-Item 1');
    });
  });

  describe('updateCell return value', () => {
    it('returns null because edit mode has no ghost row conversion', () => {
      const { result } = renderHook(() =>
        useEditTableState({ columns: testColumns, sourceRows }),
      );

      let returned: null | undefined;
      act(() => {
        returned = result.current.updateCell('row-1', 'name', 'Changed');
      });

      expect(returned).toBeNull();
    });
  });

  describe('dirtyRowIds and diffs', () => {
    it('exposes the changed row ids and only the changed cells', () => {
      const { result } = renderHook(() =>
        useEditTableState({ columns: testColumns, sourceRows }),
      );

      act(() => {
        result.current.updateCell('row-2', 'name', 'Changed');
      });

      expect(result.current.dirtyRowIds).toEqual(new Set(['row-2']));
      expect(result.current.diffs.get('row-2')).toEqual({ name: 'Changed' });
      expect(result.current.diffs.has('row-1')).toBe(false);
    });

    it('does not change the source rows it was given', () => {
      const { result } = renderHook(() =>
        useEditTableState({ columns: testColumns, sourceRows }),
      );

      act(() => {
        result.current.updateCell('row-1', 'name', 'Changed');
      });

      expect(sourceRows[0].cells.name).toBe('Item 1');
    });
  });

  describe('editable columns', () => {
    const columnsWithLockedAndDerived: ColumnDefinition[] = [
      { id: 'id', type: 'number', editable: false },
      { id: 'name', type: 'text' },
      { id: 'total', type: 'text', derived: true },
      { id: 'locked', type: 'text', editable: false },
    ];
    const rowsWithExtraColumns: TableRow[] = [
      {
        id: 'row-1',
        cells: { id: '1', name: 'Item 1', total: 'a', locked: 'x' },
      },
    ];

    it('ignores bulk changes to derived and non-editable columns', () => {
      const { result } = renderHook(() =>
        useEditTableState({
          columns: columnsWithLockedAndDerived,
          sourceRows: rowsWithExtraColumns,
        }),
      );

      act(() => {
        result.current.setRowsViaDiffs([
          {
            id: 'row-1',
            cells: { id: '7', name: 'Item 1', total: 'b', locked: 'y' },
          },
        ]);
      });

      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(result.current.data.rows[0].cells).toEqual(
        rowsWithExtraColumns[0].cells,
      );
    });

    it('still tracks bulk changes to editable columns', () => {
      const { result } = renderHook(() =>
        useEditTableState({
          columns: columnsWithLockedAndDerived,
          sourceRows: rowsWithExtraColumns,
        }),
      );

      act(() => {
        result.current.setRowsViaDiffs([
          {
            id: 'row-1',
            cells: { id: '1', name: 'Renamed', total: 'a', locked: 'x' },
          },
        ]);
      });

      expect(result.current.hasUnsavedChanges).toBe(true);
      expect(result.current.data.rows[0].cells.name).toBe('Renamed');
    });
  });

  describe('getDirtyRows across edits', () => {
    it('returns nothing when there are no changes', () => {
      const { result } = renderHook(() =>
        useEditTableState({ columns: testColumns, sourceRows }),
      );

      expect(result.current.getDirtyRows()).toEqual([]);
    });

    it('returns every changed row and leaves out unchanged ones', () => {
      const { result } = renderHook(() =>
        useEditTableState({ columns: testColumns, sourceRows }),
      );

      act(() => {
        result.current.updateCell('row-1', 'name', 'Changed 1');
      });
      act(() => {
        result.current.updateCell('row-3', 'value', '99');
      });

      expect(result.current.getDirtyRows().map((r) => r.id)).toEqual([
        'row-1',
        'row-3',
      ]);
    });

    it('stops returning a row once it is reverted to the source value', () => {
      const { result } = renderHook(() =>
        useEditTableState({ columns: testColumns, sourceRows }),
      );

      act(() => {
        result.current.updateCell('row-1', 'name', 'Changed');
      });
      act(() => {
        result.current.updateCell('row-1', 'name', 'Item 1');
      });

      expect(result.current.getDirtyRows()).toEqual([]);
    });
  });

  describe('computeDerivedFields with edits', () => {
    const computeDerivedFields = (row: TableRow): Record<string, string> => ({
      label: `label-${row.cells.name}`,
    });

    it('recomputes the derived fields from the edited values', () => {
      const { result } = renderHook(() =>
        useEditTableState({
          columns: testColumns,
          sourceRows,
          computeDerivedFields,
        }),
      );

      act(() => {
        result.current.updateCell('row-1', 'name', 'Edited');
      });

      expect(result.current.data.rows[0].cells.label).toBe('label-Edited');
      expect(result.current.data.rows[1].cells.label).toBe('label-Item 2');
    });

    it('keeps the cells that the derived fields do not override', () => {
      const { result } = renderHook(() =>
        useEditTableState({
          columns: testColumns,
          sourceRows,
          computeDerivedFields,
        }),
      );

      expect(result.current.data.rows[0].cells).toEqual({
        id: '1',
        name: 'Item 1',
        value: '10',
        label: 'label-Item 1',
      });
    });

    it('lets a derived value replace the cell with the same column id', () => {
      const { result } = renderHook(() =>
        useEditTableState({
          columns: testColumns,
          sourceRows,
          computeDerivedFields: () => ({ value: 'computed' }),
        }),
      );

      expect(result.current.data.rows[0].cells.value).toBe('computed');
    });

    it('does not leave derived fields behind after changes are discarded', () => {
      const { result } = renderHook(() =>
        useEditTableState({
          columns: testColumns,
          sourceRows,
          computeDerivedFields,
        }),
      );

      act(() => {
        result.current.updateCell('row-1', 'name', 'Edited');
      });
      act(() => {
        result.current.discardChanges();
      });

      expect(result.current.data.rows[0].cells.label).toBe('label-Item 1');
    });
  });

  describe('paste into the active cell', () => {
    it('writes pasted values from the active cell across columns of the same row', () => {
      const { result } = renderHook(() =>
        useEditTableState({ columns: testColumns, sourceRows }),
      );

      act(() => {
        result.current.setActiveCellInfo('row-2', 'name');
      });
      act(() => {
        result.current.handlePaste(createMockClipboardEvent('Pasted\t55'));
      });

      expect(result.current.data.rows[1].cells).toEqual({
        id: '2',
        name: 'Pasted',
        value: '55',
      });
      expect(result.current.dirtyRowIds).toEqual(new Set(['row-2']));
    });

    it('writes a single pasted value into the active cell only', () => {
      const { result } = renderHook(() =>
        useEditTableState({ columns: testColumns, sourceRows }),
      );

      act(() => {
        result.current.setActiveCellInfo('row-3', 'name');
      });
      act(() => {
        result.current.handlePaste(createMockClipboardEvent('Just one'));
      });

      expect(result.current.data.rows[2].cells.name).toBe('Just one');
      expect(result.current.data.rows[2].cells.value).toBe('30');
      expect(result.current.dirtyRowIds).toEqual(new Set(['row-3']));
    });

    it('does not add rows when pasted data runs past the last row', () => {
      const { result } = renderHook(() =>
        useEditTableState({ columns: testColumns, sourceRows }),
      );

      act(() => {
        result.current.setActiveCellInfo('row-3', 'name');
      });
      act(() => {
        result.current.handlePaste(
          createMockClipboardEvent('Last\t1\nOverflow\t2'),
        );
      });

      expect(result.current.data.rows).toHaveLength(3);
      expect(result.current.data.rows[2].cells.name).toBe('Last');
    });

    it('pastes by matching ids again once the active cell is cleared', () => {
      const { result } = renderHook(() =>
        useEditTableState({ columns: testColumns, sourceRows }),
      );

      act(() => {
        result.current.setActiveCellInfo('row-3', 'name');
      });
      act(() => {
        result.current.clearActiveCellInfo();
      });
      act(() => {
        result.current.handlePaste(createMockClipboardEvent('1\tMatched\t5'));
      });

      expect(result.current.data.rows[0].cells.name).toBe('Matched');
      expect(result.current.data.rows[2].cells.name).toBe('Item 3');
    });

    it('stops pasting into the active cell after changes are discarded', () => {
      const { result } = renderHook(() =>
        useEditTableState({ columns: testColumns, sourceRows }),
      );

      act(() => {
        result.current.setActiveCellInfo('row-3', 'name');
      });
      act(() => {
        result.current.discardChanges();
      });
      act(() => {
        result.current.handlePaste(createMockClipboardEvent('1\tMatched\t5'));
      });

      // Paste went to the row with id 1, not to the previously active row-3
      expect(result.current.data.rows[0].cells.name).toBe('Matched');
      expect(result.current.data.rows[2].cells.name).toBe('Item 3');
    });
  });

  describe('handlePaste by id', () => {
    it('leaves rows without a matching id in the pasted data unchanged', () => {
      const { result } = renderHook(() =>
        useEditTableState({ columns: testColumns, sourceRows }),
      );

      act(() => {
        result.current.handlePaste(createMockClipboardEvent('2\tOnly Two\t7'));
      });

      expect(result.current.dirtyRowIds).toEqual(new Set(['row-2']));
      expect(result.current.data.rows[0].cells.name).toBe('Item 1');
      expect(result.current.data.rows[2].cells.name).toBe('Item 3');
    });

    it('does not mark rows dirty when the pasted values match the source', () => {
      const { result } = renderHook(() =>
        useEditTableState({ columns: testColumns, sourceRows }),
      );

      act(() => {
        result.current.handlePaste(createMockClipboardEvent('1\tItem 1\t10'));
      });

      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });
});
