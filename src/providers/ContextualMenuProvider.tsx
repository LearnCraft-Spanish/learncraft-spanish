import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ContextualMenuContextType } from '../context/ContextualMenuContext';
import ContextualMenuContext from '../context/ContextualMenuContext';

export const ContextualMenuProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [contextual, setContextual] = useState<string>('');
  const currentContextual = useRef<HTMLDivElement | null>(null);

  const openContextual = useCallback((menu: string) => {
    setContextual(menu);
  }, []);

  const closeContextual = useCallback(() => {
    setContextual('');
    currentContextual.current = null;
  }, []);

  const setContextualRef = useCallback((element: HTMLDivElement | null) => {
    currentContextual.current = element;
  }, []);

  const value: ContextualMenuContextType = useMemo(
    () => ({
      contextual,
      openContextual,
      closeContextual,
      setContextualRef,
    }),
    [contextual, openContextual, setContextualRef, closeContextual],
  );

  // Click-outside detection
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        currentContextual.current &&
        !currentContextual.current.contains(event.target as Node)
      ) {
        closeContextual();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeContextual]);

  return (
    <ContextualMenuContext.Provider value={value}>
      {children}
    </ContextualMenuContext.Provider>
  );
};
