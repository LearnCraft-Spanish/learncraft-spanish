import type { JSX } from 'react';
import styles from './BrandMark.module.scss';

interface BrandMarkProps {
  /** Rendered width and height, in pixels. The mark is always square. */
  size: number;
  /** Stroke/fill color. Pass a `--lcs-*` color token, e.g. `var(--lcs-color-on-action)`. */
  color: string;
}

/**
 * The wheel mark: a hub and rim with eight spokes that run past the rim.
 * Purely decorative — always hidden from assistive technology. Used small
 * beside the wordmark in `AppHeader` and large as a clipped watermark
 * behind the arrow in `QuizCTA`.
 */
export function BrandMark({ size, color }: BrandMarkProps): JSX.Element {
  return (
    <svg
      className={styles.root}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke={color} strokeWidth={6} strokeLinecap="round" fill="none">
        <line x1="50" y1="1" x2="50" y2="99" />
        <line x1="1" y1="50" x2="99" y2="50" />
        <line x1="15" y1="15" x2="85" y2="85" />
        <line x1="85" y1="15" x2="15" y2="85" />
        <circle cx="50" cy="50" r="34" />
        <circle cx="50" cy="50" r="7" fill={color} stroke="none" />
      </g>
    </svg>
  );
}
