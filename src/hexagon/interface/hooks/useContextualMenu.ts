import type { ContextualMenuContextType } from '@composition/context/ContextualMenuContext';
import ContextualMenuContext from '@composition/context/ContextualMenuContext';
import { use } from 'react';

export const useContextualMenu = (): ContextualMenuContextType => {
  const context = use(ContextualMenuContext);
  if (!context) {
    throw new Error(
      'useContextualMenu must be used within a ContextualMenuProvider',
    );
  }
  return context;
};
