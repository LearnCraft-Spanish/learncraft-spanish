import type { JSX } from 'react';
import { IconButton } from '@interface/components/general/IconButton/IconButton';
import styles from './PaginationV2.module.scss';

/** Pages either side of the current one that are always shown. */
const WINDOW = 1;

interface PaginationV2Props {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Plain-language position, e.g. "1–25 of 342". */
  rangeLabel?: string;
}

/**
 * The v2 page control. Built beside the legacy `Pagination`, which has too
 * many consumers to restyle.
 */
export function PaginationV2({
  page,
  pageCount,
  onPageChange,
  rangeLabel,
}: PaginationV2Props): JSX.Element {
  return (
    <nav className={styles.root} aria-label="Pagination">
      <div className={styles.pages}>
        <IconButton
          icon="chevronLeft"
          label="Previous page"
          variant="outlined"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        />
        {buildPages(page, pageCount).map((entry, index) =>
          entry === null ? (
            <span
              className={styles.gap}
              key={`gap-${index}`}
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              type="button"
              className={[
                styles.page,
                entry === page ? styles.current : undefined,
              ]
                .filter(Boolean)
                .join(' ')}
              key={entry}
              aria-label={`Page ${entry}`}
              aria-current={entry === page ? 'page' : undefined}
              onClick={() => onPageChange(entry)}
            >
              {entry}
            </button>
          ),
        )}
        <IconButton
          icon="chevronRight"
          label="Next page"
          variant="outlined"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        />
      </div>
      {rangeLabel !== undefined && (
        <span className={styles.range}>{rangeLabel}</span>
      )}
    </nav>
  );
}

/** Page numbers to render, with `null` standing in for an elided run. */
function buildPages(page: number, pageCount: number): (number | null)[] {
  const shown = new Set<number>([1, pageCount]);

  for (let offset = -WINDOW; offset <= WINDOW; offset += 1) {
    const candidate = page + offset;
    if (candidate >= 1 && candidate <= pageCount) {
      shown.add(candidate);
    }
  }

  const ordered = Array.from(shown).sort((a, b) => a - b);

  return ordered.flatMap((value, index) =>
    index > 0 && value - ordered[index - 1] > 1 ? [null, value] : [value],
  );
}
