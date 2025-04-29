import type { CreateNonVerbVocabulary } from '@LearnCraft-Spanish/shared';
import type { CellType, TableColumn, TableHook } from './pasteTable/types';
import { validateCreateNonVerbVocabulary } from '@LearnCraft-Spanish/shared';
import { usePasteTable } from './pasteTable';

// Column configuration with labels and widths
const SCHEMA_FIELD_CONFIG: Record<
  string,
  { label: string; width: string; type: CellType; min?: number; max?: number }
> = {
  word: { label: 'Word', width: '1fr', type: 'text' },
  descriptor: { label: 'Descriptor', width: '2fr', type: 'text' },
  frequency: {
    label: 'Frequency',
    width: '0.5fr',
    type: 'number',
    min: 1,
    max: 10000,
  },
  notes: { label: 'Notes', width: '1fr', type: 'text' },
};

/**
 * Column definitions for the vocabulary table.
 * Generated from schema field names as IDs for consistency with the domain model.
 */
const VOCABULARY_COLUMNS: TableColumn[] = [
  // Generate columns from schema fields
  ...Object.keys(SCHEMA_FIELD_CONFIG).map((field) => ({
    id: field,
    label: SCHEMA_FIELD_CONFIG[field].label,
    width: SCHEMA_FIELD_CONFIG[field].width,
    type: SCHEMA_FIELD_CONFIG[field].type,
    min: SCHEMA_FIELD_CONFIG[field].min,
    max: SCHEMA_FIELD_CONFIG[field].max,
  })),
];

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
