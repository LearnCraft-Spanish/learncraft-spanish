import type { CellRenderProps } from '@interface/components/EditableTable/types';

/**
 * Select dropdown cell
 */
export function SelectCell({
  column,
  value,
  display,
  onChange,
  onFocus,
  onBlur,
  cellRef,
}: CellRenderProps) {
  if (!column.options) {
    // Fallback to text input if no options provided
    return (
      <div
        onFocus={onFocus}
        onBlur={onBlur}
        className="paste-table__cell-wrapper"
      >
        <input
          ref={cellRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={display.label}
          className="paste-table__cell"
          placeholder={display.placeholder}
        />
      </div>
    );
  }

  return (
    <div
      onFocus={onFocus}
      onBlur={onBlur}
      className="paste-table__cell-wrapper"
    >
      <select
        ref={cellRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={display.label}
        className="paste-table__cell"
      >
        <option value="">Select...</option>
        {column.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
