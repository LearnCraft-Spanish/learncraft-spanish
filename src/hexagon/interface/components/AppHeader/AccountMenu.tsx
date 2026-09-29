import type { UsingAsIdentity } from '@application/useCases/AppHeader';
import type { IconName } from '@interface/components/general/Icon/Icon';
import type { JSX } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import { Popover } from '@interface/components/general/Popover/Popover';
import { useState } from 'react';
import styles from './AccountMenu.module.scss';

interface AccountMenuProps {
  studentName: string | undefined;
  studentEmail: string | undefined;
  onLogOut: () => void;
  /** The student a coach/admin is using the app as. */
  usingAs?: UsingAsIdentity | null;
  /** Coach/admin in their own view: "Use as student" above Log out. */
  onUseAsStudent?: () => void;
  /** Coach/admin using the app as a student: "Change student". */
  onChangeStudent?: () => void;
  /**
   * Coach/admin using the app as a student: replaces Log out, so leaving
   * the student view never signs them out by accident.
   */
  stopUsingAsStudent?: { label: string; caption: string; onSelect: () => void };
}

interface MenuAction {
  label: string;
  caption?: string;
  icon: IconName;
  onSelect: () => void;
}

function initialsOf(
  name: string | undefined,
  email: string | undefined,
): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return (email?.[0] ?? '').toUpperCase();
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
  usingAs = null,
  onUseAsStudent,
  onChangeStudent,
  stopUsingAsStudent,
}: AccountMenuProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const firstName = studentName?.split(/\s+/)[0] || undefined;

  const actions: MenuAction[] = [];
  if (onUseAsStudent !== undefined) {
    actions.push({
      label: 'Use as student',
      icon: 'user',
      onSelect: onUseAsStudent,
    });
  }
  if (onChangeStudent !== undefined) {
    actions.push({
      label: 'Change student',
      icon: 'user',
      onSelect: onChangeStudent,
    });
  }
  actions.push(
    stopUsingAsStudent !== undefined
      ? {
          label: stopUsingAsStudent.label,
          caption: stopUsingAsStudent.caption,
          icon: 'arrowLeft',
          onSelect: stopUsingAsStudent.onSelect,
        }
      : { label: 'Log out', icon: 'logout', onSelect: onLogOut },
  );

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
            {initialsOf(studentName, studentEmail)}
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
          {studentName && (
            <div className={styles.identityName}>{studentName}</div>
          )}
          {studentEmail !== undefined && (
            <div className={styles.identityEmail}>{studentEmail}</div>
          )}
        </div>
        {usingAs !== null && (
          <div className={styles.usingAs}>
            <div className={styles.usingAsLabel}>Using as</div>
            <div className={styles.identityName}>
              {usingAs.name || usingAs.email}
            </div>
            <div className={styles.identityEmail}>{usingAs.email}</div>
          </div>
        )}
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            role="menuitem"
            className={styles.menuItem}
            onClick={() => {
              setOpen(false);
              action.onSelect();
            }}
          >
            <Icon name={action.icon} size="sm" />
            {action.caption === undefined ? (
              action.label
            ) : (
              <span className={styles.menuItemText}>
                {action.label}
                <span className={styles.menuItemCaption}>{action.caption}</span>
              </span>
            )}
          </button>
        ))}
      </div>
    </Popover>
  );
}
