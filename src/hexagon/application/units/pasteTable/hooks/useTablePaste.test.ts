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

const setupPaste = ({
  columns = testColumns,
  rows,
  mode,
  idColumnId,
  onRowUpdated,
}: {
  columns?: ColumnDefinition[];
  rows: TableRow[];
  mode?: 'create' | 'edit';
  idColumnId?: string;
  onRowUpdated?: (rowId: string, domainId: number) => void;
}) => {
  const updateCell = vi.fn();
  const setRows = vi.fn();
  const rendered = renderHook(() =>
    useTablePaste({
      columns,
      rows,
      updateCell,
      setRows,
      mode,
      idColumnId,
      onRowUpdated,
    }),
  );

  const paste = (text: string) => {
    const event = createMockClipboardEvent(text);
    act(() => {
      rendered.result.current.handlePaste(event);
    });
    return event;
  };

  return { ...rendered, updateCell, setRows, paste };
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

  describe('rejected pastes', () => {
    it('should not treat an empty table paste as a successful paste', () => {
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
        createGhostRow(),
      ];
      const { setRows, updateCell, paste } = setupPaste({ rows });

      for (const text of ['', '\n\n', '   ', '\t', '\r\n\t']) {
        const event = paste(text);

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(event.clipboardData.getData).toHaveBeenCalledWith('text');
      }

      expect(setRows).not.toHaveBeenCalled();
      expect(updateCell).not.toHaveBeenCalled();
    });

    it('should not treat an empty cell paste as a successful paste', () => {
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
      ];
      const { result, setRows, updateCell, paste } = setupPaste({
        rows,
        mode: 'edit',
      });

      act(() => {
        result.current.setActiveCellInfo('row-1', 'name');
      });

      const event = paste('\n\t\r');

      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(event.clipboardData.getData).toHaveBeenCalledWith('text');
      expect(setRows).not.toHaveBeenCalled();
      expect(updateCell).not.toHaveBeenCalled();
    });

    it('should not treat a paste into an unknown column as a successful paste', () => {
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
      ];
      const { result, setRows, updateCell, paste } = setupPaste({
        rows,
        mode: 'edit',
        onRowUpdated: vi.fn(),
      });

      act(() => {
        result.current.setActiveCellInfo('row-1', 'missing-column');
      });

      const event = paste('Updated\t100');

      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(setRows).not.toHaveBeenCalled();
      expect(updateCell).not.toHaveBeenCalled();
    });

    it('should not treat a paste into an unknown row as a successful paste', () => {
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
      ];
      const { result, setRows, updateCell, paste } = setupPaste({
        rows,
        mode: 'create',
      });

      act(() => {
        result.current.setActiveCellInfo('missing-row', 'name');
      });

      paste('Updated\t100');

      expect(setRows).not.toHaveBeenCalled();
      expect(updateCell).not.toHaveBeenCalled();
    });

    it('should not treat the part of a partial row that falls outside the table as a successful paste', () => {
      const onRowUpdated = vi.fn();
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
        createTestRow('row-2', { id: '2', name: 'Item 2', value: '20' }),
        createGhostRow(),
      ];
      const { result, setRows, paste } = setupPaste({
        rows,
        mode: 'edit',
        onRowUpdated,
      });

      act(() => {
        result.current.setActiveCellInfo('row-2', 'value');
      });

      paste('200\tEXTRA\n300\tALSO\n400');

      expect(setRows).toHaveBeenCalledTimes(1);
      const updatedRows = setRows.mock.calls[0][0] as TableRow[];

      expect(updatedRows).toEqual([
        rows[0],
        {
          id: 'row-2',
          cells: { id: '2', name: 'Item 2', value: '200' },
        },
        rows[2],
      ]);
      expect(onRowUpdated).toHaveBeenCalledTimes(1);
      expect(onRowUpdated).toHaveBeenCalledWith('row-2', 2);
    });
  });

  describe('cell paste boundaries', () => {
    it('should keep a single-cell paste unparsed and untrimmed', () => {
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
      ];
      const { result, updateCell, setRows, paste } = setupPaste({ rows });

      act(() => {
        result.current.setActiveCellInfo('row-1', 'name');
      });

      const event = paste('  New Name  ');

      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(event.clipboardData.getData).toHaveBeenCalledWith('text');
      expect(updateCell).toHaveBeenCalledTimes(1);
      expect(updateCell).toHaveBeenCalledWith('row-1', 'name', '  New Name  ');
      expect(setRows).not.toHaveBeenCalled();
    });

    it.each(['\t', '\n', '\r', ','])(
      'should treat %j as tabular data rather than one cell',
      (delimiter) => {
        const rows = [createGhostRow()];
        const { result, updateCell, setRows, paste } = setupPaste({
          rows,
          mode: 'create',
        });

        act(() => {
          result.current.setActiveCellInfo(GHOST_ROW_ID, 'name');
        });

        paste(`Left${delimiter}Right`);

        expect(updateCell).not.toHaveBeenCalled();
        expect(setRows).toHaveBeenCalledTimes(1);
      },
    );

    it('should trim structured edits and keep the column order of the paste', () => {
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
      ];
      const edited = setupPaste({ rows, mode: 'edit' });

      act(() => {
        edited.result.current.setActiveCellInfo('row-1', 'name');
      });
      edited.paste('  Hi  \t  8  ');

      expect(edited.setRows.mock.calls[0][0]).toEqual([
        {
          id: 'row-1',
          cells: { id: '1', name: 'Hi', value: '8' },
        },
      ]);

      const created = setupPaste({
        rows: [
          createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
          createGhostRow(),
        ],
        mode: 'create',
      });

      act(() => {
        created.result.current.setActiveCellInfo('row-1', 'name');
      });
      created.paste('New\t99\tEXTRA');

      expect(created.setRows.mock.calls[0][0][0]).toEqual({
        id: 'row-1',
        cells: { id: '1', name: 'New', value: '99' },
      });
    });

    it('should trim a structured paste and leave columns outside that paste untouched', () => {
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
        createGhostRow(),
      ];
      const { result, setRows, updateCell, paste } = setupPaste({
        rows,
        mode: 'create',
      });

      act(() => {
        result.current.setActiveCellInfo('row-1', 'name');
      });

      paste('  Updated  \n  Next  ');

      expect(updateCell).not.toHaveBeenCalled();
      const updatedRows = setRows.mock.calls[0][0] as TableRow[];

      expect(updatedRows).toHaveLength(2);
      expect(updatedRows[0]).toEqual({
        id: 'row-1',
        cells: { id: '1', name: 'Updated', value: '10' },
      });
      expect(updatedRows[1].id).toMatch(/^row-\d+-\d+$/);
      expect(updatedRows[1].cells).toEqual({
        id: '',
        name: 'Next',
        value: '',
      });
    });

    it('should ignore pasted cells that run past the last column', () => {
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
      ];
      const { result, setRows, paste } = setupPaste({
        rows,
        mode: 'edit',
        onRowUpdated: vi.fn(),
      });

      act(() => {
        result.current.setActiveCellInfo('row-1', 'id');
      });

      paste('42\tNew Name\t99\tIGNORED');

      const updatedRows = setRows.mock.calls[0][0] as TableRow[];
      expect(updatedRows).toEqual([
        {
          id: 'row-1',
          cells: { id: '42', name: 'New Name', value: '99' },
        },
      ]);
    });

    it('should call onRowUpdated with the domain id taken from the edited cells', () => {
      const onRowUpdated = vi.fn();
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
      ];
      const { result, paste } = setupPaste({
        rows,
        mode: 'edit',
        onRowUpdated,
      });

      act(() => {
        result.current.setActiveCellInfo('row-1', 'id');
      });
      paste('7\tRenamed');

      expect(onRowUpdated).toHaveBeenCalledTimes(1);
      expect(onRowUpdated).toHaveBeenCalledWith('row-1', 7);
    });

    it('should not mark a row dirty when a structured paste matches the current cells', () => {
      const onRowUpdated = vi.fn();
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
      ];
      const { result, setRows, paste } = setupPaste({
        rows,
        mode: 'edit',
        onRowUpdated,
      });

      act(() => {
        result.current.setActiveCellInfo('row-1', 'name');
      });
      paste('Item 1\t10');

      expect(setRows).toHaveBeenCalledTimes(1);
      expect(setRows.mock.calls[0][0]).toEqual(rows);
      expect(onRowUpdated).not.toHaveBeenCalled();
    });

    it('should update a non-numeric id without marking the row dirty', () => {
      const onRowUpdated = vi.fn();
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
      ];
      const { result, setRows, paste } = setupPaste({
        rows,
        mode: 'edit',
        onRowUpdated,
      });

      act(() => {
        result.current.setActiveCellInfo('row-1', 'id');
      });
      paste('abc\tRenamed');

      expect(onRowUpdated).not.toHaveBeenCalled();
      expect(setRows.mock.calls[0][0]).toEqual([
        {
          id: 'row-1',
          cells: { id: 'abc', name: 'Renamed', value: '10' },
        },
      ]);
    });

    it('should not require onRowUpdated in edit mode', () => {
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
      ];
      const { result, setRows, paste } = setupPaste({ rows, mode: 'edit' });

      act(() => {
        result.current.setActiveCellInfo('row-1', 'name');
      });

      expect(() => paste('Renamed\t99')).not.toThrow();
      expect(setRows.mock.calls[0][0][0].cells).toEqual({
        id: '1',
        name: 'Renamed',
        value: '99',
      });
    });

    it('should keep values already on the ghost row and number new row ids from Math.random', () => {
      vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const rows = [
        {
          id: GHOST_ROW_ID,
          cells: { id: '', name: 'keep', value: '' },
        },
      ];
      const { result, setRows, paste } = setupPaste({ rows, mode: 'create' });

      act(() => {
        result.current.setActiveCellInfo(GHOST_ROW_ID, 'value');
      });
      paste('55\n66');

      expect(setRows.mock.calls[0][0]).toEqual([
        {
          id: 'row-1700000000000-500',
          cells: { id: '', name: 'keep', value: '55' },
        },
        {
          id: 'row-1700000000000-500',
          cells: { id: '', name: '', value: '66' },
        },
      ]);
    });

    it('should paste into the rows from the latest render', () => {
      const updateCell = vi.fn();
      const setRows = vi.fn();
      const rowA = createTestRow('row-a', { id: '1', name: 'A', value: '1' });
      const rowB = createTestRow('row-b', { id: '2', name: 'B', value: '2' });
      const { result, rerender } = renderHook(
        ({ rows }: { rows: TableRow[] }) =>
          useTablePaste({
            columns: testColumns,
            rows,
            updateCell,
            setRows,
            mode: 'edit',
          }),
        { initialProps: { rows: [rowA] } },
      );

      rerender({ rows: [rowB] });

      act(() => {
        result.current.setActiveCellInfo('row-b', 'name');
      });

      const event = createMockClipboardEvent('After\t9');
      act(() => {
        result.current.handlePaste(event);
      });

      expect(updateCell).not.toHaveBeenCalled();
      expect(setRows).toHaveBeenCalledTimes(1);
      expect(setRows.mock.calls[0][0]).toEqual([
        {
          id: 'row-b',
          cells: { id: '2', name: 'After', value: '9' },
        },
      ]);
    });

    it('should turn the ghost row into real rows and keep creating rows in create mode', () => {
      const onRowUpdated = vi.fn();
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
        createGhostRow(),
      ];
      const { result, setRows, paste } = setupPaste({
        rows,
        mode: 'create',
        onRowUpdated,
      });

      act(() => {
        result.current.setActiveCellInfo('row-1', 'value');
      });
      paste('11\n22\n33');

      const updatedRows = setRows.mock.calls[0][0] as TableRow[];
      expect(updatedRows).toHaveLength(3);
      expect(updatedRows.map((row) => row.id)).toEqual([
        'row-1',
        expect.stringMatching(/^row-\d+-\d+$/),
        expect.stringMatching(/^row-\d+-\d+$/),
      ]);
      expect(updatedRows.map((row) => row.cells)).toEqual([
        { id: '1', name: 'Item 1', value: '11' },
        { id: '', name: '', value: '22' },
        { id: '', name: '', value: '33' },
      ]);
      expect(onRowUpdated).not.toHaveBeenCalled();
    });

    it('should leave the ghost row alone when editing', () => {
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
        createGhostRow(),
      ];
      const { result, setRows, paste } = setupPaste({ rows, mode: 'edit' });

      act(() => {
        result.current.setActiveCellInfo(GHOST_ROW_ID, 'name');
      });
      paste('Nope\t1');

      expect(setRows.mock.calls[0][0]).toEqual(rows);
    });
  });

  describe('table paste boundaries', () => {
    it('should keep existing rows, drop the ghost row, and append a table paste', () => {
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Item 1', value: '10' }),
        createGhostRow(),
      ];
      const { setRows, updateCell, paste } = setupPaste({
        rows,
        mode: 'create',
      });
      const event = paste('2\tItem 2\t20');

      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(event.clipboardData.getData).toHaveBeenCalledWith('text');
      expect(updateCell).not.toHaveBeenCalled();
      const updatedRows = setRows.mock.calls[0][0] as TableRow[];

      expect(updatedRows).toHaveLength(2);
      expect(updatedRows[0]).toEqual(rows[0]);
      expect(updatedRows[1].id).toMatch(/^row-/);
      expect(updatedRows[1].cells).toEqual({
        id: '2',
        name: 'Item 2',
        value: '20',
      });
    });

    it('should map a header row by column id instead of by position', () => {
      const { setRows, paste } = setupPaste({
        rows: [createGhostRow()],
        mode: 'create',
      });

      paste('name\tvalue\tid\nItem\t10\t7');

      const updatedRows = setRows.mock.calls[0][0] as TableRow[];
      expect(updatedRows).toHaveLength(1);
      expect(updatedRows[0].cells).toEqual({
        id: '7',
        name: 'Item',
        value: '10',
      });
    });

    it('should treat a single matching header cell as a header when it meets the threshold', () => {
      const { setRows, paste } = setupPaste({
        rows: [createGhostRow()],
        mode: 'create',
      });

      paste('id\tzzz\n5\tReal');

      const updatedRows = setRows.mock.calls[0][0] as TableRow[];
      expect(updatedRows).toHaveLength(1);
      expect(updatedRows[0].cells).toEqual({ id: '5', name: '', value: '' });
    });

    it('should match edit-mode rows on the default id column and ignore rows without a numeric id', () => {
      const onRowUpdated = vi.fn();
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Original', value: '10' }),
        createTestRow('row-x', { id: 'abc', name: 'Keep', value: '3' }),
        createTestRow('row-2', { id: '2', name: 'Same', value: '20' }),
      ];
      const { setRows, paste } = setupPaste({
        rows,
        mode: 'edit',
        onRowUpdated,
      });

      paste('1\tUpdated\t100\n2\tSame\t20\n9\tMissing\t1');

      expect(setRows.mock.calls[0][0]).toEqual([
        {
          id: 'row-1',
          cells: { id: '1', name: 'Updated', value: '100' },
        },
        rows[1],
        rows[2],
      ]);
      expect(onRowUpdated).toHaveBeenCalledTimes(1);
      expect(onRowUpdated).toHaveBeenCalledWith('row-1', 1);
    });

    it('should blank columns omitted from an edit-mode table paste', () => {
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Original', value: '10' }),
      ];
      const { setRows, paste } = setupPaste({
        rows,
        mode: 'edit',
        onRowUpdated: vi.fn(),
      });

      paste('1\tOnly name');

      expect(setRows.mock.calls[0][0]).toEqual([
        {
          id: 'row-1',
          cells: { id: '1', name: 'Only name', value: '' },
        },
      ]);
    });

    it('should not throw when edit mode has no row-updated callback', () => {
      const rows = [
        createTestRow('row-1', { id: '1', name: 'Original', value: '10' }),
      ];
      const { setRows, paste } = setupPaste({ rows, mode: 'edit' });

      expect(() => paste('1\tUpdated\t100')).not.toThrow();
      expect(setRows.mock.calls[0][0]).toEqual([
        {
          id: 'row-1',
          cells: { id: '1', name: 'Updated', value: '100' },
        },
      ]);
    });
  });
});
