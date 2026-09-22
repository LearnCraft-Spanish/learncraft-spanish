import type { JSX, ReactNode } from 'react';
import styles from './Eyebrow.module.scss';

type EyebrowTone = 'label' | 'muted' | 'onDark';
type EyebrowWeight = 'regular' | 'medium';
type EyebrowLeading = 'tight' | 'body';

interface EyebrowProps {
  children: ReactNode;
  tone?: EyebrowTone;
  /** Render as a heading when the eyebrow titles a section. */
  as?: 'span' | 'h2' | 'h3';
  /** Defaults to medium (500), the UiGallery / primitive default. */
  weight?: EyebrowWeight;
  /** Defaults to tight (1.3). Body is 1.6, an 11px line box of ~17.6px. */
  leading?: EyebrowLeading;
}

/** Small uppercase section label. Green Smoke by default. */
export function Eyebrow({
  children,
  tone = 'label',
  as: Tag = 'span',
  weight = 'medium',
  leading = 'tight',
}: EyebrowProps): JSX.Element {
  const className = [
    styles.root,
    tone === 'label' ? undefined : styles[tone],
    weight === 'regular' ? styles.regular : undefined,
    leading === 'body' ? styles.leadingBody : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return <Tag className={className}>{children}</Tag>;
}
