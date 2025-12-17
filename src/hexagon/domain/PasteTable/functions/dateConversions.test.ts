import type { ColumnDefinition } from '@domain/PasteTable/types';
import {
  formatDateForTable,
  parseDateFromTable,
  validateDate,
} from '@domain/PasteTable/functions/dateConversions';
import { describe, expect, it } from 'vitest';

describe('dateConversions', () => {
  describe('parseDateFromTable', () => {
    it('should return undefined for empty input', () => {
      expect(parseDateFromTable('')).toBeUndefined();
      expect(parseDateFromTable('   ')).toBeUndefined();
    });

    it('should parse ISO date format (YYYY-MM-DD)', () => {
      const result = parseDateFromTable('2024-01-15');
      expect(result).toBe('2024-01-15');
    });

    it('should parse US date format (MM/DD/YYYY)', () => {
      const result = parseDateFromTable('01/15/2024');
      expect(result).toBe('2024-01-15');
    });

    it('should parse European date format (DD-MM-YYYY)', () => {
      const result = parseDateFromTable('15-01-2024');
      expect(result).toBe('2024-01-15');
    });

    it('should parse alternative ISO format (YYYY/MM/DD)', () => {
      const result = parseDateFromTable('2024/01/15');
      expect(result).toBe('2024-01-15');
    });

    it('should use custom input formats', () => {
      const dateFormat = {
        inputFormats: ['MM/DD/YYYY'],
        outputFormat: 'iso-date' as const,
      };

      const result = parseDateFromTable('01/15/2024', dateFormat);
      expect(result).toBe('2024-01-15');
    });

    it('should return Date object when outputFormat is Date', () => {
      const dateFormat = {
        outputFormat: 'Date' as const,
      };

      const result = parseDateFromTable('2024-01-15', dateFormat);
      expect(result).toBeInstanceOf(Date);
    });

    it('should return ISO string when outputFormat is iso', () => {
      const dateFormat = {
        outputFormat: 'iso' as const,
      };

      const result = parseDateFromTable('2024-01-15', dateFormat);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should return timestamp string when outputFormat is timestamp', () => {
      const dateFormat = {
        outputFormat: 'timestamp' as const,
      };

      const result = parseDateFromTable('2024-01-15', dateFormat);
      expect(typeof result).toBe('string');
      expect(Number(result)).toBeGreaterThan(0);
    });

    it('should throw error for invalid date format', () => {
      expect(() => parseDateFromTable('invalid-date')).toThrow();
    });

    it('should trim whitespace', () => {
      const result = parseDateFromTable('  2024-01-15  ');
      expect(result).toBe('2024-01-15');
    });
  });

  describe('formatDateForTable', () => {
    it('should return empty string for undefined', () => {
      expect(formatDateForTable(undefined)).toBe('');
    });

    it('should format Date object', () => {
      const date = new Date('2024-01-15');
      const result = formatDateForTable(date);
      expect(result).toBe('2024-01-15');
    });

    it('should format ISO string', () => {
      const result = formatDateForTable('2024-01-15');
      expect(result).toBe('2024-01-15');
    });

    it('should format timestamp', () => {
      const timestamp = new Date('2024-01-15').getTime();
      const result = formatDateForTable(timestamp);
      expect(result).toBe('2024-01-15');
    });

    it('should use custom display format', () => {
      const dateFormat = {
        displayFormat: 'MM/DD/YYYY',
      };

      const date = new Date('2024-01-15');
      const result = formatDateForTable(date, dateFormat);
      expect(result).toBe('01/15/2024');
    });

    it('should return empty string for invalid date', () => {
      const invalidDate = new Date('invalid');
      expect(formatDateForTable(invalidDate)).toBe('');
    });

    it('should handle DD-MM-YYYY format', () => {
      const dateFormat = {
        displayFormat: 'DD-MM-YYYY',
      };

      const date = new Date('2024-01-15');
      const result = formatDateForTable(date, dateFormat);
      expect(result).toBe('15-01-2024');
    });
  });

  describe('validateDate', () => {
    it('should return null for valid date', () => {
      const column: ColumnDefinition = {
        id: 'date',
        type: 'date',
      };

      expect(validateDate('2024-01-15', column)).toBeNull();
    });

    it('should return error for required empty value', () => {
      const column: ColumnDefinition = {
        id: 'date',
        type: 'date',
        required: true,
      };

      const result = validateDate('', column);
      expect(result).toBe('date is required');
    });

    it('should return null for empty non-required value', () => {
      const column: ColumnDefinition = {
        id: 'date',
        type: 'date',
        required: false,
      };

      expect(validateDate('', column)).toBeNull();
    });

    it('should return error for invalid date format', () => {
      const column: ColumnDefinition = {
        id: 'date',
        type: 'date',
      };

      const result = validateDate('invalid-date', column);
      expect(result).toContain('Invalid date format');
    });

    it('should show expected formats in error message', () => {
      const column: ColumnDefinition = {
        id: 'date',
        type: 'date',
        dateFormat: {
          inputFormats: ['MM/DD/YYYY', 'YYYY-MM-DD'],
        },
      };

      const result = validateDate('invalid', column);
      expect(result).toContain('MM/DD/YYYY');
      expect(result).toContain('YYYY-MM-DD');
    });
  });
});
