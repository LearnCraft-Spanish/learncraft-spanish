import type { CreateTableStateHook } from '@application/units/pasteTable/useCreateTableState';
import {
  SCHEMA_FIELD_CONFIG,
  VOCABULARY_COLUMNS,
} from '@application/implementations/vocabularyTable/constants';
import { useCreateTableState } from '@application/units/pasteTable';

/**
 * Custom hook for managing vocabulary data in a table format.
 * Returns focused state hook (no mapping, no validation).
 * Use case composes mapping and validation separately.
 */
export function useVocabularyTable(): CreateTableStateHook {
  return useCreateTableState({
    columns: VOCABULARY_COLUMNS,
  });
}

// Re-export constants to maintain the same public API
export { SCHEMA_FIELD_CONFIG, VOCABULARY_COLUMNS };
