/**
 * CreateTable Component Types
 *
 * Shared types for CreateTable and related components.
 */

import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type {
  CellRenderProps,
  ColumnDisplayConfig,
} from '@interface/components/EditableTable/types';
import type { ClipboardEvent } from 'react';

// Re-export shared types
export type {
  CellRenderProps,
  ColumnDisplayConfig,
} from '@interface/components/EditableTable/types';

// =============================================================================
// TABLE PROPS
// =============================================================================

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

/**
 * Props for the CreateTable component
 * Combines use case props with interface-layer presentation concerns
 */
export interface CreateTableProps extends CreateTableUseCaseProps {
  /** Column display configuration - presentation concern (interface layer) */
  displayConfig: ColumnDisplayConfig[];
  /**
   * Cell renderer function - determines which component to render for each cell
   *
   * This function is called by EditableTableRow for every cell, allowing
   * interface-layer customization of cell rendering (e.g., custom components
   * for specific column types).
   *
   * The function receives CellRenderProps containing all cell state and handlers.
   * Return a React component (typically StandardCell or a custom cell component).
   */
  renderCell: (props: CellRenderProps) => React.ReactNode;
  /** Optional class name */
  className?: string;
}
