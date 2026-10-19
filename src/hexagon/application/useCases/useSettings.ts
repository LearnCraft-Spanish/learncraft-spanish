import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useMyData } from '@application/queries/useMyData';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

export type PasswordResetStatus = 'idle' | 'sending' | 'sent' | 'error';

/**
 * Auth0 sustains one `POST /dbconnections/change_password` per minute for an
 * email address. A burst is allowed, but each extra email replaces the previous
 * link, so the button sends once and then waits the full minute. This is a
 * cooldown, not a debounce: the first click sends immediately.
 */
const PASSWORD_RESET_COOLDOWN_MS = 60_000;

export interface UseSettingsResult {
  /** The signed-in user's own name, never the student a coach is viewing. */
  fullName: string | null;
  /** The signed-in user's own email, never the student a coach is viewing. */
  email: string | null;
  isLoading: boolean;
  passwordResetStatus: PasswordResetStatus;
  /** Whole seconds until another reset email can be requested. `0` when ready. */
  passwordResetCooldownSeconds: number;
  /**
   * Emails a password-reset link to `email`. No-ops when there is no email,
   * while a request is in flight, or during the one-minute cooldown.
   */
  requestPasswordReset: () => void;
  logout: () => void;
}

function presentText(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Account settings for whoever is signed in. Name comes from their own
 * record; email and logout come from auth. Password reset asks the auth
 * provider to email a link — this screen never collects a new password.
 */
export function useSettings(): UseSettingsResult {
  const { myData, isLoading } = useMyData();
  const {
    authUser,
    logout,
    requestPasswordReset: sendPasswordResetEmail,
  } = useAuthAdapter();
  const [passwordResetStatus, setPasswordResetStatus] =
    useState<PasswordResetStatus>('idle');
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [cooldownNow, setCooldownNow] = useState(() => Date.now());
  const sendingRef = useRef(false);
  const cooldownUntilRef = useRef<number | null>(null);

  const email = presentText(authUser?.email);
  const fullName = presentText(myData?.name);

  useEffect(() => {
    if (cooldownUntil === null) {
      return undefined;
    }

    const tick = (): void => {
      const until = cooldownUntilRef.current;
      const current = Date.now();
      if (until === null || current >= until) {
        cooldownUntilRef.current = null;
        setCooldownUntil(null);
        return;
      }
      setCooldownNow(current);
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [cooldownUntil]);

  const passwordResetCooldownSeconds =
    cooldownUntil === null
      ? 0
      : Math.max(0, Math.ceil((cooldownUntil - cooldownNow) / 1000));

  const requestPasswordReset = useCallback((): void => {
    const coolingDown =
      cooldownUntilRef.current !== null &&
      Date.now() < cooldownUntilRef.current;
    if (email === null || sendingRef.current || coolingDown) {
      return;
    }

    sendingRef.current = true;
    setPasswordResetStatus('sending');
    void sendPasswordResetEmail(email)
      .then(() => {
        const until = Date.now() + PASSWORD_RESET_COOLDOWN_MS;
        sendingRef.current = false;
        cooldownUntilRef.current = until;
        setCooldownUntil(until);
        setCooldownNow(Date.now());
        setPasswordResetStatus('sent');
        toast.success('Your password reset email is on its way.');
      })
      .catch(() => {
        sendingRef.current = false;
        setPasswordResetStatus('error');
        toast.error("We couldn't send the reset email. Please try again.");
      });
  }, [email, sendPasswordResetEmail]);

  return {
    fullName,
    email,
    isLoading,
    passwordResetStatus,
    passwordResetCooldownSeconds,
    requestPasswordReset,
    logout,
  };
}
