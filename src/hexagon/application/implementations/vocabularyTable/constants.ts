import type { CellType, ColumnDefinition } from '@domain/PasteTable';

// Column configuration with labels and widths
export const SCHEMA_FIELD_CONFIG: Record<
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
 * Column definitions for the vocabulary table (domain only).
 */
export const VOCABULARY_COLUMNS: ColumnDefinition[] = Object.keys(
  SCHEMA_FIELD_CONFIG,
).map((field) => ({
  id: field,
  type: SCHEMA_FIELD_CONFIG[field].type,
  min: SCHEMA_FIELD_CONFIG[field].min,
  max: SCHEMA_FIELD_CONFIG[field].max,
}));
