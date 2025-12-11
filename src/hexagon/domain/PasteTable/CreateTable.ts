import type { ClipboardEvent } from 'react';
import type { TableColumn, TableRow, ValidationState } from './types';

/**
 * ID used for the ghost row that appears at the bottom of create tables
 */
export const GHOST_ROW_ID = 'ghost-row';

/**
 * Create table hook interface
 * For tables that allow creating new records via paste/editing
 */
export interface CreateTableHook<T> {
  // Data
  data: {
    rows: TableRow[];
    columns: TableColumn[];
  };

  // Operations
  updateCell: (rowId: string, columnId: string, value: string) => string | null;
  handlePaste: (e: ClipboardEvent<Element>) => void;
  importData: (data: T[]) => void;
  resetTable: () => void;

  // Focus tracking (for paste operations)
  setActiveCellInfo: (rowId: string, columnId: string) => void;
  clearActiveCellInfo: () => void;

  // State
  isSaveEnabled: boolean;
  validationState: ValidationState;

  // Save operation (returns data for external save)
  saveData: () => Promise<T[] | undefined>;
}
