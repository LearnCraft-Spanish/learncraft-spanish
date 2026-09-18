import type { JSX } from 'react';
import iconBlue from 'src/assets/Icon_Blue.svg';
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
  );
}
