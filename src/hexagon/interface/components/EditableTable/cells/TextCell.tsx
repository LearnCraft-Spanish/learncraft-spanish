import type { CellRenderProps } from '@interface/components/EditableTable/types';
import React from 'react';

/**
 * Standard text input cell
 */
export function TextCell({
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
