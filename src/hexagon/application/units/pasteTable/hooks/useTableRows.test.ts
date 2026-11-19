import type { ColumnDefinition } from '@domain/PasteTable';
import { GHOST_ROW_ID } from '@application/units/pasteTable/constants';
import { useTableRows } from '@application/units/pasteTable/hooks/useTableRows';
import { act, renderHook } from '@testing-library/react';

// Test columns
const testColumns: ColumnDefinition[] = [
  { id: 'name', type: 'text' },
  { id: 'value', type: 'number' },
];

// Test initial data
interface TestData {
  name: string;
  value: number;
}

const testInitialData: TestData[] = [
  { name: 'Item 1', value: 10 },
  { name: 'Item 2', value: 20 },
];

describe('useTableRows', () => {
  describe('initialization', () => {
    it('should initialize with ghost row when no initial data provided', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns }),
      );

      expect(result.current.rows).toHaveLength(1);
      expect(result.current.rows[0].id).toBe(GHOST_ROW_ID);
      expect(result.current.rows[0].cells).toEqual({
        name: '',
        value: '',
      });
    });

    it('should initialize with initial data plus ghost row', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, initialData: testInitialData }),
      );

      expect(result.current.rows).toHaveLength(3); // 2 data rows + ghost row
      expect(result.current.rows[0].cells).toEqual({
        name: 'Item 1',
        value: '10',
      });
      expect(result.current.rows[1].cells).toEqual({
        name: 'Item 2',
        value: '20',
      });
      expect(result.current.rows[2].id).toBe(GHOST_ROW_ID);
    });

    it('should generate unique row IDs for initial data', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, initialData: testInitialData }),
      );

      const rowIds = result.current.rows.map((row) => row.id);
      const uniqueIds = new Set(rowIds);
      expect(uniqueIds.size).toBe(rowIds.length);
    });
  });

  describe('updateCell', () => {
    it('should update a cell value in an existing row', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, initialData: testInitialData }),
      );

      const rowId = result.current.rows[0].id;

      act(() => {
        result.current.updateCell(rowId, 'name', 'Updated Name');
      });

      expect(result.current.rows[0].cells.name).toBe('Updated Name');
    });

    it('should preserve other cell values when updating one cell', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, initialData: testInitialData }),
      );

      const rowId = result.current.rows[0].id;

      act(() => {
        result.current.updateCell(rowId, 'name', 'Updated Name');
      });

      expect(result.current.rows[0].cells.value).toBe('10'); // Unchanged
    });

    it('should not affect other rows when updating a cell', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, initialData: testInitialData }),
      );

      const rowId = result.current.rows[0].id;

      act(() => {
        result.current.updateCell(rowId, 'name', 'Updated Name');
      });

      expect(result.current.rows[1].cells.name).toBe('Item 2'); // Unchanged
    });
  });

  describe('convertGhostRow', () => {
    it('should convert ghost row to regular row when value is entered', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns }),
      );

      expect(result.current.rows).toHaveLength(1);
      expect(result.current.rows[0].id).toBe(GHOST_ROW_ID);

      let newRowId: string | null = null;
      act(() => {
        newRowId = result.current.convertGhostRow(
          GHOST_ROW_ID,
          'name',
          'New Item',
        );
      });

      expect(newRowId).not.toBeNull();
      expect(result.current.rows).toHaveLength(2); // New row + new ghost row
      expect(result.current.rows[0].id).toBe(newRowId);
      expect(result.current.rows[0].cells.name).toBe('New Item');
      expect(result.current.rows[1].id).toBe(GHOST_ROW_ID); // New ghost row
    });

    it('should not convert ghost row when value is empty', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns }),
      );

      let returnValue: string | null = null;
      act(() => {
        returnValue = result.current.convertGhostRow(GHOST_ROW_ID, 'name', '');
      });

      expect(returnValue).toBeNull();
      expect(result.current.rows).toHaveLength(1);
      expect(result.current.rows[0].id).toBe(GHOST_ROW_ID);
    });

    it('should not convert ghost row when value is only whitespace', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns }),
      );

      let returnValue: string | null = null;
      act(() => {
        returnValue = result.current.convertGhostRow(
          GHOST_ROW_ID,
          'name',
          '   ',
        );
      });

      expect(returnValue).toBeNull();
      expect(result.current.rows).toHaveLength(1);
    });

    it('should return null when called on non-ghost row', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, initialData: testInitialData }),
      );

      const rowId = result.current.rows[0].id;

      let returnValue: string | null = null;
      act(() => {
        returnValue = result.current.convertGhostRow(rowId, 'name', 'Value');
      });

      expect(returnValue).toBeNull();
    });
  });

  describe('setRows', () => {
    it('should replace all rows with new array', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, initialData: testInitialData }),
      );

      const newRows = [
        { id: 'new-row-1', cells: { name: 'New 1', value: '100' } },
        { id: 'new-row-2', cells: { name: 'New 2', value: '200' } },
      ];

      act(() => {
        result.current.setRows(newRows);
      });

      expect(result.current.rows).toHaveLength(3); // 2 new rows + ghost row added
      expect(result.current.rows[0].cells.name).toBe('New 1');
      expect(result.current.rows[1].cells.name).toBe('New 2');
      expect(result.current.rows[2].id).toBe(GHOST_ROW_ID);
    });

    it('should accept updater function', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, initialData: testInitialData }),
      );

      act(() => {
        result.current.setRows((currentRows) => {
          // Filter out ghost row for testing
          return currentRows.filter((row) => row.id !== GHOST_ROW_ID);
        });
      });

      // Should still have ghost row because setRows adds it back
      expect(result.current.rows.some((r) => r.id === GHOST_ROW_ID)).toBe(true);
    });

    it('should preserve existing ghost row if present in new rows', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns }),
      );

      const newRowsWithGhost = [
        { id: 'new-row-1', cells: { name: 'New 1', value: '100' } },
        { id: GHOST_ROW_ID, cells: { name: '', value: '' } },
      ];

      act(() => {
        result.current.setRows(newRowsWithGhost);
      });

      // Should only have 2 rows (no duplicate ghost row)
      expect(result.current.rows).toHaveLength(2);
      expect(
        result.current.rows.filter((r) => r.id === GHOST_ROW_ID),
      ).toHaveLength(1);
    });
  });

  describe('resetRows', () => {
    it('should reset to only ghost row', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, initialData: testInitialData }),
      );

      expect(result.current.rows).toHaveLength(3);

      act(() => {
        result.current.resetRows();
      });

      expect(result.current.rows).toHaveLength(1);
      expect(result.current.rows[0].id).toBe(GHOST_ROW_ID);
    });

    it('should create fresh ghost row with all columns initialized', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, initialData: testInitialData }),
      );

      act(() => {
        result.current.resetRows();
      });

      expect(result.current.rows[0].cells).toEqual({
        name: '',
        value: '',
      });
    });
  });

  describe('addRow', () => {
    it('should add row before ghost row by default', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns }),
      );

      const newRow = { id: 'new-row', cells: { name: 'New', value: '50' } };

      act(() => {
        result.current.addRow(newRow);
      });

      expect(result.current.rows).toHaveLength(2);
      expect(result.current.rows[0].id).toBe('new-row');
      expect(result.current.rows[1].id).toBe(GHOST_ROW_ID);
    });

    it('should add row at start when position is "start"', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, initialData: testInitialData }),
      );

      const newRow = { id: 'new-row', cells: { name: 'New', value: '50' } };

      act(() => {
        result.current.addRow(newRow, 'start');
      });

      expect(result.current.rows[0].id).toBe('new-row');
    });

    it('should add row at specific index when position is number', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, initialData: testInitialData }),
      );

      const newRow = { id: 'new-row', cells: { name: 'New', value: '50' } };

      act(() => {
        result.current.addRow(newRow, 1);
      });

      expect(result.current.rows[1].id).toBe('new-row');
    });
  });

  describe('createEmptyRow', () => {
    it('should create an empty row with all columns initialized', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns }),
      );

      const emptyRow = result.current.createEmptyRow();

      expect(emptyRow.cells).toEqual({
        name: '',
        value: '',
      });
      expect(emptyRow.id).toMatch(/^row-/);
    });
  });

  describe('generateRowId', () => {
    it('should generate unique IDs on subsequent calls', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns }),
      );

      const id1 = result.current.generateRowId();
      const id2 = result.current.generateRowId();
      const id3 = result.current.generateRowId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });
  });

  describe('initial data conversion', () => {
    it('should show a blank cell for a missing property', () => {
      const { result } = renderHook(() =>
        useTableRows<{ name: string; value?: number }>({
          columns: testColumns,
          initialData: [{ name: 'Only name' }],
        }),
      );

      expect(result.current.rows[0].cells).toEqual({
        name: 'Only name',
        value: '',
      });
    });

    it('should keep 0 as text rather than blanking it', () => {
      const { result } = renderHook(() =>
        useTableRows({
          columns: testColumns,
          initialData: [{ name: 'Zero', value: 0 }],
        }),
      );

      expect(result.current.rows[0].cells.value).toBe('0');
    });
  });

  describe('updateCell edge cases', () => {
    it('should leave every row unchanged when the row id does not exist', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, initialData: testInitialData }),
      );
      const before = result.current.rows.map((row) => ({
        id: row.id,
        cells: { ...row.cells },
      }));

      act(() => {
        result.current.updateCell('no-such-row', 'name', 'Changed');
      });

      expect(result.current.rows).toEqual(before);
    });
  });

  describe('convertGhostRow results', () => {
    it('should fill only the edited column and keep earlier rows in order', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, initialData: testInitialData }),
      );
      const [first, second] = result.current.rows;

      act(() => {
        result.current.convertGhostRow(GHOST_ROW_ID, 'value', '99');
      });

      expect(result.current.rows).toHaveLength(4);
      expect(result.current.rows[0]).toEqual(first);
      expect(result.current.rows[1]).toEqual(second);
      expect(result.current.rows[2].cells).toEqual({ name: '', value: '99' });
      expect(result.current.rows[2].id).not.toBe(GHOST_ROW_ID);
      expect(result.current.rows[3]).toEqual({
        id: GHOST_ROW_ID,
        cells: { name: '', value: '' },
      });
    });
  });

  describe('setRows with an updater', () => {
    it('should pass the current rows to the updater and keep what it returns', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, initialData: testInitialData }),
      );
      const seenRows: string[][] = [];

      act(() => {
        result.current.setRows((currentRows) => {
          seenRows.push(currentRows.map((row) => row.cells.name));
          return [
            ...currentRows,
            { id: 'extra', cells: { name: 'Extra', value: '1' } },
          ];
        });
      });

      expect(seenRows[0]).toEqual(['Item 1', 'Item 2', '']);
      expect(result.current.rows.map((row) => row.cells.name)).toEqual([
        'Item 1',
        'Item 2',
        '',
        'Extra',
      ]);
    });
  });

  describe('addRow placement', () => {
    const newRow = { id: 'new-row', cells: { name: 'New', value: '50' } };

    it('should keep the ghost row last when adding at the start', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, initialData: testInitialData }),
      );

      act(() => {
        result.current.addRow(newRow, 'start');
      });

      expect(result.current.rows).toHaveLength(4);
      expect(result.current.rows[3].id).toBe(GHOST_ROW_ID);
    });

    it('should keep the ghost row last when adding at an index', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, initialData: testInitialData }),
      );

      act(() => {
        result.current.addRow(newRow, 1);
      });

      expect(result.current.rows.map((row) => row.cells.name)).toEqual([
        'Item 1',
        'New',
        'Item 2',
        '',
      ]);
      expect(result.current.rows[3].id).toBe(GHOST_ROW_ID);
    });

    it.each([-1, 3])(
      'should add before the ghost row when the index %i is out of range',
      (position) => {
        const { result } = renderHook(() =>
          useTableRows({ columns: testColumns, initialData: testInitialData }),
        );

        act(() => {
          result.current.addRow(newRow, position);
        });

        expect(result.current.rows.map((row) => row.cells.name)).toEqual([
          'Item 1',
          'Item 2',
          'New',
          '',
        ]);
        expect(result.current.rows[3].id).toBe(GHOST_ROW_ID);
      },
    );
  });

  describe('without a ghost row', () => {
    it('should start with only the initial data', () => {
      const { result } = renderHook(() =>
        useTableRows({
          columns: testColumns,
          initialData: testInitialData,
          includeGhostRow: false,
        }),
      );

      expect(result.current.rows.map((row) => row.cells.name)).toEqual([
        'Item 1',
        'Item 2',
      ]);
    });

    it('should start empty when there is no initial data', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, includeGhostRow: false }),
      );

      expect(result.current.rows).toEqual([]);
    });

    it('should not add a ghost row when rows are replaced', () => {
      const { result } = renderHook(() =>
        useTableRows({ columns: testColumns, includeGhostRow: false }),
      );

      act(() => {
        result.current.setRows([
          { id: 'new-row-1', cells: { name: 'New 1', value: '100' } },
        ]);
      });

      expect(result.current.rows.map((row) => row.id)).toEqual(['new-row-1']);
    });

    it('should not add a ghost row when rows are updated with a function', () => {
      const { result } = renderHook(() =>
        useTableRows({
          columns: testColumns,
          initialData: testInitialData,
          includeGhostRow: false,
        }),
      );

      act(() => {
        result.current.setRows((rows) => rows.slice(0, 1));
      });

      expect(result.current.rows).toHaveLength(1);
      expect(result.current.rows[0].cells.name).toBe('Item 1');
    });

    it('should reset to no rows', () => {
      const { result } = renderHook(() =>
        useTableRows({
          columns: testColumns,
          initialData: testInitialData,
          includeGhostRow: false,
        }),
      );

      act(() => {
        result.current.resetRows();
      });

      expect(result.current.rows).toEqual([]);
    });

    it('should add rows without introducing a ghost row', () => {
      const { result } = renderHook(() =>
        useTableRows({
          columns: testColumns,
          initialData: testInitialData,
          includeGhostRow: false,
        }),
      );
      const newRow = { id: 'new-row', cells: { name: 'New', value: '50' } };

      act(() => {
        result.current.addRow(newRow, 'start');
      });
      act(() => {
        result.current.addRow({ ...newRow, id: 'end-row' });
      });
      act(() => {
        result.current.addRow({ ...newRow, id: 'index-row' }, 1);
      });

      expect(result.current.rows.map((row) => row.id)).toEqual([
        'new-row',
        'index-row',
        expect.stringMatching(/^row-/),
        expect.stringMatching(/^row-/),
        'end-row',
      ]);
    });
  });
});
