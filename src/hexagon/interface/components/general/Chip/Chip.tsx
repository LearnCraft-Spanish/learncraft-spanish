import type { IconName } from '@interface/components/general/Icon/Icon';
import type { JSX } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './Chip.module.scss';

type ChipTone = 'label' | 'action' | 'warning';

interface ChipProps {
  label: string;
  tone?: ChipTone;
  /** Leading glyph, e.g. the audio marker on a flashcard chip. */
  icon?: IconName;
  /**
   * Makes the chip a toggle. Ignored when `onRemove` is set, since a remove
   * control cannot be nested inside another button.
   */
  onSelect?: () => void;
  selected?: boolean;
  /** Adds a trailing remove control, as on an applied filter chip. */
  onRemove?: () => void;
}

export function Chip({
  label,
  tone = 'label',
  icon,
  onSelect,
  selected = false,
  onRemove,
}: ChipProps): JSX.Element {
  const selectable = onSelect !== undefined && onRemove === undefined;

  const className = [
    styles.root,
    tone === 'label' ? undefined : styles[tone],
    selectable ? styles.selectable : undefined,
    selected ? styles.selected : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {icon !== undefined && <Icon name={icon} size="inline" />}
      {label}
    </>
  );

  if (selectable) {
    return (
      <button
        type="button"
        className={className}
        aria-pressed={selected}
        onClick={onSelect}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={className}>
      {content}
      {onRemove !== undefined && (
        <button
          type="button"
          className={styles.remove}
          aria-label={`Remove ${label}`}
          onClick={onRemove}
        >
          <Icon name="x" size="inline" />
        </button>
      )}
    </span>
  );
}
