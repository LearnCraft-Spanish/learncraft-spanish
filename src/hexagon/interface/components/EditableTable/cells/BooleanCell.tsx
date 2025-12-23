import type { CellRenderProps } from '@interface/components/EditableTable/types';
import { ToggleSwitch } from '@interface/components/general';

/**
 * Boolean cell - uses ToggleSwitch for 'auto' format, text input for others
 */
export function BooleanCell({
  column,
  row,
  display,
  value,
  onChange,
  onFocus,
  onBlur,
  cellRef,
}: CellRenderProps) {
  const cellKey = `${row.id}-${column.id}`;
  const format = column.booleanFormat || 'auto';

  // Auto format: use ToggleSwitch
  if (format === 'auto') {
    return (
      <div
        ref={cellRef}
        onFocus={onFocus}
        onBlur={onBlur}
        tabIndex={0}
        role="checkbox"
        aria-checked={value === 'true'}
        aria-label={display.label}
        className="paste-table__cell-boolean-wrapper"
      >
        <ToggleSwitch
          id={cellKey}
          ariaLabel={display.label}
          label=""
          checked={value === 'true'}
          onChange={() => onChange(value === 'true' ? 'false' : 'true')}
        />
      </div>
    );
  }

  // Other formats: use text input
  return (
    <div
      ref={cellRef}
      onFocus={onFocus}
      onBlur={onBlur}
      className="paste-table__cell-wrapper"
    >
      <input
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
