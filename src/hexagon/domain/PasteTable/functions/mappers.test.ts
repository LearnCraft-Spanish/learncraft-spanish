import type { ColumnDefinition, TableRow } from '@domain/PasteTable/types';
import {
  mapDomainToTableRow,
  mapDomainToTableRows,
  mapTableRowsToDomain,
  mapTableRowToDomain,
} from '@domain/PasteTable/functions/mappers';
import { describe, expect, it } from 'vitest';

describe('mappers', () => {
  const columns: ColumnDefinition[] = [
    { id: 'name', type: 'text' },
    { id: 'age', type: 'number' },
    { id: 'active', type: 'boolean' },
    { id: 'birthday', type: 'date' },
  ];

  describe('mapDomainToTableRow', () => {
    it('should convert domain entity to TableRow', () => {
      const entity = {
        id: 'entity-1',
        name: 'John',
        age: 30,
        active: true,
        birthday: '2024-01-15',
      };

      const result = mapDomainToTableRow(entity, columns);

      expect(result.id).toBe('entity-1');
      expect(result.cells.name).toBe('John');
      expect(result.cells.age).toBe('30');
      expect(result.cells.active).toBe('true');
      expect(result.cells.birthday).toBe('2024-01-15');
    });

    it('should handle undefined values', () => {
      const entity = {
        name: 'John',
        age: undefined,
        active: true,
        birthday: undefined,
      };

      const result = mapDomainToTableRow(entity, columns);

      expect(result.cells.name).toBe('John');
      expect(result.cells.age).toBe('');
      expect(result.cells.birthday).toBe('');
    });

    it('should handle null values', () => {
      const entity = {
        name: 'John',
        age: null,
        active: true,
        birthday: null,
      };

      const result = mapDomainToTableRow(entity, columns);

      expect(result.cells.age).toBe('');
      expect(result.cells.birthday).toBe('');
    });

    it('should generate ID if not present', () => {
      const entity = {
        name: 'John',
        age: 30,
        active: true,
        birthday: '2024-01-15',
      };

      const result = mapDomainToTableRow(entity, columns);

      expect(result.id).toMatch(/^row-/);
    });

    it('should format boolean with custom format', () => {
      const entity = {
        name: 'John',
        age: 30,
        active: true,
        birthday: '2024-01-15',
      };

      const customColumns: ColumnDefinition[] = [
        { id: 'active', type: 'boolean', booleanFormat: 'yes-no' },
      ];

      const result = mapDomainToTableRow(entity, customColumns);
      expect(result.cells.active).toBe('yes');
    });

    it('should format Date object', () => {
      const entity = {
        name: 'John',
        birthday: new Date('2024-01-15'),
      };

      const dateColumns: ColumnDefinition[] = [
        { id: 'name', type: 'text' },
        { id: 'birthday', type: 'date' },
      ];

      const result = mapDomainToTableRow(entity, dateColumns);
      expect(result.cells.birthday).toBe('2024-01-15');
    });
  });

  describe('mapDomainToTableRows', () => {
    it('should convert array of entities to TableRows', () => {
      const entities = [
        {
          id: '1',
          name: 'John',
          age: 30,
          active: true,
          birthday: '2024-01-15',
        },
        {
          id: '2',
          name: 'Jane',
          age: 25,
          active: false,
          birthday: '2024-02-20',
        },
      ];

      const result = mapDomainToTableRows(entities, columns);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[0].cells.name).toBe('John');
      expect(result[1].id).toBe('2');
      expect(result[1].cells.name).toBe('Jane');
    });
  });

  describe('mapTableRowToDomain', () => {
    it('should convert TableRow to domain entity', () => {
      const row: TableRow = {
        id: 'row-1',
        cells: {
          name: 'John',
          age: '30',
          active: 'true',
          birthday: '2024-01-15',
        },
      };

      const result = mapTableRowToDomain(row, columns);

      expect(result.name).toBe('John');
      expect(result.age).toBe(30);
      expect(result.active).toBe(true);
      expect(result.birthday).toBe('2024-01-15');
    });

    it('should handle empty string values', () => {
      const row: TableRow = {
        id: 'row-1',
        cells: {
          name: '',
          age: '',
          active: '',
          birthday: '',
        },
      };

      const result = mapTableRowToDomain(row, columns);

      expect(result.name).toBeUndefined();
      expect(result.age).toBeUndefined();
      expect(result.active).toBe(false); // Empty string parses to false
      expect(result.birthday).toBeUndefined();
    });

    it('should parse boolean with custom format', () => {
      const row: TableRow = {
        id: 'row-1',
        cells: { active: 'yes' },
      };

      const customColumns: ColumnDefinition[] = [
        { id: 'active', type: 'boolean', booleanFormat: 'yes-no' },
      ];

      const result = mapTableRowToDomain(row, customColumns);
      expect(result.active).toBe(true);
    });

    it('should parse number values', () => {
      const row: TableRow = {
        id: 'row-1',
        cells: { age: '42' },
      };

      const numberColumns: ColumnDefinition[] = [{ id: 'age', type: 'number' }];

      const result = mapTableRowToDomain(row, numberColumns);
      expect(result.age).toBe(42);
    });

    it('should handle invalid number as undefined', () => {
      const row: TableRow = {
        id: 'row-1',
        cells: { age: 'not-a-number' },
      };

      const numberColumns: ColumnDefinition[] = [{ id: 'age', type: 'number' }];

      const result = mapTableRowToDomain(row, numberColumns);
      expect(result.age).toBeUndefined();
    });
  });

  describe('mapTableRowsToDomain', () => {
    it('should convert array of TableRows to domain entities', () => {
      const rows: TableRow[] = [
        {
          id: 'row-1',
          cells: {
            name: 'John',
            age: '30',
            active: 'true',
            birthday: '2024-01-15',
          },
        },
        {
          id: 'row-2',
          cells: {
            name: 'Jane',
            age: '25',
            active: 'false',
            birthday: '2024-02-20',
          },
        },
      ];

      const result = mapTableRowsToDomain(rows, columns);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('John');
      expect(result[1].name).toBe('Jane');
    });

    it('should filter out ghost row', () => {
      const rows: TableRow[] = [
        {
          id: 'row-1',
          cells: {
            name: 'John',
            age: '30',
            active: 'true',
            birthday: '2024-01-15',
          },
        },
        {
          id: 'ghost-row',
          cells: { name: '', age: '', active: '', birthday: '' },
        },
      ];

      const result = mapTableRowsToDomain(rows, columns);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John');
    });

    it('should use custom ghost row ID', () => {
      const rows: TableRow[] = [
        {
          id: 'row-1',
          cells: {
            name: 'John',
            age: '30',
            active: 'true',
            birthday: '2024-01-15',
          },
        },
        {
          id: 'custom-ghost',
          cells: { name: '', age: '', active: '', birthday: '' },
        },
      ];

      const result = mapTableRowsToDomain(rows, columns, 'custom-ghost');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John');
    });
  });
});
