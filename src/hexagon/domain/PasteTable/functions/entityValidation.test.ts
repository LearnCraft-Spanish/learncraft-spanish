import {
  validateEntities,
  validateEntity,
} from '@domain/PasteTable/functions/entityValidation';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const personSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(0, 'Age must be non-negative'),
});

type Person = z.infer<typeof personSchema>;

describe('validateEntity', () => {
  it('returns isValid true and empty errors for a valid entity', () => {
    const result = validateEntity({ name: 'Alice', age: 30 }, personSchema);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('returns isValid false and field error for empty name', () => {
    const result = validateEntity({ name: '', age: 30 }, personSchema);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeTruthy();
  });

  it('returns field error keyed by path for invalid age', () => {
    const result = validateEntity({ name: 'Bob', age: -1 }, personSchema);
    expect(result.isValid).toBe(false);
    expect(result.errors.age).toContain('Age must be non-negative');
  });

  it('accumulates errors for multiple invalid fields', () => {
    const result = validateEntity({ name: '', age: -5 }, personSchema);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeTruthy();
    expect(result.errors.age).toBeTruthy();
  });
});

describe('validateEntities', () => {
  const getId = (p: Person) => p.name;

  it('returns isValid true when all entities pass', () => {
    const entities: Person[] = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];
    const result = validateEntities(entities, personSchema, getId);
    expect(result.isValid).toBe(true);
    expect(result.validEntities).toHaveLength(2);
    expect(result.invalidEntities).toHaveLength(0);
    expect(result.errorsByEntityId).toEqual({});
  });

  it('separates valid and invalid entities', () => {
    const entities = [
      { name: 'Alice', age: 30 },
      { name: '', age: 25 },
    ];
    const result = validateEntities(entities, personSchema, getId);
    expect(result.isValid).toBe(false);
    expect(result.validEntities).toHaveLength(1);
    expect(result.validEntities[0].name).toBe('Alice');
    expect(result.invalidEntities).toHaveLength(1);
  });

  it('keys errorsByEntityId using the getId function', () => {
    const entities = [{ name: 'Bad', age: -1 }];
    const result = validateEntities(entities, personSchema, getId);
    expect(result.errorsByEntityId.Bad).toBeTruthy();
    expect(result.errorsByEntityId.Bad.age).toBeTruthy();
  });
});
