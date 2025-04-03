import type { TableColumn, TableHook } from '../units/types';
import type { VocabularyEntry, VocabularyRank } from './types';
import { useTableData } from '../units/useTableData';

/** Field identifiers derived from VocabularyEntry */
const VOCABULARY_FIELDS = Object.fromEntries(
  Object.keys({} as VocabularyEntry).map((key) => [key, key]),
) as Record<keyof VocabularyEntry, keyof VocabularyEntry>;

/** Column definitions for the vocabulary table */
const VOCABULARY_COLUMNS: TableColumn[] = [
  { id: VOCABULARY_FIELDS.spanish, label: 'Spanish', width: '1fr' },
  { id: VOCABULARY_FIELDS.english, label: 'English', width: '1fr' },
  { id: VOCABULARY_FIELDS.usage, label: 'Usage Example', width: '2fr' },
  { id: VOCABULARY_FIELDS.rank, label: 'Rank', width: '80px' },
];

/** Validates that a number is a valid vocabulary rank (1-10001) */
function isValidRank(value: number): value is VocabularyRank {
  return Number.isInteger(value) && value >= 1 && value <= 10001;
}

export function useVocabularyTable(): TableHook<VocabularyEntry> {
  return useTableData<VocabularyEntry>({
    columns: VOCABULARY_COLUMNS,
    validateRow: (row) => {
      const errors: Record<string, string> = {};

      if (!row.spanish?.trim()) {
        errors[VOCABULARY_FIELDS.spanish] = 'Spanish is required';
      }
      if (!row.english?.trim()) {
        errors[VOCABULARY_FIELDS.english] = 'English is required';
      }

      const rankNum = Number(row.rank);
      if (Number.isNaN(rankNum) || !isValidRank(rankNum)) {
        errors[VOCABULARY_FIELDS.rank] =
          'Rank must be a number between 1 and 10001';
      }

      return errors;
    },
  });
}
