/**
 * EditableTable Interface Contract
 *
 * Types that define what the interface layer expects from any use case
 * that wants to use the EditableTable component.
 *
 * The use case decides HOW to compute dirty/validation state.
 * The interface just renders based on WHAT it receives.
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
// USE CASE CONTRACT
// =============================================================================

/**
 * Contract that any use case must satisfy to use EditableTable
 *
 * The use case owns:
 * - Local table state (tableRows)
 * - Dirty detection logic (comparing to server state)
 * - Validation logic (via Zod or other)
 * - Save/discard actions
 *
 * The interface receives the RESULTS of these computations.
 */
export interface EditableTableContract {
  // Data
  rows: TableRow[];

  // Derived state (use case computes these however it wants)
  dirtyRowIds: Set<string>;
  validationErrors: Record<string, Record<string, string>>; // rowId -> columnId -> message

  // Actions
  updateCell: (rowId: string, columnId: string, value: string) => void;

  // Paste support (optional - table can handle if not provided)
  handlePaste?: (e: ClipboardEvent<Element>) => void;

  // Focus tracking for paste operations
  setActiveCellInfo?: (rowId: string, columnId: string) => void;
  clearActiveCellInfo?: () => void;
}

/**
 * Extended contract for edit mode (has save/discard)
 */
export interface EditModeContract extends EditableTableContract {
  hasUnsavedChanges: boolean;
  save: () => Promise<void>;
  discard: () => void;
  isSaving?: boolean;
}

/**
 * Extended contract for create mode (has different save semantics)
 */
export interface CreateModeContract extends EditableTableContract {
  hasData: boolean;
  save: () => Promise<void>;
  reset: () => void;
  isSaving?: boolean;
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
  /** Ref callback for focus management */
  cellRef: RefCallback<HTMLElement>;
}

// =============================================================================
// TABLE PROPS
// =============================================================================

/**
 * Props for the EditableTable component
 */
export interface EditableTableProps {
  /** Use case contract - provides data and actions */
  contract: EditableTableContract;
  /** Column definitions (domain) */
  columns: ColumnDefinition[];
  /** Column display config (interface) */
  displayConfig: ColumnDisplayConfig[];
  /**
   * Cell renderer - receives props for each cell
   * Return null to use default StandardCell renderer
   */
  renderCell?: (props: CellRenderProps) => React.ReactNode | null;
  /** Optional class name for the table container */
  className?: string;
}
