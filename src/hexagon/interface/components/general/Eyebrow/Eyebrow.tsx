import type { JSX, ReactNode } from 'react';
import styles from './Eyebrow.module.scss';

type EyebrowTone = 'label' | 'muted' | 'onDark';

interface EyebrowProps {
  children: ReactNode;
  tone?: EyebrowTone;
  /** Render as a heading when the eyebrow titles a section. */
  as?: 'span' | 'h2' | 'h3';
}

/** Small uppercase section label. Green Smoke by default. */
export function Eyebrow({
  children,
  tone = 'label',
  as: Tag = 'span',
}: EyebrowProps): JSX.Element {
  const className = [styles.root, tone === 'label' ? undefined : styles[tone]]
    .filter(Boolean)
    .join(' ');

  return <Tag className={className}>{children}</Tag>;
}
