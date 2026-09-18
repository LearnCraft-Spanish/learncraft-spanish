import type { JSX } from 'react';
import { BrandMark } from '@interface/components/general/BrandMark/BrandMark';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import styles from './LoggedOut.module.scss';

interface LoggedOutProps {
  onLogIn: () => void;
}

/**
 * Full-screen sign-in prompt shown when auth has settled and there is no
 * session. `App` renders this with no header, nav, or sub header.
 */
export function LoggedOut({ onLogIn }: LoggedOutProps): JSX.Element {
  return (
    <PageShell>
      <div className={styles.column}>
        <BrandMark size={96} color="var(--lcs-color-action)" />
        <h1 className={styles.title}>Please log in to access the LCS App</h1>
        <p className={styles.guidance}>Sign in to access your materials</p>
        <button type="button" className={styles.logInButton} onClick={onLogIn}>
          Log in
        </button>
      </div>
    </PageShell>
  );
}
