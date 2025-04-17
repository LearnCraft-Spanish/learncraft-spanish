import type { TableColumn } from '../../../application/units/types';
import React from 'react';

// TableCellInput component to handle rendering different input types for table cells
interface TableCellInputProps {
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

  const columnType = column.type || 'text';

  switch (columnType) {
    case 'select':
      return (
        <select
          ref={(el) => cellRef(el)}
          value={cellValue}
          onChange={handleChange}
          {...commonProps}
        >
          <option value="">Select...</option>
          {column.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case 'number':
      return (
        <input
          ref={(el) => cellRef(el)}
          type="number"
          value={cellValue}
          onChange={handleChange}
          min={column.min}
          max={column.max}
          {...commonProps}
        />
      );

    default:
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
}
