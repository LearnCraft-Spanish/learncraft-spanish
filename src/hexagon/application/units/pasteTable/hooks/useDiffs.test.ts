import type { TableRow } from '@domain/PasteTable';
import { useDiffs } from '@application/units/pasteTable/hooks/useDiffs';
import { act, renderHook } from '@testing-library/react';

const sourceRows: TableRow[] = [
  { id: 'row-1', cells: { id: '1', name: 'Item 1', value: '10' } },
  { id: 'row-2', cells: { id: '2', name: 'Item 2', value: '20' } },
];
const editableColumnIds = ['name', 'value'];

function renderDiffs(rows: TableRow[] = sourceRows) {
  return renderHook(
    ({ source }: { source: TableRow[] }) =>
      useDiffs({ sourceRows: source, editableColumnIds }),
    { initialProps: { source: rows } },
  );
}

describe('useDiffs', () => {
  describe('initial state', () => {
    it('starts with no diffs and no dirty rows', () => {
      const { result } = renderDiffs();

      expect(result.current.diffs.size).toBe(0);
      expect(result.current.dirtyRowIds.size).toBe(0);
    });
  });

  describe('updateDiff', () => {
    it('records only the changed cell and marks the row dirty', () => {
      const { result } = renderDiffs();

      act(() => {
        result.current.updateDiff('row-1', 'name', 'Changed');
      });

      expect(result.current.diffs.get('row-1')).toEqual({ name: 'Changed' });
      expect(result.current.dirtyRowIds).toEqual(new Set(['row-1']));
    });

    it('tracks several cells of the same row together', () => {
      const { result } = renderDiffs();

      act(() => {
        result.current.updateDiff('row-1', 'name', 'Changed');
      });
      act(() => {
        result.current.updateDiff('row-1', 'value', '99');
      });

      expect(result.current.diffs.get('row-1')).toEqual({
        name: 'Changed',
        value: '99',
      });
    });

    it('tracks different rows independently', () => {
      const { result } = renderDiffs();

      act(() => {
        result.current.updateDiff('row-1', 'name', 'Changed 1');
      });
      act(() => {
        result.current.updateDiff('row-2', 'name', 'Changed 2');
      });

      expect(result.current.dirtyRowIds).toEqual(new Set(['row-1', 'row-2']));
      expect(result.current.diffs.get('row-1')).toEqual({ name: 'Changed 1' });
      expect(result.current.diffs.get('row-2')).toEqual({ name: 'Changed 2' });
    });

    it('removes the row from the diffs when its only change is reverted to the source value', () => {
      const { result } = renderDiffs();

      act(() => {
        result.current.updateDiff('row-1', 'name', 'Changed');
      });
      act(() => {
        result.current.updateDiff('row-1', 'name', 'Item 1');
      });

      expect(result.current.diffs.has('row-1')).toBe(false);
      expect(result.current.dirtyRowIds.size).toBe(0);
    });

    it('keeps the other changed cells of a row when one cell is reverted', () => {
      const { result } = renderDiffs();

      act(() => {
        result.current.updateDiff('row-1', 'name', 'Changed');
      });
      act(() => {
        result.current.updateDiff('row-1', 'value', '99');
      });
      act(() => {
        result.current.updateDiff('row-1', 'name', 'Item 1');
      });

      expect(result.current.diffs.get('row-1')).toEqual({ value: '99' });
      expect(result.current.dirtyRowIds).toEqual(new Set(['row-1']));
    });

    it('does not mark a row dirty when set to the value it already has', () => {
      const { result } = renderDiffs();

      act(() => {
        result.current.updateDiff('row-1', 'name', 'Item 1');
      });

      expect(result.current.diffs.size).toBe(0);
      expect(result.current.dirtyRowIds.size).toBe(0);
    });
  });

  describe('setRowsViaDiffs', () => {
    it('stores only the cells that differ from the source', () => {
      const { result } = renderDiffs();

      act(() => {
        result.current.setRowsViaDiffs([
          { id: 'row-1', cells: { id: '1', name: 'Pasted', value: '10' } },
          { id: 'row-2', cells: { id: '2', name: 'Item 2', value: '20' } },
        ]);
      });

      expect(result.current.diffs.get('row-1')).toEqual({ name: 'Pasted' });
      expect(result.current.dirtyRowIds).toEqual(new Set(['row-1']));
    });

    it('ignores changes to columns that are not editable', () => {
      const { result } = renderDiffs();

      act(() => {
        result.current.setRowsViaDiffs([
          { id: 'row-1', cells: { id: '999', name: 'Item 1', value: '10' } },
        ]);
      });

      expect(result.current.diffs.size).toBe(0);
    });

    it('ignores rows that are not in the source', () => {
      const { result } = renderDiffs();

      act(() => {
        result.current.setRowsViaDiffs([
          { id: 'unknown', cells: { id: '3', name: 'Stranger', value: '1' } },
        ]);
      });

      expect(result.current.diffs.size).toBe(0);
      expect(result.current.dirtyRowIds.size).toBe(0);
    });

    it('clears earlier changes when the rows passed in match the source again', () => {
      const { result } = renderDiffs();

      act(() => {
        result.current.updateDiff('row-1', 'name', 'Changed');
      });
      act(() => {
        result.current.setRowsViaDiffs(sourceRows);
      });

      expect(result.current.diffs.size).toBe(0);
      expect(result.current.dirtyRowIds.size).toBe(0);
    });
  });

  describe('clearDiffs', () => {
    it('discards every change', () => {
      const { result } = renderDiffs();

      act(() => {
        result.current.updateDiff('row-1', 'name', 'Changed 1');
      });
      act(() => {
        result.current.updateDiff('row-2', 'value', '99');
      });
      act(() => {
        result.current.clearDiffs();
      });

      expect(result.current.diffs.size).toBe(0);
      expect(result.current.dirtyRowIds.size).toBe(0);
    });
  });

  describe('when the source rows change', () => {
    it('drops a change that now matches the new source value', () => {
      const { result, rerender } = renderDiffs();

      act(() => {
        result.current.updateDiff('row-1', 'name', 'Server Value');
      });
      expect(result.current.dirtyRowIds).toEqual(new Set(['row-1']));

      rerender({
        source: [
          {
            id: 'row-1',
            cells: { id: '1', name: 'Server Value', value: '10' },
          },
          sourceRows[1],
        ],
      });

      expect(result.current.diffs.size).toBe(0);
      expect(result.current.dirtyRowIds.size).toBe(0);
    });

    it('keeps a change that still differs from the new source value', () => {
      const { result, rerender } = renderDiffs();

      act(() => {
        result.current.updateDiff('row-1', 'name', 'My Edit');
      });

      rerender({
        source: [
          {
            id: 'row-1',
            cells: { id: '1', name: 'Server Value', value: '10' },
          },
          sourceRows[1],
        ],
      });

      expect(result.current.diffs.get('row-1')).toEqual({ name: 'My Edit' });
    });

    it('drops only the matching cells of a row and keeps the rest', () => {
      const { result, rerender } = renderDiffs();

      act(() => {
        result.current.updateDiff('row-1', 'name', 'Server Value');
      });
      act(() => {
        result.current.updateDiff('row-1', 'value', '99');
      });

      rerender({
        source: [
          {
            id: 'row-1',
            cells: { id: '1', name: 'Server Value', value: '10' },
          },
          sourceRows[1],
        ],
      });

      expect(result.current.diffs.get('row-1')).toEqual({ value: '99' });
    });

    it('drops the changes of a row that no longer exists in the source', () => {
      const { result, rerender } = renderDiffs();

      act(() => {
        result.current.updateDiff('row-1', 'name', 'Changed');
      });
      act(() => {
        result.current.updateDiff('row-2', 'name', 'Changed 2');
      });

      rerender({ source: [sourceRows[1]] });

      expect(result.current.diffs.has('row-1')).toBe(false);
      expect(result.current.diffs.get('row-2')).toEqual({ name: 'Changed 2' });
      expect(result.current.dirtyRowIds).toEqual(new Set(['row-2']));
    });
  });
});
