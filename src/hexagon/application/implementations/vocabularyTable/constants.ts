import type { CellType, TableColumn } from '@domain/PasteTable/General';

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
 * Column definitions for the vocabulary table.
 * Generated from schema field names as IDs for consistency with the domain model.
 */
export const VOCABULARY_COLUMNS: TableColumn[] = [
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
