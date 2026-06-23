import type { ColumnDefinition } from '@domain/PasteTable';
import {
  normalizeBoolean,
  normalizeCellValue,
  normalizeNumber,
  normalizeRowCells,
  normalizeText,
} from '@domain/PasteTable/functions/normalization';
import { describe, expect, it } from 'vitest';

const textCol: ColumnDefinition = { id: 'name', type: 'text' };
const numberCol: ColumnDefinition = { id: 'age', type: 'number' };
const boolCol: ColumnDefinition = { id: 'active', type: 'boolean' };
const dateCol: ColumnDefinition = { id: 'birthday', type: 'date' };
const selectCol: ColumnDefinition = {
  id: 'status',
  type: 'select',
  options: [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ],
};
const multiSelectCol: ColumnDefinition = {
  id: 'tags',
  type: 'multi-select',
  options: [
    { value: 'Red', label: 'Red' },
    { value: 'Blue', label: 'Blue' },
    { value: 'Green', label: 'Green' },
  ],
};

describe('normalizeCellValue', () => {
  it('returns empty string for empty input', () => {
    expect(normalizeCellValue('', textCol)).toBe('');
    expect(normalizeCellValue('   ', textCol)).toBe('');
  });

  it('trims text values', () => {
    expect(normalizeCellValue('  hello  ', textCol)).toBe('hello');
  });

  it('normalizes boolean "yes" to canonical "true" format', () => {
    expect(normalizeCellValue('yes', boolCol)).toBe('true');
    expect(normalizeCellValue('no', boolCol)).toBe('false');
  });

  it('normalizes float number "10.0" to integer string "10"', () => {
    expect(normalizeCellValue('10.0', numberCol)).toBe('10');
  });

  it('passes through invalid number as-is', () => {
    expect(normalizeCellValue('abc', numberCol)).toBe('abc');
  });

  it('normalizes ISO date format', () => {
    expect(normalizeCellValue('2024-01-15', dateCol)).toBe('2024-01-15');
  });

  it('normalizes select value case-insensitively', () => {
    expect(normalizeCellValue('active', selectCol)).toBe('Active');
    expect(normalizeCellValue('INACTIVE', selectCol)).toBe('Inactive');
  });

  it('returns unmatched select value as-is', () => {
    expect(normalizeCellValue('Unknown', selectCol)).toBe('Unknown');
  });

  it('normalizes multi-select values case-insensitively', () => {
    expect(normalizeCellValue('red,blue', multiSelectCol)).toBe('Red,Blue');
  });

  it('handles multi-select with extra whitespace around entries', () => {
    expect(normalizeCellValue('red, blue', multiSelectCol)).toBe('Red,Blue');
  });
});

describe('normalizeRowCells', () => {
  const columns: ColumnDefinition[] = [textCol, numberCol, boolCol];

  it('normalizes all columns in a row', () => {
    const cells = { name: '  Alice  ', age: '25.0', active: 'yes' };
    const result = normalizeRowCells(cells, columns);
    expect(result.name).toBe('Alice');
    expect(result.age).toBe('25');
    expect(result.active).toBe('true');
  });

  it('fills missing cells with empty string', () => {
    const result = normalizeRowCells({}, columns);
    expect(result.name).toBe('');
    expect(result.age).toBe('');
    expect(result.active).toBe('');
  });
});

describe('normalizeNumber', () => {
  it('returns empty string for empty input', () => {
    expect(normalizeNumber('')).toBe('');
    expect(normalizeNumber('   ')).toBe('');
  });

  it('converts integer float to integer string', () => {
    expect(normalizeNumber('5.0')).toBe('5');
    expect(normalizeNumber('100.00')).toBe('100');
  });

  it('removes trailing zeros from decimal', () => {
    expect(normalizeNumber('3.50')).toBe('3.5');
  });

  it('returns invalid string as-is', () => {
    expect(normalizeNumber('abc')).toBe('abc');
  });
});

describe('normalizeBoolean', () => {
  it('returns empty string for empty input', () => {
    expect(normalizeBoolean('')).toBe('');
  });

  it('normalizes truthy value to "true" in true-false format', () => {
    expect(normalizeBoolean('true')).toBe('true');
  });

  it('normalizes falsy value to "false" in true-false format', () => {
    expect(normalizeBoolean('false')).toBe('false');
    expect(normalizeBoolean('other')).toBe('false');
  });

  it('normalizes to "yes"/"no" when format is yes-no', () => {
    expect(normalizeBoolean('yes', 'yes-no')).toBe('yes');
    expect(normalizeBoolean('no', 'yes-no')).toBe('no');
  });
});

describe('normalizeText', () => {
  it('returns empty string for empty input', () => {
    expect(normalizeText('')).toBe('');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeText('  hello world  ')).toBe('hello world');
  });
});
