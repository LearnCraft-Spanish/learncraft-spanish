import type { ColumnDefinition } from '@domain/PasteTable';
import type { ColumnDisplayConfig } from '@interface/components/EditableTable/types';
import {
  isBooleanColumn,
  isDateColumn,
  isMultiSelectColumn,
  isSelectColumn,
} from '@domain/PasteTable';
import { ToggleSwitch } from '@interface/components/general';
import React from 'react';
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
  cellRef: (el: HTMLInputElement | HTMLSelectElement | null) => void;
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
      <select
        ref={(el) => cellRef(el)}
        value={cellValue}
        onChange={handleChange}
        {...commonProps}
      >
        <option value="">Select...</option>
        {column.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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

  // Boolean column
  if (isBooleanColumn(column)) {
    const format = column.booleanFormat || 'true-false';
    if (format === 'true-false' || format === 'auto') {
      return (
        <ToggleSwitch
          id={cellKey}
          ariaLabel={ariaLabel}
          label={''}
          checked={cellValue === 'true'}
          onChange={() =>
            handlers.onChange(cellValue === 'true' ? 'false' : 'true')
          }
        />
      );
    }
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
