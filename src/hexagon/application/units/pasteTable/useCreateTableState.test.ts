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

      // The set rows plus a ghost row at the end
      expect(result.current.data.rows.map((r) => r.id)).toEqual([
        'row-1',
        'row-2',
        GHOST_ROW_ID,
      ]);
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

      expect(result.current.data.rows.map((r) => r.id)).toEqual([
        'row-1',
        'row-2',
        GHOST_ROW_ID,
      ]);
      expect(result.current.data.rows[1].cells.name).toBe('Added Row');
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

      // Pasted rows + ghost
      expect(result.current.data.rows).toHaveLength(3);
      expect(result.current.data.rows[0].cells).toEqual({
        name: 'Item 1',
        value: '10',
      });
      expect(result.current.data.rows[1].cells).toEqual({
        name: 'Item 2',
        value: '20',
      });
      expect(result.current.data.rows[2].id).toBe(GHOST_ROW_ID);
    });
  });

  describe('empty row cleanup', () => {
    it('leaves out rows whose cells are all empty or blank', () => {
      const { result } = renderHook(() =>
        useCreateTableState({ columns: testColumns }),
      );

      act(() => {
        result.current.setRows([
          { id: 'keep-1', cells: { name: 'Item 1', value: '10' } },
          { id: 'empty', cells: { name: '', value: '' } },
          { id: 'blank', cells: { name: '   ', value: ' ' } },
          { id: 'keep-2', cells: { name: 'Item 2', value: '20' } },
        ]);
      });

      expect(result.current.data.rows.map((r) => r.id)).toEqual([
        'keep-1',
        'keep-2',
        GHOST_ROW_ID,
      ]);
    });

    it('treats missing cells as empty', () => {
      const { result } = renderHook(() =>
        useCreateTableState({ columns: testColumns }),
      );

      act(() => {
        result.current.setRows([
          { id: 'no-cells', cells: {} },
          { id: 'keep', cells: { name: 'Item', value: '1' } },
        ]);
      });

      expect(result.current.data.rows.map((r) => r.id)).toEqual([
        'keep',
        GHOST_ROW_ID,
      ]);
    });

    it('keeps a row that has a value in only one column', () => {
      const { result } = renderHook(() =>
        useCreateTableState({ columns: testColumns }),
      );

      act(() => {
        result.current.setRows([
          { id: 'name-only', cells: { name: 'Item', value: '' } },
          { id: 'value-only', cells: { name: '', value: '5' } },
        ]);
      });

      expect(result.current.data.rows.map((r) => r.id)).toEqual([
        'name-only',
        'value-only',
        GHOST_ROW_ID,
      ]);
    });

    it('keeps the ghost row even though it is empty', () => {
      const { result } = renderHook(() =>
        useCreateTableState({ columns: testColumns }),
      );

      act(() => {
        result.current.setRows([
          { id: 'empty', cells: { name: '', value: '' } },
        ]);
      });

      expect(result.current.data.rows.map((r) => r.id)).toEqual([GHOST_ROW_ID]);
    });

    it('keeps the ghost row last after empty rows are removed', () => {
      const { result } = renderHook(() =>
        useCreateTableState({ columns: testColumns }),
      );

      act(() => {
        result.current.setRows([
          { id: 'keep', cells: { name: 'Item', value: '1' } },
          { id: 'empty', cells: { name: '', value: '' } },
          {
            id: GHOST_ROW_ID,
            cells: { name: '', value: '' },
          },
          { id: 'keep-after-ghost', cells: { name: 'Late', value: '2' } },
        ]);
      });

      expect(result.current.data.rows.map((r) => r.id)).toEqual([
        'keep',
        'keep-after-ghost',
        GHOST_ROW_ID,
      ]);
    });

    it('leaves out empty rows from getRows as well as the ghost row', () => {
      const { result } = renderHook(() =>
        useCreateTableState({ columns: testColumns }),
      );

      act(() => {
        result.current.setRows([
          { id: 'keep', cells: { name: 'Item', value: '1' } },
          { id: 'empty', cells: { name: '', value: '' } },
        ]);
      });

      expect(result.current.getRows().map((r) => r.id)).toEqual(['keep']);
    });
  });

  describe('getRows on an empty table', () => {
    it('returns no rows when the table has only the ghost row', () => {
      const { result } = renderHook(() =>
        useCreateTableState({ columns: testColumns }),
      );

      expect(result.current.getRows()).toEqual([]);
    });
  });

  describe('updateCell on the ghost row', () => {
    it('returns the id of the new row it creates', () => {
      const { result } = renderHook(() =>
        useCreateTableState({ columns: testColumns }),
      );

      let newRowId: string | null = null;
      act(() => {
        newRowId = result.current.updateCell(GHOST_ROW_ID, 'value', '42');
      });

      expect(newRowId).not.toBeNull();
      expect(newRowId).not.toBe(GHOST_ROW_ID);
      expect(result.current.data.rows[0].id).toBe(newRowId);
      expect(result.current.data.rows[0].cells).toEqual({
        name: '',
        value: '42',
      });
    });

    it('moves the active cell to the new row in the edited column', () => {
      const { result } = renderHook(() =>
        useCreateTableState({ columns: testColumns }),
      );

      let newRowId: string | null = null;
      act(() => {
        newRowId = result.current.updateCell(GHOST_ROW_ID, 'value', '42');
      });

      expect(result.current.activeCell).toEqual({
        rowId: newRowId,
        columnId: 'value',
      });
    });

    it('directs the next paste to the new row', () => {
      const { result } = renderHook(() =>
        useCreateTableState({ columns: testColumns }),
      );

      act(() => {
        result.current.updateCell(GHOST_ROW_ID, 'name', 'Typed');
      });
      act(() => {
        result.current.handlePaste(createMockClipboardEvent('Pasted\t5'));
      });

      expect(result.current.getRows().map((r) => r.cells)).toEqual([
        { name: 'Pasted', value: '5' },
      ]);
    });

    it('does not create a row when the value is blank', () => {
      const { result } = renderHook(() =>
        useCreateTableState({ columns: testColumns }),
      );

      let returned: string | null = 'unset';
      act(() => {
        returned = result.current.updateCell(GHOST_ROW_ID, 'name', '   ');
      });

      expect(returned).toBeNull();
      expect(result.current.data.rows.map((r) => r.id)).toEqual([GHOST_ROW_ID]);
      expect(result.current.activeCell).toBeNull();
    });

    it('keeps a ghost row at the end after converting', () => {
      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
          initialRows: [{ id: 'row-1', cells: { name: 'A', value: '1' } }],
        }),
      );

      act(() => {
        result.current.updateCell(GHOST_ROW_ID, 'name', 'B');
      });

      expect(result.current.data.rows).toHaveLength(3);
      expect(result.current.data.rows[0].id).toBe('row-1');
      expect(result.current.data.rows[1].cells.name).toBe('B');
      expect(result.current.data.rows[2].id).toBe(GHOST_ROW_ID);
      expect(result.current.data.rows[2].cells).toEqual({
        name: '',
        value: '',
      });
    });
  });

  describe('updateCell on an existing row', () => {
    it('returns null and leaves the active cell alone', () => {
      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
          initialRows: [{ id: 'row-1', cells: { name: 'A', value: '1' } }],
        }),
      );

      let returned: string | null = 'unset';
      act(() => {
        returned = result.current.updateCell('row-1', 'value', '2');
      });

      expect(returned).toBeNull();
      expect(result.current.data.rows[0].cells.value).toBe('2');
      expect(result.current.data.rows[0].cells.name).toBe('A');
      expect(result.current.activeCell).toBeNull();
    });
  });

  describe('activeCell', () => {
    it('starts empty and can be set and cleared', () => {
      const { result } = renderHook(() =>
        useCreateTableState({ columns: testColumns }),
      );

      expect(result.current.activeCell).toBeNull();

      act(() => {
        result.current.setActiveCell({ rowId: 'row-1', columnId: 'name' });
      });
      expect(result.current.activeCell).toEqual({
        rowId: 'row-1',
        columnId: 'name',
      });

      act(() => {
        result.current.setActiveCell(null);
      });
      expect(result.current.activeCell).toBeNull();
    });
  });

  describe('resetTable and focus', () => {
    it('clears the active cell', () => {
      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
          initialRows: [{ id: 'row-1', cells: { name: 'A', value: '1' } }],
        }),
      );

      act(() => {
        result.current.setActiveCell({ rowId: 'row-1', columnId: 'name' });
      });
      act(() => {
        result.current.resetTable();
      });

      expect(result.current.activeCell).toBeNull();
    });

    it('pastes into the table as a whole again afterwards', () => {
      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
          initialRows: [{ id: 'row-1', cells: { name: 'A', value: '1' } }],
        }),
      );

      act(() => {
        result.current.setActiveCellInfo('row-1', 'name');
      });
      act(() => {
        result.current.resetTable();
      });
      act(() => {
        result.current.handlePaste(createMockClipboardEvent('X\t9'));
      });

      expect(result.current.getRows().map((r) => r.cells)).toEqual([
        { name: 'X', value: '9' },
      ]);
    });
  });

  describe('handlePaste into a populated table', () => {
    it('adds pasted rows after the rows already in the table', () => {
      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
          initialRows: [{ id: 'row-1', cells: { name: 'A', value: '1' } }],
        }),
      );

      act(() => {
        result.current.handlePaste(createMockClipboardEvent('B\t2\nC\t3'));
      });

      expect(result.current.getRows().map((r) => r.cells.name)).toEqual([
        'A',
        'B',
        'C',
      ]);
      expect(result.current.data.rows[3].id).toBe(GHOST_ROW_ID);
    });

    it('pastes nothing when the clipboard is empty', () => {
      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
          initialRows: [{ id: 'row-1', cells: { name: 'A', value: '1' } }],
        }),
      );

      act(() => {
        result.current.handlePaste(createMockClipboardEvent(''));
      });

      expect(result.current.getRows().map((r) => r.id)).toEqual(['row-1']);
    });

    it('fills from the active cell onward and adds the rows that do not fit', () => {
      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
          initialRows: [{ id: 'row-1', cells: { name: 'A', value: '1' } }],
        }),
      );

      act(() => {
        result.current.setActiveCellInfo('row-1', 'name');
      });
      act(() => {
        result.current.handlePaste(createMockClipboardEvent('X\t8\nY\t9'));
      });

      expect(result.current.getRows().map((r) => r.cells)).toEqual([
        { name: 'X', value: '8' },
        { name: 'Y', value: '9' },
      ]);
      expect(result.current.getRows()[0].id).toBe('row-1');
      expect(result.current.data.rows[2].id).toBe(GHOST_ROW_ID);
    });

    it('pastes a single value into the active cell of an existing row', () => {
      const { result } = renderHook(() =>
        useCreateTableState({
          columns: testColumns,
          initialRows: [{ id: 'row-1', cells: { name: 'A', value: '1' } }],
        }),
      );

      act(() => {
        result.current.setActiveCellInfo('row-1', 'value');
      });
      act(() => {
        result.current.handlePaste(createMockClipboardEvent('77'));
      });

      expect(result.current.getRows()[0].cells).toEqual({
        name: 'A',
        value: '77',
      });
    });
  });
});
