import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

export interface DismissableResult {
  /** Attach to the element that should survive an outside click. */
  containerRef: RefObject<HTMLDivElement | null>;
}

/**
 * Closes a floating surface on Escape or a click outside it. Visual-only, so
 * it is allowed to live in the interface layer per interface/DECISIONS.md.
 */
export function useDismissable(
  open: boolean,
  onDismiss: () => void,
): DismissableResult {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent): void => {
      const container = containerRef.current;
      if (container && !container.contains(event.target as Node)) {
        onDismiss();
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onDismiss();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onDismiss]);

  return { containerRef };
}
