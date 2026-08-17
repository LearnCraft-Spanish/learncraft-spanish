import type { ColumnDefinition } from '@domain/PasteTable';
import {
  normalizeBoolean,
  normalizeCellValue,
  normalizeNumber,
  normalizeRowCells,
  normalizeText,
} from '@domain/PasteTable/functions/normalization';
import { describe, expect, it } from 'vitest';

describe('normalization', () => {
  describe('normalizeNumber', () => {
    it('should return empty string for empty input', () => {
      expect(normalizeNumber('')).toBe('');
    });

    it('should return empty string for whitespace-only input', () => {
      expect(normalizeNumber('   ')).toBe('');
    });

    it('should normalize integers without a decimal', () => {
      expect(normalizeNumber('42')).toBe('42');
      expect(normalizeNumber('10')).toBe('10');
      expect(normalizeNumber('100')).toBe('100');
    });

    it('should normalize integer-valued decimals without a decimal', () => {
      expect(normalizeNumber('42.0')).toBe('42');
    });

    it('should strip trailing zeros from decimals', () => {
      expect(normalizeNumber('1.2500')).toBe('1.25');
    });

    it('should keep invalid numbers trimmed as-is', () => {
      expect(normalizeNumber('abc')).toBe('abc');
    });
  });

  describe('normalizeBoolean', () => {
    it('should return empty string for empty input', () => {
      expect(normalizeBoolean('')).toBe('');
    });

    it('should return empty string for whitespace-only input', () => {
      expect(normalizeBoolean('   ')).toBe('');
    });

    it('should format with 1-0', () => {
      expect(normalizeBoolean('1', '1-0')).toBe('1');
      expect(normalizeBoolean('0', '1-0')).toBe('0');
    });

    it('should format YES with yes-no', () => {
      expect(normalizeBoolean('YES', 'yes-no')).toBe('yes');
      expect(normalizeBoolean('NO', 'yes-no')).toBe('no');
    });

    it('should default to true-false format', () => {
      expect(normalizeBoolean('true')).toBe('true');
      expect(normalizeBoolean('false')).toBe('false');
      expect(normalizeBoolean('TRUE')).toBe('true');
    });
  });

  describe('normalizeText', () => {
    it('should return empty string for empty input', () => {
      expect(normalizeText('')).toBe('');
    });

    it('should return empty string for whitespace-only input', () => {
      expect(normalizeText('   ')).toBe('');
    });

    it('should trim surrounding whitespace', () => {
      expect(normalizeText('  x  ')).toBe('x');
    });
  });

  describe('normalizeCellValue', () => {
    it('should return empty string for empty input before type switch', () => {
      const column: ColumnDefinition = { id: 'name', type: 'text' };
      expect(normalizeCellValue('', column)).toBe('');
    });

    it('should return empty string for whitespace-only input before type switch', () => {
      const column: ColumnDefinition = { id: 'count', type: 'number' };
      expect(normalizeCellValue('   ', column)).toBe('');
    });

    describe('boolean', () => {
      it('should format YES with booleanFormat yes-no', () => {
        const column: ColumnDefinition = {
          id: 'active',
          type: 'boolean',
          booleanFormat: 'yes-no',
        };
        expect(normalizeCellValue(' YES ', column)).toBe('yes');
      });

      it('should default to true-false when booleanFormat is omitted', () => {
        const column: ColumnDefinition = { id: 'active', type: 'boolean' };
        expect(normalizeCellValue(' YES ', column)).toBe('true');
      });
    });

    describe('number', () => {
      const column: ColumnDefinition = { id: 'count', type: 'number' };

      it('should normalize integers without a decimal', () => {
        expect(normalizeCellValue('42', column)).toBe('42');
        expect(normalizeCellValue('10', column)).toBe('10');
        expect(normalizeCellValue('100', column)).toBe('100');
      });

      it('should normalize integer-valued decimals without a decimal', () => {
        expect(normalizeCellValue('42.0', column)).toBe('42');
      });

      it('should strip trailing zeros from decimals', () => {
        expect(normalizeCellValue('1.2500', column)).toBe('1.25');
      });

      it('should keep invalid numbers trimmed as-is', () => {
        expect(normalizeCellValue('abc', column)).toBe('abc');
      });
    });

    describe('date', () => {
      it('should convert MM/DD/YYYY to ISO', () => {
        const column: ColumnDefinition = { id: 'date', type: 'date' };
        expect(normalizeCellValue('01/15/2024', column)).toBe('2024-01-15');
      });
    });

    describe('select', () => {
      it('should return the canonical option value on case-insensitive match', () => {
        const column: ColumnDefinition = {
          id: 'status',
          type: 'select',
          options: [{ value: 'Foo', label: 'Foo' }],
        };
        expect(normalizeCellValue('foo', column)).toBe('Foo');
      });

      it('should return the trimmed value when no option matches', () => {
        const column: ColumnDefinition = {
          id: 'status',
          type: 'select',
          options: [{ value: 'Foo', label: 'Foo' }],
        };
        expect(normalizeCellValue('  bar  ', column)).toBe('bar');
      });

      it('should return the trimmed value when there are no options', () => {
        const column: ColumnDefinition = { id: 'status', type: 'select' };
        expect(normalizeCellValue('  foo  ', column)).toBe('foo');
      });
    });

    describe('multi-select', () => {
      const options = [
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
      ];

      it('should match each value case-insensitively and join with comma', () => {
        const column: ColumnDefinition = {
          id: 'tags',
          type: 'multi-select',
          options,
        };
        expect(normalizeCellValue('a, B', column)).toBe('A,B');
      });

      it('should join with a custom separator', () => {
        const column: ColumnDefinition = {
          id: 'tags',
          type: 'multi-select',
          options,
          separator: ';',
        };
        expect(normalizeCellValue('a; B', column)).toBe('A;B');
      });

      it('should filter empty tokens', () => {
        const column: ColumnDefinition = {
          id: 'tags',
          type: 'multi-select',
          options,
        };
        expect(normalizeCellValue('a,,b', column)).toBe('A,B');
      });

      it('should preserve unmatched values', () => {
        const column: ColumnDefinition = {
          id: 'tags',
          type: 'multi-select',
          options,
        };
        expect(normalizeCellValue('a, xyz', column)).toBe('A,xyz');
      });

      it('should return the trimmed value when there are no options', () => {
        const column: ColumnDefinition = { id: 'tags', type: 'multi-select' };
        expect(normalizeCellValue(' a, B ', column)).toBe('a, B');
      });
    });

    describe('text and default', () => {
      it('should trim text values', () => {
        const column: ColumnDefinition = { id: 'name', type: 'text' };
        expect(normalizeCellValue('  x  ', column)).toBe('x');
      });

      it('should trim textarea values via the default branch', () => {
        const column: ColumnDefinition = { id: 'notes', type: 'textarea' };
        expect(normalizeCellValue('  x  ', column)).toBe('x');
      });
    });
  });

  describe('normalizeRowCells', () => {
    it('should use empty string for a missing cell key', () => {
      const columns: ColumnDefinition[] = [{ id: 'name', type: 'text' }];
      expect(normalizeRowCells({}, columns)).toEqual({ name: '' });
    });

    it('should drop extra cell keys that are not in columns', () => {
      const columns: ColumnDefinition[] = [{ id: 'name', type: 'text' }];
      expect(
        normalizeRowCells({ name: 'x', extra: 'dropped' }, columns),
      ).toEqual({ name: 'x' });
    });

    it('should return an empty object when columns is empty', () => {
      expect(normalizeRowCells({ name: 'x' }, [])).toEqual({});
    });

    it('should normalize each cell according to its column', () => {
      const columns: ColumnDefinition[] = [
        { id: 'name', type: 'text' },
        { id: 'count', type: 'number' },
      ];
      expect(
        normalizeRowCells({ name: '  x  ', count: '42.0' }, columns),
      ).toEqual({ name: 'x', count: '42' });
    });
  });
});
