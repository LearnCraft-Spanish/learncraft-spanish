import { calculateNewSrsInterval } from '@domain/srs';
import { describe, expect, it } from 'vitest';

describe('calculateNewSrsInterval', () => {
  describe('easy difficulty', () => {
    it('should increase interval by 1 when difficulty is easy', () => {
      expect(calculateNewSrsInterval(0, 'easy')).toBe(1);
      expect(calculateNewSrsInterval(5, 'easy')).toBe(6);
      expect(calculateNewSrsInterval(10, 'easy')).toBe(11);
    });
  });

  describe('hard difficulty', () => {
    it('should decrease interval by 1 when difficulty is hard', () => {
      expect(calculateNewSrsInterval(5, 'hard')).toBe(4);
      expect(calculateNewSrsInterval(10, 'hard')).toBe(9);
    });

    it('should not go below 0 when difficulty is hard', () => {
      expect(calculateNewSrsInterval(0, 'hard')).toBe(0);
      expect(calculateNewSrsInterval(1, 'hard')).toBe(0);
    });
  });

  describe('viewed difficulty', () => {
    it('should keep the same interval when difficulty is viewed', () => {
      expect(calculateNewSrsInterval(0, 'viewed')).toBe(0);
      expect(calculateNewSrsInterval(5, 'viewed')).toBe(5);
      expect(calculateNewSrsInterval(10, 'viewed')).toBe(10);
    });
  });
});
