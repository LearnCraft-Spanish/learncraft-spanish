import type { JSX, ReactNode } from 'react';
import { useAppHeader } from '@application/units/AppHeader';
import { AccountMenu } from '@interface/components/AppHeader/AccountMenu';
import { BrandMark } from '@interface/components/general/BrandMark/BrandMark';
import { Icon } from '@interface/components/general/Icon/Icon';
import { Link } from 'react-router-dom';
import styles from './AppHeader.module.scss';

interface AppHeaderProps {
  /** Centered nav content on desktop; hidden below 768px. Optional — most pages pass nothing. */
  children?: ReactNode;
}

/**
 * The Celestial Blue app bar mounted once in `App.tsx`, above every route.
 * v2.2: the right slot is the account only — no lesson number, no card
 * count, no due count. Those belong on the page, on cards.
 */
export function AppHeader({ children }: AppHeaderProps): JSX.Element {
  const {
    isAuthenticated,
    isLoading,
    studentName,
    studentEmail,
    login,
    logout,
  } = useAppHeader();

  return (
    <header className={styles.root}>
      <Link to="/" className={styles.brand}>
        <BrandMark size={22} color="var(--lcs-color-on-action)" />
        <span className={styles.wordmark}>LEARNCRAFT</span>
      </Link>

      {Boolean(children) && <nav className={styles.nav}>{children}</nav>}

      <div className={styles.account}>
        {!isLoading &&
          (isAuthenticated ? (
            <AccountMenu
              studentName={studentName}
              studentEmail={studentEmail}
              onLogOut={logout}
            />
          ) : (
            <button type="button" className={styles.logIn} onClick={login}>
              <span className={styles.logInIcon}>
                <Icon name="user" size="sm" tone="onAction" />
              </span>
              Log in
            </button>
          ))}
      </div>
    </header>
  );
}
