import {
  dateUtils,
  fromISODate,
  fromISODateTime,
  fromTimestamp,
  toISODate,
  toISODateTime,
  toReadableDate,
  toReadableMonthDay,
  toTimestamp,
} from '@domain/functions/dateUtils';
import { describe, expect, it } from 'vitest';

const FIXED_DATE = new Date('2024-03-15T12:00:00.000Z');

describe('dateUtils', () => {
  describe('toISODateTime', () => {
    it('returns full ISO 8601 string', () => {
      expect(toISODateTime(FIXED_DATE)).toBe('2024-03-15T12:00:00.000Z');
    });
  });

  describe('toISODate', () => {
    it('returns YYYY-MM-DD portion of UTC date', () => {
      expect(toISODate(FIXED_DATE)).toBe('2024-03-15');
    });
  });

  describe('toTimestamp', () => {
    it('returns milliseconds since epoch', () => {
      expect(toTimestamp(FIXED_DATE)).toBe(FIXED_DATE.getTime());
    });

    it('returns 0 for epoch', () => {
      expect(toTimestamp(new Date(0))).toBe(0);
    });
  });

  describe('toReadableDate', () => {
    it('returns locale-formatted date string', () => {
      const result = toReadableDate(FIXED_DATE);
      expect(result).toContain('2024');
      expect(result).toContain('15');
    });
  });

  describe('fromISODateTime', () => {
    it('parses a valid ISO 8601 string into a Date', () => {
      const result = fromISODateTime('2024-03-15T12:00:00.000Z');
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe('2024-03-15T12:00:00.000Z');
    });

    it('throws TypeError for empty string', () => {
      expect(() => fromISODateTime('')).toThrow(TypeError);
    });

    it('throws TypeError for non-date string', () => {
      expect(() => fromISODateTime('not-a-date')).toThrow(TypeError);
    });
  });

  describe('fromISODate', () => {
    it('parses YYYY-MM-DD into a Date with correct year, month, day', () => {
      const result = fromISODate('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0); // 0-based
      expect(result.getDate()).toBe(15);
    });

    it('throws for MM/DD/YYYY format', () => {
      expect(() => fromISODate('03/15/2024')).toThrow();
    });

    it('throws for non-date string', () => {
      expect(() => fromISODate('hello')).toThrow();
    });
  });

  describe('toReadableMonthDay', () => {
    it('formats YYYY-MM-DD as "Month Day" in UTC', () => {
      expect(toReadableMonthDay('2024-03-02')).toBe('March 2');
    });

    it('formats January 1 correctly', () => {
      expect(toReadableMonthDay('2024-01-01')).toBe('January 1');
    });
  });

  describe('fromTimestamp', () => {
    it('parses 0 into the Unix epoch Date', () => {
      const result = fromTimestamp(0);
      expect(result.getTime()).toBe(0);
    });

    it('parses a known timestamp correctly', () => {
      const ts = FIXED_DATE.getTime();
      expect(fromTimestamp(ts).toISOString()).toBe('2024-03-15T12:00:00.000Z');
    });

    it('throws TypeError for negative timestamp', () => {
      expect(() => fromTimestamp(-1)).toThrow(TypeError);
    });

    it('throws TypeError for non-safe-integer', () => {
      expect(() => fromTimestamp(Number.MAX_SAFE_INTEGER + 1)).toThrow(
        TypeError,
      );
    });
  });

  describe('dateUtils frozen object', () => {
    it('exposes all utility functions', () => {
      expect(typeof dateUtils.toISODate).toBe('function');
      expect(typeof dateUtils.toISODateTime).toBe('function');
      expect(typeof dateUtils.toReadableDate).toBe('function');
      expect(typeof dateUtils.toReadableMonthDay).toBe('function');
      expect(typeof dateUtils.toTimestamp).toBe('function');
      expect(typeof dateUtils.fromISODate).toBe('function');
      expect(typeof dateUtils.fromISODateTime).toBe('function');
      expect(typeof dateUtils.fromTimestamp).toBe('function');
    });

    it('is frozen', () => {
      expect(Object.isFrozen(dateUtils)).toBe(true);
    });
  });
});
