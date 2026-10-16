import type { JSX } from 'react';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import iconBlue from 'src/assets/Icon_Blue.svg';
import styles from './LoggedOut.module.scss';

interface LoggedOutProps {
  onLogIn: () => void;
}

/**
 * Centered sign-in prompt. `App` shows this under the v2 header, which
 * carries only the brand until a session exists, so this button is the one
 * way to log in.
 */
export function LoggedOut({ onLogIn }: LoggedOutProps): JSX.Element {
  return (
    <PageShell flushHorizontal>
      <div className={styles.column}>
        <img
          className={styles.logo}
          src={iconBlue}
          width={96}
          height={96}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
        <h1 className={styles.title}>Please log in to access the LCS App</h1>
        <p className={styles.guidance}>Sign in to access your materials</p>
        <button type="button" className={styles.logInButton} onClick={onLogIn}>
          Log in
        </button>
      </div>
    </PageShell>
  );
}
