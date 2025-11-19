import Modal from '@interface/components/Modal/Modal';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const mockProps = {
  title: 'Test Title',
  body: 'Test Body',
  type: 'error' as 'error' | 'confirm' | 'notice',
  closeModal: vi.fn(),
  confirmFunction: vi.fn(),
  cancelFunction: vi.fn(),
};

describe('component Modal', () => {
  it('should render with title, body', () => {
    render(<Modal {...mockProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Body')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();

    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
    expect(screen.queryByText('Accept')).not.toBeInTheDocument();
    expect(
      screen.queryByText('unknown modal type, please go back'),
    ).not.toBeInTheDocument();
  });

  describe('buttons', () => {
    it('should render with confirm and cancel buttons', () => {
      render(<Modal {...mockProps} type="confirm" />);
      expect(screen.getByText('Confirm')).toBeInTheDocument();
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });
    it('should render with accept button', () => {
      render(<Modal {...mockProps} type="notice" />);
      expect(screen.getByText('Accept')).toBeInTheDocument();
    });
    it('should render with unknown modal type', () => {
      render(
        <Modal
          {...mockProps}
          type={'unknown' as 'error' | 'confirm' | 'notice'}
        />,
      );
      expect(
        screen.getByText('unknown modal type, please go back'),
      ).toBeInTheDocument();
    });

    it('should call confirmFunction when confirm button is clicked', () => {
      render(<Modal {...mockProps} type="confirm" />);
      act(() => {
        fireEvent.click(screen.getByText('Confirm'));
      });
      expect(mockProps.confirmFunction).toHaveBeenCalled();
    });
    it('should call cancelFunction when Go Back button is clicked', () => {
      render(<Modal {...mockProps} type="confirm" />);
      act(() => {
        fireEvent.click(screen.getByText('Go Back'));
      });
      expect(mockProps.cancelFunction).toHaveBeenCalled();
    });
  });
});
