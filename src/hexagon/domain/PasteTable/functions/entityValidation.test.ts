import {
  validateEntities,
  validateEntity,
} from '@domain/PasteTable/functions/entityValidation';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

describe('entityValidation', () => {
  const personSchema = z.object({
    id: z.number(),
    name: z.string({ invalid_type_error: 'Name must be a string' }),
    age: z.number({ invalid_type_error: 'Age must be a number' }),
  });

  type Person = z.infer<typeof personSchema>;

  const nestedSchema = z.object({
    address: z.object({
      city: z.string({ invalid_type_error: 'City must be a string' }),
    }),
  });

  type NestedEntity = z.infer<typeof nestedSchema>;

  describe('validateEntity', () => {
    it('should return isValid true and empty errors for a valid entity', () => {
      const entity: Person = { id: 1, name: 'Ada', age: 30 };

      expect(validateEntity(entity, personSchema)).toEqual({
        isValid: true,
        errors: {},
      });
    });

    it('should return isValid false and the Zod message on the invalid flat field', () => {
      const entity = { id: 1, name: 123, age: 30 } as unknown as Person;

      expect(validateEntity(entity, personSchema)).toEqual({
        isValid: false,
        errors: { name: 'Name must be a string' },
      });
    });

    it('should use a dotted path key for nested schema issues', () => {
      const entity = {
        address: { city: 42 },
      } as unknown as NestedEntity;

      expect(validateEntity(entity, nestedSchema)).toEqual({
        isValid: false,
        errors: { 'address.city': 'City must be a string' },
      });
    });

    it('should include every invalid field when there are multiple issues', () => {
      const entity = { id: 1, name: 123, age: 'x' } as unknown as Person;

      expect(validateEntity(entity, personSchema)).toEqual({
        isValid: false,
        errors: {
          name: 'Name must be a string',
          age: 'Age must be a number',
        },
      });
    });
  });

  describe('validateEntities', () => {
    it('should return isValid true and empty collections for an empty array', () => {
      expect(validateEntities([], personSchema, (entity) => entity.id)).toEqual(
        {
          isValid: true,
          validEntities: [],
          invalidEntities: [],
          errorsByEntityId: {},
        },
      );
    });

    it('should partition mixed valid and invalid entities and key errors by String(id)', () => {
      const validEntity: Person = { id: 2, name: 'Ada', age: 30 };
      const invalidEntity = {
        id: 1,
        name: 123,
        age: 30,
      } as unknown as Person;

      const result = validateEntities(
        [validEntity, invalidEntity],
        personSchema,
        (entity) => entity.id,
      );

      expect(result).toEqual({
        isValid: false,
        validEntities: [validEntity],
        invalidEntities: [
          {
            entity: invalidEntity,
            errors: { name: 'Name must be a string' },
          },
        ],
        errorsByEntityId: {
          '1': { name: 'Name must be a string' },
        },
      });
    });

    it('should return isValid true when every entity is valid', () => {
      const entities: Person[] = [
        { id: 1, name: 'Ada', age: 30 },
        { id: 2, name: 'Grace', age: 40 },
      ];

      expect(
        validateEntities(entities, personSchema, (entity) => entity.id),
      ).toEqual({
        isValid: true,
        validEntities: entities,
        invalidEntities: [],
        errorsByEntityId: {},
      });
    });

    it('should return isValid false when every entity is invalid', () => {
      const firstInvalid = {
        id: 1,
        name: 123,
        age: 30,
      } as unknown as Person;
      const secondInvalid = {
        id: 2,
        name: 'Ada',
        age: 'x',
      } as unknown as Person;

      expect(
        validateEntities(
          [firstInvalid, secondInvalid],
          personSchema,
          (entity) => entity.id,
        ),
      ).toEqual({
        isValid: false,
        validEntities: [],
        invalidEntities: [
          {
            entity: firstInvalid,
            errors: { name: 'Name must be a string' },
          },
          {
            entity: secondInvalid,
            errors: { age: 'Age must be a number' },
          },
        ],
        errorsByEntityId: {
          '1': { name: 'Name must be a string' },
          '2': { age: 'Age must be a number' },
        },
      });
    });
  });
});
