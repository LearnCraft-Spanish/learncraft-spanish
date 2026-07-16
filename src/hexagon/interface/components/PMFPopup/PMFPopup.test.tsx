import {
  mockUsePMFData,
  overrideMockUsePMFData,
  resetMockUsePMFData,
} from '@application/useCases/usePMFData.mock';
import PMFPopup from '@interface/components/PMFPopup/PMFPopup';
import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/usePMFData', () => ({
  usePMFData: mockUsePMFData,
}));

describe('component PMFPopup', () => {
  beforeEach(() => {
    resetMockUsePMFData();
    overrideMockUsePMFData({
      canShowPMF: true,
    });
  });

  describe('when timeToShowPopup is false', () => {
    it('does not render', () => {
      render(<PMFPopup timeToShowPopup={false} />);
      expect(
        screen.queryByText('Enjoying our software?'),
      ).not.toBeInTheDocument();
    });
  });

  describe('when canShowPMF is false', () => {
    it('does not render even if timeToShowPopup is true', () => {
      overrideMockUsePMFData({
        canShowPMF: false,
      });
      render(<PMFPopup timeToShowPopup />);
      expect(
        screen.queryByText('Enjoying our software?'),
      ).not.toBeInTheDocument();
    });
  });

  describe('when timeToShowPopup is true and canShowPMF is true', () => {
    it('renders the popup', () => {
      render(<PMFPopup timeToShowPopup />);
      expect(screen.getByText('Enjoying our software?')).toBeInTheDocument();
    });

    it('closes the popup and records survey declined when Close is clicked', async () => {
      const { createOrUpdatePMFData } = mockUsePMFData();
      render(<PMFPopup timeToShowPopup />);

      act(() => {
        screen.getByText('Close').click();
      });

      await waitFor(() => {
        expect(
          screen.queryByText('Enjoying our software?'),
        ).not.toBeInTheDocument();
      });
      expect(createOrUpdatePMFData).toHaveBeenCalledWith({
        hasTakenSurvey: false,
      });
    });

    it('closes the popup, records survey taken, and opens Typeform when Go is clicked', async () => {
      const { createOrUpdatePMFData } = mockUsePMFData();
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      render(<PMFPopup timeToShowPopup />);

      act(() => {
        screen.getByText('Go').click();
      });

      await waitFor(() => {
        expect(
          screen.queryByText('Enjoying our software?'),
        ).not.toBeInTheDocument();
      });
      expect(createOrUpdatePMFData).toHaveBeenCalledWith({
        hasTakenSurvey: true,
      });
      expect(openSpy).toHaveBeenCalledWith(
        'https://learncraft.typeform.com/to/kaI5Wwlx',
        '_blank',
      );
    });
  });
});
