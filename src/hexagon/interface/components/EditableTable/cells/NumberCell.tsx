import type { CellRenderProps } from '@interface/components/EditableTable/types';

/**
 * Number input cell
 */
export function NumberCell({
  value,
  column,
  display,
  error,
  onChange,
  onFocus,
  onBlur,
  cellRef,
}: CellRenderProps) {
  return (
    <input
      ref={cellRef}
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      min={column.min}
      max={column.max}
      aria-label={display.label}
      className={`paste-table__cell${error ? ' paste-table__cell--error' : ''}`}
      placeholder={display.placeholder}
    />
  );
}

