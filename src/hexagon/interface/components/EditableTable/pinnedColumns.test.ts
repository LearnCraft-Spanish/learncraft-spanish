import type { ColumnDefinition } from '@domain/PasteTable';
import type { ColumnDisplayConfig } from '@interface/components/EditableTable/types';
import { getPinnedColumnLayout } from '@interface/components/EditableTable/pinnedColumns';
import { describe, expect, it } from 'vitest';

function layoutFor(displays: ColumnDisplayConfig[]) {
  const columns: ColumnDefinition[] = displays.map(({ id }) => ({
    id,
    type: 'read-only',
  }));
  const byId = new Map(displays.map((display) => [display.id, display]));
  return getPinnedColumnLayout(columns, (id) => byId.get(id)!);
}

describe('getPinnedColumnLayout', () => {
  it('leaves the table alone when no column is pinned', () => {
    expect(
      layoutFor([
        { id: 'a', label: 'A', width: '1fr' },
        { id: 'b', label: 'B' },
      ]),
    ).toEqual({ isScrollable: false, tableStyle: {}, pinnedColumns: {} });
  });

  it('offsets each pinned column by the pinned widths between it and its edge', () => {
    const layout = layoutFor([
      { id: 'name', label: 'Name', width: '10rem', pinned: 'left' },
      { id: 'id', label: 'ID', width: '4rem', pinned: 'left' },
      { id: 'scrolls', label: 'Scrolls', width: '20rem' },
      { id: 'total', label: 'Total', width: '6rem', pinned: 'right' },
      { id: 'goal', label: 'Goal', width: '5rem', pinned: 'right' },
      { id: 'percent', label: 'Percent', width: '7rem', pinned: 'right' },
      { id: 'notes', label: 'Notes', width: '12rem' },
    ]);

    expect(layout.isScrollable).toBe(true);
    expect(layout.pinnedColumns.name.style.left).toBe('0px');
    expect(layout.pinnedColumns.id.style.left).toBe('10rem');
    expect(layout.pinnedColumns.total.style.right).toBe('calc(5rem + 7rem)');
    expect(layout.pinnedColumns.goal.style.right).toBe('7rem');
    expect(layout.pinnedColumns.percent.style.right).toBe('0px');
    expect(layout.pinnedColumns.scrolls).toBeUndefined();
    expect(layout.pinnedColumns.notes).toBeUndefined();
  });

  it('marks the pinned column nearest the scrolling columns on each side', () => {
    const layout = layoutFor([
      { id: 'name', label: 'Name', width: '10rem', pinned: 'left' },
      { id: 'id', label: 'ID', width: '4rem', pinned: 'left' },
      { id: 'scrolls', label: 'Scrolls', width: '20rem' },
      { id: 'total', label: 'Total', width: '6rem', pinned: 'right' },
      { id: 'goal', label: 'Goal', width: '5rem', pinned: 'right' },
    ]);

    expect(layout.pinnedColumns.name).toMatchObject({
      side: 'left',
      isInnerEdge: false,
    });
    expect(layout.pinnedColumns.id).toMatchObject({
      side: 'left',
      isInnerEdge: true,
    });
    expect(layout.pinnedColumns.total).toMatchObject({
      side: 'right',
      isInnerEdge: true,
    });
    expect(layout.pinnedColumns.goal).toMatchObject({
      side: 'right',
      isInnerEdge: false,
    });
  });

  it('fixes pinned column widths and sizes the table to its columns', () => {
    const layout = layoutFor([
      { id: 'name', label: 'Name', width: '10rem', pinned: 'left' },
      { id: 'scrolls', label: 'Scrolls', width: '20rem' },
    ]);

    expect(layout.pinnedColumns.name.style).toMatchObject({
      width: '10rem',
      minWidth: '10rem',
      maxWidth: '10rem',
    });
    expect(layout.tableStyle).toEqual({
      width: 'calc(10rem + 20rem)',
      minWidth: '100%',
    });
  });

  it('treats a column without a width as zero wide', () => {
    const layout = layoutFor([
      { id: 'name', label: 'Name', pinned: 'left' },
      { id: 'id', label: 'ID', width: '4rem', pinned: 'left' },
    ]);

    expect(layout.pinnedColumns.name.style.width).toBe('0px');
    expect(layout.pinnedColumns.id.style.left).toBe('0px');
  });
});
