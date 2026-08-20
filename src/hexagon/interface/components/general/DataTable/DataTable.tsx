import type { CSSProperties, JSX, ReactNode } from 'react';
import { Fragment } from 'react';
import styles from './DataTable.module.scss';

export interface DataTableColumn {
  id: string;
  header: ReactNode;
  /** Right-align counts and other numerics. */
  align?: 'start' | 'end';
  /**
   * Named area this column takes below 768px, matching `mobileLayout`. When a
   * mobile layout is given, a column without an area is hidden on mobile.
   */
  mobileArea?: string;
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

export interface DataTableMobileLayout {
  /** `grid-template-columns` below 768px. */
  columnTemplate: string;
  /**
   * `grid-template-areas` below 768px. Repeat an area name down the rows to
   * span it, e.g. `'"select spanish chevron" "select english chevron"'`
   * stacks two columns while the outer two stay full height.
   */
  templateAreas: string;
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
  /** Reflow below 768px. Without it the desktop grid is kept at every width. */
  mobileLayout?: DataTableMobileLayout;
}

/**
 * CSS Grid rather than a `table`, so a row can hold controls and an expanding
 * detail panel without colspan gymnastics. The caller owns the column widths
 * at both widths — the grid is passed in as custom properties so the mobile
 * reflow can live in a media query, which inline styles cannot express.
 */
export function DataTable({
  columns,
  rows,
  columnTemplate,
  caption,
  emptyState,
  mobileLayout,
}: DataTableProps): JSX.Element {
  const gridStyle = {
    '--dt-columns': columnTemplate,
    ...(mobileLayout !== undefined && {
      '--dt-mobile-columns': mobileLayout.columnTemplate,
      '--dt-mobile-areas': mobileLayout.templateAreas,
    }),
  } as CSSProperties;

  const cellClassName = (
    column: DataTableColumn | undefined,
    base: string,
  ): string =>
    [
      base,
      column?.align === 'end' ? styles.alignEnd : undefined,
      mobileLayout === undefined
        ? undefined
        : column?.mobileArea === undefined
          ? styles.hiddenOnMobile
          : styles.placed,
    ]
      .filter(Boolean)
      .join(' ');

  const cellStyle = (
    column: DataTableColumn | undefined,
  ): CSSProperties | undefined =>
    column?.mobileArea === undefined
      ? undefined
      : ({ '--dt-mobile-area': column.mobileArea } as CSSProperties);

  return (
    <div className={styles.root} role="table" aria-label={caption}>
      <div role="rowgroup">
        <div className={styles.headerRow} role="row" style={gridStyle}>
          {columns.map((column) => (
            <div
              className={cellClassName(column, styles.headerCell)}
              role="columnheader"
              key={column.id}
              style={cellStyle(column)}
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
                  className={cellClassName(columns[index], styles.cell)}
                  role="cell"
                  key={columns[index]?.id ?? index}
                  style={cellStyle(columns[index])}
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
