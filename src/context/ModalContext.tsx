import { createContext } from 'react';

interface ModalContentProps {
  title: string;
  body: string;
  type: 'error' | 'confirm' | 'info';
  confirmFunction?: () => void;
  cancelFunction?: () => void;
}
// Define the type for the context without optional or undefined properties
interface ModalContextType {
  modalProps: ModalContentProps | null;
  isOpen: boolean;
  openModal: (props: ModalContentProps) => void;
  closeModal: () => void;
}

// Create the context with a default value of `null`
const ModalContext = createContext<ModalContextType | null>(null);

export type { ModalContextType, ModalContentProps };
export default ModalContext;
