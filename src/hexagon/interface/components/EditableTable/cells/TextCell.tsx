import type { CellRenderProps } from '@interface/components/EditableTable/types';

/**
 * Standard text input cell
 */
export function TextCell({
  value,
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
