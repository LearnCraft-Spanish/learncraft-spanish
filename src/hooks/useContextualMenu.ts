import { useContext } from 'react';
import { ContextualMenuContext } from '../providers/ContextualMenuProvider';

export const useContextualMenu = () => {
  const context = useContext(ContextualMenuContext);
  if (!context) {
    throw new Error(
      'useContextualMenu must be used within a ContextualMenuProvider',
    );
  }
  return context;
};
