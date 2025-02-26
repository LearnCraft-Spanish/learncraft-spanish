import type { ModalContextType } from '../context/ModalContext';
import { useContext } from 'react';
import ModalContext from '../context/ModalContext';

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
