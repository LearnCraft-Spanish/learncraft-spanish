/**
 * Row ID generation utilities
 * Pure functions for generating unique row IDs
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a guaranteed unique row ID using UUID v4
 */
export const generateRowId = (): string => {
  return `row-${uuidv4()}`;
};
