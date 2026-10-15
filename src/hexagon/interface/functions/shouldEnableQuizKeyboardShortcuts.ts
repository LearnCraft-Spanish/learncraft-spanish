export interface QuizKeyboardCapability {
  userAgent: string;
  /** `navigator.platform`. iPadOS 13+ reports `MacIntel`. */
  platform: string;
  maxTouchPoints: number;
  /** Primary pointing device is a mouse or trackpad (`(pointer: fine)`). */
  finePointer: boolean;
  /** Primary pointing device can hover (`(hover: hover)`). */
  canHover: boolean;
}

/**
 * Text and audio quizzes take keyboard shortcuts only for a desktop pointer.
 * iPad stays off even when iPadOS reports a Macintosh user agent, a
 * desktop-width viewport, and a fine pointer (Magic Keyboard or trackpad).
 * A touchscreen laptop keeps shortcuts when its primary pointer is still a
 * mouse. Viewport width is not an input — iPad landscape is wider than 768px.
 */
export function shouldEnableQuizKeyboardShortcuts(
  capability: QuizKeyboardCapability,
): boolean {
  if (isIpad(capability)) {
    return false;
  }
  return capability.finePointer && capability.canHover;
}

function isIpad(capability: QuizKeyboardCapability): boolean {
  if (/iPad/i.test(capability.userAgent)) {
    return true;
  }
  // iPadOS 13+ Safari and Chrome send a desktop Mac user agent. A real Mac
  // reports no touch points; an iPad reports several.
  const reportsAsMac =
    capability.platform === 'MacIntel' ||
    /Macintosh/i.test(capability.userAgent);
  return reportsAsMac && capability.maxTouchPoints > 1;
}
