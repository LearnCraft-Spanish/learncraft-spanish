import type { ExamplesEditTableRow } from '@application/implementations/ExamplesEditTable/validation';
import type { TableHook } from '@domain/PasteTable/General';
import {
  EXAMPLES_EDIT_COLUMNS,
  SCHEMA_FIELD_CONFIG,
} from '@application/implementations/ExamplesEditTable/constants';
import { validateExamplesEditTableRow } from '@application/implementations/ExamplesEditTable/validation';
import { usePasteTable } from '@application/units/pasteTable';

/**
 * Custom hook for managing examples edit data in a table format.
 * This hook provides a bridge between the table UI and the examples edit domain models.
 * It handles table-specific concerns like column configuration and basic data validation.
 */
export function useExamplesEditTable(): TableHook<ExamplesEditTableRow> {
  return usePasteTable<ExamplesEditTableRow>({
    columns: EXAMPLES_EDIT_COLUMNS,
    validateRow: (row) => {
      const errors: Record<string, string> = {};

      // Use shared validation function
      const result = validateExamplesEditTableRow(row);
      if (!result.valid) {
        // Map validation errors to field errors
        result.errors.forEach((error) => {
          const field = error.split(':')[0].trim();
          if (field in SCHEMA_FIELD_CONFIG) {
            errors[field] = error;
          }
        });
      }

      return errors;
    },
  });
}
