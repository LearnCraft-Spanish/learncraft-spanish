import type { JSX } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import styles from './LoggedOut.module.scss';

interface LoggedOutProps {
  onLogIn: () => void;
}

/**
 * Full-screen v2 replacement for the legacy "You must be logged in to use
 * this app." sub-header line. `App` swaps this in for `AppRoutes` once
 * auth has settled and there's no session — every route needs one anyway,
 * so there's nothing else useful to show underneath the new header.
 */
export function LoggedOut({ onLogIn }: LoggedOutProps): JSX.Element {
  return (
    <PageShell>
      <div className={styles.column}>
        <Icon name="user" size="xl" tone="muted" />
        <h1 className={styles.title}>Please log in to use this app</h1>
        <p className={styles.guidance}>
          Sign in to reach your flashcards, quizzes, and lessons.
        </p>
        <button type="button" className={styles.logInButton} onClick={onLogIn}>
          Log in
        </button>
      </div>
    </PageShell>
  );
}
