import { CookieAdapter } from '@application/adapters/cookieAdapter';
import { useModal } from '@interface/hooks/useModal';
import { useCallback, useEffect } from 'react';
const TEMPORARY_UPDATE_NOTIFICATION_COOKIE_NAME = 'temporaryUpdateNotification';
export function TemporaryUpdateNotification() {
  const cookieAdapter = CookieAdapter();
  const { openModal, closeModal } = useModal();

  const isTemporaryUpdateNotificationVisible = cookieAdapter.getCookie(
    TEMPORARY_UPDATE_NOTIFICATION_COOKIE_NAME,
  );
  // 30 days
  const setTemporaryUpdateNotificationCookie = useCallback(() => {
    if (isTemporaryUpdateNotificationVisible) {
      return null;
    }
    cookieAdapter.setCookie(
      TEMPORARY_UPDATE_NOTIFICATION_COOKIE_NAME,
      'true',
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    ); // 30 days
    closeModal();
  }, []);
  useEffect(() => {
    if (isTemporaryUpdateNotificationVisible) {
      return;
    }
    openModal({
      title: 'SRS Quiz Update',
      body: 'We’ve updated the SRS quiz to better reflect your learning progress. It’s going to start doing a better job of showing you ONLY the flashcards you haven’t reviewed recently (even if you didn’t review them via the SRS). As you continue to review your flashcard collection, please give the new-and-improved SRS a try and let us know what you think of the changes!',
      type: 'notice',
      confirmFunction: setTemporaryUpdateNotificationCookie,
    });
  }, []);

  if (isTemporaryUpdateNotificationVisible) {
    return null;
  }
  return null;
}
