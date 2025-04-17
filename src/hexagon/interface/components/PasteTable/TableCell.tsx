import React from 'react';

// TableCellInput component to handle rendering different input types for table cells
interface TableCellInputProps {
  columnType: string;
  cellValue: string;
  hasError: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  placeholder?: string;
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
  columnType,
  cellValue,
  hasError,
  options,
  min,
  max,
  placeholder,
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
    placeholder,
  };

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
          {options?.map((option) => (
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
          min={min}
          max={max}
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
