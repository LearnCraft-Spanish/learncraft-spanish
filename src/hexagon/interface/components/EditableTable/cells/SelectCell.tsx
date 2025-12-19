import type { CellRenderProps } from '@interface/components/EditableTable/types';

/**
 * Select dropdown cell
 */
export function SelectCell({
  column,
  value,
  display,
  error,
  onChange,
  onFocus,
  onBlur,
  cellRef,
}: CellRenderProps) {
  if (!column.options) {
    // Fallback to text input if no options provided
    return (
      <input
        ref={cellRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-label={display.label}
        className={`paste-table__cell${error ? ' paste-table__cell--error' : ''}`}
        placeholder={display.placeholder}
      />
    );
  }

  return (
    <select
      ref={cellRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label={display.label}
      className={`paste-table__cell${error ? ' paste-table__cell--error' : ''}`}
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

