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
      expect(normalizeNumber('  abc  ')).toBe('abc');
    });

    it('should trim surrounding whitespace before normalizing', () => {
      expect(normalizeNumber('  42  ')).toBe('42');
      expect(normalizeNumber(' 1.2500 ')).toBe('1.25');
    });

    it('should drop leading zeros and keep the sign', () => {
      expect(normalizeNumber('007')).toBe('7');
      expect(normalizeNumber('-3.50')).toBe('-3.5');
    });

    it('should keep a decimal that has no trailing zeros', () => {
      expect(normalizeNumber('0.5')).toBe('0.5');
      expect(normalizeNumber('10.25')).toBe('10.25');
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

    it('should format with y-n', () => {
      expect(normalizeBoolean(' Y ', 'y-n')).toBe('y');
      expect(normalizeBoolean('n', 'y-n')).toBe('n');
    });

    it('should accept any true or false spelling when the format is auto', () => {
      expect(normalizeBoolean('yes', 'auto')).toBe('true');
      expect(normalizeBoolean('1', 'auto')).toBe('true');
      expect(normalizeBoolean('no', 'auto')).toBe('false');
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

    it('should preserve internal spaces', () => {
      expect(normalizeText('  hello   world  ')).toBe('hello   world');
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

      it('should format each boolean format in its own canonical spelling', () => {
        const base = { id: 'active', type: 'boolean' } as const;

        expect(normalizeCellValue('Y', { ...base, booleanFormat: 'y-n' })).toBe(
          'y',
        );
        expect(normalizeCellValue('0', { ...base, booleanFormat: '1-0' })).toBe(
          '0',
        );
        expect(
          normalizeCellValue('TRUE', { ...base, booleanFormat: 'true-false' }),
        ).toBe('true');
      });

      it('should read any accepted spelling and write true/false when the format is auto', () => {
        const column: ColumnDefinition = {
          id: 'active',
          type: 'boolean',
          booleanFormat: 'auto',
        };

        expect(normalizeCellValue('yes', column)).toBe('true');
        expect(normalizeCellValue('no', column)).toBe('false');
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
        expect(normalizeCellValue('  abc  ', column)).toBe('abc');
      });

      it('should trim before normalizing', () => {
        expect(normalizeCellValue('  42  ', column)).toBe('42');
        expect(normalizeCellValue(' 1.2500 ', column)).toBe('1.25');
      });

      it('should keep the sign of negative numbers', () => {
        expect(normalizeCellValue('-7.0', column)).toBe('-7');
        expect(normalizeCellValue('-3.50', column)).toBe('-3.5');
      });

      it('should produce the same result as normalizeNumber', () => {
        for (const value of ['42', '42.0', '1.2500', ' 007 ', 'abc', '0.5']) {
          expect(normalizeCellValue(value, column)).toBe(
            normalizeNumber(value),
          );
        }
      });
    });

    describe('date', () => {
      it('should convert MM/DD/YYYY to ISO', () => {
        const column: ColumnDefinition = { id: 'date', type: 'date' };
        expect(normalizeCellValue('01/15/2024', column)).toBe('2024-01-15');
      });

      it('should convert DD-MM-YYYY to ISO', () => {
        const column: ColumnDefinition = { id: 'date', type: 'date' };
        expect(normalizeCellValue('15-01-2024', column)).toBe('2024-01-15');
      });

      it('should keep an ISO date and trim surrounding whitespace', () => {
        const column: ColumnDefinition = { id: 'date', type: 'date' };
        expect(normalizeCellValue('  2024-01-15  ', column)).toBe('2024-01-15');
      });

      it('should return text that is not a date unchanged apart from trimming', () => {
        const column: ColumnDefinition = { id: 'date', type: 'date' };
        expect(normalizeCellValue('  not-a-date  ', column)).toBe('not-a-date');
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

      it('should keep the option value when the input already matches it exactly', () => {
        const column: ColumnDefinition = {
          id: 'status',
          type: 'select',
          options: [
            { value: 'Foo', label: 'Foo' },
            { value: 'Bar', label: 'Bar' },
          ],
        };
        expect(normalizeCellValue('Bar', column)).toBe('Bar');
      });

      it('should match a padded input against the options', () => {
        const column: ColumnDefinition = {
          id: 'status',
          type: 'select',
          options: [{ value: 'Foo', label: 'Foo' }],
        };
        expect(normalizeCellValue('  FOO  ', column)).toBe('Foo');
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

      it('should match against the options with the custom separator and padding', () => {
        const column: ColumnDefinition = {
          id: 'tags',
          type: 'multi-select',
          options,
          separator: '|',
        };
        expect(normalizeCellValue(' a | b | c ', column)).toBe('A|B|c');
      });

      it('should keep a single matched value without adding a separator', () => {
        const column: ColumnDefinition = {
          id: 'tags',
          type: 'multi-select',
          options,
        };
        expect(normalizeCellValue('b', column)).toBe('B');
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

      it('should preserve internal spaces in text values', () => {
        const column: ColumnDefinition = { id: 'name', type: 'text' };
        expect(normalizeCellValue('  hello   world  ', column)).toBe(
          'hello   world',
        );
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

    it('should normalize boolean, select, and date cells together', () => {
      const columns: ColumnDefinition[] = [
        { id: 'active', type: 'boolean', booleanFormat: 'yes-no' },
        {
          id: 'status',
          type: 'select',
          options: [{ value: 'Foo', label: 'Foo' }],
        },
        { id: 'date', type: 'date' },
      ];
      expect(
        normalizeRowCells(
          { active: 'YES', status: 'foo', date: '01/15/2024' },
          columns,
        ),
      ).toEqual({ active: 'yes', status: 'Foo', date: '2024-01-15' });
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
