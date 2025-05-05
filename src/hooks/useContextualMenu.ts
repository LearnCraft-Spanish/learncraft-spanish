import type { ContextualMenuContextType } from '../context/ContextualMenuContext';
import { use } from 'react';
import ContextualMenuContext from '../context/ContextualMenuContext';

export const useContextualMenu = (): ContextualMenuContextType => {
  const context = use(ContextualMenuContext);
  if (!context) {
    throw new Error(
      'useContextualMenu must be used within a ContextualMenuProvider',
    );
  }
  return context;
};
