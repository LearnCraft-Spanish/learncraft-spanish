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

  describe('setActiveCellInfo / clearActiveCellInfo', () => {
    it('should expose cell info management functions', () => {
      const { result } = renderHook(() =>
        useEditTableState({
          columns: testColumns,
          sourceRows,
        }),
      );

      expect(typeof result.current.setActiveCellInfo).toBe('function');
      expect(typeof result.current.clearActiveCellInfo).toBe('function');
    });
  });
});
