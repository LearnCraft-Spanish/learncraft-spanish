import type {
  TableColumn,
  TableRow,
  ValidationState,
} from '@domain/PasteTable/types';
import type { ClipboardEvent } from 'react';

/**
 * Edit table hook interface
 * For tables that allow editing existing records
 */
export interface EditTableHook<T> {
  // Data
  data: {
    rows: TableRow[];
    columns: TableColumn[];
  };

  // Operations
  updateCell: (rowId: string, columnId: string, value: string) => void;
  handlePaste: (e: ClipboardEvent<Element>) => void;
  importData: (data: T[]) => void;
  discardChanges: () => void;

  // Focus tracking
  setActiveCellInfo: (rowId: string, columnId: string) => void;
  clearActiveCellInfo: () => void;

  // State
  hasUnsavedChanges: boolean; // Alias for isDirty
  validationState: ValidationState;

  // Save operation
  applyChanges: () => Promise<void>;
}
