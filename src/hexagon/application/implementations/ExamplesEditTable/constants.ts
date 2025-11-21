import type { CellType, TableColumn } from '@domain/PasteTable/General';

// Column configuration with labels and widths
export const SCHEMA_FIELD_CONFIG: Record<
  string,
  { label: string; width: string; type: CellType; min?: number; max?: number }
> = {
  recordId: { label: 'Record ID', width: '1fr', type: 'read-only' },
  englishText: { label: 'English Text', width: '2fr', type: 'text' },
  spanishText: { label: 'Spanish Text', width: '2fr', type: 'text' },
  hasAudio: { label: 'Has Audio', width: '1fr', type: 'boolean' },
  spanglish: { label: 'Spanglish', width: '1fr', type: 'read-only' },
};

/**
 * Column definitions for the examples edit table.
 * Generated from schema field names as IDs for consistency with the domain model.
 */
export const EXAMPLES_EDIT_COLUMNS: TableColumn[] = Object.keys(
  SCHEMA_FIELD_CONFIG,
).map((field) => ({
  id: field,
  label: SCHEMA_FIELD_CONFIG[field].label,
  width: SCHEMA_FIELD_CONFIG[field].width,
  type: SCHEMA_FIELD_CONFIG[field].type,
}));
