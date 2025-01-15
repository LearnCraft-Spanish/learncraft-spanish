import { describe, it, vi, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';

import mockDataHardCoded from '../../../../../mocks/data/serverlike/studentRecords/studentRecordsMockData';
import MockAllProviders from '../../../../../mocks/Providers/MockAllProviders';
import WeeksTable from './WeeksTable';

describe('component WeeksTable', () => {
  // Write better tests, delete skipped ones
  it.skip('renders without crashing', async () => {
    render(
      <MockAllProviders>
        <WeeksTable weeks={mockDataHardCoded.lastThreeWeeks} />
      </MockAllProviders>,
    );
    await waitFor(() => {
      //any colomn header of the table
      expect(screen.getByText('Student')).toBeInTheDocument();
    });
  });
});
