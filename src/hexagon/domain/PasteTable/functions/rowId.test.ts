import { generateRowId } from '@domain/PasteTable/functions/rowId';
import { describe, expect, it } from 'vitest';

describe('rowId', () => {
  describe('generateRowId', () => {
    it('should generate unique row IDs', () => {
      const id1 = generateRowId();
      const id2 = generateRowId();
      const id3 = generateRowId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should generate IDs with row- prefix and UUID format', () => {
      const id = generateRowId();
      // UUID v4 format: row-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(id).toMatch(
        /^row-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate different IDs on each call', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateRowId());
      }
      expect(ids.size).toBe(100);
    });
  });
});
