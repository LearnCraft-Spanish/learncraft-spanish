/**
 * Validation Types
 *
 * Domain-level types for validation state.
 */

/**
 * Validation result for a single row
 */
export interface RowValidationResult {
  isValid: boolean;
  errors: Record<string, string>; // columnId -> errorMessage
}

/**
 * Validation state for the entire table
 */
export interface ValidationState {
  /** Whether all rows pass validation */
  isValid: boolean;
  /** Map of row IDs to their validation errors */
  errors: Record<string, Record<string, string>>; // rowId -> { columnId -> errorMessage }
}

