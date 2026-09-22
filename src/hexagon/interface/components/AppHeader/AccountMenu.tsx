import type { JSX } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import { Popover } from '@interface/components/general/Popover/Popover';
import { useState } from 'react';
import styles from './AccountMenu.module.scss';

interface AccountMenuProps {
  studentName: string | undefined;
  studentEmail: string | undefined;
  onLogOut: () => void;
}

function initialsOf(name: string | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  return (parts[0]![0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

/**
 * The signed-in account trigger + dropdown in `AppHeader`. Desktop shows the
 * initials pill, first name, and a chevron; the 44×44 mobile trigger drops
 * the name so it stays a fixed-size tap target.
 */
export function AccountMenu({
  studentName,
  studentEmail,
  onLogOut,
}: AccountMenuProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const firstName = studentName?.split(/\s+/)[0];

  return (
    <Popover
      open={open}
      onDismiss={() => setOpen(false)}
      align="end"
      trigger={
        <button
          type="button"
          className={styles.trigger}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Account"
          onClick={() => setOpen((value) => !value)}
        >
          <span className={styles.initials} aria-hidden="true">
            {initialsOf(studentName)}
          </span>
          {firstName !== undefined && (
            <span className={styles.name} aria-hidden="true">
              {firstName}
            </span>
          )}
          <span className={styles.chevron}>
            <Icon name="chevronDown" size="sm" tone="onAction" />
          </span>
        </button>
      }
    >
      <div role="menu" aria-label="Account" className={styles.panel}>
        <div className={styles.identity}>
          <div className={styles.identityName}>{studentName}</div>
          {studentEmail !== undefined && (
            <div className={styles.identityEmail}>{studentEmail}</div>
          )}
        </div>
        <button
          type="button"
          role="menuitem"
          className={styles.logOut}
          onClick={() => {
            setOpen(false);
            onLogOut();
          }}
        >
          <Icon name="logout" size="sm" />
          Log out
        </button>
      </div>
    </Popover>
  );
}
