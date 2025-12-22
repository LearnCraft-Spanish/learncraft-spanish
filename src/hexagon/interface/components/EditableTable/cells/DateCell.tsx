import type { CellRenderProps } from '@interface/components/EditableTable/types';

/**
 * Date input cell
 */
export function DateCell({
  value,
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
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={display.label}
        className="paste-table__cell"
        placeholder={display.placeholder}
      />
    </div>
  );
}

