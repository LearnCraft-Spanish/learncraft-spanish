import type { CellRenderProps } from '@interface/components/EditableTable/types';

/**
 * Number input cell
 */
export function NumberCell({
  value,
  column,
  display,
  onChange,
  onFocus,
  onBlur,
  cellRef,
}: CellRenderProps) {
  return (
    <div
      onFocus={onFocus}
      onBlur={onBlur}
      className="paste-table__cell-wrapper"
    >
      <input
        ref={cellRef}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={column.min}
        max={column.max}
        aria-label={display.label}
        className="paste-table__cell"
        placeholder={display.placeholder}
      />
    </div>
  );
}

