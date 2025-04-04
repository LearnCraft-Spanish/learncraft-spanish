import type { ClipboardEvent } from 'react';

/**
 * Supported cell input types
 */
export type CellType = 'text' | 'number' | 'select' | 'date';

/**
 * Options for select-type cells
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Simple column definition that includes both data and display properties
 */
export interface TableColumn {
  /** Unique identifier for the column */
  id: string;
  /** Human-readable label for display */
  label: string;
  /** Optional CSS width */
  width?: string;
  /** Input type for the column cells */
  type?: CellType;
  /** Options for select-type cells */
  options?: SelectOption[];
  /** Min value for number inputs */
  min?: number;
  /** Max value for number inputs */
  max?: number;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Core data structure for the table
 */
export interface TableData {
  /** Array of table rows */
  rows: TableRow[];
}

/**
 * Represents a single row in the table
 */
export interface TableRow {
  /** Unique identifier for the row */
  id: string;
  /** Map of column IDs to cell values */
  cells: Record<string, string>;
  /** Optional validation errors for each cell */
  validationErrors?: Record<string, string>;
}

/**
 * Core hook interface that provides table functionality.
 * Focuses purely on data management and business rules.
 */
export interface TableHook<T> {
  // Data
  data: TableData;
  columns: TableColumn[];

  // Event handlers
  handlePaste: (e: ClipboardEvent<Element>) => void;
  handleCellPaste: (
    e: ClipboardEvent<HTMLInputElement>,
    rowId: string,
    columnId: string,
  ) => void;
  handleCellChange: (rowId: string, columnId: string, value: string) => void;
  handleSave: () => Promise<T[] | undefined>;
  clearTable: () => void;

  // Cell focus tracking
  setActiveCellInfo: (rowId: string, columnId: string) => void;
  clearActiveCellInfo: () => void;

  // External data management
  setExternalData: (data: T[]) => void;

  // Business rules
  isSaveEnabled: boolean;
}

/** ID used for the ghost row that appears at the bottom of the table */
export const GHOST_ROW_ID = 'ghost-row';
