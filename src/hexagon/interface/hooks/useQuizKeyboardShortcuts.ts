import { shouldEnableQuizKeyboardShortcuts } from '@interface/functions/shouldEnableQuizKeyboardShortcuts';
import { useMediaQuery } from '@interface/hooks/useMediaQuery';

/**
 * Whether an in-progress text or audio quiz should honor keyboard shortcuts
 * and show the shortcut legend. False on iPad and on other touch-primary
 * devices. Visual input policy only — see `interface/DECISIONS.md`.
 */
export function useQuizKeyboardShortcuts(): boolean {
  const finePointer = useMediaQuery('(pointer: fine)');
  const canHover = useMediaQuery('(hover: hover)');

  return shouldEnableQuizKeyboardShortcuts({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    finePointer,
    canHover,
  });
}
