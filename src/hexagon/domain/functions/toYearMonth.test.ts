import { toYearMonth } from '@domain/functions/toYearMonth';
import { describe, expect, it } from 'vitest';

describe('toYearMonth', () => {
  it('returns YYYY-MM from a YYYY-MM-DD string', () => {
    expect(toYearMonth('2026-03-15')).toBe('2026-03');
  });

  it('returns YYYY-MM from an ISO datetime string without timezone shift', () => {
    expect(toYearMonth('2026-01-01T23:00:00.000Z')).toBe('2026-01');
  });

  it('returns YYYY-MM from a Date using local calendar month', () => {
    expect(toYearMonth(new Date(2026, 6, 22))).toBe('2026-07');
  });

  it('pads single-digit months', () => {
    expect(toYearMonth('2026-09-01')).toBe('2026-09');
  });

  it('throws for an invalid string', () => {
    expect(() => toYearMonth('not-a-date')).toThrow(TypeError);
  });

  it('throws for an invalid Date', () => {
    expect(() => toYearMonth(new Date(Number.NaN))).toThrow(TypeError);
  });
});
