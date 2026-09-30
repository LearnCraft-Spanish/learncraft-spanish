import type { ColumnDefinition } from '@domain/PasteTable';
import {
  convertCellValue,
  formatBooleanForTable,
  normalizeDate,
  parseBoolean,
} from '@domain/PasteTable/functions/typeConversions';
import { describe, expect, it } from 'vitest';

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

      it('should accept every true token when format is auto', () => {
        expect(parseBoolean('true', 'auto')).toBe(true);
        expect(parseBoolean('1', 'auto')).toBe(true);
        expect(parseBoolean(' yes ', 'auto')).toBe(true);
        expect(parseBoolean('Y', 'auto')).toBe(true);
      });

      it('should reject tokens that are not an accepted true value', () => {
        expect(parseBoolean('')).toBe(false);
        expect(parseBoolean('false', 'auto')).toBe(false);
        expect(parseBoolean('no')).toBe(false);
        expect(parseBoolean('yep')).toBe(false);
        expect(parseBoolean('2')).toBe(false);
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

      it('should trim and ignore the other true tokens', () => {
        expect(parseBoolean(' TRUE ', 'true-false')).toBe(true);
        expect(parseBoolean('yes', 'true-false')).toBe(false);
        expect(parseBoolean('y', 'true-false')).toBe(false);
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

      it('should trim and ignore lookalike tokens', () => {
        expect(parseBoolean(' YES ', 'yes-no')).toBe(true);
        expect(parseBoolean('y', 'yes-no')).toBe(false);
        expect(parseBoolean('1', 'yes-no')).toBe(false);
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

      it('should trim and ignore lookalike tokens', () => {
        expect(parseBoolean(' 1 ', '1-0')).toBe(true);
        expect(parseBoolean('yes', '1-0')).toBe(false);
        expect(parseBoolean('2', '1-0')).toBe(false);
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

      it('should trim and ignore lookalike tokens', () => {
        expect(parseBoolean(' Y ', 'y-n')).toBe(true);
        expect(parseBoolean('yes', 'y-n')).toBe(false);
        expect(parseBoolean('1', 'y-n')).toBe(false);
      });

      it('should return undefined for a format it does not implement', () => {
        expect(parseBoolean('true', 'nope' as 'yes-no')).toBeUndefined();
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

    it('should format auto and true-false with boolean strings', () => {
      expect(formatBooleanForTable(true, 'auto')).toBe('true');
      expect(formatBooleanForTable(false, 'auto')).toBe('false');
      expect(formatBooleanForTable(true, 'true-false')).toBe('true');
      expect(formatBooleanForTable(false, 'true-false')).toBe('false');
    });

    it('should stringify an unrecognized format', () => {
      expect(formatBooleanForTable(true, 'nope' as 'yes-no')).toBe('true');
      expect(formatBooleanForTable(false, 'nope' as 'yes-no')).toBe('false');
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
      expect(convertCellValue('  hello  ', column)).toBe('  hello  ');
    });

    it('should stringify the parsed boolean for each boolean format', () => {
      expect(
        convertCellValue(' YES ', {
          id: 'active',
          type: 'boolean',
          booleanFormat: 'yes-no',
        }),
      ).toBe('true');
      expect(
        convertCellValue('no', {
          id: 'active',
          type: 'boolean',
          booleanFormat: 'yes-no',
        }),
      ).toBe('false');
      expect(
        convertCellValue('1', {
          id: 'active',
          type: 'boolean',
          booleanFormat: '1-0',
        }),
      ).toBe('true');
      expect(
        convertCellValue('y', {
          id: 'active',
          type: 'boolean',
          booleanFormat: 'y-n',
        }),
      ).toBe('true');
      expect(convertCellValue('', { id: 'active', type: 'boolean' })).toBe(
        'false',
      );
    });

    it('should coerce numbers instead of returning the original text', () => {
      const column: ColumnDefinition = { id: 'count', type: 'number' };

      expect(convertCellValue('  08 ', column)).toBe('8');
      expect(convertCellValue('', column)).toBe('0');
      expect(convertCellValue('abc', column)).toBe('NaN');
      expect(convertCellValue('1e2', column)).toBe('100');
      expect(convertCellValue('0.0', column)).toBe('0');
    });

    it('should normalize each supported date shape', () => {
      const column: ColumnDefinition = { id: 'date', type: 'date' };

      expect(convertCellValue('  15-01-2024  ', column)).toBe('2024-01-15');
      expect(convertCellValue('', column)).toBe('');
      expect(convertCellValue('not-a-date', column)).toBe('not-a-date');
      expect(convertCellValue('02/31/2024', column)).toBe('2024-02-31');
    });

    it('should return select, custom, and read-only values unchanged', () => {
      expect(convertCellValue('Hello', { id: 'status', type: 'select' })).toBe(
        'Hello',
      );
      expect(convertCellValue(' [1] ', { id: 'payload', type: 'custom' })).toBe(
        ' [1] ',
      );
      expect(
        convertCellValue('locked', { id: 'label', type: 'read-only' }),
      ).toBe('locked');
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

    it('should keep an impossible ISO date instead of letting native parsing roll it over', () => {
      expect(normalizeDate('2024-02-31')).toBe('2024-02-31');
      expect(normalizeDate('2023-02-29')).toBe('2023-02-29');
      expect(normalizeDate('2024-13-01')).toBe('2024-13-01');
    });

    it('should rearrange a strict US date and leave strings the pattern does not match', () => {
      expect(normalizeDate('02/03/2024')).toBe('2024-02-03');
      expect(normalizeDate('02/31/2024')).toBe('2024-02-31');
      expect(normalizeDate('1/15/2024')).toBe('2024-01-15');
      expect(normalizeDate('01/5/2024')).toBe('2024-01-05');
      expect(normalizeDate('01/15/2')).toBe('2002-01-15');
      expect(normalizeDate('01/15/2024x')).toBe('01/15/2024x');
      expect(normalizeDate('x01/15/2024')).toBe('x01/15/2024');
      expect(normalizeDate('ab/15/2024')).toBe('ab/15/2024');
      expect(normalizeDate('01/ab/2024')).toBe('01/ab/2024');
      expect(normalizeDate('01/15/abcd')).toBe('01/15/abcd');
    });

    it('should rearrange a strict European date, including an impossible month', () => {
      expect(normalizeDate('03-02-2024')).toBe('2024-02-03');
      expect(normalizeDate('01-15-2024')).toBe('2024-15-01');
      expect(normalizeDate('31-02-2024')).toBe('2024-02-31');
      expect(normalizeDate('1-01-2024')).toBe('2024-01-01');
      expect(normalizeDate('15-1-2024')).toBe('15-1-2024');
      expect(normalizeDate('15-01-2024x')).toBe('15-01-2024x');
      expect(normalizeDate('x15-01-2024')).toBe('x15-01-2024');
      expect(normalizeDate('ab-01-2024')).toBe('ab-01-2024');
      expect(normalizeDate('15-ab-2024')).toBe('15-ab-2024');
      expect(normalizeDate('15-01-abcd')).toBe('15-01-abcd');
    });

    it('should use native parsing only after the strict patterns miss', () => {
      expect(normalizeDate('2024-1-15')).toBe('2024-01-15');
      expect(normalizeDate('2024-01-5')).toBe('2024-01-05');
      expect(normalizeDate('2-01-15')).toBe('2015-02-01');
      expect(normalizeDate('January 15, 2024')).toBe('2024-01-15');
    });

    it('should return the original text when nothing can parse it', () => {
      expect(normalizeDate('not-a-date')).toBe('not-a-date');
      expect(normalizeDate('x2024-02-31')).toBe('x2024-02-31');
      expect(normalizeDate('2024-02-31x')).toBe('2024-02-31x');
    });
  });
});
