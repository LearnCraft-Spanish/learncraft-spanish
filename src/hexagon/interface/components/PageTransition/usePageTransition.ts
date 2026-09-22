import type { AnimationEvent } from 'react';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { useMediaQuery } from '@interface/hooks/useMediaQuery';
import { isStackBack } from '@interface/navigation/studentMobileStack';
import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

export type SlideDirection = 'forward' | 'back';

export interface PageTransitionGhost {
  html: string;
  direction: SlideDirection;
}

export interface UsePageTransitionResult {
  pathname: string;
  enabled: boolean;
  ghost: PageTransitionGhost | null;
  handleCaptured: (html: string, fromPath: string, toPath: string) => void;
  handleAnimationEnd: (event: AnimationEvent<HTMLDivElement>) => void;
}

/**
 * Visual-only route-slide state. Lives in the interface layer per
 * `interface/DECISIONS.md`.
 */
export function usePageTransition(): UsePageTransitionResult {
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );
  const { version } = useStudentUiVersion();
  const enabled = isMobile && version === 'v2' && !prefersReducedMotion;

  const [ghost, setGhost] = useState<PageTransitionGhost | null>(null);

  const handleCaptured = useCallback(
    (html: string, fromPath: string, toPath: string): void => {
      if (html.length === 0) {
        return;
      }
      setGhost({
        html,
        direction: isStackBack(fromPath, toPath) ? 'back' : 'forward',
      });
    },
    [],
  );

  const handleAnimationEnd = useCallback(
    (event: AnimationEvent<HTMLDivElement>): void => {
      if (event.target !== event.currentTarget) {
        return;
      }
      setGhost(null);
    },
    [],
  );

  return {
    pathname: location.pathname,
    enabled,
    ghost,
    handleCaptured,
    handleAnimationEnd,
  };
}
