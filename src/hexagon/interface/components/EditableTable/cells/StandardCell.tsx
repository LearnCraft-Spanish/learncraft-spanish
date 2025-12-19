import type { CellRenderProps } from '@interface/components/EditableTable/types';
import {
  isBooleanColumn,
  isColumnEditable,
  isDateColumn,
  isMultiSelectColumn,
  isReadOnlyColumn,
  isSelectColumn,
  isTextAreaColumn,
} from '@domain/PasteTable';
import {
  BooleanCell,
  DateCell,
  MultiSelectCell,
  NumberCell,
  ReadOnlyCell,
  SelectCell,
  TextAreaCell,
  TextCell,
} from '@interface/components/EditableTable/cells';
import React from 'react';

/**
 * Standard cell renderer - dispatches to appropriate cell component based on column type
 *
 * Provides stable defaults for all column types. This is the default renderer
 * used by EditableTable when no custom renderCell is provided.
 *
 * Extensibility: Use the renderCell prop in EditableTable to override specific cells.
 */
export function StandardCell(props: CellRenderProps) {
  const { column, error, isActive } = props;

  // Render the appropriate cell component
  let cellComponent: React.ReactNode;

  // Read-only columns - use domain helper to check editability (editable !== false)
  if (!isColumnEditable(column) || isReadOnlyColumn(column)) {
    cellComponent = <ReadOnlyCell {...props} />;
  }
  // Select columns
  else if (isSelectColumn(column)) {
    cellComponent = <SelectCell {...props} />;
  }
  // Multi-select columns
  else if (isMultiSelectColumn(column)) {
    cellComponent = <MultiSelectCell {...props} />;
  }
  // Textarea columns
  else if (isTextAreaColumn(column)) {
    cellComponent = <TextAreaCell {...props} />;
  }
  // Boolean columns
  else if (isBooleanColumn(column)) {
    cellComponent = <BooleanCell {...props} />;
  }
  // Date columns
  else if (isDateColumn(column)) {
    cellComponent = <DateCell {...props} />;
  }
  // Number columns
  else if (column.type === 'number') {
    cellComponent = <NumberCell {...props} />;
  }
  // Default: text input
  else {
    cellComponent = <TextCell {...props} />;
  }

  // Show error message when cell is active and has error
  return (
    <>
      {cellComponent}
      {error && isActive && (
        <div className="paste-table__cell-error" role="alert">
          {error}
        </div>
      )}
    </>
  );
}
