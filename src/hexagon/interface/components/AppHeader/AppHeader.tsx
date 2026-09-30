import type { JSX, ReactNode } from 'react';
import { AccountMenu } from '@interface/components/AppHeader/AccountMenu';
import { StudentSelector } from '@interface/components/AppHeader/StudentSelector';
import { useAppHeaderView } from '@interface/components/AppHeader/useAppHeaderView';
import { IconButton } from '@interface/components/general/IconButton/IconButton';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import iconWhite from 'src/assets/Icon_White.svg';
import styles from './AppHeader.module.scss';

interface AppHeaderProps {
  /** Centered nav content on desktop; hidden below 768px. Optional — most pages pass nothing. */
  children?: ReactNode;
}

/**
 * The Celestial Blue app bar. `App` mounts this for v2 sessions: beta-tester
 * students, and every coach/admin. v2.2: the right slot is the account only —
 * no lesson number, no card count, no due count. Those belong on the page,
 * on cards.
 *
 * Coaches/admins not yet using the app as a student get a "Use as student"
 * button in place of the student nav. Once they are, the student nav returns
 * and the account menu reports who they are using the app as.
 *
 * On mobile student-v2 stack screens (every student surface except Home)
 * the brand and account swap for a back arrow and the page title.
 */
export function AppHeader({ children }: AppHeaderProps): JSX.Element {
  const {
    isSignedIn,
    studentName,
    studentEmail,
    isStaff,
    staffRole,
    showUseAsStudent,
    isStaffUsingAsStudent,
    usingAs,
    stopUsingAsStudent,
    logout,
    stack,
  } = useAppHeaderView();
  const navigate = useNavigate();
  /** Which control the student picker hangs from, if it is open. */
  const [selectorAnchor, setSelectorAnchor] = useState<
    'nav' | 'account' | null
  >(null);
  const closeSelector = (): void => setSelectorAnchor(null);

  const isStack = stack !== null;

  const rootClassName = [
    styles.root,
    isStack ? styles.stackMode : undefined,
    showUseAsStudent ? styles.withStaffAction : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  const openFromAccount = (): void => setSelectorAnchor('account');

  const accountMenu = (
    <AccountMenu
      studentName={studentName}
      studentEmail={studentEmail}
      onLogOut={logout}
      usingAs={usingAs}
      onUseAsStudent={showUseAsStudent ? openFromAccount : undefined}
      onChangeStudent={isStaffUsingAsStudent ? openFromAccount : undefined}
      stopUsingAsStudent={
        isStaffUsingAsStudent
          ? {
              label: 'Stop using as student',
              caption: `Back to your ${staffRole ?? 'coach'} view`,
              onSelect: () => {
                stopUsingAsStudent();
                navigate('/');
              },
            }
          : undefined
      }
    />
  );

  return (
    <header className={rootClassName}>
      <Link
        to="/"
        className={styles.brand}
        tabIndex={isStack ? -1 : undefined}
        aria-hidden={isStack}
      >
        <img
          className={styles.logo}
          src={iconWhite}
          width={22}
          height={22}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
        <span className={styles.wordmark}>LEARNCRAFT</span>
      </Link>

      {showUseAsStudent ? (
        <div className={styles.staffAction} aria-hidden={isStack}>
          <StudentSelector
            open={selectorAnchor === 'nav'}
            onClose={closeSelector}
            trigger={
              <button
                type="button"
                className={styles.useAsStudent}
                aria-expanded={selectorAnchor === 'nav'}
                aria-haspopup="dialog"
                onClick={() =>
                  setSelectorAnchor((anchor) =>
                    anchor === 'nav' ? null : 'nav',
                  )
                }
              >
                Use as student
              </button>
            }
          />
        </div>
      ) : (
        Boolean(children) && <nav className={styles.nav}>{children}</nav>
      )}

      <div className={styles.account} aria-hidden={isStack}>
        {isSignedIn &&
          !isStack &&
          (isStaff ? (
            <StudentSelector
              open={selectorAnchor === 'account'}
              onClose={closeSelector}
              align="end"
              trigger={accountMenu}
            />
          ) : (
            accountMenu
          ))}
      </div>

      {stack !== null && (
        <div className={styles.stack}>
          <IconButton
            icon="arrowLeft"
            label="Back"
            onClick={stack.onBack}
            size="sm"
            tone="onDark"
          />
          <h1 className={styles.stackTitle}>{stack.title}</h1>
        </div>
      )}
    </header>
  );
}
