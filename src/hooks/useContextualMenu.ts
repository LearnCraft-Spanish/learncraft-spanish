import type { ContextualMenuContextType } from '../context/ContextualMenuContext';
import { useContext } from 'react';
import ContextualMenuContext from '../context/ContextualMenuContext';

export const useContextualMenu = (): ContextualMenuContextType => {
  const context = useContext(ContextualMenuContext);
  if (!context) {
    throw new Error(
      'useContextualMenu must be used within a ContextualMenuProvider',
    );
  }
  return context;
};
