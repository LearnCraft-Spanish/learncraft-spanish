import type { CreateNonVerbVocabulary } from '@LearnCraft-Spanish/shared';
import type { TableColumn, TableHook } from './pasteTable/types';
import { usePasteTable } from './pasteTable';

// Define schema fields directly using strings to avoid type issues
const schemaFields: (keyof CreateNonVerbVocabulary)[] = [
  'word',
  'descriptor',
  'frequency',
  'notes',
];

// Column configuration with labels and widths
const SCHEMA_FIELD_CONFIG: Record<string, { label: string; width: string }> = {
  word: { label: 'Word', width: '1fr' },
  descriptor: { label: 'Descriptor', width: '2fr' },
  frequency: { label: 'Frequency', width: '0.5fr' },
  notes: { label: 'Notes', width: '1fr' },
};

/**
 * Column definitions for the vocabulary table.
 * Generated from schema field names as IDs for consistency with the domain model.
 */
const VOCABULARY_COLUMNS: TableColumn[] = [
  // Generate columns from schema fields
  ...schemaFields.map((field) => ({
    id: field,
    label: SCHEMA_FIELD_CONFIG[field]?.label || field,
    width: SCHEMA_FIELD_CONFIG[field]?.width || '1fr',
  })),
];

// Define our interface based on the schema types
interface VocabularyTableData {
  descriptor: string;
  frequency: number;
  spellings: string; // Simplified for table entry - in schema this is an array
  notes?: string;
}

/**
 * Custom hook for managing vocabulary data in a table format
 * This hook provides a bridge between the table UI and the vocabulary domain models
 */
export function useVocabularyTable(): TableHook<VocabularyTableData> {
  return usePasteTable<VocabularyTableData>({
    columns: VOCABULARY_COLUMNS,
    validateRow: (row) => {
      const errors: Record<string, string> = {};

      // Validate against schema requirements
      if (!row.descriptor?.trim()) {
        errors.descriptor = 'Descriptor is required';
      } else if (!/^[^:]+: [^(]+ \([^)]+\)$/.test(row.descriptor)) {
        errors.descriptor = 'Format must be "word: description (context)"';
      }

      const frequencyNum = Number(row.frequency);
      if (
        Number.isNaN(frequencyNum) ||
        frequencyNum < 1 ||
        frequencyNum > 10000
      ) {
        errors.frequency = 'Frequency must be a number between 1 and 10000';
      }

      return errors;
    },
  });
}
