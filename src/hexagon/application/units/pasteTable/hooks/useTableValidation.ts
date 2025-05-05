import type { TableRow } from '../types';
import { useCallback, useMemo } from 'react';
import { GHOST_ROW_ID } from '../types';

interface UseTableValidationProps<T> {
  rows: TableRow[];
  validateRow: (row: T) => Record<string, string>;
}

interface ValidationResult {
  validationState: {
    isValid: boolean;
    errors: Record<string, Record<string, string>>;
  };
  isSaveEnabled: boolean;
  validateAll: () => {
    isValid: boolean;
    errors: Record<string, Record<string, string>>;
  };
}

/**
 * Hook for deriving validation state directly from row data
 * No internal state - purely computed from props on every render
 */
export function useTableValidation<T>({
  rows,
  validateRow,
}: UseTableValidationProps<T>): ValidationResult {
  // The key to derived validation is to compute it fresh on every render
  // from the current row data, without any internal state or caching

  // Get all non-ghost rows
  const nonGhostRows = useMemo(
    () => rows.filter((row) => row.id !== GHOST_ROW_ID),
    [rows],
  );

  // Validate a specific row and return errors
  const validateSingleRow = useCallback(
    (row: TableRow): Record<string, string> => {
      if (row.id === GHOST_ROW_ID) return {};
      return validateRow(row.cells as T);
    },
    [validateRow],
  );

  // Compute full validation state directly from current rows
  // This runs on every render when rows change
  const validationState = useMemo(() => {
    // Start with an empty error record
    const errors: Record<string, Record<string, string>> = {};
    let hasErrors = false;

    // Check each non-ghost row
    nonGhostRows.forEach((row) => {
      // Validate row and get errors
      const rowErrors = validateSingleRow(row);

      // If there are errors, record them
      if (Object.keys(rowErrors).length > 0) {
        errors[row.id] = rowErrors;
        hasErrors = true;
      }
      // If no errors, no entry is created in the errors object
      // This is how errors "clear" - by not being included
    });

    return {
      isValid: !hasErrors,
      errors,
    };
  }, [nonGhostRows, validateSingleRow]);

  // Determine if save is enabled based on validation state and row presence
  const isSaveEnabled = useMemo(
    () => nonGhostRows.length > 0 && validationState.isValid,
    [nonGhostRows, validationState.isValid],
  );

  // Function to validate all rows on demand (for save)
  // This ensures we get a fresh validation result at save time
  const validateAll = useCallback(() => {
    return validationState;
  }, [validationState]);

  return {
    validationState,
    isSaveEnabled,
    validateAll,
  };
}
