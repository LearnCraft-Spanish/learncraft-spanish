import type { BannerDisplayContextType } from '@application/coordinators/contexts/BannerDisplayContext';
import { CookieAdapter } from '@application/adapters/cookieAdapter';
import BannerDisplayContext from '@application/coordinators/contexts/BannerDisplayContext';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Banner-specific constants and logic
const COACHING_BANNER_COOKIE_NAME = 'coachingBannerSeen';

/**
 * Calculates the expiration date for the coaching banner cookie
 * Sets expiration to midnight on the day after next (2 days from now)
 * Example: If seen on Tuesday 8am, expires Wednesday midnight (visible again Thursday)
 */
function getCoachingBannerCookieExpiration(): Date {
  const now = new Date();
  const expireDate = new Date();

  // Add 2 days to current date
  expireDate.setDate(now.getDate() + 2);

  // Set time to midnight (00:00:00.000)
  expireDate.setHours(0, 0, 0, 0);

  return expireDate;
}

export function BannerDisplayProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const cookieAdapter = CookieAdapter();

  // Track the initial route that the user loaded on
  const initialRouteRef = useRef<string | null>(null);

  // Check if banner should be visible based on cookie
  const [isBannerVisible, setIsBannerVisible] = useState(() => {
    // Initially check if cookie exists - if it does, hide banner
    const cookieExists = cookieAdapter.getCookie(COACHING_BANNER_COOKIE_NAME);
    return !cookieExists;
  });

  const closeBanner = useCallback(() => {
    const expirationDate = getCoachingBannerCookieExpiration();
    cookieAdapter.setCookie(
      COACHING_BANNER_COOKIE_NAME,
      'true',
      expirationDate,
    );
    setIsBannerVisible(false);
  }, [cookieAdapter]);

  // Set initial route on first render
  useEffect(() => {
    if (initialRouteRef.current === null) {
      initialRouteRef.current = location.pathname;
    }
  }, [location.pathname]);

  // Close banner if user navigates away from initial route
  useEffect(() => {
    if (
      initialRouteRef.current !== null &&
      location.pathname !== initialRouteRef.current
    ) {
      closeBanner();
    }
  }, [location.pathname, closeBanner]);

  const returnValue: BannerDisplayContextType = useMemo(
    () => ({
      isBannerVisible,
      closeBanner,
    }),
    [isBannerVisible, closeBanner],
  );

  return (
    <BannerDisplayContext value={returnValue}>{children}</BannerDisplayContext>
  );
}
