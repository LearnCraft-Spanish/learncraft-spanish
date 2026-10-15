import type { ColumnDefinition } from '@domain/PasteTable';
import type { ColumnDisplayConfig } from '@interface/components/EditableTable/types';
import type { CSSProperties } from 'react';

export interface PinnedColumn {
  side: 'left' | 'right';
  /** The pinned column the scrolling columns pass under */
  isInnerEdge: boolean;
  style: CSSProperties;
}

export interface PinnedColumnLayout {
  /** True once any column is pinned; the table then scrolls horizontally */
  isScrollable: boolean;
  tableStyle: CSSProperties;
  pinnedColumns: Record<string, PinnedColumn>;
}

function sumWidths(widths: string[]): string {
  if (widths.length === 0) return '0px';
  if (widths.length === 1) return widths[0];
  return `calc(${widths.join(' + ')})`;
}

function widthOf(display: ColumnDisplayConfig): string {
  return display.width ?? '0px';
}

function fixedWidth(display: ColumnDisplayConfig): CSSProperties {
  const width = widthOf(display);
  return { width, minWidth: width, maxWidth: width };
}

/**
 * Sticky offsets for pinned columns. Each pinned column sits past the widths of
 * the pinned columns between it and its edge, so those widths must be fixed.
 * The table is exactly as wide as its columns (or its container, if wider) so
 * the offsets line up with where the columns actually render.
 */
export function getPinnedColumnLayout(
  columns: ColumnDefinition[],
  getDisplay: (columnId: string) => ColumnDisplayConfig,
): PinnedColumnLayout {
  const displays = columns.map((column) => getDisplay(column.id));
  const left = displays.filter((display) => display.pinned === 'left');
  const right = displays.filter((display) => display.pinned === 'right');

  if (left.length === 0 && right.length === 0) {
    return { isScrollable: false, tableStyle: {}, pinnedColumns: {} };
  }

  const pinnedColumns: Record<string, PinnedColumn> = {};
  left.forEach((display, index) => {
    pinnedColumns[display.id] = {
      side: 'left',
      isInnerEdge: index === left.length - 1,
      style: {
        ...fixedWidth(display),
        left: sumWidths(left.slice(0, index).map(widthOf)),
      },
    };
  });
  right.forEach((display, index) => {
    pinnedColumns[display.id] = {
      side: 'right',
      isInnerEdge: index === 0,
      style: {
        ...fixedWidth(display),
        right: sumWidths(right.slice(index + 1).map(widthOf)),
      },
    };
  });

  return {
    isScrollable: true,
    tableStyle: { width: sumWidths(displays.map(widthOf)), minWidth: '100%' },
    pinnedColumns,
  };
}
