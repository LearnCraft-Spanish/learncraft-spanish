import type { CreateTableHook } from '@application/units/pasteTable/useCreateTable';
import type { CreateNonVerbVocabulary } from '@learncraft-spanish/shared';
import {
  SCHEMA_FIELD_CONFIG,
  VOCABULARY_COLUMNS,
} from '@application/implementations/vocabularyTable/constants';
import { useCreateTable } from '@application/units/pasteTable';
import { CreateNonVerbVocabularySchema } from '@learncraft-spanish/shared';

/**
 * Custom hook for managing vocabulary data in a table format.
 * This hook provides a bridge between the table UI and the vocabulary domain models.
 * It handles table-specific concerns like column configuration and basic data validation.
 */
export function useVocabularyTable(): CreateTableHook<CreateNonVerbVocabulary> {
  return useCreateTable<CreateNonVerbVocabulary>({
    columns: VOCABULARY_COLUMNS,
    rowSchema: CreateNonVerbVocabularySchema,
  });
}

// Re-export constants to maintain the same public API
export { SCHEMA_FIELD_CONFIG, VOCABULARY_COLUMNS };
