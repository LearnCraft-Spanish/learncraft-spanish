import type { ColumnDefinition } from '@domain/PasteTable';
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

    it('should trim whitespace before a format that native parsing cannot rescue', () => {
      expect(parseDateFromTable('  15-01-2024  ')).toBe('2024-01-15');
    });

    it('should keep month and day in the groups the format names', () => {
      expect(parseDateFromTable('02/03/2024')).toBe('2024-02-03');
      expect(parseDateFromTable('03-02-2024')).toBe('2024-02-03');
      expect(parseDateFromTable('2024/02/03')).toBe('2024-02-03');
      expect(parseDateFromTable('2024-02-03')).toBe('2024-02-03');
    });

    it('should keep a leading zero in the iso-date output', () => {
      expect(parseDateFromTable('2024-01-05')).toBe('2024-01-05');
      expect(parseDateFromTable('01/05/2024')).toBe('2024-01-05');
      expect(parseDateFromTable('05-01-2024')).toBe('2024-01-05');
    });

    it('should accept a leap day', () => {
      expect(parseDateFromTable('2024-02-29')).toBe('2024-02-29');
    });

    it('should throw for text that matches none of the anchored formats', () => {
      expect(() => parseDateFromTable('not-a-date')).toThrow(
        'Invalid date format: not-a-date',
      );
      expect(() => parseDateFromTable('  not-a-date  ')).toThrow(
        'Invalid date format: not-a-date',
      );
    });

    it.each([
      'x2024-01-15',
      '2024-01-15x',
      'x01/15/2024',
      '01/15/2024x',
      'x15-01-2024',
      '15-01-2024x',
      'x2024/01/15',
      '2024/01/15x',
    ])('should reject %s when an anchor is required', (value) => {
      expect(() => parseDateFromTable(value)).toThrow(
        `Invalid date format: ${value}`,
      );
    });

    it.each([
      '2024-13-01',
      '2024-00-15',
      '2024-01-00',
      '13/01/2024',
      '00/15/2024',
      '01/00/2024',
    ])('should reject impossible calendar date %s', (value) => {
      expect(() => parseDateFromTable(value)).toThrow(
        `Invalid date format: ${value}`,
      );
    });

    it('should reject a European date when that format is not an allowed input', () => {
      expect(() =>
        parseDateFromTable('15-01-2024', {
          inputFormats: ['MM/DD/YYYY', 'YYYY-MM-DD'],
        }),
      ).toThrow('Invalid date format: 15-01-2024');
    });

    it('should still parse a listed format when other formats are excluded', () => {
      expect(
        parseDateFromTable('01/15/2024', { inputFormats: ['MM/DD/YYYY'] }),
      ).toBe('2024-01-15');
      expect(
        parseDateFromTable('15-01-2024', { inputFormats: ['DD-MM-YYYY'] }),
      ).toBe('2024-01-15');
    });

    it('should fall through to native parsing when no configured format matches', () => {
      expect(parseDateFromTable('2024-1-15', { inputFormats: [] })).toBe(
        '2024-01-15',
      );
      expect(parseDateFromTable('January 15, 2024')).toBe('2024-01-15');
    });

    it('should keep the requested output format when parsing falls through to the native Date parser', () => {
      const native = new Date('January 15, 2024');

      expect(
        parseDateFromTable('January 15, 2024', { outputFormat: 'timestamp' }),
      ).toBe(String(native.getTime()));
      expect(
        parseDateFromTable('January 15, 2024', { outputFormat: 'iso' }),
      ).toBe(native.toISOString());
      expect(
        parseDateFromTable('January 15, 2024', { outputFormat: 'Date' }),
      ).toEqual(native);
    });

    it('should return the manual date for each output format', () => {
      const manual = new Date(2024, 0, 15);

      expect(
        parseDateFromTable('2024-01-15', { outputFormat: 'Date' }),
      ).toEqual(manual);
      expect(parseDateFromTable('01/15/2024', { outputFormat: 'iso' })).toBe(
        manual.toISOString(),
      );
      expect(
        parseDateFromTable('15-01-2024', { outputFormat: 'timestamp' }),
      ).toBe(String(manual.getTime()));
      expect(
        parseDateFromTable('2024/01/15', { outputFormat: 'iso-date' }),
      ).toBe('2024-01-15');
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

    it('should return an empty string for an empty string, zero, and a non-date value', () => {
      expect(formatDateForTable('')).toBe('');
      expect(formatDateForTable(0)).toBe('');
      expect(formatDateForTable(true as unknown as Date)).toBe('');
    });

    it('should return an empty string for an unparseable date string', () => {
      expect(formatDateForTable('not-a-date')).toBe('');
    });

    it('should zero-pad month and day in every display format', () => {
      const date = new Date('2024-01-05T00:00:00.000Z');

      expect(formatDateForTable(date)).toBe('2024-01-05');
      expect(formatDateForTable(date, { displayFormat: 'YYYY-MM-DD' })).toBe(
        '2024-01-05',
      );
      expect(formatDateForTable(date, { displayFormat: 'MM/DD/YYYY' })).toBe(
        '01/05/2024',
      );
      expect(formatDateForTable(date, { displayFormat: 'DD-MM-YYYY' })).toBe(
        '05-01-2024',
      );
    });

    it('should format an ISO datetime string and a numeric timestamp with UTC calendar parts', () => {
      const timestamp = Date.parse('2024-01-05T00:00:00.000Z');

      expect(formatDateForTable('2024-01-05T00:00:00.000Z')).toBe('2024-01-05');
      expect(formatDateForTable(timestamp)).toBe('2024-01-05');
      expect(
        formatDateForTable(timestamp, { displayFormat: 'MM/DD/YYYY' }),
      ).toBe('01/05/2024');
    });

    it('should use the ISO date when the display format is not one of the known patterns', () => {
      expect(
        formatDateForTable(new Date('2024-01-05T00:00:00.000Z'), {
          displayFormat: 'MMM DD, YYYY',
        }),
      ).toBe('2024-01-05');
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

    it('should return null for a non-date column', () => {
      const column: ColumnDefinition = {
        id: 'name',
        type: 'text',
        required: true,
      };

      expect(validateDate('not-a-date', column)).toBeNull();
      expect(validateDate('', column)).toBeNull();
    });

    it('should name the column id when a required date is blank or whitespace', () => {
      const column: ColumnDefinition = {
        id: 'birthday',
        type: 'date',
        required: true,
      };

      expect(validateDate('', column)).toBe('birthday is required');
      expect(validateDate('   ', column)).toBe('birthday is required');
      expect(validateDate('2024-01-15', column)).toBeNull();
      expect(validateDate('  2024-01-15  ', column)).toBeNull();
    });

    it('should accept whitespace-only input when the date is not required', () => {
      const column: ColumnDefinition = {
        id: 'birthday',
        type: 'date',
      };

      expect(validateDate('   ', column)).toBeNull();
      expect(validateDate('  2024-01-15  ', column)).toBeNull();
    });

    it('should report the default format when a date column has no input formats', () => {
      const column: ColumnDefinition = {
        id: 'date',
        type: 'date',
      };

      expect(validateDate('not-a-date', column)).toBe(
        'Invalid date format. Expected: YYYY-MM-DD',
      );
    });

    it('should report only the configured formats, joined in order', () => {
      const column: ColumnDefinition = {
        id: 'date',
        type: 'date',
        dateFormat: {
          inputFormats: ['MM/DD/YYYY', 'YYYY-MM-DD'],
        },
      };

      expect(validateDate('15-01-2024', column)).toBe(
        'Invalid date format. Expected: MM/DD/YYYY, YYYY-MM-DD',
      );
      expect(validateDate('01/15/2024', column)).toBeNull();
    });

    it('should fall back to the default format label when inputFormats is empty', () => {
      const column: ColumnDefinition = {
        id: 'date',
        type: 'date',
        dateFormat: {
          inputFormats: [],
        },
      };

      expect(validateDate('not-a-date', column)).toBe(
        'Invalid date format. Expected: YYYY-MM-DD',
      );
    });
  });
});
