import { useCallback, useEffect, useRef } from 'react';
export function TextAreaCell({
  cellValue,
  cellRef,
  commonProps,
  handleChange,
}: {
  cellValue: string;
  cellRef: (el: HTMLTextAreaElement | null) => void;
  commonProps: React.HTMLAttributes<HTMLTextAreaElement>;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const resizeTextarea = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    resizeTextarea(textAreaRef.current);
  }, [cellValue, resizeTextarea]);

  const handleChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);
    resizeTextarea(e.target);
  };

  return (
    <textarea
      ref={(el) => {
        textAreaRef.current = el;
        cellRef(el);
        resizeTextarea(el);
      }}
      value={cellValue}
      onChange={handleChangeTextArea}
      {...commonProps}
    />
  );
}
