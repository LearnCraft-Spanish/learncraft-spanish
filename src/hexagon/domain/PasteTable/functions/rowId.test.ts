import { describe, it, expect, beforeEach } from 'vitest';
import { generateRowId, resetRowIdCounter } from './rowId';

describe('rowId', () => {
  beforeEach(() => {
    resetRowIdCounter();
  });

  describe('generateRowId', () => {
    it('should generate unique row IDs', () => {
      const id1 = generateRowId();
      const id2 = generateRowId();
      const id3 = generateRowId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should generate IDs with expected format', () => {
      const id = generateRowId();
      expect(id).toMatch(/^row-\d+-\d+-\d+$/);
    });

    it('should generate different IDs even with same timestamp', () => {
      const id1 = generateRowId();
      const id2 = generateRowId();

      expect(id1).not.toBe(id2);
    });
  });

  describe('resetRowIdCounter', () => {
    it('should reset counter to 0', () => {
      generateRowId();
      generateRowId();
      const beforeReset = generateRowId();

      resetRowIdCounter();

      const afterReset = generateRowId();
      // Counter should be lower after reset
      expect(afterReset).not.toBe(beforeReset);
    });
  });
});

