import type { JSX, ReactNode } from 'react';
import { Fragment } from 'react';
import styles from './DataTable.module.scss';

export interface DataTableColumn {
  id: string;
  header: ReactNode;
  /** Right-align counts and other numerics. */
  align?: 'start' | 'end';
}

export interface DataTableRow {
  id: string;
  /** One entry per column, in column order. */
  cells: ReactNode[];
  selected?: boolean;
  expanded?: boolean;
  /** Full-width detail shown beneath the row while it is expanded. */
  expandPanel?: ReactNode;
}

interface DataTableProps {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  /** A `grid-template-columns` value, e.g. `'44px 1fr 1fr 120px'`. */
  columnTemplate: string;
  /** Accessible name for the table. */
  caption: string;
  /** Shown in place of the body when there are no rows. */
  emptyState?: ReactNode;
}

/**
 * CSS Grid rather than a `table`, so a row can hold controls and an expanding
 * detail panel without colspan gymnastics. The caller owns the column widths.
 */
export function DataTable({
  columns,
  rows,
  columnTemplate,
  caption,
  emptyState,
}: DataTableProps): JSX.Element {
  const gridStyle = { gridTemplateColumns: columnTemplate };

  return (
    <div className={styles.root} role="table" aria-label={caption}>
      <div role="rowgroup">
        <div className={styles.headerRow} role="row" style={gridStyle}>
          {columns.map((column) => (
            <div
              className={[
                styles.headerCell,
                column.align === 'end' ? styles.alignEnd : undefined,
              ]
                .filter(Boolean)
                .join(' ')}
              role="columnheader"
              key={column.id}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      <div role="rowgroup">
        {rows.length === 0 && emptyState !== undefined && (
          <div className={styles.empty}>{emptyState}</div>
        )}
        {rows.map((row) => (
          <Fragment key={row.id}>
            <div
              className={[
                styles.row,
                row.selected ? styles.selected : undefined,
              ]
                .filter(Boolean)
                .join(' ')}
              role="row"
              aria-selected={row.selected}
              style={gridStyle}
            >
              {row.cells.map((cell, index) => (
                <div
                  className={[
                    styles.cell,
                    columns[index]?.align === 'end'
                      ? styles.alignEnd
                      : undefined,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  role="cell"
                  key={columns[index]?.id ?? index}
                >
                  {cell}
                </div>
              ))}
            </div>
            {row.expanded === true && row.expandPanel !== undefined && (
              <div className={styles.expandRow} role="row">
                <div role="cell">{row.expandPanel}</div>
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
