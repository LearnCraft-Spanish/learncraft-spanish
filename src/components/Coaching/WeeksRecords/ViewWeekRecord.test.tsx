import { describe, it, vi, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';

import mockDataHardCoded from '../../../../mocks/data/serverlike/studentRecords/studentRecordsMockData';

import MockAllProviders from '../../../../mocks/Providers/MockAllProviders';
import ViewWeekRecord from './ViewWeekRecord';

describe('component ViewWeekRecord', () => {
  // Write better tests, delete skipped ones
  it.skip('renders without crashing', async () => {
    render(
      <MockAllProviders>
        <ViewWeekRecord week={mockDataHardCoded.lastThreeWeeks[0]} />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText('Related Membership:')).toBeInTheDocument();
    });
  });
});
