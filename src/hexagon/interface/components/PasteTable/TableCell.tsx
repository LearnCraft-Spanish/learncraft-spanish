import type { TableColumn } from '@domain/PasteTable/types';
import {
  isBooleanColumn,
  isDateColumn,
  isMultiSelectColumn,
  isReadOnlyColumn,
  isSelectColumn,
} from '@domain/PasteTable/types';
import { ToggleSwitch } from '@interface/components/general';
import React from 'react';
import './TableCell.scss';

// TableCellInput component to handle rendering different input types for table cells
interface TableCellInputProps {
  cellKey: string;
  column: TableColumn;
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
    placeholder: column.placeholder,
  };

  // Use type guards to safely access type-specific properties
  if (isSelectColumn(column)) {
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

  if (isMultiSelectColumn(column)) {
    // Multi-select: comma-separated values in cell, display as text input for now
    // TODO: Implement proper multi-select UI (checkboxes or multi-select dropdown)
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

  if (isBooleanColumn(column)) {
    // Boolean: checkbox or select based on format
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

  // Number or text (default)
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
  if (isReadOnlyColumn(column)) {
    return <div className="paste-table__cell-readonly">{cellValue}</div>;
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
