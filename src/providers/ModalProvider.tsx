import type {
  ModalContentProps,
  ModalContextType,
} from '../context/ModalContext';

import React, { useCallback, useMemo, useState } from 'react';

import { useContextualMenu } from 'src/hooks/useContextualMenu';
import Modal from '../components/Modal/Modal';
import ModalContext from '../context/ModalContext';

export const ModalProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { updateDisableClickOutside } = useContextualMenu();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modalProps, setModalProps] = useState<ModalContentProps | null>(null);
  const openModal = useCallback(
    (props: ModalContentProps) => {
      if (
        !props ||
        props.title.length === 0 ||
        props.body.length === 0 ||
        !props.type
      ) {
        throw new Error('Modal props must have a title body, & type');
      }
      setModalProps(props);
      setIsOpen(true);
      updateDisableClickOutside(true);
    },
    [updateDisableClickOutside],
  );
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalProps(null);
    updateDisableClickOutside(false);
  }, [updateDisableClickOutside]);

  const value: ModalContextType = useMemo(
    () => ({
      modalProps,
      isOpen,
      openModal,
      closeModal,
    }),
    [isOpen, modalProps, openModal, closeModal],
  );

  return (
    <ModalContext value={value}>
      {children}
      {isOpen && (
        <div className="modal-container">
          {modalProps && <Modal {...modalProps} closeModal={closeModal} />}
        </div>
      )}
    </ModalContext>
  );
};
