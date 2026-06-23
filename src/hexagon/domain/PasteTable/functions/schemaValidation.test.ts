import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import {
  createCombinedValidateRow,
  createValidateRowFromColumnSchemas,
  createValidateRowFromRowSchema,
} from '@domain/PasteTable/functions/schemaValidation';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const columns: ColumnDefinition[] = [
  { id: 'name', type: 'text', schema: z.string().min(1, 'Name is required') },
  {
    id: 'age',
    type: 'number',
    schema: z.number().min(0, 'Age must be non-negative'),
  },
];

function makeRow(cells: Record<string, string>): TableRow {
  return { id: 'row-1', cells };
}

describe('createValidateRowFromColumnSchemas', () => {
  const validate = createValidateRowFromColumnSchemas(columns);

  it('returns empty errors for a valid row', () => {
    const errors = validate(makeRow({ name: 'Alice', age: '30' }));
    expect(errors).toEqual({});
  });

  it('returns a field error for an invalid column value', () => {
    const errors = validate(makeRow({ name: '', age: '30' }));
    expect(errors.name).toBeTruthy();
  });

  it('returns errors for multiple invalid columns', () => {
    const errors = validate(makeRow({ name: '', age: '-5' }));
    expect(errors.name).toBeTruthy();
    expect(errors.age).toBeTruthy();
  });

  it('skips columns without a schema', () => {
    const colsWithoutSchema: ColumnDefinition[] = [
      { id: 'note', type: 'text' },
    ];
    const validateNoSchema =
      createValidateRowFromColumnSchemas(colsWithoutSchema);
    const errors = validateNoSchema(makeRow({ note: '' }));
    expect(errors).toEqual({});
  });
});

describe('createValidateRowFromRowSchema', () => {
  const rowSchema = z.object({
    name: z.string().min(1, 'Name required'),
    age: z.number().min(0, 'Age invalid'),
  });
  const validate = createValidateRowFromRowSchema(rowSchema, columns);

  it('returns empty errors for a valid row', () => {
    const errors = validate(makeRow({ name: 'Bob', age: '25' }));
    expect(errors).toEqual({});
  });

  it('returns path-keyed errors for invalid fields', () => {
    const errors = validate(makeRow({ name: '', age: '10' }));
    expect(errors.name).toBeTruthy();
  });
});

describe('createCombinedValidateRow', () => {
  const rowSchema = z.object({
    name: z.string().min(1, 'Row-level name error'),
    age: z.number(),
  });

  it('returns empty errors when both column and row schemas pass', () => {
    const validate = createCombinedValidateRow(columns, rowSchema);
    const errors = validate(makeRow({ name: 'Charlie', age: '20' }));
    expect(errors).toEqual({});
  });

  it('returns column-level errors when a column schema fails', () => {
    const validate = createCombinedValidateRow(columns);
    const errors = validate(makeRow({ name: '', age: '5' }));
    expect(errors.name).toBeTruthy();
  });

  it('merges column and row schema errors', () => {
    const validate = createCombinedValidateRow(columns, rowSchema);
    const errors = validate(makeRow({ name: '', age: '5' }));
    expect(errors.name).toBeTruthy();
  });
});
