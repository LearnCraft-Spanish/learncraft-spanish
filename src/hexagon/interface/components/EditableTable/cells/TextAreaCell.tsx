import type { CellRenderProps } from '@interface/components/EditableTable/types';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Textarea cell with auto-resize
 */
export function TextAreaCell({
  value,
  display,
  error,
  onChange,
  onFocus,
  onBlur,
  cellRef,
}: CellRenderProps) {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const resizeTextarea = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    // Reset height to force recalculation, then set to scrollHeight
    // This ensures the textarea both grows and shrinks properly
    el.style.height = '1px';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    resizeTextarea(textAreaRef.current);
  }, [value, resizeTextarea]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    // Resize immediately on change for responsive behavior
    resizeTextarea(e.target);
  };

  return (
    <textarea
      ref={(el) => {
        textAreaRef.current = el;
        cellRef(el);
        resizeTextarea(el);
      }}
      value={value}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label={display.label}
      className={`paste-table__cell${error ? ' paste-table__cell--error' : ''}`}
      placeholder={display.placeholder}
    />
  );
}
