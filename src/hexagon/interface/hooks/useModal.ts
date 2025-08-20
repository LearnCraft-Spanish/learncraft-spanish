import type { ModalContextType } from '../../composition/context/ModalContext';
import { use } from 'react';
import ModalContext from '../../composition/context/ModalContext';

export const useModal = (): ModalContextType => {
  const context = use(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
