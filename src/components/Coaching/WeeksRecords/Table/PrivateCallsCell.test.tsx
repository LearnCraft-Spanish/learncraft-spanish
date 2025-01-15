import { describe, it, vi, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';

import MockAllProviders from '../../../../../mocks/Providers/MockAllProviders';
import PrivateCallsCell from './PrivateCallsCell';
import mockData from '../../../../../mocks/data/serverlike/studentRecords/studentRecordsMockData';
import { act } from 'react';

// const week = mockData.calls.find((call) => call.rating > 0);
const week = mockData.lastThreeWeeks[0];
const call = mockData.calls.find((call) => call.relatedWeek === week.recordId);

if (!call) {
  throw new Error('No call with relatedWeek found in mock data');
}
if (call.recording.length < 0) {
  throw new Error('No recording found in mock data');
}

describe('component StudentCell', () => {
  it('default view renders without crashing', async () => {
    render(
      <MockAllProviders>
        <PrivateCallsCell week={week} />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText(call.rating)).toBeInTheDocument();
    });
  });
  describe('contextual menu view', () => {
    it('contextual menu view renders without crashing', async () => {
      render(
        <MockAllProviders>
          <PrivateCallsCell week={week} />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText(call.rating)).toBeInTheDocument();
      });
      // Click on the button that opens the contextual menu
      act(() => {
        screen.getByRole('button').click();
      });
      await waitFor(() => {
        expect(screen.getByText('Rating:')).toBeInTheDocument();
      });
    });

    it('contextual menu view renders the correct data', async () => {
      const requiredFields = ['Rating:', 'Notes:', 'Difficulties:'];
      render(
        <MockAllProviders>
          <PrivateCallsCell week={week} />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText(call.rating)).toBeInTheDocument();
      });
      // Click on the button that opens the contextual menu
      act(() => {
        screen.getByRole('button').click();
      });
      await waitFor(() => {
        requiredFields.forEach((field) => {
          expect(screen.getByText(field)).toBeInTheDocument();
        });
      });
    });

    it('contextual menu view renders the session documents if they exist on the call', async () => {
      render(
        <MockAllProviders>
          <PrivateCallsCell week={week} />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText(call.rating)).toBeInTheDocument();
      });
      // Click on the button that opens the contextual menu
      act(() => {
        screen.getByRole('button').click();
      });
      await waitFor(() => {
        expect(screen.getByText('Session Documents:')).toBeInTheDocument();
      });
    });
  });
});
