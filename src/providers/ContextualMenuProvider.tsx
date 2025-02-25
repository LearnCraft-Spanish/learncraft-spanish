import type { ContextualMenuContextType } from '../context/ContextualMenuContext';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ContextualMenuContext from '../context/ContextualMenuContext';

export const ContextualMenuProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [contextual, setContextual] = useState<string>('');
  const currentContextual = useRef<HTMLDivElement | null>(null);

  const [disableClickOutside, setDisableClickOutside] = useState(false);

  const updateDisableClickOutside = useCallback((value: boolean) => {
    setDisableClickOutside(value);
  }, []);

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
      disableClickOutside,
      updateDisableClickOutside,
    }),
    [
      contextual,
      openContextual,
      setContextualRef,
      closeContextual,
      disableClickOutside,
      updateDisableClickOutside,
    ],
  );

  // Click-outside detection
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (disableClickOutside) {
        return;
      }
      if (
        currentContextual.current &&
        !currentContextual.current.contains(event.target as Node)
      ) {
        closeContextual();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeContextual, disableClickOutside]);

  return (
    <ContextualMenuContext value={value}>{children}</ContextualMenuContext>
  );
};
