/**
 * Entity Validation Functions
 *
 * Pure functions for validating mapped domain entities with Zod.
 */

import type { z } from 'zod';

/**
 * Result of validating a single entity
 */
export interface EntityValidationResult {
  isValid: boolean;
  errors: Record<string, string>; // fieldName -> errorMessage
}

/**
 * Result of validating multiple entities
 */
export interface EntitiesValidationState<T> {
  isValid: boolean;
  validEntities: T[];
  invalidEntities: Array<{ entity: T; errors: Record<string, string> }>;
  errorsByEntityId: Record<string, Record<string, string>>; // entityId -> { fieldName -> errorMessage }
}

/**
 * Validate a single entity against a Zod schema.
 *
 * @param entity - The entity to validate
 * @param schema - Zod schema to validate against
 * @returns Validation result with errors by field
 */
export function validateEntity<T>(
  entity: T,
  schema: z.ZodType<T>,
): EntityValidationResult {
  const result = schema.safeParse(entity);

  if (result.success) {
    return { isValid: true, errors: {} };
  }

  // Convert Zod errors to field -> message map
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  }

  return { isValid: false, errors };
}

/**
 * Validate multiple entities against a Zod schema.
 *
 * @param entities - Array of entities to validate
 * @param schema - Zod schema to validate against
 * @param getId - Function to extract ID from an entity
 * @returns Validation state with valid/invalid entities and errors by ID
 */
export function validateEntities<T>(
  entities: T[],
  schema: z.ZodType<T>,
  getId: (entity: T) => string | number,
): EntitiesValidationState<T> {
  const validEntities: T[] = [];
  const invalidEntities: Array<{ entity: T; errors: Record<string, string> }> =
    [];
  const errorsByEntityId: Record<string, Record<string, string>> = {};

  for (const entity of entities) {
    const result = validateEntity(entity, schema);
    const id = String(getId(entity));

    if (result.isValid) {
      validEntities.push(entity);
    } else {
      invalidEntities.push({ entity, errors: result.errors });
      errorsByEntityId[id] = result.errors;
    }
  }

  return {
    isValid: invalidEntities.length === 0,
    validEntities,
    invalidEntities,
    errorsByEntityId,
  };
}
