import { describe, it, vi, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';

import mockDataHardCoded from 'mocks/data/serverlike/studentRecords/studentRecordsMockData';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import WeeksTable from './WeeksTable';

/*
notes for minimum mock data needed for testing this component:
- week with no assignments,calls, or group sessions
- 1 week with assignments
- 1 week with calls
- 1 week with group sessions
- holdWeek? (1 with true, 1 with false)
- recordsComplete? (1 with true, 1 with false)
- 1 test with no weeks passed in
- 1 test with 1 week passed in
- 1 test with many weeks passed in
- 
*/
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
