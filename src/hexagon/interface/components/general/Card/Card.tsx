import type { JSX, ReactNode } from 'react';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import styles from './Card.module.scss';

interface CardProps {
  children: ReactNode;
  /** Adds the hover lift. Only for cards that are themselves clickable. */
  interactive?: boolean;
  /**
   * Clip descendants to the card radius. Gallery cards stay clipped.
   * Pass `false` when a child overlay must paint outside the card.
   */
  clip?: boolean;
}

export function Card({
  children,
  interactive = false,
  clip = true,
}: CardProps): JSX.Element {
  const className = [
    styles.card,
    interactive ? styles.interactive : undefined,
    clip ? undefined : styles.unclipped,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={className}>{children}</div>;
}

interface CardSectionProps {
  children: ReactNode;
  /** Draws a hairline above the section, separating it from the one before. */
  divided?: boolean;
}

export function CardSection({
  children,
  divided = false,
}: CardSectionProps): JSX.Element {
  const className = [styles.section, divided ? styles.divided : undefined]
    .filter(Boolean)
    .join(' ');

  return <div className={className}>{children}</div>;
}

interface CardSectionHeaderProps {
  eyebrow: string;
  /** Trailing control, e.g. a "Clear 3 tags" ghost button. */
  action?: ReactNode;
}

export function CardSectionHeader({
  eyebrow,
  action,
}: CardSectionHeaderProps): JSX.Element {
  return (
    <div className={styles.sectionHeader}>
      <Eyebrow as="h2">{eyebrow}</Eyebrow>
      {action}
    </div>
  );
}

interface CardFooterStripProps {
  children: ReactNode;
}

/** Parchment inset at the foot of a card. Holds secondary options. */
export function CardFooterStrip({
  children,
}: CardFooterStripProps): JSX.Element {
  return <div className={styles.footerStrip}>{children}</div>;
}
