import type { JSX, ReactNode } from 'react';
import { AccountMenu } from '@interface/components/AppHeader/AccountMenu';
import { useAppHeaderView } from '@interface/components/AppHeader/useAppHeaderView';
import { BrandMark } from '@interface/components/general/BrandMark/BrandMark';
import { IconButton } from '@interface/components/general/IconButton/IconButton';
import { Link } from 'react-router-dom';
import styles from './AppHeader.module.scss';

interface AppHeaderProps {
  /** Centered nav content on desktop; hidden below 768px. Optional — most pages pass nothing. */
  children?: ReactNode;
}

/**
 * The Celestial Blue app bar. `App` mounts this only for v2 (beta-tester
 * student) sessions. v2.2: the right slot is the account only — no lesson
 * number, no card count, no due count. Those belong on the page, on cards.
 *
 * On mobile student-v2 stack screens (every student surface except Home)
 * the brand and account swap for a back arrow and the page title.
 */
export function AppHeader({ children }: AppHeaderProps): JSX.Element {
  const {
    isAuthenticated,
    isLoading,
    studentName,
    studentEmail,
    logout,
    stack,
  } = useAppHeaderView();

  const isStack = stack !== null;

  return (
    <header
      className={isStack ? `${styles.root} ${styles.stackMode}` : styles.root}
    >
      <Link
        to="/"
        className={styles.brand}
        tabIndex={isStack ? -1 : undefined}
        aria-hidden={isStack}
      >
        <BrandMark size={22} color="var(--lcs-color-on-action)" />
        <span className={styles.wordmark}>LEARNCRAFT</span>
      </Link>

      {Boolean(children) && <nav className={styles.nav}>{children}</nav>}

      <div className={styles.account} aria-hidden={isStack}>
        {!isLoading && isAuthenticated && !isStack && (
          <AccountMenu
            studentName={studentName}
            studentEmail={studentEmail}
            onLogOut={logout}
          />
        )}
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
