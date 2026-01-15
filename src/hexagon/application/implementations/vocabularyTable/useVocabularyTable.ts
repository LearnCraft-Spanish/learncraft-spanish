import type { CreateTableStateHook } from '@application/units/pasteTable/useCreateTableState';
import {
  SCHEMA_FIELD_CONFIG,
  VOCABULARY_COLUMNS,
} from '@application/implementations/vocabularyTable/constants';
import { useCreateTableState } from '@application/units/pasteTable/useCreateTableState';

/**
 * Custom hook for managing vocabulary data in a table format.
 * This hook provides a bridge between the table UI and the vocabulary domain models.
 * It handles table-specific concerns like column configuration and basic data validation.
 */
export function useVocabularyTable(): CreateTableStateHook {
  return useCreateTableState({
    columns: VOCABULARY_COLUMNS,
  });
}

// Re-export constants to maintain the same public API
export { SCHEMA_FIELD_CONFIG, VOCABULARY_COLUMNS };
