/**
 * Table Row Types
 *
 * Domain-level data structures for table rows.
 * All cell values are strings - type conversion happens at boundaries.
 */

/**
 * Represents a single row in the table
 */
export interface TableRow {
  /**
   * Unique identifier for the row (table-internal)
   * NOT the same as domain entity ID (which is stored in cells)
   */
  id: string;
  /**
   * Map of column IDs to cell values
   * All values are strings for paste compatibility
   */
  cells: Record<string, string>;
}

/**
 * Core data structure for the table
 */
export interface TableData {
  rows: TableRow[];
}
