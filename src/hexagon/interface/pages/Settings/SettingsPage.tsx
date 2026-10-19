import type { PasswordResetStatus } from '@application/useCases/useSettings';
import type { JSX } from 'react';
import { useSettings } from '@application/useCases/useSettings';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { Card, CardSection } from '@interface/components/general/Card/Card';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { Loading } from '@interface/components/Loading';
import styles from './SettingsPage.module.scss';

function resetPasswordLabel(
  status: PasswordResetStatus,
  cooldownSeconds: number,
): string {
  if (status === 'sending') {
    return 'Sending...';
  }
  if (cooldownSeconds > 0) {
    return `Try again in ${cooldownSeconds}s`;
  }
  return 'Reset password';
}

/**
 * Signed-in account settings for every role on the v2 chrome. Name and email
 * are read from the account; they are not fields. Reset password asks Auth0
 * to email a link. Log out lives here, not in the header menu.
 */
export function SettingsPage(): JSX.Element {
  const {
    fullName,
    email,
    isLoading,
    passwordResetStatus,
    passwordResetCooldownSeconds,
    requestPasswordReset,
    logout,
  } = useSettings();

  if (isLoading) {
    return (
      <PageShell>
        <Loading message="Loading settings..." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className={styles.column}>
        <h1 className={styles.title}>Settings</h1>
        <Card>
          <CardSection>
            <dl className={styles.rows}>
              <div className={styles.row}>
                <dt>Full name</dt>
                <dd>{fullName ?? 'Not available'}</dd>
              </div>
              <div className={styles.row}>
                <dt>Email</dt>
                <dd>{email ?? 'Not available'}</dd>
              </div>
            </dl>
          </CardSection>
          <CardSection divided>
            <div className={styles.reset}>
              <Button
                variant="ghost"
                size="inline"
                disabled={
                  passwordResetStatus === 'sending' ||
                  passwordResetCooldownSeconds > 0 ||
                  email === null
                }
                onClick={requestPasswordReset}
              >
                {resetPasswordLabel(
                  passwordResetStatus,
                  passwordResetCooldownSeconds,
                )}
              </Button>
              <p className={styles.hint}>
                {"We'll email you a link to choose a new password."}
              </p>
            </div>
          </CardSection>
          <CardSection divided>
            <Button variant="secondary" leadingIcon="logout" onClick={logout}>
              Log out
            </Button>
          </CardSection>
        </Card>
      </div>
    </PageShell>
  );
}

export default SettingsPage;
