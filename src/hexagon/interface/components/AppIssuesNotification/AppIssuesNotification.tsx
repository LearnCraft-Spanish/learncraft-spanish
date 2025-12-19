import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useState } from 'react';
import closeIcon from 'src/assets/icons/x.svg';
import './AppIssuesNotification.scss';

export default function AppIssuesNotification() {
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const { isAuthenticated, isLoading, isStudent, isLimited, isCoach, isAdmin } =
    useAuthAdapter();
  const closeBanner = () => {
    setIsBannerVisible(false);
  };

  // if not student, limited, or coach, or admin, don't show banner
  if (!isStudent && !isLimited && !isCoach && !isAdmin) {
    return null;
  }
  // Only show banner if user is authenticated and banner hasn't been closed
  if (!isAuthenticated || isLoading) {
    return null;
  }
  if (!isBannerVisible) {
    return null;
  }

  return (
    <div className="appIssuesNotification">
      <button
        type="button"
        className="appIssuesNotification__closeButton"
        onClick={closeBanner}
        aria-label="Close banner"
      >
        <img src={closeIcon} alt="Close" />
      </button>
      <div className="content">
        <div className="text">
          <h2>App Outage</h2>

          <p>
            We are currently experiencing issues with the app. Features such as
            "Find Flashcards", "Custom Quiz", and "Flashcard Filtering" may not
            work correctly. We are working to fix the issues as soon as
            possible.
          </p>
        </div>
      </div>
    </div>
  );
}
