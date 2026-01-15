import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { ClipboardEvent } from 'react';
import { GHOST_ROW_ID } from '@application/units/pasteTable/constants';
import { useTablePaste } from '@application/units/pasteTable/hooks/useTablePaste';
import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

// Test columns
const testColumns: ColumnDefinition[] = [
  { id: 'id', type: 'number' },
  { id: 'name', type: 'text' },
  { id: 'value', type: 'number' },
];

// Helper to create test rows
const createTestRow = (
  id: string,
  cells: Record<string, string>,
): TableRow => ({
  id,
  cells,
});

const createGhostRow = (): TableRow => ({
  id: GHOST_ROW_ID,
  cells: { id: '', name: '', value: '' },
});

// Helper to create mock clipboard event
const createMockClipboardEvent = (text: string): ClipboardEvent<Element> => {
  return {
    preventDefault: vi.fn(),
    clipboardData: {
      getData: vi.fn().mockReturnValue(text),
    },
  } as unknown as ClipboardEvent<Element>;
};

describe('useTablePaste', () => {
  describe('active cell management', () => {
    it('should initialize with no active cell', () => {
      const { result } = renderHook(() =>
        useTablePaste({
          columns: testColumns,
          rows: [createGhostRow()],
          updateCell: vi.fn(),
          setRows: vi.fn(),
        }),
      );

      expect(result.current.activeCell).toBeNull();
    });

    it('should set active cell info', () => {
      const { result } = renderHook(() =>
        useTablePaste({
          columns: testColumns,
          rows: [createGhostRow()],
          updateCell: vi.fn(),
          setRows: vi.fn(),
        }),
      );

      act(() => {
        result.current.setActiveCellInfo('row-1', 'name');
      });

      expect(result.current.activeCell).toEqual({
        rowId: 'row-1',
        columnId: 'name',
      });
    });

    it('should clear active cell info', () => {
      const { result } = renderHook(() =>
        useTablePaste({
          columns: testColumns,
          rows: [createGhostRow()],
          updateCell: vi.fn(),
          setRows: vi.fn(),
        }),
      );

      act(() => {
        result.current.setActiveCellInfo('row-1', 'name');
      });

      expect(result.current.activeCell).not.toBeNull();

      act(() => {
        result.current.clearActiveCellInfo();
      });

      expect(result.current.activeCell).toBeNull();
    });
  });

  describe('simple paste (single cell)', () => {
    it('should call updateCell for simple single-cell paste', () => {
      const updateCell = vi.fn();
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
        createGhostRow(),
      ];

      const { result } = renderHook(() =>
        useTablePaste({
          columns: testColumns,
          rows,
          updateCell,
          setRows: vi.fn(),
        }),
      );

      // Set active cell
      act(() => {
        result.current.setActiveCellInfo('row-1', 'name');
      });

      // Paste simple text (no tabs, newlines, or commas)
      const event = createMockClipboardEvent('New Name');

      act(() => {
        result.current.handlePaste(event);
      });

      expect(updateCell).toHaveBeenCalledWith('row-1', 'name', 'New Name');
    });
  });

  describe('table-level paste in create mode', () => {
    it('should add new rows from TSV paste', () => {
      const setRows = vi.fn();
      const rows = [createGhostRow()];

      const { result } = renderHook(() =>
        useTablePaste({
          columns: testColumns,
          rows,
          updateCell: vi.fn(),
          setRows,
          mode: 'create',
        }),
      );

      // Paste TSV data (tab-separated)
      const tsvData = '1\tItem 1\t10\n2\tItem 2\t20';
      const event = createMockClipboardEvent(tsvData);

      act(() => {
        result.current.handlePaste(event);
      });

      expect(setRows).toHaveBeenCalled();
      const newRows = setRows.mock.calls[0][0];

      // Should have 2 new rows (ghost row filtered out, then pasted rows added)
      expect(newRows.length).toBe(2);
      expect(newRows[0].cells.name).toBe('Item 1');
      expect(newRows[1].cells.name).toBe('Item 2');
    });

    it('should handle header row detection', () => {
      const setRows = vi.fn();
      const rows = [createGhostRow()];

      const { result } = renderHook(() =>
        useTablePaste({
          columns: testColumns,
          rows,
          updateCell: vi.fn(),
          setRows,
          mode: 'create',
        }),
      );

      // Paste with header row matching column labels
      const dataWithHeader = 'ID\tName\tValue\n1\tItem 1\t10';
      const event = createMockClipboardEvent(dataWithHeader);

      act(() => {
        result.current.handlePaste(event);
      });

      expect(setRows).toHaveBeenCalled();
      const newRows = setRows.mock.calls[0][0];

      // Should have 1 row (header skipped)
      expect(newRows.length).toBe(1);
      expect(newRows[0].cells.name).toBe('Item 1');
    });
  });

  describe('table-level paste in edit mode', () => {
    it('should update existing rows by ID match', () => {
      const setRows = vi.fn();
      const onRowUpdated = vi.fn();
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Original 1', value: '10' }),
        createTestRow('row-2', { id: '2', name: 'Original 2', value: '20' }),
      ];

      const { result } = renderHook(() =>
        useTablePaste({
          columns: testColumns,
          rows,
          updateCell: vi.fn(),
          setRows,
          mode: 'edit',
          idColumnId: 'id',
          onRowUpdated,
        }),
      );

      // Paste data that matches ID column
      const tsvData = '1\tUpdated 1\t100';
      const event = createMockClipboardEvent(tsvData);

      act(() => {
        result.current.handlePaste(event);
      });

      expect(setRows).toHaveBeenCalled();
      const updatedRows = setRows.mock.calls[0][0];

      // Row with id=1 should be updated
      const row1 = updatedRows.find((r: TableRow) => r.cells.id === '1');
      expect(row1?.cells.name).toBe('Updated 1');
      expect(row1?.cells.value).toBe('100');

      // Row with id=2 should be unchanged
      const row2 = updatedRows.find((r: TableRow) => r.cells.id === '2');
      expect(row2?.cells.name).toBe('Original 2');
    });

    it('should call onRowUpdated when row changes in edit mode', () => {
      const setRows = vi.fn();
      const onRowUpdated = vi.fn();
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Original', value: '10' }),
      ];

      const { result } = renderHook(() =>
        useTablePaste({
          columns: testColumns,
          rows,
          updateCell: vi.fn(),
          setRows,
          mode: 'edit',
          idColumnId: 'id',
          onRowUpdated,
        }),
      );

      const tsvData = '1\tUpdated\t100';
      const event = createMockClipboardEvent(tsvData);

      act(() => {
        result.current.handlePaste(event);
      });

      expect(onRowUpdated).toHaveBeenCalledWith('row-1', 1);
    });

    it('should not add new rows in edit mode', () => {
      const setRows = vi.fn();
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Original', value: '10' }),
      ];

      const { result } = renderHook(() =>
        useTablePaste({
          columns: testColumns,
          rows,
          updateCell: vi.fn(),
          setRows,
          mode: 'edit',
          idColumnId: 'id',
        }),
      );

      // Paste data with non-matching ID (should be ignored)
      const tsvData = '999\tNew Item\t999';
      const event = createMockClipboardEvent(tsvData);

      act(() => {
        result.current.handlePaste(event);
      });

      expect(setRows).toHaveBeenCalled();
      const updatedRows = setRows.mock.calls[0][0];

      // Should still have only 1 row
      expect(updatedRows.length).toBe(1);
      expect(updatedRows[0].cells.name).toBe('Original'); // Unchanged
    });
  });

  describe('cell-level paste with structured data', () => {
    it('should paste multi-row data starting at active cell in create mode', () => {
      const setRows = vi.fn();
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
        createGhostRow(),
      ];

      const { result } = renderHook(() =>
        useTablePaste({
          columns: testColumns,
          rows,
          updateCell: vi.fn(),
          setRows,
          mode: 'create',
        }),
      );

      // Set active cell to name column
      act(() => {
        result.current.setActiveCellInfo('row-1', 'name');
      });

      // Paste 2x2 data (will fill name and value columns for 2 rows)
      const tsvData = 'New 1\t100\nNew 2\t200';
      const event = createMockClipboardEvent(tsvData);

      act(() => {
        result.current.handlePaste(event);
      });

      expect(setRows).toHaveBeenCalled();
    });

    it('should only update existing rows when pasting in edit mode', () => {
      const setRows = vi.fn();
      const onRowUpdated = vi.fn();
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
        createTestRow('row-2', { id: '2', name: 'Item 2', value: '20' }),
      ];

      const { result } = renderHook(() =>
        useTablePaste({
          columns: testColumns,
          rows,
          updateCell: vi.fn(),
          setRows,
          mode: 'edit',
          idColumnId: 'id',
          onRowUpdated,
        }),
      );

      // Set active cell
      act(() => {
        result.current.setActiveCellInfo('row-1', 'name');
      });

      // Paste 3 rows of data (only 2 existing rows)
      const tsvData = 'Updated 1\t100\nUpdated 2\t200\nUpdated 3\t300';
      const event = createMockClipboardEvent(tsvData);

      act(() => {
        result.current.handlePaste(event);
      });

      expect(setRows).toHaveBeenCalled();
      const updatedRows = setRows.mock.calls[0][0];

      // Should still have only 2 rows (no new rows added in edit mode)
      expect(updatedRows.length).toBe(2);
    });
  });

  describe('cSV parsing', () => {
    it('should parse CSV with commas correctly', () => {
      const setRows = vi.fn();
      const rows = [createGhostRow()];

      const { result } = renderHook(() =>
        useTablePaste({
          columns: testColumns,
          rows,
          updateCell: vi.fn(),
          setRows,
          mode: 'create',
        }),
      );

      // CSV with commas (no quotes)
      const csvData = '1,Item 1,10\n2,Item 2,20';
      const event = createMockClipboardEvent(csvData);

      act(() => {
        result.current.handlePaste(event);
      });

      expect(setRows).toHaveBeenCalled();
      const newRows = setRows.mock.calls[0][0];

      expect(newRows.length).toBe(2);
      expect(newRows[0].cells.name).toBe('Item 1');
    });

    it('should handle quoted fields in CSV', () => {
      const setRows = vi.fn();
      const rows = [createGhostRow()];

      const { result } = renderHook(() =>
        useTablePaste({
          columns: testColumns,
          rows,
          updateCell: vi.fn(),
          setRows,
          mode: 'create',
        }),
      );

      // CSV with quoted field containing comma
      const csvData = '1,"Smith, John",10';
      const event = createMockClipboardEvent(csvData);

      act(() => {
        result.current.handlePaste(event);
      });

      expect(setRows).toHaveBeenCalled();
      const newRows = setRows.mock.calls[0][0];

      expect(newRows[0].cells.name).toBe('Smith, John');
    });
  });

  describe('default mode behavior', () => {
    it('should default to create mode if not specified', () => {
      const setRows = vi.fn();
      const rows = [createGhostRow()];

      const { result } = renderHook(() =>
        useTablePaste({
          columns: testColumns,
          rows,
          updateCell: vi.fn(),
          setRows,
          // No mode specified - should default to 'create'
        }),
      );

      const tsvData = '1\tItem 1\t10\n2\tItem 2\t20';
      const event = createMockClipboardEvent(tsvData);

      act(() => {
        result.current.handlePaste(event);
      });

      expect(setRows).toHaveBeenCalled();
      const newRows = setRows.mock.calls[0][0];

      // Create mode adds rows
      expect(newRows.length).toBe(2);
    });
  });
});
