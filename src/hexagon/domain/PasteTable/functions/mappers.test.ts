import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import {
  mapAndParseTableRowsToDomain,
  mapDomainToTableRow,
  mapDomainToTableRows,
  mapTableRowsToDomain,
  mapTableRowToDomain,
} from '@domain/PasteTable/functions/mappers';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

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

      const result = mapDomainToTableRow(entity, columns, 'id');

      expect(result.id).toBe('row-entity-1');
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

      const result = mapDomainToTableRows(entities, columns, 'id');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('row-1');
      expect(result[0].cells.name).toBe('John');
      expect(result[1].id).toBe('row-2');
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

  describe('mapDomainToTableRow column branches', () => {
    it('should blank an explicit undefined text value instead of stringifying it', () => {
      const result = mapDomainToTableRow({ name: undefined }, [
        { id: 'name', type: 'text' },
      ]);

      expect(result.cells.name).toBe('');
    });

    it('should stringify a non-string select value', () => {
      const result = mapDomainToTableRow({ status: 1 }, [
        { id: 'status', type: 'select' },
      ]);

      expect(result.cells.status).toBe('1');
    });

    it('should join multi-select arrays with a comma when no separator is set', () => {
      const result = mapDomainToTableRow({ tags: ['red', 'blue'] }, [
        { id: 'tags', type: 'multi-select' },
      ]);

      expect(result.cells.tags).toBe('red,blue');
    });

    it('should leave a missing key, a null text value, and an id of zero as empty or row-0', () => {
      const result = mapDomainToTableRow(
        { id: 0, name: null, nickname: 'Ada' },
        [
          { id: 'name', type: 'text' },
          { id: 'nickname', type: 'text' },
          { id: 'missing', type: 'text' },
        ],
        'id',
      );

      expect(result.id).toBe('row-0');
      expect(result.cells).toEqual({
        name: '',
        nickname: 'Ada',
        missing: '',
      });
    });

    it('should generate a uuid row id when the id field is missing or null', () => {
      const missing = mapDomainToTableRow(
        { name: 'Ada' },
        [{ id: 'name', type: 'text' }],
        'id',
      );
      const empty = mapDomainToTableRow(
        { id: null, name: 'Ada' },
        [{ id: 'name', type: 'text' }],
        'id',
      );

      expect(missing.id).toMatch(
        /^row-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(empty.id).toMatch(
        /^row-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(missing.id).not.toBe('row-undefined');
      expect(empty.id).not.toBe('row-null');
    });

    it('should blank a date, number, or boolean that is not a supported runtime type', () => {
      const result = mapDomainToTableRow(
        { birthday: 5, age: true, active: 1 },
        [
          { id: 'birthday', type: 'date' },
          { id: 'age', type: 'number' },
          { id: 'active', type: 'boolean' },
        ],
      );

      expect(result.cells).toEqual({ birthday: '', age: '', active: '' });
    });

    it('should format dates, numbers, and booleans from either typed or string values', () => {
      const columns: ColumnDefinition[] = [
        {
          id: 'birthday',
          type: 'date',
          dateFormat: { displayFormat: 'MM/DD/YYYY' },
        },
        { id: 'age', type: 'number' },
        { id: 'active', type: 'boolean', booleanFormat: 'yes-no' },
        { id: 'archived', type: 'boolean' },
      ];
      const result = mapDomainToTableRow(
        {
          birthday: new Date('2024-01-05T00:00:00.000Z'),
          age: '30.50',
          active: false,
          archived: 'yes',
        },
        columns,
      );

      expect(result.cells).toEqual({
        birthday: '01/05/2024',
        age: '30.5',
        active: 'no',
        archived: 'true',
      });
    });

    it('should blank an invalid date string', () => {
      const result = mapDomainToTableRow({ birthday: 'not-a-date' }, [
        { id: 'birthday', type: 'date' },
      ]);

      expect(result.cells.birthday).toBe('');
    });

    it('should map select, multi-select, custom, read-only, and textarea values', () => {
      const columns: ColumnDefinition[] = [
        {
          id: 'status',
          type: 'select',
          options: [{ value: 'Open', label: 'Open' }],
        },
        { id: 'tags', type: 'multi-select', separator: ';' },
        {
          id: 'labels',
          type: 'multi-select',
          options: [
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
          ],
        },
        { id: 'rawTags', type: 'multi-select' },
        { id: 'emptyTags', type: 'multi-select' },
        { id: 'badTags', type: 'multi-select' },
        { id: 'payload', type: 'custom' },
        { id: 'note', type: 'custom' },
        { id: 'badPayload', type: 'custom' },
        { id: 'locked', type: 'read-only' },
        { id: 'essay', type: 'textarea' },
      ];

      const result = mapDomainToTableRow(
        {
          status: 'open',
          tags: ['red', 'blue'],
          labels: 'a, b',
          rawTags: ' A , b ',
          emptyTags: [],
          badTags: 4,
          payload: [1, 'a'],
          note: '  hello  ',
          badPayload: 3,
          locked: 'secret',
          essay: '  paragraph  ',
        },
        columns,
      );

      expect(result.cells).toEqual({
        status: 'Open',
        tags: 'red;blue',
        labels: 'A,B',
        rawTags: 'A , b',
        emptyTags: '',
        badTags: '',
        payload: '[1,"a"]',
        note: 'hello',
        badPayload: '3',
        locked: 'secret',
        essay: 'paragraph',
      });
    });
  });

  describe('mapTableRowToDomain column branches', () => {
    it('should convert every supported cell type and omit empty optional values', () => {
      const columns: ColumnDefinition[] = [
        { id: 'name', type: 'text' },
        { id: 'title', type: 'textarea' },
        { id: 'age', type: 'number' },
        { id: 'score', type: 'number' },
        { id: 'active', type: 'boolean', booleanFormat: 'yes-no' },
        { id: 'flag', type: 'boolean', booleanFormat: '1-0' },
        { id: 'short', type: 'boolean', booleanFormat: 'y-n' },
        { id: 'rejected', type: 'boolean', booleanFormat: 'yes-no' },
        {
          id: 'birthday',
          type: 'date',
          dateFormat: { outputFormat: 'iso-date' },
        },
        {
          id: 'status',
          type: 'select',
          options: [{ value: 'Open', label: 'Open' }],
        },
        { id: 'emptyStatus', type: 'select' },
        { id: 'tags', type: 'multi-select', separator: '|' },
        { id: 'emptyTags', type: 'multi-select' },
        { id: 'payload', type: 'custom' },
        { id: 'count', type: 'custom' },
        { id: 'enabled', type: 'custom' },
        { id: 'blank', type: 'custom' },
        { id: 'note', type: 'custom' },
        { id: 'locked', type: 'read-only' },
      ];
      const row: TableRow = {
        id: 'row-1',
        cells: {
          name: '  Ada  ',
          title: '   ',
          age: '0',
          score: '1.2500',
          active: ' YES ',
          flag: '1',
          short: 'Y',
          rejected: 'true',
          birthday: '01/05/2024',
          status: 'open',
          emptyStatus: '',
          tags: ' red | | blue ',
          emptyTags: ' , , ',
          payload: '[1, "a"]',
          count: '0',
          enabled: 'false',
          blank: '   ',
          note: '[oops',
          locked: ' secret ',
        },
      };

      expect(mapTableRowToDomain(row, columns)).toEqual({
        name: 'Ada',
        age: 0,
        score: 1.25,
        active: true,
        flag: true,
        short: true,
        rejected: false,
        birthday: '2024-01-05',
        status: 'Open',
        tags: ['red', 'blue'],
        payload: [1, 'a'],
        count: 0,
        enabled: false,
        note: '[oops',
        locked: 'secret',
      });
      expect(Object.keys(mapTableRowToDomain(row, columns))).toEqual([
        'name',
        'age',
        'score',
        'active',
        'flag',
        'short',
        'rejected',
        'birthday',
        'status',
        'tags',
        'payload',
        'count',
        'enabled',
        'note',
        'locked',
      ]);
    });

    it('should omit a cell that is not on the row', () => {
      const result = mapTableRowToDomain({ id: 'row-1', cells: {} }, [
        { id: 'name', type: 'text' },
      ]);

      expect(result).toEqual({});
    });

    it('should return a Date when the date column asks for a Date', () => {
      const result = mapTableRowToDomain(
        { id: 'row-1', cells: { birthday: '2024-01-15' } },
        [
          {
            id: 'birthday',
            type: 'date',
            dateFormat: { outputFormat: 'Date' },
          },
        ],
      );

      expect(result.birthday).toEqual(new Date(2024, 0, 15));
    });

    it('should throw when a date cell cannot be parsed', () => {
      expect(() =>
        mapTableRowToDomain(
          { id: 'row-1', cells: { birthday: 'not-a-date' } },
          [{ id: 'birthday', type: 'date' }],
        ),
      ).toThrow('Invalid date format: not-a-date');
    });

    it('should split multi-select on a comma when no separator is configured', () => {
      const result = mapTableRowToDomain(
        { id: 'row-1', cells: { tags: 'a, b, ,c' } },
        [{ id: 'tags', type: 'multi-select' }],
      );

      expect(result.tags).toEqual(['a', 'b', 'c']);
    });
  });

  describe('mapAndParseTableRowsToDomain', () => {
    const columns: ColumnDefinition[] = [
      { id: 'name', type: 'text' },
      { id: 'age', type: 'number' },
    ];
    const rowSchema = z.object({
      name: z.string(),
      age: z.number().transform((age) => age + 1),
    });

    const row = (id: string, name: string, age: string): TableRow => ({
      id,
      cells: { name, age },
    });

    it('should parse every non-ghost row through the schema', () => {
      const result = mapAndParseTableRowsToDomain(
        [
          row('row-1', 'Ada', '30'),
          row('ghost-row', '', ''),
          row('row-2', 'Grace', '40'),
        ],
        columns,
        rowSchema,
      );

      expect(result).toEqual([
        { name: 'Ada', age: 31 },
        { name: 'Grace', age: 41 },
      ]);
    });

    it('should honor a custom ghost row id and return an empty list for no rows', () => {
      expect(
        mapAndParseTableRowsToDomain(
          [row('skip-me', '', ''), row('row-1', 'Ada', '1')],
          columns,
          rowSchema,
          'skip-me',
        ),
      ).toEqual([{ name: 'Ada', age: 2 }]);

      expect(mapAndParseTableRowsToDomain([], columns, rowSchema)).toEqual([]);
    });

    it('should throw when a parsed row does not satisfy the schema', () => {
      expect(() =>
        mapAndParseTableRowsToDomain(
          [row('row-1', '', '30')],
          columns,
          rowSchema,
        ),
      ).toThrow(z.ZodError);
    });
  });
});
