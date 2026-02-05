/**
 * CreateTable Component Types
 *
 * Shared types for CreateTable and related components.
 */

import type { CreateTableUseCaseProps } from '@application/useCases/types';
import type {
  CellRenderProps,
  ColumnDisplayConfig,
} from '@interface/components/EditableTable/types';

// Re-export use case contract from application layer
export type { CreateTableUseCaseProps } from '@application/useCases/types';

// Re-export shared types
export type {
  CellRenderProps,
  ColumnDisplayConfig,
} from '@interface/components/EditableTable/types';

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
