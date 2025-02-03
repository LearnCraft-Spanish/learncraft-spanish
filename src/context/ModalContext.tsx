import { createContext } from 'react';

interface ModalContentProps {
  title: string;
  body: string;
  type: 'error' | 'confirm';
  confirmFunction?: () => void;
  cancelFunction?: () => void;
}
interface ModalContextType {
  modalProps: ModalContentProps | null;
  isOpen: boolean;
  openModal: (props: ModalContentProps) => void;
  closeModal: () => void;
}
const ModalContext = createContext<ModalContextType | null>(null);

export type { ModalContextType, ModalContentProps };
export default ModalContext;
