import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import {
  createCombinedValidateRow,
  createValidateRowFromColumnSchemas,
  createValidateRowFromRowSchema,
} from '@domain/PasteTable/functions/schemaValidation';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

describe('schemaValidation', () => {
  describe('createValidateRowFromColumnSchemas', () => {
    it('should return no errors for a valid mapped value', () => {
      const columns: ColumnDefinition[] = [
        { id: 'name', type: 'text', schema: z.string().min(1) },
        { id: 'age', type: 'number', schema: z.number().positive() },
      ];
      const row: TableRow = {
        id: 'row-1',
        cells: { name: 'Ada', age: '42' },
      };

      const validateRow = createValidateRowFromColumnSchemas(columns);

      expect(validateRow(row)).toEqual({});
    });

    it('should include the column id and ": " in the error message for an invalid value', () => {
      const columns: ColumnDefinition[] = [
        { id: 'name', type: 'text', schema: z.string().min(1) },
      ];
      const row: TableRow = {
        id: 'row-1',
        cells: { name: '' },
      };

      const errors = createValidateRowFromColumnSchemas(columns)(row);

      expect(errors).toHaveProperty('name');
      expect(errors.name).toContain('name');
      expect(errors.name).toContain(': ');
    });

    it('should omit columns that have no schema even when the cell is garbage', () => {
      const columns: ColumnDefinition[] = [
        { id: 'name', type: 'text', schema: z.string().min(1) },
        { id: 'notes', type: 'text' },
      ];
      const row: TableRow = {
        id: 'row-1',
        cells: { name: 'Ada', notes: '@@@not-a-valid-anything@@@' },
      };

      const errors = createValidateRowFromColumnSchemas(columns)(row);

      expect(errors).toEqual({});
      expect(errors).not.toHaveProperty('notes');
    });

    it('should list only failing columns when multiple columns are validated', () => {
      const columns: ColumnDefinition[] = [
        { id: 'name', type: 'text', schema: z.string().min(1) },
        { id: 'age', type: 'number', schema: z.number().positive() },
        { id: 'title', type: 'text', schema: z.string().min(3) },
      ];
      const row: TableRow = {
        id: 'row-1',
        cells: { name: '', age: '30', title: 'ab' },
      };

      const errors = createValidateRowFromColumnSchemas(columns)(row);

      expect(errors).toHaveProperty('name');
      expect(errors).toHaveProperty('title');
      expect(errors).not.toHaveProperty('age');
      expect(Object.keys(errors).sort()).toEqual(['name', 'title']);
    });

    it('should return no errors when columns is empty', () => {
      const row: TableRow = {
        id: 'row-1',
        cells: { name: 'garbage' },
      };

      const errors = createValidateRowFromColumnSchemas([])(row);

      expect(errors).toEqual({});
    });

    it('should mark the column invalid when schema.parse throws a non-Zod error', () => {
      const columns: ColumnDefinition[] = [
        {
          id: 'name',
          type: 'text',
          schema: {
            parse() {
              throw new Error('boom');
            },
          } as unknown as z.ZodType<unknown>,
        },
      ];
      const row: TableRow = {
        id: 'row-1',
        cells: { name: 'Ada' },
      };

      const errors = createValidateRowFromColumnSchemas(columns)(row);

      expect(errors.name).toBe('name is invalid');
    });

    it('should mark the column invalid when ZodError has no issues', () => {
      const columns: ColumnDefinition[] = [
        {
          id: 'name',
          type: 'text',
          schema: {
            parse() {
              throw new z.ZodError([]);
            },
          } as unknown as z.ZodType<unknown>,
        },
      ];
      const row: TableRow = {
        id: 'row-1',
        cells: { name: 'Ada' },
      };

      const errors = createValidateRowFromColumnSchemas(columns)(row);

      expect(errors.name).toBe('name is invalid');
    });

    it('should use only the first Zod issue for a column', () => {
      const columns: ColumnDefinition[] = [
        {
          id: 'name',
          type: 'text',
          schema: z.string().superRefine((_value, ctx) => {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'first-issue',
            });
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'second-issue',
            });
          }),
        },
      ];
      const row: TableRow = {
        id: 'row-1',
        cells: { name: 'Ada' },
      };

      const errors = createValidateRowFromColumnSchemas(columns)(row);

      expect(errors.name).toBe('name: first-issue');
      expect(errors.name).not.toContain('second-issue');
    });

    it('should validate a padded number cell after normalization', () => {
      const columns: ColumnDefinition[] = [
        { id: 'age', type: 'number', schema: z.number().positive() },
      ];
      const row: TableRow = {
        id: 'row-1',
        cells: { age: ' 42 ' },
      };

      const errors = createValidateRowFromColumnSchemas(columns)(row);

      expect(errors).toEqual({});
    });
  });

  describe('createValidateRowFromRowSchema', () => {
    it('should return no errors when the row schema is valid', () => {
      const columns: ColumnDefinition[] = [
        { id: 'name', type: 'text' },
        { id: 'age', type: 'number' },
      ];
      const rowSchema = z.object({
        name: z.string(),
        age: z.number(),
      });
      const row: TableRow = {
        id: 'row-1',
        cells: { name: 'Ada', age: '42' },
      };

      const errors = createValidateRowFromRowSchema(rowSchema, columns)(row);

      expect(errors).toEqual({});
    });

    it('should set a field error to the message only with no column-id prefix', () => {
      const columns: ColumnDefinition[] = [
        { id: 'name', type: 'text' },
        { id: 'age', type: 'number' },
      ];
      const rowSchema = z.object({
        name: z.string().min(5),
        age: z.number(),
      });
      const row: TableRow = {
        id: 'row-1',
        cells: { name: 'Ada', age: '42' },
      };

      const errors = createValidateRowFromRowSchema(rowSchema, columns)(row);

      expect(errors).toHaveProperty('name');
      expect(errors.name).not.toContain('name:');
      expect(errors.name).not.toContain(': ');
    });

    it('should use a dotted path for nested Zod issues', () => {
      const columns: ColumnDefinition[] = [{ id: 'address', type: 'custom' }];
      const rowSchema = z.object({
        address: z.object({
          city: z.string().min(1),
        }),
      });
      const row: TableRow = {
        id: 'row-1',
        cells: { address: '{"city":""}' },
      };

      const errors = createValidateRowFromRowSchema(rowSchema, columns)(row);

      expect(errors).toHaveProperty('address.city');
      expect(errors['address.city']).toBeDefined();
      expect(errors['address.city']).not.toContain('address.city:');
    });

    it('should set _root when a refine produces an empty path', () => {
      const columns: ColumnDefinition[] = [{ id: 'name', type: 'text' }];
      const rowSchema = z.object({ name: z.string() }).refine(() => false, {
        message: 'row is invalid',
      });
      const row: TableRow = {
        id: 'row-1',
        cells: { name: 'Ada' },
      };

      const errors = createValidateRowFromRowSchema(rowSchema, columns)(row);

      expect(errors._root).toBe('row is invalid');
    });

    it('should include every Zod issue', () => {
      const columns: ColumnDefinition[] = [
        { id: 'name', type: 'text' },
        { id: 'age', type: 'number' },
      ];
      const rowSchema = z.object({
        name: z.string().min(5),
        age: z.number().positive(),
      });
      const row: TableRow = {
        id: 'row-1',
        cells: { name: 'Ada', age: '-1' },
      };

      const errors = createValidateRowFromRowSchema(rowSchema, columns)(row);

      expect(errors).toHaveProperty('name');
      expect(errors).toHaveProperty('age');
      expect(Object.keys(errors).sort()).toEqual(['age', 'name']);
    });

    it('should set _root to Validation failed when schema.parse throws a non-Zod error', () => {
      const columns: ColumnDefinition[] = [{ id: 'name', type: 'text' }];
      const row: TableRow = {
        id: 'row-1',
        cells: { name: 'Ada' },
      };

      const errors = createValidateRowFromRowSchema(
        {
          parse() {
            throw new Error('boom');
          },
        } as unknown as z.ZodType<Record<string, unknown>>,
        columns,
      )(row);

      expect(errors._root).toBe('Validation failed');
    });
  });

  describe('createCombinedValidateRow', () => {
    it('should include both column errors and row errors', () => {
      const columns: ColumnDefinition[] = [
        { id: 'name', type: 'text', schema: z.string().min(1) },
        { id: 'age', type: 'number' },
      ];
      const rowSchema = z.object({
        name: z.string().optional(),
        age: z.number().positive(),
      });
      const row: TableRow = {
        id: 'row-1',
        cells: { name: '', age: '-1' },
      };

      const errors = createCombinedValidateRow(columns, rowSchema)(row);

      expect(errors).toHaveProperty('name');
      expect(errors.name).toContain('name');
      expect(errors.name).toContain(': ');
      expect(errors).toHaveProperty('age');
      expect(errors.age).not.toContain('age:');
    });

    it('should let row errors overwrite column errors for the same key', () => {
      const columns: ColumnDefinition[] = [
        { id: 'age', type: 'number', schema: z.number().positive() },
      ];
      const rowSchema = z.object({
        age: z.number().min(100),
      });
      const row: TableRow = {
        id: 'row-1',
        cells: { age: '-1' },
      };

      const errors = createCombinedValidateRow(columns, rowSchema)(row);

      expect(errors.age).toBe('Number must be greater than or equal to 100');
      expect(errors.age).not.toContain('age:');
    });

    it('should return column-only errors when rowSchema is omitted', () => {
      const columns: ColumnDefinition[] = [
        { id: 'name', type: 'text', schema: z.string().min(1) },
      ];
      const row: TableRow = {
        id: 'row-1',
        cells: { name: '' },
      };

      const errors = createCombinedValidateRow(columns)(row);

      expect(errors).toHaveProperty('name');
      expect(errors.name).toContain('name');
      expect(errors.name).toContain(': ');
      expect(errors).not.toHaveProperty('_root');
    });

    it('should return no errors when columns is empty and rowSchema is omitted', () => {
      const row: TableRow = {
        id: 'row-1',
        cells: { name: 'garbage' },
      };

      const errors = createCombinedValidateRow([])(row);

      expect(errors).toEqual({});
    });
  });
});
