import { render, screen, waitFor } from '@testing-library/react';
import { generatedMockData } from 'mocks/data/serverlike/studentRecords/studentRecordsMockData';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { describe, expect, it } from 'vitest';

import getDateRange from '../../general/functions/dateRange';
import getWeekEnds from '../../general/functions/getWeekEnds';
import { DateRangeProvider } from '../DateRangeProvider';
import WeeksTable from './WeeksTable';

// Get the default date range
const dateRange = getDateRange();
const defaultStartDate =
  Number.parseInt(dateRange.dayOfWeekString) >= 3
    ? dateRange.thisWeekDate
    : dateRange.lastSundayDate;

// Find weeks that fall within the default date range
const weeksInRange = generatedMockData.weeks.filter((w) => {
  const weekDate = new Date(w.weekStarts);

  return (
    weekDate >= new Date(defaultStartDate) &&
    weekDate <= new Date(getWeekEnds(defaultStartDate))
  );
});

if (weeksInRange.length === 0) {
  throw new Error(
    'No weeks found within the default date range. Please update the mock data.',
  );
}

/*
 * Missing Tests:
 *
 *  - Pagination (next page & previous page buttons, need >50 records)
 */
describe('component WeeksTable', () => {
  it('renders without crashing', async () => {
    render(
      <MockAllProviders>
        <DateRangeProvider>
          <WeeksTable weeks={[weeksInRange[0]]} />
        </DateRangeProvider>
      </MockAllProviders>,
    );
    await waitFor(() => {
      //any colomn header of the table
      expect(screen.getByText('Student')).toBeInTheDocument();
    });
  });
  describe('assignment cell', () => {
    it('renders with assignments', async () => {
      const weekWithAssignment = weeksInRange.find(
        (week) => week.assignmentRatings.length > 0,
      );
      if (!weekWithAssignment) {
        throw new Error('No week with assignments found within the date range');
      }
      render(
        <MockAllProviders>
          <DateRangeProvider>
            <WeeksTable weeks={[weekWithAssignment]} />
          </DateRangeProvider>
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(
          screen.getByText(weekWithAssignment.assignmentRatings[0], {
            exact: false,
          }),
        ).toBeInTheDocument();
      });
    });
  });
  describe('group session cell', () => {
    it('renders with group sessions', async () => {
      const weekWithGroupSession = weeksInRange.find(
        (week) => week.numberOfGroupCalls > 0,
      );
      const groupSession = generatedMockData.groupSessions.find(
        (groupSession) =>
          generatedMockData.groupAttendees.find(
            (attendee) =>
              attendee.groupSession === groupSession.recordId &&
              attendee.student === weekWithGroupSession?.recordId,
          ),
      );
      if (!weekWithGroupSession) {
        throw new Error(
          'No week with group sessions found within the date range',
        );
      }
      if (!groupSession) {
        throw new Error('No group session found');
      }
      render(
        <MockAllProviders>
          <DateRangeProvider>
            <WeeksTable weeks={[weekWithGroupSession]} />
          </DateRangeProvider>
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText(groupSession.sessionType)).toBeInTheDocument();
      });
    });
  });

  // this is more of a concern for WeeksTableItem

  // describe('private call cell', () => {
  //   it('renders with private calls', async () => {
  //     const dateRange = getDateRange();
  //     const defaultStartDate =
  //       Number.parseInt(dateRange.dayOfWeekString) >= 3
  //         ? dateRange.thisWeekDate
  //         : dateRange.lastSundayDate;

  //     // Find weeks that fall within the default date range
  //     const weeksInRange = generatedMockData.weeks.filter((w) => {
  //       const weekDate = new Date(w.weekStarts);

  //       return (
  //         weekDate >= new Date(defaultStartDate) &&
  //         weekDate <= new Date(getWeekEnds(defaultStartDate))
  //       );
  //     });

  //     const weekWithPrivateCall = weeksInRange.find(
  //       (week) => week.privateCallsCompleted > 0,
  //     );
  //     console.log(weekWithPrivateCall);

  //     const privateCall = generatedMockData.calls.find(
  //       (call) => call.relatedWeek === weekWithPrivateCall?.recordId,
  //     );
  //     console.log(privateCall);

  //     if (!weekWithPrivateCall) {
  //       throw new Error(
  //         'No week with private calls found within the date range',
  //       );
  //     }
  //     if (!privateCall) {
  //       throw new Error('No private call found');
  //     }
  //     render(
  //       <MockAllProviders>
  //         <DateRangeProvider>
  //           <WeeksTable weeks={[weekWithPrivateCall]} />
  //         </DateRangeProvider>
  //       </MockAllProviders>,
  //     );

  //     await waitFor(() => {
  //       expect(screen.getByText(privateCall.rating)).toBeInTheDocument();
  //     });
  //   });
  // });
  describe('hold week cell', () => {
    it('renders with hold week', async () => {
      const weekWithHoldWeek = weeksInRange.find((week) => week.holdWeek);
      if (!weekWithHoldWeek) {
        throw new Error('No week with hold week found within the date range');
      }
      render(
        <MockAllProviders>
          <DateRangeProvider>
            <WeeksTable weeks={[weekWithHoldWeek]} />
          </DateRangeProvider>
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByAltText('Checkmark')).toBeInTheDocument();
      });
    });
  });
  describe('records complete cell', () => {
    it('renders with records complete', async () => {
      const weekWithRecordsComplete = weeksInRange.find(
        (week) => week.recordsComplete,
      );
      if (!weekWithRecordsComplete) {
        throw new Error(
          'No week with records complete found within the date range',
        );
      }
      render(
        <MockAllProviders>
          <DateRangeProvider>
            <WeeksTable weeks={[weekWithRecordsComplete]} />
          </DateRangeProvider>
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByAltText('Checkmark')).toBeInTheDocument();
      });
    });
  });
});
