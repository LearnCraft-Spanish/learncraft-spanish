import type { JSX } from 'react';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './SetupHeader.module.scss';

export interface SetupHeaderProps {
  backLabel: string;
  onBack: () => void;
  eyebrow: string;
  title: string;
  /** Rendered after the title in regular weight, e.g. "(optional)". */
  titleSuffix?: string;
  caption?: string;
  /** Omit on desktop, where there are no steps. */
  progress?: { total: number; complete: number };
}

export function SetupHeader({
  backLabel,
  onBack,
  eyebrow,
  title,
  titleSuffix,
  caption,
  progress,
}: SetupHeaderProps): JSX.Element {
  return (
    <div className={styles.root}>
      <button type="button" className={styles.back} onClick={onBack}>
        <Icon name="arrowLeft" />
        {backLabel}
      </button>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className={styles.title}>
        {title}
        {titleSuffix !== undefined && (
          <span className={styles.optional}> {titleSuffix}</span>
        )}
      </h1>
      {caption !== undefined && <p className={styles.caption}>{caption}</p>}
      {progress !== undefined && (
        <div className={styles.progress}>
          {Array.from({ length: progress.total }, (_, index) => (
            <span
              key={index}
              className={
                index < progress.complete
                  ? `${styles.segment} ${styles.segmentOn}`
                  : styles.segment
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
