import type { JSX } from 'react';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { useEffect } from 'react';
import styles from './NoticeBar.module.scss';

const AUTO_DISMISS_MS = 6000;

interface NoticeBarProps {
  message: string;
  onDismiss: () => void;
  /** Optional recovery action, e.g. "Undo". */
  actionLabel?: string;
  onAction?: () => void;
  /** Set to 0 to keep the notice until it is dismissed by hand. */
  autoDismissMs?: number;
}

/**
 * Confirmation bar. Only one notice shows at a time — render the newest and
 * let it replace the last rather than stacking them.
 */
export function NoticeBar({
  message,
  onDismiss,
  actionLabel,
  onAction,
  autoDismissMs = AUTO_DISMISS_MS,
}: NoticeBarProps): JSX.Element {
  useEffect(() => {
    if (autoDismissMs <= 0) {
      return;
    }

    const timer = setTimeout(onDismiss, autoDismissMs);

    return () => {
      clearTimeout(timer);
    };
  }, [message, autoDismissMs, onDismiss]);

  return (
    <div className={styles.root} role="status">
      <span className={styles.message}>{message}</span>
      <span className={styles.actions}>
        {actionLabel !== undefined && onAction !== undefined && (
          <Button
            variant="ghost"
            size="inline"
            tone="onDark"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
        <Button variant="ghost" size="inline" tone="onDark" onClick={onDismiss}>
          Dismiss
        </Button>
      </span>
    </div>
  );
}
