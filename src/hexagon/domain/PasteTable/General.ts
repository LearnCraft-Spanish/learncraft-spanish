import type {
  CellType,
  ColumnDefinition,
  ColumnDisplayConfig,
  DateFormatConfig,
  SelectOption,
  TableColumn,
  TableData,
  TableRow,
  ValidationState,
} from '@domain/PasteTable/types';
import type { ClipboardEvent } from 'react';

/**
 * @deprecated Use types from '@domain/PasteTable/types' instead
 * This file is kept for backward compatibility during migration
 */

// Re-export types from the new types file
export type {
  CellType,
  ColumnDefinition,
  ColumnDisplayConfig,
  DateFormatConfig,
  SelectOption,
  TableColumn,
  TableData,
  TableRow,
  ValidationState,
};

/**
 * Core hook interface that provides table functionality.
 * Focuses purely on data management and business rules.
 * @deprecated Consider using CreateTableHook or EditTableHook for new code
 */
export interface TableHook<T> {
  // Core data structure
  data: {
    rows: TableRow[];
    columns: TableColumn[];
  };

  // Core operations
  updateCell: (rowId: string, columnId: string, value: string) => string | null;
  saveData: () => Promise<T[] | undefined>;
  resetTable: () => void;

  // Data import
  importData: (data: T[]) => void;
  handlePaste: (e: ClipboardEvent<Element>) => void;

  // Cell focus tracking (needed for paste operations)
  setActiveCellInfo: (rowId: string, columnId: string) => void;
  clearActiveCellInfo: () => void;

  // State flags and validation
  isSaveEnabled: boolean;
  validationState: ValidationState;
}
