import type { ColumnDefinition } from '@domain/PasteTable/columnDefinition';
import {
  getEditableColumns,
  isBooleanColumn,
  isColumnDerived,
  isColumnEditable,
  isDateColumn,
  isMultiSelectColumn,
  isNumberColumn,
  isReadOnlyColumn,
  isSelectColumn,
  isTextAreaColumn,
} from '@domain/PasteTable/columnDefinition';
import { describe, expect, it } from 'vitest';

describe('columnDefinition helpers', () => {
  describe('isColumnEditable', () => {
    it('returns true for editable column', () => {
      const col: ColumnDefinition = {
        id: 'test',
        type: 'text',
        editable: true,
      };
      expect(isColumnEditable(col)).toBe(true);
    });

    it('returns false for non-editable column', () => {
      const col: ColumnDefinition = {
        id: 'test',
        type: 'text',
        editable: false,
      };
      expect(isColumnEditable(col)).toBe(false);
    });

    it('returns false for derived column', () => {
      const col: ColumnDefinition = { id: 'test', type: 'text', derived: true };
      expect(isColumnEditable(col)).toBe(false);
    });

    it('returns true by default when editable is not specified', () => {
      const col: ColumnDefinition = { id: 'test', type: 'text' };
      expect(isColumnEditable(col)).toBe(true);
    });
  });

  describe('isColumnDerived', () => {
    it('returns true for derived column', () => {
      const col: ColumnDefinition = { id: 'test', type: 'text', derived: true };
      expect(isColumnDerived(col)).toBe(true);
    });

    it('returns false for non-derived column', () => {
      const col: ColumnDefinition = {
        id: 'test',
        type: 'text',
        derived: false,
      };
      expect(isColumnDerived(col)).toBe(false);
    });

    it('returns false by default when derived is not specified', () => {
      const col: ColumnDefinition = { id: 'test', type: 'text' };
      expect(isColumnDerived(col)).toBe(false);
    });
  });

  describe('getEditableColumns', () => {
    it('returns only editable columns', () => {
      const columns: ColumnDefinition[] = [
        { id: 'col1', type: 'text', editable: true },
        { id: 'col2', type: 'text', editable: false },
        { id: 'col3', type: 'text' },
        { id: 'col4', type: 'text', derived: true },
      ];
      const result = getEditableColumns(columns);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('col1');
      expect(result[1].id).toBe('col3');
    });
  });

  describe('isNumberColumn', () => {
    it('returns true for number column', () => {
      const col: ColumnDefinition = { id: 'test', type: 'number' };
      expect(isNumberColumn(col)).toBe(true);
    });

    it('returns false for non-number column', () => {
      const col: ColumnDefinition = { id: 'test', type: 'text' };
      expect(isNumberColumn(col)).toBe(false);
    });
  });

  describe('isBooleanColumn', () => {
    it('returns true for boolean column', () => {
      const col: ColumnDefinition = { id: 'test', type: 'boolean' };
      expect(isBooleanColumn(col)).toBe(true);
    });

    it('returns false for non-boolean column', () => {
      const col: ColumnDefinition = { id: 'test', type: 'text' };
      expect(isBooleanColumn(col)).toBe(false);
    });
  });

  describe('isDateColumn', () => {
    it('returns true for date column', () => {
      const col: ColumnDefinition = { id: 'test', type: 'date' };
      expect(isDateColumn(col)).toBe(true);
    });

    it('returns false for non-date column', () => {
      const col: ColumnDefinition = { id: 'test', type: 'text' };
      expect(isDateColumn(col)).toBe(false);
    });
  });

  describe('isSelectColumn', () => {
    it('returns true for select column', () => {
      const col: ColumnDefinition = { id: 'test', type: 'select' };
      expect(isSelectColumn(col)).toBe(true);
    });

    it('returns false for non-select column', () => {
      const col: ColumnDefinition = { id: 'test', type: 'text' };
      expect(isSelectColumn(col)).toBe(false);
    });
  });

  describe('isMultiSelectColumn', () => {
    it('returns true for multi-select column', () => {
      const col: ColumnDefinition = { id: 'test', type: 'multi-select' };
      expect(isMultiSelectColumn(col)).toBe(true);
    });

    it('returns false for non-multi-select column', () => {
      const col: ColumnDefinition = { id: 'test', type: 'text' };
      expect(isMultiSelectColumn(col)).toBe(false);
    });
  });

  describe('isReadOnlyColumn', () => {
    it('returns true for read-only column', () => {
      const col: ColumnDefinition = { id: 'test', type: 'read-only' };
      expect(isReadOnlyColumn(col)).toBe(true);
    });

    it('returns false for non-read-only column', () => {
      const col: ColumnDefinition = { id: 'test', type: 'text' };
      expect(isReadOnlyColumn(col)).toBe(false);
    });
  });

  describe('isTextAreaColumn', () => {
    it('returns true for textarea column', () => {
      const col: ColumnDefinition = { id: 'test', type: 'textarea' };
      expect(isTextAreaColumn(col)).toBe(true);
    });

    it('returns false for non-textarea column', () => {
      const col: ColumnDefinition = { id: 'test', type: 'text' };
      expect(isTextAreaColumn(col)).toBe(false);
    });
  });
});
