import type { CellRenderProps } from '@interface/components/EditableTable/types';

/**
 * Read-only cell - displays value without input
 */
export function ReadOnlyCell({ value }: CellRenderProps) {
  return <div className="paste-table__cell-readonly">{value}</div>;
}
