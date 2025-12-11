import { describe, it, expect } from 'vitest';
import {
  parseBoolean,
  formatBooleanForTable,
  convertCellValue,
  normalizeDate,
} from './typeConversions';
import type { ColumnDefinition } from '@domain/PasteTable/types';

describe('typeConversions', () => {
  describe('parseBoolean', () => {
    describe('auto format', () => {
      it('should parse "true" as true', () => {
        expect(parseBoolean('true')).toBe(true);
        expect(parseBoolean('TRUE')).toBe(true);
        expect(parseBoolean('True')).toBe(true);
      });

      it('should parse "1" as true', () => {
        expect(parseBoolean('1')).toBe(true);
      });

      it('should parse "yes" as true', () => {
        expect(parseBoolean('yes')).toBe(true);
        expect(parseBoolean('YES')).toBe(true);
        expect(parseBoolean('Yes')).toBe(true);
      });

      it('should parse "y" as true', () => {
        expect(parseBoolean('y')).toBe(true);
        expect(parseBoolean('Y')).toBe(true);
      });

      it('should parse "false" as false', () => {
        expect(parseBoolean('false')).toBe(false);
        expect(parseBoolean('FALSE')).toBe(false);
      });

      it('should parse "0" as false', () => {
        expect(parseBoolean('0')).toBe(false);
      });

      it('should parse "no" as false', () => {
        expect(parseBoolean('no')).toBe(false);
        expect(parseBoolean('NO')).toBe(false);
      });

      it('should parse "n" as false', () => {
        expect(parseBoolean('n')).toBe(false);
        expect(parseBoolean('N')).toBe(false);
      });

      it('should trim whitespace', () => {
        expect(parseBoolean('  true  ')).toBe(true);
        expect(parseBoolean('  false  ')).toBe(false);
      });
    });

    describe('true-false format', () => {
      it('should parse "true" as true', () => {
        expect(parseBoolean('true', 'true-false')).toBe(true);
      });

      it('should parse "false" as false', () => {
        expect(parseBoolean('false', 'true-false')).toBe(false);
      });

      it('should not parse "1" as true', () => {
        expect(parseBoolean('1', 'true-false')).toBe(false);
      });
    });

    describe('yes-no format', () => {
      it('should parse "yes" as true', () => {
        expect(parseBoolean('yes', 'yes-no')).toBe(true);
      });

      it('should parse "no" as false', () => {
        expect(parseBoolean('no', 'yes-no')).toBe(false);
      });

      it('should not parse "true" as true', () => {
        expect(parseBoolean('true', 'yes-no')).toBe(false);
      });
    });

    describe('1-0 format', () => {
      it('should parse "1" as true', () => {
        expect(parseBoolean('1', '1-0')).toBe(true);
      });

      it('should parse "0" as false', () => {
        expect(parseBoolean('0', '1-0')).toBe(false);
      });

      it('should not parse "true" as true', () => {
        expect(parseBoolean('true', '1-0')).toBe(false);
      });
    });

    describe('y-n format', () => {
      it('should parse "y" as true', () => {
        expect(parseBoolean('y', 'y-n')).toBe(true);
      });

      it('should parse "n" as false', () => {
        expect(parseBoolean('n', 'y-n')).toBe(false);
      });

      it('should not parse "yes" as true', () => {
        expect(parseBoolean('yes', 'y-n')).toBe(false);
      });
    });
  });

  describe('formatBooleanForTable', () => {
    it('should format true as "true" by default', () => {
      expect(formatBooleanForTable(true)).toBe('true');
    });

    it('should format false as "false" by default', () => {
      expect(formatBooleanForTable(false)).toBe('false');
    });

    it('should format with yes-no format', () => {
      expect(formatBooleanForTable(true, 'yes-no')).toBe('yes');
      expect(formatBooleanForTable(false, 'yes-no')).toBe('no');
    });

    it('should format with 1-0 format', () => {
      expect(formatBooleanForTable(true, '1-0')).toBe('1');
      expect(formatBooleanForTable(false, '1-0')).toBe('0');
    });

    it('should format with y-n format', () => {
      expect(formatBooleanForTable(true, 'y-n')).toBe('y');
      expect(formatBooleanForTable(false, 'y-n')).toBe('n');
    });
  });

  describe('convertCellValue', () => {
    it('should convert boolean values', () => {
      const column: ColumnDefinition = {
        id: 'active',
        type: 'boolean',
        booleanFormat: 'auto',
      };

      expect(convertCellValue('true', column)).toBe('true');
      expect(convertCellValue('yes', column)).toBe('true');
      expect(convertCellValue('false', column)).toBe('false');
    });

    it('should convert number values', () => {
      const column: ColumnDefinition = {
        id: 'count',
        type: 'number',
      };

      expect(convertCellValue('123', column)).toBe('123');
      expect(convertCellValue('45.67', column)).toBe('45.67');
    });

    it('should normalize date values', () => {
      const column: ColumnDefinition = {
        id: 'date',
        type: 'date',
      };

      expect(convertCellValue('2024-01-15', column)).toBe('2024-01-15');
      expect(convertCellValue('01/15/2024', column)).toBe('2024-01-15');
    });

    it('should return text values as-is', () => {
      const column: ColumnDefinition = {
        id: 'name',
        type: 'text',
      };

      expect(convertCellValue('hello', column)).toBe('hello');
    });
  });

  describe('normalizeDate', () => {
    it('should return empty string for empty input', () => {
      expect(normalizeDate('')).toBe('');
      expect(normalizeDate('   ')).toBe('');
    });

    it('should keep ISO format as-is', () => {
      expect(normalizeDate('2024-01-15')).toBe('2024-01-15');
    });

    it('should convert MM/DD/YYYY to ISO', () => {
      expect(normalizeDate('01/15/2024')).toBe('2024-01-15');
    });

    it('should convert DD-MM-YYYY to ISO', () => {
      expect(normalizeDate('15-01-2024')).toBe('2024-01-15');
    });

    it('should handle native Date parsing as fallback', () => {
      const result = normalizeDate('January 15, 2024');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should trim whitespace', () => {
      expect(normalizeDate('  2024-01-15  ')).toBe('2024-01-15');
    });
  });
});

