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
  });
});
