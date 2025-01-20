import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import MockQueryClientProvider from 'mocks/Providers/MockQueryClient';
import PMFPopup from './PMFPopup';

vi.mock('src/hooks/usePMFData', () => ({
  usePMFData: vi.fn(() => ({
    canShowPMF: true,
    createOrUpdatePMFData: vi.fn(),
  })),
}));
describe('component PMFPopup', () => {
  describe('when timeToShowPopup is false', () => {
    it('does not render when timeToShowPopup is false', () => {
      render(<PMFPopup timeToShowPopup={false} />, {
        wrapper: MockQueryClientProvider,
      });
      expect(screen.queryByText('Enjoying our software?')).toBeFalsy();
    });
  });
  describe('when timeToShowPopup is true', () => {
    it('renders when timeToShowPopup is true', () => {
      render(<PMFPopup timeToShowPopup />, {
        wrapper: MockQueryClientProvider,
      });
      expect(screen.getByText('Enjoying our software?')).toBeTruthy();
    });
    it('closes the popup when the close button is clicked', async () => {
      render(<PMFPopup timeToShowPopup />, {
        wrapper: MockQueryClientProvider,
      });
      act(() => {
        screen.getByText('Close').click();
      });
      await waitFor(() => {
        expect(screen.queryByText('Enjoying our software?')).toBeFalsy();
      });
    });
    it('closes the popup when the go button is clicked', async () => {
      // const jsdomOpen = window.open;
      window.open = vi.fn();
      render(<PMFPopup timeToShowPopup />, {
        wrapper: MockQueryClientProvider,
      });
      act(() => {
        screen.getByText('Go').click();
      });
      await waitFor(() => {
        expect(screen.queryByText('Enjoying our software?')).toBeFalsy();
      });
      expect(window.open).toHaveBeenCalledOnce();
      // window.alert = jsdomOpen;
    });
  });
});
