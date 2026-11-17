import type { TableRow } from '@domain/PasteTable';
import {
  cellsEqual,
  findDirtyRows,
  hasRowChanged,
  rowsEqual,
} from '@domain/PasteTable/functions/rowComparison';
import { describe, expect, it } from 'vitest';

describe('rowComparison', () => {
  describe('cellsEqual', () => {
    it('should return true for identical cells', () => {
      const cells1 = { name: 'John', age: '30' };
      const cells2 = { name: 'John', age: '30' };

      expect(cellsEqual(cells1, cells2)).toBe(true);
    });

    it('should return false for different cells', () => {
      const cells1 = { name: 'John', age: '30' };
      const cells2 = { name: 'Jane', age: '30' };

      expect(cellsEqual(cells1, cells2)).toBe(false);
    });

    it('should return false for different number of keys', () => {
      const cells1 = { name: 'John', age: '30' };
      const cells2 = { name: 'John' };

      expect(cellsEqual(cells1, cells2)).toBe(false);
    });

    it('should return true for empty cells', () => {
      expect(cellsEqual({}, {})).toBe(true);
    });

    it('should not depend on key order', () => {
      expect(
        cellsEqual({ name: 'John', age: '30' }, { age: '30', name: 'John' }),
      ).toBe(true);
    });

    it('should return false when the keys differ even if the key count matches', () => {
      expect(cellsEqual({ name: 'John' }, { nickname: 'John' })).toBe(false);
    });

    it('should return false when the second cells have extra keys', () => {
      expect(cellsEqual({ name: 'John' }, { name: 'John', age: '30' })).toBe(
        false,
      );
    });

    describe('with columnIds', () => {
      it('should compare only the listed columns', () => {
        const cells1 = { name: 'John', age: '30' };
        const cells2 = { name: 'John', age: '99', city: 'NYC' };

        expect(cellsEqual(cells1, cells2, ['name'])).toBe(true);
      });

      it('should return false when a listed column differs', () => {
        const cells1 = { name: 'John', age: '30' };
        const cells2 = { name: 'John', age: '99' };

        expect(cellsEqual(cells1, cells2, ['name', 'age'])).toBe(false);
      });

      it('should return true when no columns are listed', () => {
        expect(cellsEqual({ name: 'John' }, { name: 'Jane' }, [])).toBe(true);
      });
    });
  });

  describe('rowsEqual', () => {
    it('should return true for identical rows', () => {
      const row1: TableRow = {
        id: 'row-1',
        cells: { name: 'John', age: '30' },
      };
      const row2: TableRow = {
        id: 'row-1',
        cells: { name: 'John', age: '30' },
      };

      expect(rowsEqual(row1, row2)).toBe(true);
    });

    it('should return false for different IDs', () => {
      const row1: TableRow = {
        id: 'row-1',
        cells: { name: 'John', age: '30' },
      };
      const row2: TableRow = {
        id: 'row-2',
        cells: { name: 'John', age: '30' },
      };

      expect(rowsEqual(row1, row2)).toBe(false);
    });

    it('should return false for different cells', () => {
      const row1: TableRow = {
        id: 'row-1',
        cells: { name: 'John', age: '30' },
      };
      const row2: TableRow = {
        id: 'row-1',
        cells: { name: 'Jane', age: '30' },
      };

      expect(rowsEqual(row1, row2)).toBe(false);
    });

    it('should return false for the same cells under different IDs', () => {
      const cells = { name: 'John' };

      expect(
        rowsEqual({ id: 'row-1', cells }, { id: 'row-2', cells: { ...cells } }),
      ).toBe(false);
    });
  });

  describe('hasRowChanged', () => {
    it('should return false for unchanged rows', () => {
      const current: TableRow = {
        id: 'row-1',
        cells: { name: 'John', age: '30' },
      };
      const original: TableRow = {
        id: 'row-1',
        cells: { name: 'John', age: '30' },
      };

      expect(hasRowChanged(current, original)).toBe(false);
    });

    it('should return true for changed rows', () => {
      const current: TableRow = {
        id: 'row-1',
        cells: { name: 'Jane', age: '30' },
      };
      const original: TableRow = {
        id: 'row-1',
        cells: { name: 'John', age: '30' },
      };

      expect(hasRowChanged(current, original)).toBe(true);
    });

    it('should return true when new cells are added', () => {
      const current: TableRow = {
        id: 'row-1',
        cells: { name: 'John', age: '30', city: 'NYC' },
      };
      const original: TableRow = {
        id: 'row-1',
        cells: { name: 'John', age: '30' },
      };

      expect(hasRowChanged(current, original)).toBe(true);
    });

    it('should return true when a cell has been removed', () => {
      const current: TableRow = {
        id: 'row-1',
        cells: { name: 'John' },
      };
      const original: TableRow = {
        id: 'row-1',
        cells: { name: 'John', age: '30' },
      };

      expect(hasRowChanged(current, original)).toBe(true);
    });

    it('should return true when a cell is cleared to an empty string', () => {
      const current: TableRow = {
        id: 'row-1',
        cells: { name: '', age: '30' },
      };
      const original: TableRow = {
        id: 'row-1',
        cells: { name: 'John', age: '30' },
      };

      expect(hasRowChanged(current, original)).toBe(true);
    });
  });

  describe('findDirtyRows', () => {
    it('should return empty set when no rows changed', () => {
      const current: TableRow[] = [
        { id: 'row-1', cells: { name: 'John' } },
        { id: 'row-2', cells: { name: 'Jane' } },
      ];
      const original: TableRow[] = [
        { id: 'row-1', cells: { name: 'John' } },
        { id: 'row-2', cells: { name: 'Jane' } },
      ];

      const dirty = findDirtyRows(current, original);
      expect(dirty.size).toBe(0);
    });

    it('should find changed rows', () => {
      const current: TableRow[] = [
        { id: 'row-1', cells: { name: 'John' } },
        { id: 'row-2', cells: { name: 'Jane Updated' } },
      ];
      const original: TableRow[] = [
        { id: 'row-1', cells: { name: 'John' } },
        { id: 'row-2', cells: { name: 'Jane' } },
      ];

      const dirty = findDirtyRows(current, original);
      expect(dirty.size).toBe(1);
      expect(dirty.has('row-2')).toBe(true);
    });

    it('should find multiple changed rows', () => {
      const current: TableRow[] = [
        { id: 'row-1', cells: { name: 'John Updated' } },
        { id: 'row-2', cells: { name: 'Jane Updated' } },
      ];
      const original: TableRow[] = [
        { id: 'row-1', cells: { name: 'John' } },
        { id: 'row-2', cells: { name: 'Jane' } },
      ];

      const dirty = findDirtyRows(current, original);
      expect(dirty.size).toBe(2);
      expect(dirty.has('row-1')).toBe(true);
      expect(dirty.has('row-2')).toBe(true);
    });

    it('should ignore rows not in original', () => {
      const current: TableRow[] = [
        { id: 'row-1', cells: { name: 'John' } },
        { id: 'row-3', cells: { name: 'New Row' } },
      ];
      const original: TableRow[] = [{ id: 'row-1', cells: { name: 'John' } }];

      const dirty = findDirtyRows(current, original);
      expect(dirty.size).toBe(0);
    });

    it('should match rows by id rather than by position', () => {
      const current: TableRow[] = [
        { id: 'row-2', cells: { name: 'Jane' } },
        { id: 'row-1', cells: { name: 'John Updated' } },
      ];
      const original: TableRow[] = [
        { id: 'row-1', cells: { name: 'John' } },
        { id: 'row-2', cells: { name: 'Jane' } },
      ];

      const dirty = findDirtyRows(current, original);
      expect([...dirty]).toEqual(['row-1']);
    });

    it('should return an empty set when there are no rows', () => {
      expect(findDirtyRows([], []).size).toBe(0);
      expect(findDirtyRows([], [{ id: 'row-1', cells: {} }]).size).toBe(0);
    });

    it('should return an empty set when no original rows exist to compare against', () => {
      const current: TableRow[] = [{ id: 'row-1', cells: { name: 'John' } }];

      expect(findDirtyRows(current, []).size).toBe(0);
    });
  });
});
