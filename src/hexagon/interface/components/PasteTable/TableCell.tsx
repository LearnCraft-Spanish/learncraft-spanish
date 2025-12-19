import type { ColumnDefinition } from '@domain/PasteTable';
import type { ColumnDisplayConfig } from '@interface/components/EditableTable/types';
import {
  isBooleanColumn,
  isDateColumn,
  isMultiSelectColumn,
  isSelectColumn,
  isTextAreaColumn,
} from '@domain/PasteTable';
import { BooleanCell } from '@interface/components/PasteTable/TableCell/BooleanCell';
import { SelectCell } from '@interface/components/PasteTable/TableCell/SelectCell';
import { TextAreaCell } from '@interface/components/PasteTable/TableCell/TextAreaCell';
import './TableCell.scss';

interface TableCellInputProps {
  cellKey: string;
  column: ColumnDefinition;
  display: ColumnDisplayConfig;
  cellValue: string;
  hasError: boolean;
  ariaLabel: string;
  handlers: {
    onChange: (value: string) => void;
    onPaste: (e: React.ClipboardEvent) => void;
    onFocus: () => void;
    onBlur: () => void;
  };
  cellRef: (
    el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null,
  ) => void;
}

export function TableCellInput({
  cellKey,
  column,
  display,
  cellValue,
  hasError,
  ariaLabel,
  handlers,
  cellRef,
}: TableCellInputProps) {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    handlers.onChange(e.target.value);
  };

  // Common props for all input types
  const commonProps = {
    'aria-label': ariaLabel,
    className: `paste-table__cell${hasError ? ' paste-table__cell--error' : ''}`,
    onPaste: handlers.onPaste,
    onFocus: handlers.onFocus,
    onBlur: handlers.onBlur,
    placeholder: display.placeholder,
  };

  // Readonly column
  if (column.editable === false) {
    return <div className="paste-table__cell-readonly">{cellValue}</div>;
  }

  // Select column
  if (isSelectColumn(column) && column.options) {
    return (
      <SelectCell
        cellValue={cellValue}
        handleChange={handleChange}
        options={column.options}
        commonProps={commonProps}
        cellRef={cellRef}
      />
    );
  }

  // Multi-select column
  if (isMultiSelectColumn(column)) {
    return (
      <input
        ref={(el) => cellRef(el)}
        type="text"
        value={cellValue}
        onChange={handleChange}
        {...commonProps}
        placeholder="Comma-separated values"
      />
    );
  }
  if (isTextAreaColumn(column)) {
    return (
      <TextAreaCell
        cellValue={cellValue}
        handleChange={handleChange}
        commonProps={commonProps}
        cellRef={cellRef}
      />
    );
  }

  // Boolean column
  if (isBooleanColumn(column)) {
    // Boolean: checkbox or select based on format
    const format = column.booleanFormat || 'true-false';
    if (format === 'true-false' || format === 'auto') {
      return (
        <BooleanCell
          cellKey={cellKey}
          ariaLabel={ariaLabel}
          cellValue={cellValue}
          handlers={handlers}
        />
      );
    }
    // For other formats, use text input
    return (
      <input
        ref={(el) => cellRef(el)}
        type="text"
        value={cellValue}
        onChange={handleChange}
        {...commonProps}
      />
    );
  }

  // Date column
  if (isDateColumn(column)) {
    return (
      <input
        ref={(el) => cellRef(el)}
        type="date"
        value={cellValue}
        onChange={handleChange}
        {...commonProps}
      />
    );
  }

  // Number column
  if (column.type === 'number') {
    return (
      <input
        ref={(el) => cellRef(el)}
        type="number"
        value={cellValue}
        onChange={handleChange}
        {...commonProps}
      />
    );
  }

  // Default: text input
  return (
    <input
      ref={(el) => cellRef(el)}
      type="text"
      value={cellValue}
      onChange={handleChange}
      {...commonProps}
    />
  );
}
