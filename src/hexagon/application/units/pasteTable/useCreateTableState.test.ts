import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { ClipboardEvent } from 'react';
import { GHOST_ROW_ID } from '@application/units/pasteTable/constants';
import { useCreateTableState } from '@application/units/pasteTable/useCreateTableState';
import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

// Test columns
const testColumns: ColumnDefinition[] = [
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

describe('useCreateTableState', () => {
  describe('initialization', () => {
    it('should initialize with ghost row only', () => {
      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
        }),
      );

      expect(result.current.data.rows).toHaveLength(1);
      expect(result.current.data.rows[0].id).toBe(GHOST_ROW_ID);
    });

    it('should initialize with provided initial rows plus ghost row', () => {
      const initialRows: TableRow[] = [
        {
          id: 'row-1',
          cells: { name: 'Item 1', value: '10' },
        },
        {
          id: 'row-2',
          cells: { name: 'Item 2', value: '20' },
        },
      ];

      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
          initialRows,
        }),
      );

      expect(result.current.data.rows).toHaveLength(3); // 2 data + ghost
      expect(result.current.data.rows[0].cells.name).toBe('Item 1');
      expect(result.current.data.rows[1].cells.name).toBe('Item 2');
      expect(result.current.data.rows[2].id).toBe(GHOST_ROW_ID);
    });
  });

  describe('updateCell', () => {
    it('should update cell value in existing row', () => {
      const initialRows: TableRow[] = [
        {
          id: 'row-1',
          cells: { name: 'Item 1', value: '10' },
        },
      ];

      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
          initialRows,
        }),
      );

      const rowId = result.current.data.rows[0].id;

      act(() => {
        result.current.updateCell(rowId, 'name', 'Updated Name');
      });

      expect(result.current.data.rows[0].cells.name).toBe('Updated Name');
    });

    it('should convert ghost row when edited with non-empty value', () => {
      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
        }),
      );

      expect(result.current.data.rows).toHaveLength(1);

      let newRowId: string | null = null;
      act(() => {
        newRowId = result.current.updateCell(GHOST_ROW_ID, 'name', 'New Item');
      });

      expect(newRowId).not.toBeNull();
      expect(result.current.data.rows).toHaveLength(2); // New row + new ghost
      expect(result.current.data.rows[0].cells.name).toBe('New Item');
      expect(result.current.data.rows[1].id).toBe(GHOST_ROW_ID);
    });
  });

  describe('resetTable', () => {
    it('should reset to only ghost row', () => {
      const initialRows: TableRow[] = [
        {
          id: 'row-1',
          cells: { name: 'Item 1', value: '10' },
        },
        {
          id: 'row-2',
          cells: { name: 'Item 2', value: '20' },
        },
      ];

      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
          initialRows,
        }),
      );

      expect(result.current.data.rows).toHaveLength(3);

      act(() => {
        result.current.resetTable();
      });

      expect(result.current.data.rows).toHaveLength(1);
      expect(result.current.data.rows[0].id).toBe(GHOST_ROW_ID);
    });
  });

  describe('setRows', () => {
    it('should allow setting rows directly', () => {
      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
        }),
      );

      const newRows: TableRow[] = [
        {
          id: 'row-1',
          cells: { name: 'Set Row 1', value: '100' },
        },
        {
          id: 'row-2',
          cells: { name: 'Set Row 2', value: '200' },
        },
      ];

      act(() => {
        result.current.setRows(newRows);
      });

      // Should have 3 rows: 2 set rows + ghost (preserved by setRows)
      expect(result.current.data.rows.length).toBeGreaterThanOrEqual(2);
    });

    it('should allow setting rows via updater function', () => {
      const initialRows: TableRow[] = [
        {
          id: 'row-1',
          cells: { name: 'Item 1', value: '10' },
        },
      ];

      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
          initialRows,
        }),
      );

      act(() => {
        result.current.setRows((currentRows) => {
          const nonGhost = currentRows.filter((r) => r.id !== GHOST_ROW_ID);
          const ghost = currentRows.find((r) => r.id === GHOST_ROW_ID);
          return [
            ...nonGhost,
            {
              id: 'row-2',
              cells: { name: 'Added Row', value: '20' },
            },
            ...(ghost ? [ghost] : []),
          ];
        });
      });

      expect(result.current.data.rows.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getRows', () => {
    it('should return current rows', () => {
      const initialRows: TableRow[] = [
        {
          id: 'row-1',
          cells: { name: 'Item 1', value: '10' },
        },
      ];

      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
          initialRows,
        }),
      );

      const rows = result.current.getRows();
      expect(rows).toHaveLength(1); // 1 data row (ghost filtered by getRows)
      expect(rows[0].cells.name).toBe('Item 1');
    });
  });

  describe('handlePaste', () => {
    it('should handle paste in create mode (add rows)', () => {
      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
        }),
      );

      const tsvData = 'Item 1\t10\nItem 2\t20';
      const event = createMockClipboardEvent(tsvData);

      act(() => {
        result.current.handlePaste(event);
      });

      // Should have pasted rows + ghost
      expect(result.current.data.rows.length).toBeGreaterThan(1);
    });
  });

  describe('setActiveCellInfo / clearActiveCellInfo', () => {
    it('should expose cell info management functions', () => {
      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
        }),
      );

      expect(typeof result.current.setActiveCellInfo).toBe('function');
      expect(typeof result.current.clearActiveCellInfo).toBe('function');
    });
  });
});
