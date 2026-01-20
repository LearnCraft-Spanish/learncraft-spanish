import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import { convertDataToRows } from '@application/units/pasteTable/utils/rowCreation';
import { describe, expect, it } from 'vitest';

const testColumns: ColumnDefinition[] = [
  { id: 'name', type: 'text' },
  { id: 'age', type: 'number' },
  { id: 'city', type: 'text' },
];

describe('convertDataToRows', () => {
  describe('success cases', () => {
    it('should convert simple typed data to rows with matching columns', () => {
      // Given: An array of typed objects and matching columns
      const data = [
        { name: 'Alice', age: 30, city: 'New York' },
        { name: 'Bob', age: 25, city: 'Los Angeles' },
      ];

      // When: convertDataToRows is called
      const result: TableRow[] = convertDataToRows(data, testColumns);

      // Then: Returns array of TableRow objects with correct structure
      expect(result).toHaveLength(2);

      // First row
      expect(result[0]).toHaveProperty('id');
      expect(result[0].id).toBeTruthy();
      expect(result[0].cells).toEqual({
        name: 'Alice',
        age: '30', // Converted to string
        city: 'New York',
      });

      // Second row
      expect(result[1]).toHaveProperty('id');
      expect(result[1].id).toBeTruthy();
      expect(result[1].cells).toEqual({
        name: 'Bob',
        age: '25', // Converted to string
        city: 'Los Angeles',
      });

      // Verify unique IDs
      expect(result[0].id).not.toBe(result[1].id);
    });

    it('should convert undefined values to empty strings', () => {
      // Given: Data objects with undefined properties
      const data = [
        { name: 'Alice', age: undefined, city: 'New York' },
        { name: 'Bob', age: 25, city: undefined },
      ];

      // When: convertDataToRows is called
      const result: TableRow[] = convertDataToRows(data, testColumns);

      // Then: Undefined values become empty strings in cells
      expect(result[0].cells).toEqual({
        name: 'Alice',
        age: '', // undefined converted to empty string
        city: 'New York',
      });

      expect(result[1].cells).toEqual({
        name: 'Bob',
        age: '25',
        city: '', // undefined converted to empty string
      });
    });

    it('should generate unique row IDs for each row', () => {
      // Given: Multiple data objects
      const data = [
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' },
        { name: 'Diana' },
      ];

      // When: convertDataToRows is called
      const result: TableRow[] = convertDataToRows(data, testColumns);

      // Then: Each row has a unique ID
      const ids = result.map((row) => row.id);
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(4);
      expect(uniqueIds.size).toBe(4); // All IDs are unique
    });
  });

  describe('edge cases', () => {
    it('should handle undefined and null values by converting to strings', () => {
      const data = [
        { name: 'Alice', city: 'New York', age: undefined },
        { name: 'Bob', city: null, age: undefined },
      ];

      // When: convertDataToRows is called
      const result: TableRow[] = convertDataToRows(data, testColumns);

      // Then: Boolean and null values are converted to strings
      expect(result[0].cells).toEqual({
        name: 'Alice',
        age: '',
        city: 'New York',
      });

      expect(result[1].cells).toEqual({
        name: 'Bob',
        age: '',
        city: '',
      });
    });
  });
});
