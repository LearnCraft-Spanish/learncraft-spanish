/**
 * EditableTable Component Types
 *
 * Shared types for EditableTable and related components.
 */

import type { EditableTableUseCaseProps } from '@application/useCases/types';
import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { CSSProperties, RefCallback } from 'react';

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
  /**
   * Keeps the column in view while the other columns scroll horizontally.
   * Once any column is pinned, every column needs a fixed `width` (e.g. '8rem').
   */
  pinned?: 'left' | 'right';
  /**
   * Makes the header a button that reports clicks through `onSortColumn` and
   * shows the `sort` it is given. The table never reorders rows itself.
   */
  sortable?: boolean;
}

/**
 * Class name and inline style that keep a pinned column's cells in view
 */
export interface PinnedCellProps {
  className: string;
  style: CSSProperties;
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

// Re-export use case contract from application layer
export type { EditableTableUseCaseProps };

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
