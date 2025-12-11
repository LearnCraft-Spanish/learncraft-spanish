import { describe, it, expect } from 'vitest';
import {
  validateRow,
  computeValidationState,
  validateCell,
} from './validation';
import type {
  TableRow,
  ColumnDefinition,
  NumberColumnDefinition,
} from '@domain/PasteTable/types';

describe('validation', () => {
  describe('validateRow', () => {
    it('should call validateFn with row cells', () => {
      const row: TableRow = {
        id: 'row-1',
        cells: { name: 'John', age: '30' },
      };

      const validateFn = (data: { name: string; age: string }) => {
        const errors: Record<string, string> = {};
        if (!data.name) errors.name = 'Name required';
        return errors;
      };

      const result = validateRow(row, validateFn);
      expect(result).toEqual({});
    });

    it('should return errors from validateFn', () => {
      const row: TableRow = {
        id: 'row-1',
        cells: { name: '', age: '30' },
      };

      const validateFn = (data: { name: string; age: string }) => {
        const errors: Record<string, string> = {};
        if (!data.name) errors.name = 'Name required';
        return errors;
      };

      const result = validateRow(row, validateFn);
      expect(result).toEqual({ name: 'Name required' });
    });
  });

  describe('computeValidationState', () => {
    it('should return valid state when no errors', () => {
      const rows: TableRow[] = [
        { id: 'row-1', cells: { name: 'John' } },
        { id: 'row-2', cells: { name: 'Jane' } },
      ];

      const validateFn = () => ({});

      const result = computeValidationState(rows, validateFn);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return invalid state when errors exist', () => {
      const rows: TableRow[] = [
        { id: 'row-1', cells: { name: '' } },
        { id: 'row-2', cells: { name: 'Jane' } },
      ];

      const validateFn = (data: { name: string }) => {
        const errors: Record<string, string> = {};
        if (!data.name) errors.name = 'Name required';
        return errors;
      };

      const result = computeValidationState(rows, validateFn);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        'row-1': { name: 'Name required' },
      });
    });

    it('should exclude rows by ID', () => {
      const rows: TableRow[] = [
        { id: 'ghost-row', cells: { name: '' } },
        { id: 'row-1', cells: { name: '' } },
      ];

      const validateFn = (data: { name: string }) => {
        const errors: Record<string, string> = {};
        if (!data.name) errors.name = 'Name required';
        return errors;
      };

      const result = computeValidationState(rows, validateFn, new Set(['ghost-row']));
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        'row-1': { name: 'Name required' },
      });
      expect(result.errors['ghost-row']).toBeUndefined();
    });
  });

  describe('validateCell', () => {
    it('should return null for valid value', () => {
      const column: ColumnDefinition = {
        id: 'name',
        type: 'text',
      };

      expect(validateCell('John', column)).toBeNull();
    });

    it('should return error for required empty value', () => {
      const column: ColumnDefinition = {
        id: 'name',
        type: 'text',
        required: true,
      };

      const result = validateCell('', column);
      expect(result).toBe('name is required');
    });

    it('should return null for empty non-required value', () => {
      const column: ColumnDefinition = {
        id: 'name',
        type: 'text',
        required: false,
      };

      expect(validateCell('', column)).toBeNull();
    });

    it('should validate number type', () => {
      const column: NumberColumnDefinition = {
        id: 'age',
        type: 'number',
      };

      expect(validateCell('30', column)).toBeNull();
      expect(validateCell('not-a-number', column)).toBe('age must be a number');
    });

    it('should validate number min constraint', () => {
      const column: NumberColumnDefinition = {
        id: 'age',
        type: 'number',
        min: 18,
      };

      expect(validateCell('20', column)).toBeNull();
      const result = validateCell('15', column);
      expect(result).toBe('age must be at least 18');
    });

    it('should validate number max constraint', () => {
      const column: NumberColumnDefinition = {
        id: 'age',
        type: 'number',
        max: 100,
      };

      expect(validateCell('50', column)).toBeNull();
      const result = validateCell('150', column);
      expect(result).toBe('age must be at most 100');
    });

    it('should use custom validator', () => {
      const column: ColumnDefinition = {
        id: 'email',
        type: 'text',
        validate: (value) => {
          if (!value.includes('@')) {
            return 'Invalid email format';
          }
          return null;
        },
      };

      expect(validateCell('test@example.com', column)).toBeNull();
      expect(validateCell('invalid', column)).toBe('Invalid email format');
    });
  });
});

