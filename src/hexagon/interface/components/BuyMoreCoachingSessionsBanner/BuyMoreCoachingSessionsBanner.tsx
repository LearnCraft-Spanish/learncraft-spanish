/*
🌟 Make Faster Progress!
Add extra coaching sessions and accelerate your Spanish.
[ Get More Coaching ]
*/

import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useBannerDisplay } from '@application/coordinators/hooks/useBannerDisplay';
import closeIcon from 'src/assets/icons/x.svg';
import './BuyMoreCoachingSessionsBanner.scss';

export default function ExtraCoachingCTA() {
  const { isBannerVisible, closeBanner } = useBannerDisplay();
  const { isAuthenticated, isLoading, isStudent, isCoach, isAdmin } =
    useAuthAdapter();

  // Only show banner if user is a student (and not a coach or admin)
  if (!isStudent || isCoach || isAdmin) {
    return null;
  }
  // Only show banner if user is authenticated and banner hasn't been closed
  if (!isAuthenticated || isLoading || !isBannerVisible) {
    return null;
  }

  return (
    <div className="buyMoreCoachingSessionsBanner">
      <button
        type="button"
        className="buyMoreCoachingSessionsBanner__closeButton"
        onClick={closeBanner}
        aria-label="Close banner"
      >
        <img src={closeIcon} alt="Close" />
      </button>
      <div className="content">
        <div className="text">
          <h2> Make Faster Progress!</h2>

          <p>Add extra coaching sessions and accelerate your Spanish.</p>
        </div>
        <button
          type="button"
          className="buyMoreCoachingSessionsBanner__ctaButton"
          onClick={() => {
            window.open(
              'https://masterofmemory.thrivecart.com/extra-private-session/',
              '_blank',
            );
          }}
        >
          Get More Coaching
        </button>
      </div>
    </div>
  );
}
