/**
 * Row ID generation utilities
 * Pure functions for generating unique row IDs
 */

// Counter for generating truly unique row IDs
let rowIdCounter = 0;

/**
 * Reset the row ID counter - mainly for testing purposes
 */
export const resetRowIdCounter = (): void => {
  rowIdCounter = 0;
};

/**
 * Generates a guaranteed unique row ID by combining timestamp, counter and random value
 * TODO: Use UUID instead of timestamp, counter and random value
 */
export const generateRowId = (): string => {
  // Increment the counter first to ensure uniqueness even with same timestamp
  rowIdCounter += 1;

  // Create a unique ID using timestamp, counter and random number
  return `row-${Date.now()}-${rowIdCounter}-${Math.floor(Math.random() * 1000)}`;
};

