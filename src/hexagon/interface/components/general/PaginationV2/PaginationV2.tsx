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
  /**
   * `fade` (default) drops unavailable prev/next to 35% opacity. `parchment`
   * paints them as a non-interactive parchment fill with a steel glyph.
   */
  unavailableTreatment?: 'fade' | 'parchment';
}

function EndButton({
  icon,
  label,
  disabled,
  parchment,
  onClick,
}: {
  icon: 'chevronLeft' | 'chevronRight';
  label: string;
  disabled: boolean;
  parchment: boolean;
  onClick: () => void;
}): JSX.Element {
  const button = (
    <IconButton
      icon={icon}
      label={label}
      variant="outlined"
      tone={parchment && disabled ? 'steel' : 'muted'}
      disabled={disabled}
      onClick={onClick}
    />
  );

  if (!parchment || !disabled) {
    return button;
  }

  return <span className={styles.parchmentEnd}>{button}</span>;
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
  unavailableTreatment = 'fade',
}: PaginationV2Props): JSX.Element {
  const parchment = unavailableTreatment === 'parchment';

  return (
    <nav className={styles.root} aria-label="Pagination">
      <div className={styles.pages}>
        <EndButton
          icon="chevronLeft"
          label="Previous page"
          disabled={page <= 1}
          parchment={parchment}
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
        <EndButton
          icon="chevronRight"
          label="Next page"
          disabled={page >= pageCount}
          parchment={parchment}
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
