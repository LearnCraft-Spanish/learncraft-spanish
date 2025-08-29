import type { BannerDisplayContextType } from '@application/coordinators/contexts/BannerDisplayContext';
import BannerDisplayContext from '@application/coordinators/contexts/BannerDisplayContext';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function BannerDisplayProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();

  // Track the initial route that the user loaded on
  const initialRouteRef = useRef<string | null>(null);

  // Show banner only on initial app load - once closed, it stays closed for the session
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const closeBanner = useCallback(() => {
    setIsBannerVisible(false);
  }, []);

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
