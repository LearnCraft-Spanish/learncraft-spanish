import { describe, it, vi, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';

import MockAllProviders from '../../../../../mocks/Providers/MockAllProviders';
import PrivateCallsCell from './PrivateCallsCell';

import mockData from '../../../../../mocks/data/serverlike/studentRecords/studentRecordsMockData';
describe('component StudentCell', () => {
  it('renders without crashing', async () => {
    render(
      <MockAllProviders>
        <PrivateCallsCell week={mockData.lastThreeWeeks[0]} />
      </MockAllProviders>,
    );
    await waitFor(() => {
      // call.rating of a call related to the week record
      expect(screen.getByText(mockData.calls[0].rating)).toBeInTheDocument();
    });
  });
});
