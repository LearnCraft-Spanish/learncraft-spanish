import type { TableColumn, TableRow } from '@domain/PasteTable/General';
import { convertDataToRows } from '@application/units/pasteTable/General/utils/rowCreation';
import { resetRowIdCounter } from '@application/units/pasteTable/utils/rowCreation';
import { beforeEach, describe, expect, it } from 'vitest';

describe('convertDataToRows', () => {
  // Reset row ID counter before each test for consistent IDs
  beforeEach(() => {
    resetRowIdCounter();
  });

  describe('success cases', () => {
    it('should convert simple typed data to rows with matching columns', () => {
      // Given: An array of typed objects and matching columns
      const columns: TableColumn[] = [
        { id: 'name', label: 'Name', type: 'text' },
        { id: 'age', label: 'Age', type: 'number' },
        { id: 'city', label: 'City', type: 'text' },
      ];

      const data = [
        { name: 'Alice', age: 30, city: 'New York' },
        { name: 'Bob', age: 25, city: 'Los Angeles' },
      ];

      // When: convertDataToRows is called
      const result: TableRow[] = convertDataToRows(data, columns);

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
      const columns: TableColumn[] = [
        { id: 'name', label: 'Name', type: 'text' },
        { id: 'age', label: 'Age', type: 'number' },
        { id: 'city', label: 'City', type: 'text' },
      ];

      const data = [
        { name: 'Alice', age: undefined, city: 'New York' },
        { name: 'Bob', age: 25, city: undefined },
      ];

      // When: convertDataToRows is called
      const result: TableRow[] = convertDataToRows(data, columns);

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
      const columns: TableColumn[] = [
        { id: 'name', label: 'Name', type: 'text' },
      ];

      const data = [
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' },
        { name: 'Diana' },
      ];

      // When: convertDataToRows is called
      const result: TableRow[] = convertDataToRows(data, columns);

      // Then: Each row has a unique ID
      const ids = result.map((row) => row.id);
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(4);
      expect(uniqueIds.size).toBe(4); // All IDs are unique
    });
  });

  describe('edge cases', () => {
    it('should handle boolean and null values by converting to strings', () => {
      // Given: Data with various types including booleans and null
      const columns: TableColumn[] = [
        { id: 'name', label: 'Name', type: 'text' },
        { id: 'active', label: 'Active', type: 'text' },
        { id: 'score', label: 'Score', type: 'number' },
      ];

      const data = [
        { name: 'Alice', active: true, score: 100 },
        { name: 'Bob', active: false, score: null },
      ];

      // When: convertDataToRows is called
      const result: TableRow[] = convertDataToRows(data, columns);

      // Then: Boolean and null values are converted to strings
      expect(result[0].cells).toEqual({
        name: 'Alice',
        active: 'true',
        score: '100',
      });

      expect(result[1].cells).toEqual({
        name: 'Bob',
        active: 'false',
        score: 'null', // Is this correct?
      });
    });
  });
});
