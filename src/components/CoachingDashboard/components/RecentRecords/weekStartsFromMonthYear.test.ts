import { describe, expect, it } from 'vitest';
import { weekStartsFromMonthYear } from './weekStartsFromMonthYear';

describe('weekStartsFromMonthYear', () => {
  it('returns the Sunday on or before the first of the month', () => {
    // 2026-07-01 is a Wednesday → prior Sunday is 2026-06-28
    expect(weekStartsFromMonthYear('2026-07')).toBe('2026-06-28');
  });

  it('returns the first of the month when it is already Sunday', () => {
    // 2026-02-01 is a Sunday
    expect(weekStartsFromMonthYear('2026-02')).toBe('2026-02-01');
  });

  it('throws for invalid monthYear values', () => {
    expect(() => weekStartsFromMonthYear('2026-13')).toThrow(
      /Invalid monthYear/,
    );
    expect(() => weekStartsFromMonthYear('not-a-month')).toThrow(
      /Invalid monthYear/,
    );
  });
});
