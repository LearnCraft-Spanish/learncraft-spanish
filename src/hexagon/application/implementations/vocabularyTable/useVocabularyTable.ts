import type { TableHook } from '@application/units/PasteTable';
import type { CreateNonVerbVocabulary } from '@learncraft-spanish/shared';
import { usePasteTable } from '@application/units/PasteTable';
import { validateCreateNonVerbVocabulary } from '@learncraft-spanish/shared';
import { SCHEMA_FIELD_CONFIG, VOCABULARY_COLUMNS } from './constants';

/**
 * Custom hook for managing vocabulary data in a table format.
 * This hook provides a bridge between the table UI and the vocabulary domain models.
 * It handles table-specific concerns like column configuration and basic data validation.
 */
export function useVocabularyTable(): TableHook<CreateNonVerbVocabulary> {
  return usePasteTable<CreateNonVerbVocabulary>({
    columns: VOCABULARY_COLUMNS,
    validateRow: (row) => {
      const errors: Record<string, string> = {};

      // Create a copy with frequency as number for validation
      const dataForValidation = {
        ...row,
        // Convert frequency to number if it exists and is a valid number
        frequency:
          row.frequency !== undefined ? Number(row.frequency) : undefined,
      };

      // Use shared validation function
      const result = validateCreateNonVerbVocabulary(dataForValidation);
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

// Re-export constants to maintain the same public API
export { SCHEMA_FIELD_CONFIG, VOCABULARY_COLUMNS };
