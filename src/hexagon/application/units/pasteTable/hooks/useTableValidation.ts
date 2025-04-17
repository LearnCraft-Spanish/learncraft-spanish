import type { TableRow } from '../../types';
import { useCallback, useState } from 'react';
import { GHOST_ROW_ID } from '../../types';

interface UseTableValidationProps<T> {
  rows: TableRow[];
  validateRow: (row: T) => Record<string, string>;
  setRowValidation: (rowId: string, errors?: Record<string, string>) => void;
}

export function useTableValidation<T>({
  rows,
  validateRow,
  setRowValidation,
}: UseTableValidationProps<T>) {
  const [isValid, setIsValid] = useState(true);

  // Validate all rows and update validation state
  const validateRows = useCallback(() => {
    // Filter out the ghost row for validation
    const nonGhostRows = rows.filter((row) => row.id !== GHOST_ROW_ID);
    const errors: Record<string, Record<string, string>> = {};

    // Validate each row
    nonGhostRows.forEach((row) => {
      const rowData = row.cells as T;
      const rowErrors = validateRow(rowData);

      if (Object.keys(rowErrors).length > 0) {
        errors[row.id] = rowErrors;
      }
    });

    // Update validation state
    const valid = Object.keys(errors).length === 0;
    setIsValid(valid);

    // Update each row with validation errors
    nonGhostRows.forEach((row) => {
      setRowValidation(row.id, errors[row.id]);
    });

    return {
      isValid: valid,
      errors,
    };
  }, [rows, validateRow, setRowValidation]);

  // Check if save is enabled (valid and has data)
  const isSaveEnabled = isValid && rows.length > 1; // More than just ghost row

  return {
    isValid,
    isSaveEnabled,
    validateRows,
  };
}
