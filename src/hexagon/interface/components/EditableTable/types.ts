/**
 * EditableTable Component Types
 *
 * Shared types for EditableTable and related components.
 */

import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { ClipboardEvent, RefCallback } from 'react';

// =============================================================================
// DISPLAY CONFIG (Interface Layer)
// =============================================================================

/**
 * Column display configuration - presentation concerns only
 */
export interface ColumnDisplayConfig {
  /** Maps to ColumnDefinition.id */
  id: string;
  /** Human-readable label for headers/ARIA */
  label: string;
  /** CSS width (e.g., '1fr', '200px', '20%') */
  width?: string;
  /** Placeholder text for inputs */
  placeholder?: string;
  /** Whether to show this column in the table UI (default: true) */
  visible?: boolean;
}

// =============================================================================
// CELL RENDER PROPS
// =============================================================================

/**
 * Props passed to cell renderer (standard or custom)
 */
export interface CellRenderProps {
  /** The full row data */
  row: TableRow;
  /** The column definition */
  column: ColumnDefinition;
  /** The display config for this column */
  display: ColumnDisplayConfig;
  /** Current cell value (string) */
  value: string;
  /** Whether this row has unsaved changes */
  isDirty: boolean;
  /** Validation error message for this cell, if any */
  error?: string;
  /** Whether this cell is currently focused */
  isActive: boolean;
  /** Whether this column is editable */
  isEditable: boolean;
  /** Call to update the cell value */
  onChange: (value: string) => void;
  /** Call when cell receives focus */
  onFocus: () => void;
  /** Call when cell loses focus */
  onBlur: () => void;
  /** Ref callback for focus management */
  cellRef: RefCallback<HTMLElement>;
}

// =============================================================================
// TABLE PROPS
// =============================================================================

/**
 * Contract for what a use case must provide to use EditableTable
 * Defines the data, state, and actions that come from the use case layer
 *
 * Organized by concern:
 * - Data: Core table data (rows, columns)
 * - State: Derived state (dirty tracking, validation, loading states)
 * - Actions: User interactions (cell changes, paste, save, discard)
 * - Focus: Focus management for paste operations
 */
export interface EditableTableUseCaseProps {
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
  /** Set of row IDs that have unsaved changes */
  dirtyRowIds: Set<string>;
  /** Validation errors by rowId -> columnId -> error message */
  validationErrors: Record<string, Record<string, string>>;
  /** Whether data is currently loading from server */
  isLoading: boolean;
  /** Whether save operation is in progress */
  isSaving: boolean;
  /** Whether all rows pass validation */
  isValid: boolean;
  /** Whether there are any unsaved changes */
  hasUnsavedChanges?: boolean;

  // =============================================================================
  // ACTIONS
  // =============================================================================
  /** Handler for cell value changes */
  onCellChange: (rowId: string, columnId: string, value: string) => void;
  /** Handler for paste operations */
  onPaste?: (e: ClipboardEvent<Element>) => void;
  /** Handler to save changes */
  onSave?: () => Promise<void>;
  /** Handler to discard unsaved changes */
  onDiscard?: () => void;

  // =============================================================================
  // FOCUS MANAGEMENT
  // =============================================================================
  /** Set active cell info (for paste operations) */
  setActiveCellInfo?: (rowId: string, columnId: string) => void;
  /** Clear active cell info */
  clearActiveCellInfo?: () => void;
}

/**
 * Props for the EditableTable component
 * Combines use case props with interface-layer presentation concerns
 */
export interface EditableTableProps extends EditableTableUseCaseProps {
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
   *
   * Default behavior: If not provided, StandardCell is used for all cells.
   */
  renderCell: (props: CellRenderProps) => React.ReactNode;
  /** Optional class name */
  className?: string;
}
