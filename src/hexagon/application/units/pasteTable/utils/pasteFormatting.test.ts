import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import {
  convertTsvToRows,
  detectDelimiter,
  detectHeaderRow,
  parseCsv,
  parseDelimitedText,
  parseTsv,
} from '@application/units/pasteTable/utils/pasteFormatting';
import { describe, expect, it } from 'vitest';

const testColumns: ColumnDefinition[] = [
  { id: 'name', type: 'text' },
  { id: 'age', type: 'number' },
  { id: 'city', type: 'text' },
];

const ROW_ID_PATTERN = /^row-[0-9a-f-]{36}$/i;

describe('pasteFormatting', () => {
  describe('detectDelimiter', () => {
    describe('success cases', () => {
      it('should return tsv when a tab is present even if commas are present', () => {
        // Given: Text that contains both tabs and commas
        const text = 'name,age\tNew York';

        // When: detectDelimiter is called
        const result = detectDelimiter(text);

        // Then: Tabs win and the delimiter is tsv
        expect(result).toBe('tsv');
      });

      it('should return csv when quotes are present and there are no tabs', () => {
        // Given: Quoted CSV text with no tabs
        const text = '"Smith, John",30';

        // When: detectDelimiter is called
        const result = detectDelimiter(text);

        // Then: Quoted fields indicate csv
        expect(result).toBe('csv');
      });

      it('should return csv when commas are present and there are no tabs', () => {
        // Given: Comma-separated text with no tabs
        const text = 'a,b,c';

        // When: detectDelimiter is called
        const result = detectDelimiter(text);

        // Then: Commas without tabs indicate csv
        expect(result).toBe('csv');
      });
    });

    describe('edge cases', () => {
      it('should return tsv for plain text with no tabs, commas, or quotes', () => {
        // Given: Plain text with no delimiters
        const text = 'hello';

        // When: detectDelimiter is called
        const result = detectDelimiter(text);

        // Then: Ambiguous input defaults to tsv
        expect(result).toBe('tsv');
      });

      it('should return tsv for empty text', () => {
        // Given: An empty string
        const text = '';

        // When: detectDelimiter is called
        const result = detectDelimiter(text);

        // Then: Empty input defaults to tsv
        expect(result).toBe('tsv');
      });
    });
  });

  describe('parseCsv', () => {
    describe('success cases', () => {
      it('should parse comma-separated rows into a 2D array', () => {
        // Given: Simple CSV with two rows
        const text = 'a,b\nc,d';

        // When: parseCsv is called
        const result = parseCsv(text);

        // Then: Each line becomes a row of cells
        expect(result).toEqual([
          ['a', 'b'],
          ['c', 'd'],
        ]);
      });

      it('should keep commas inside quoted fields', () => {
        // Given: A quoted field that contains a comma
        const text = '"Smith, John",x';

        // When: parseCsv is called
        const result = parseCsv(text);

        // Then: The comma inside quotes is part of the cell, not a delimiter
        expect(result).toEqual([['Smith, John', 'x']]);
      });

      it('should unescape doubled quotes inside quoted fields', () => {
        // Given: A quoted field containing escaped quotes
        const text = '"He said ""Hi"""';

        // When: parseCsv is called
        const result = parseCsv(text);

        // Then: Doubled quotes become a single quote in the cell value
        expect(result).toEqual([['He said "Hi"']]);
      });

      it('should trim whitespace around cell values', () => {
        // Given: CSV cells with surrounding whitespace
        const text = ' a , b \n c,d ';

        // When: parseCsv is called
        const result = parseCsv(text);

        // Then: Each cell is trimmed
        expect(result).toEqual([
          ['a', 'b'],
          ['c', 'd'],
        ]);
      });

      it('should include a trailing empty cell after the last comma', () => {
        // Given: A row that ends with a comma
        const text = 'a,b,';

        // When: parseCsv is called
        const result = parseCsv(text);

        // Then: The trailing comma produces an empty last cell
        expect(result).toEqual([['a', 'b', '']]);
      });
    });

    describe('edge cases', () => {
      it('should normalize \\r\\n line endings', () => {
        // Given: CSV text using Windows line endings
        const text = 'a,b\r\nc,d';

        // When: parseCsv is called
        const result = parseCsv(text);

        // Then: Rows are split on the normalized newline
        expect(result).toEqual([
          ['a', 'b'],
          ['c', 'd'],
        ]);
      });

      it('should normalize \\r line endings', () => {
        // Given: CSV text using old Mac line endings
        const text = 'a,b\rc,d';

        // When: parseCsv is called
        const result = parseCsv(text);

        // Then: Rows are split on the normalized newline
        expect(result).toEqual([
          ['a', 'b'],
          ['c', 'd'],
        ]);
      });

      it('should skip blank lines', () => {
        // Given: CSV text with an empty line between rows
        const text = 'a,b\n\nc,d';

        // When: parseCsv is called
        const result = parseCsv(text);

        // Then: Blank lines are omitted
        expect(result).toEqual([
          ['a', 'b'],
          ['c', 'd'],
        ]);
      });

      it('should omit rows that contain only empty cells', () => {
        // Given: CSV text with a row of empty cells
        const text = 'a,b\n,,\nc,d';

        // When: parseCsv is called
        const result = parseCsv(text);

        // Then: Rows where every cell is empty are omitted
        expect(result).toEqual([
          ['a', 'b'],
          ['c', 'd'],
        ]);
      });
    });
  });

  describe('parseTsv', () => {
    describe('success cases', () => {
      it('should parse tab-separated rows into a 2D array', () => {
        // Given: Simple TSV with two rows
        const text = 'a\tb\nc\td';

        // When: parseTsv is called
        const result = parseTsv(text);

        // Then: Each line is split on tabs
        expect(result).toEqual([
          ['a', 'b'],
          ['c', 'd'],
        ]);
      });

      it('should keep rows that have some nonempty cells', () => {
        // Given: A TSV row with an empty middle cell
        const text = 'a\t\tc';

        // When: parseTsv is called
        const result = parseTsv(text);

        // Then: The row is kept because some cells are nonempty
        expect(result).toEqual([['a', '', 'c']]);
      });
    });

    describe('edge cases', () => {
      it('should filter rows where every cell is empty', () => {
        // Given: TSV text with empty and whitespace-only rows
        const text = 'a\tb\n\n\t\t\n  \t  \nc\td';

        // When: parseTsv is called
        const result = parseTsv(text);

        // Then: Rows whose cells are all empty after trim are removed
        expect(result).toEqual([
          ['a', 'b'],
          ['c', 'd'],
        ]);
      });

      it('should normalize \\r\\n and \\r line endings', () => {
        // Given: TSV text using Windows and old Mac line endings
        const crlfText = 'a\tb\r\nc\td';
        const crText = 'a\tb\rc\td';

        // When: parseTsv is called
        const crlfResult = parseTsv(crlfText);
        const crResult = parseTsv(crText);

        // Then: Both line endings produce the same rows
        expect(crlfResult).toEqual([
          ['a', 'b'],
          ['c', 'd'],
        ]);
        expect(crResult).toEqual([
          ['a', 'b'],
          ['c', 'd'],
        ]);
      });
    });
  });

  describe('parseDelimitedText', () => {
    describe('success cases', () => {
      it('should route comma-separated text through CSV parsing', () => {
        // Given: CSV text with no tabs
        const text = 'a,b\nc,d';

        // When: parseDelimitedText is called
        const result = parseDelimitedText(text);

        // Then: The text is parsed as CSV
        expect(result).toEqual([
          ['a', 'b'],
          ['c', 'd'],
        ]);
      });

      it('should route tab-separated text through TSV parsing', () => {
        // Given: TSV text
        const text = 'a\tb\nc\td';

        // When: parseDelimitedText is called
        const result = parseDelimitedText(text);

        // Then: The text is parsed as TSV
        expect(result).toEqual([
          ['a', 'b'],
          ['c', 'd'],
        ]);
      });
    });
  });

  describe('detectHeaderRow', () => {
    describe('success cases', () => {
      it('should detect a header row when a majority of cells match column ids', () => {
        // Given: A first row whose labels match the column ids
        const firstRow = ['name', 'age', 'city'];

        // When: detectHeaderRow is called
        const result = detectHeaderRow(firstRow, testColumns);

        // Then: It is a header row and indexes map to canonical column ids
        expect(result.hasHeaderRow).toBe(true);
        expect(result.headerColumnMap).toEqual({
          0: 'name',
          1: 'age',
          2: 'city',
        });
      });

      it('should treat exactly half matches as a header row', () => {
        // Given: A row where exactly half the cells match column ids
        // Threshold is >= (not >), so half must count as a header
        const columns: ColumnDefinition[] = [
          { id: 'name', type: 'text' },
          { id: 'age', type: 'number' },
        ];
        const firstRow = ['name', 'not-a-column'];

        // When: detectHeaderRow is called
        const result = detectHeaderRow(firstRow, columns);

        // Then: Exactly half matches still counts as a header row
        expect(result.hasHeaderRow).toBe(true);
        expect(result.headerColumnMap).toEqual({ 0: 'name' });
      });

      it('should match header labels case-insensitively to canonical column ids', () => {
        // Given: Header labels in a different case
        const firstRow = ['NAME', 'Age', 'CITY'];

        // When: detectHeaderRow is called
        const result = detectHeaderRow(firstRow, testColumns);

        // Then: Matches map to the canonical column ids
        expect(result.hasHeaderRow).toBe(true);
        expect(result.headerColumnMap).toEqual({
          0: 'name',
          1: 'age',
          2: 'city',
        });
      });

      it('should trim padded header labels before matching', () => {
        // Given: Header labels with surrounding whitespace
        const firstRow = ['  name  ', ' age', 'city '];

        // When: detectHeaderRow is called
        const result = detectHeaderRow(firstRow, testColumns);

        // Then: Trimmed labels match canonical column ids
        expect(result.hasHeaderRow).toBe(true);
        expect(result.headerColumnMap).toEqual({
          0: 'name',
          1: 'age',
          2: 'city',
        });
      });
    });

    describe('edge cases', () => {
      it('should not treat a row as a header when matches are below half', () => {
        // Given: A first row where only one of three cells matches a column id
        const firstRow = ['name', 'foo', 'bar'];

        // When: detectHeaderRow is called
        const result = detectHeaderRow(firstRow, testColumns);

        // Then: Below-half matches are not a header row
        expect(result.hasHeaderRow).toBe(false);
      });
    });
  });

  describe('convertTsvToRows', () => {
    describe('success cases', () => {
      it('should map cells by position when there is no header row', () => {
        // Given: Parsed rows with extra cells on one row and missing cells on another
        const parsedRows = [
          ['Alice', '30', 'New York'],
          ['Bob', '25', 'Los Angeles', 'extra', 'ignored'],
          ['Charlie'],
        ];

        // When: convertTsvToRows is called without a header row
        const result: TableRow[] = convertTsvToRows(
          parsedRows,
          testColumns,
          false,
          {},
        );

        // Then: Cells map by position; extras are ignored; missing cells are empty
        expect(result).toHaveLength(3);
        expect(result[0].cells).toEqual({
          name: 'Alice',
          age: '30',
          city: 'New York',
        });
        expect(result[1].cells).toEqual({
          name: 'Bob',
          age: '25',
          city: 'Los Angeles',
        });
        expect(result[2].cells).toEqual({
          name: 'Charlie',
          age: '',
          city: '',
        });
      });

      it('should fill only mapped header indexes and ignore unmapped indexes', () => {
        // Given: A header row plus data, with only name and city mapped
        const parsedRows = [
          ['name', 'notes', 'city'],
          ['Alice', 'ignored-notes', 'New York'],
        ];
        const headerColumnMap = { 0: 'name', 2: 'city' };

        // When: convertTsvToRows is called with a header row
        const result: TableRow[] = convertTsvToRows(
          parsedRows,
          testColumns,
          true,
          headerColumnMap,
        );

        // Then: Unmapped indexes are ignored and unmapped columns stay empty
        expect(result).toHaveLength(1);
        expect(result[0].cells).toEqual({
          name: 'Alice',
          age: '',
          city: 'New York',
        });
      });

      it('should skip the first parsed row when hasHeaderRow is true', () => {
        // Given: Two parsed rows where the first should be treated as a header
        const parsedRows = [
          ['name', 'age', 'city'],
          ['Alice', '30', 'New York'],
        ];
        const headerColumnMap = { 0: 'name', 1: 'age', 2: 'city' };

        // When: convertTsvToRows is called with hasHeaderRow true
        const result: TableRow[] = convertTsvToRows(
          parsedRows,
          testColumns,
          true,
          headerColumnMap,
        );

        // Then: Only the data row is returned
        expect(result).toHaveLength(1);
        expect(result[0].cells).toEqual({
          name: 'Alice',
          age: '30',
          city: 'New York',
        });
      });

      it('should generate unique nonempty row ids', () => {
        // Given: Multiple parsed data rows
        const parsedRows = [
          ['Alice', '30', 'New York'],
          ['Bob', '25', 'Los Angeles'],
          ['Charlie', '40', 'Chicago'],
        ];

        // When: convertTsvToRows is called
        const result: TableRow[] = convertTsvToRows(
          parsedRows,
          testColumns,
          false,
          {},
        );

        // Then: Each row has a unique nonempty id in row-uuid format
        const ids = result.map((row) => row.id);
        expect(ids).toHaveLength(3);
        expect(new Set(ids).size).toBe(3);

        result.forEach((row) => {
          expect(row).toHaveProperty('id');
          expect(row.id).toBeTruthy();
          expect(row.id).toMatch(ROW_ID_PATTERN);
        });
      });
    });

    describe('edge cases', () => {
      it('should return an empty array when there are no parsed rows', () => {
        // Given: No parsed rows
        const parsedRows: string[][] = [];

        // When: convertTsvToRows is called
        const result: TableRow[] = convertTsvToRows(
          parsedRows,
          testColumns,
          false,
          {},
        );

        // Then: No table rows are created
        expect(result).toEqual([]);
      });

      it('should return an empty array when the only row is a header', () => {
        // Given: A single header row and no data rows
        const parsedRows = [['name', 'age', 'city']];
        const headerColumnMap = { 0: 'name', 1: 'age', 2: 'city' };

        // When: convertTsvToRows is called with hasHeaderRow true
        const result: TableRow[] = convertTsvToRows(
          parsedRows,
          testColumns,
          true,
          headerColumnMap,
        );

        // Then: Skipping the header leaves no rows
        expect(result).toEqual([]);
      });
    });
  });
});
