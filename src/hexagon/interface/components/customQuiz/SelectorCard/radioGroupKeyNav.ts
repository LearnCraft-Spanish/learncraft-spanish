import type { KeyboardEvent } from 'react';

const ARROW_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

/**
 * Arrow-key navigation for a `role="radiogroup"` built from `SelectorCard`
 * buttons. The WAI-ARIA radiogroup pattern expects arrow keys to move
 * selection between options; wire this onto the group container's
 * `onKeyDown` so screen reader users get that behavior alongside Tab+Enter.
 */
export function handleRadioGroupKeyDown(
  event: KeyboardEvent<HTMLElement>,
): void {
  if (!ARROW_KEYS.includes(event.key)) {
    return;
  }
  const radios = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>(
      '[role="radio"]',
    ),
  );
  const currentIndex = radios.indexOf(
    document.activeElement as HTMLButtonElement,
  );
  if (currentIndex === -1) {
    return;
  }
  event.preventDefault();
  const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
  const nextIndex = (currentIndex + direction + radios.length) % radios.length;
  const next = radios[nextIndex];
  next.focus();
  next.click();
}
