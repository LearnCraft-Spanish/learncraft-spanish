import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useMyData } from '@application/queries/useMyData';
import { useCallback, useRef, useState } from 'react';

export type PasswordResetStatus = 'idle' | 'sending' | 'sent' | 'error';

export interface UseSettingsResult {
  /** The signed-in user's own name, never the student a coach is viewing. */
  fullName: string | null;
  /** The signed-in user's own email, never the student a coach is viewing. */
  email: string | null;
  isLoading: boolean;
  passwordResetStatus: PasswordResetStatus;
  /** Emails a password-reset link to `email`. No-ops when there is no email. */
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
  const sendingRef = useRef(false);

  const email = presentText(authUser?.email);
  const fullName = presentText(myData?.name);

  const requestPasswordReset = useCallback((): void => {
    if (email === null || sendingRef.current) {
      return;
    }

    sendingRef.current = true;
    setPasswordResetStatus('sending');
    void sendPasswordResetEmail(email)
      .then(() => {
        sendingRef.current = false;
        setPasswordResetStatus('sent');
      })
      .catch(() => {
        sendingRef.current = false;
        setPasswordResetStatus('error');
      });
  }, [email, sendPasswordResetEmail]);

  return {
    fullName,
    email,
    isLoading,
    passwordResetStatus,
    requestPasswordReset,
    logout,
  };
}
