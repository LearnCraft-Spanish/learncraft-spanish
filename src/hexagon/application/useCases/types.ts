import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { Vocabulary } from '@learncraft-spanish/shared';
import type { ClipboardEvent } from 'react';

// Define pagination state for current vocabulary view
export interface VocabularyPaginationState {
  vocabularyItems: Vocabulary[];
  isLoading: boolean;
  isCountLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  totalCount: number | null;
  totalPages: number | null;
  hasMorePages: boolean;
  currentPage: number;
  pageSize: number;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

/**
 * Contract for what a use case must provide to use CreateTable
 * Defines the data, state, and actions that come from the use case layer
 *
 * Organized by concern:
 * - Data: Core table data (rows, columns)
 * - State: Derived state (validation, loading states, hasData)
 * - Actions: User interactions (cell changes, paste, save, reset)
 * - Focus: Focus management for paste operations
 */
export interface CreateTableUseCaseProps {
  // =============================================================================
  // DATA
  // =============================================================================
  /** Table rows with current cell values */
  rows: TableRow[];
  /** Column definitions (domain layer) */
  columns: ColumnDefinition[];

  // =============================================================================
  // STATE
  // =============================================================================
  /** Validation errors by rowId -> columnId -> error message */
  validationErrors: Record<string, Record<string, string>>;
  /** Whether save operation is in progress */
  isSaving: boolean;
  /** Whether all rows pass validation */
  isValid: boolean;
  /** Whether table has any data (excluding ghost row) */
  hasData: boolean; // rows.filter(r => r.id !== GHOST_ROW_ID).length > 0

  // =============================================================================
  // ACTIONS
  // =============================================================================
  /** Handler for cell value changes
   * Returns new row ID if ghost row was converted, null otherwise
   */
  onCellChange: (
    rowId: string,
    columnId: string,
    value: string,
  ) => string | null;
  /** Handler for paste operations */
  onPaste?: (e: ClipboardEvent<Element>) => void;
  /** Handler to save data */
  onSave?: () => Promise<void>;
  /** Handler to reset table to empty state */
  onReset?: () => void;

  // =============================================================================
  // FOCUS MANAGEMENT
  // =============================================================================
  /** Currently active cell (for focus management) */
  activeCell: { rowId: string; columnId: string } | null;
  /** Set active cell */
  setActiveCell: (cell: { rowId: string; columnId: string } | null) => void;
  /** Set active cell info (for paste operations) */
  setActiveCellInfo?: (rowId: string, columnId: string) => void;
  /** Clear active cell info */
  clearActiveCellInfo?: () => void;
}
