import type { JSX } from 'react';
import { BrandMark } from '@interface/components/general/BrandMark/BrandMark';
import styles from './LoggedOut.module.scss';

interface LoggedOutProps {
  onLogIn: () => void;
}

/**
 * Centered sign-in prompt. `App` shows this under the legacy v1 nav and
 * sub header until a session exists; v2 chrome only replaces that chrome
 * after myData confirms a beta-tester student.
 */
export function LoggedOut({ onLogIn }: LoggedOutProps): JSX.Element {
  return (
    <div className={styles.column}>
      <BrandMark size={96} color="var(--lcs-color-action)" />
      <h1 className={styles.title}>Please log in to access the LCS App</h1>
      <p className={styles.guidance}>Sign in to access your materials</p>
      <button type="button" className={styles.logInButton} onClick={onLogIn}>
        Log in
      </button>
    </div>
  );
}
