import { render, screen, waitFor } from '@testing-library/react';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockQueryClientProvider from 'mocks/Providers/MockQueryClient';
import { act } from 'react';
import { overrideMockAuthAdapter } from 'src/hexagon/application/adapters/authAdapter.mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PMFPopup from './PMFPopup';

vi.mock('src/hooks/UserData/usePMFData', () => ({
  usePMFData: vi.fn(() => ({
    canShowPMF: true,
    createOrUpdatePMFData: vi.fn(),
  })),
}));
describe('component PMFPopup', () => {
  beforeEach(() => {
    overrideMockAuthAdapter({
      authUser: getAuthUserFromEmail('student-ser-estar@fake.not')!,
      isAuthenticated: true,
      isAdmin: false,
      isCoach: false,
      isStudent: true,
      isLimited: false,
    });
  });
  describe('when timeToShowPopup is false', () => {
    it('does not render when timeToShowPopup is false', () => {
      render(<PMFPopup timeToShowPopup={false} />, {
        wrapper: MockQueryClientProvider,
      });
      expect(screen.queryByText('Enjoying our software?')).toBeFalsy();
    });
  });
  describe('when timeToShowPopup is true', () => {
    it('renders when timeToShowPopup is true', async () => {
      render(<PMFPopup timeToShowPopup />, {
        wrapper: MockQueryClientProvider,
      });
      await waitFor(() => {
        expect(screen.getByText('Enjoying our software?')).toBeTruthy();
      });
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
