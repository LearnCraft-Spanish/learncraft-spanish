import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { generatedMockData } from 'mocks/data/serverlike/studentRecords/studentRecordsMockData';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import WeeksTable from './WeeksTable';

/*
 * Missing Tests:
 *
 *  - Pagination (next page & previous page buttons, need >50 records)
 */
describe('component WeeksTable', () => {
  it('renders without crashing', async () => {
    render(
      <MockAllProviders>
        <WeeksTable weeks={[generatedMockData.weeks[0]]} />
      </MockAllProviders>,
    );
    await waitFor(() => {
      //any colomn header of the table
      expect(screen.getByText('Student')).toBeInTheDocument();
    });
  });
  describe('assignment cell', () => {
    it('renders with assignments', async () => {
      const weekWithAssignment = generatedMockData.weeks.find(
        (week) => week.assignmentRatings.length > 0,
      );
      if (!weekWithAssignment) {
        throw new Error('No week with assignments found');
      }
      render(
        <MockAllProviders>
          <WeeksTable weeks={[weekWithAssignment]} />
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
      const weekWithGroupSession = generatedMockData.weeks.find(
        (week) => week.numberOfGroupCalls > 0,
      );
      const groupSession = generatedMockData.groupSessions.find(
        (groupSession) =>
          generatedMockData.groupAttendees.find(
            (attendee) => attendee.groupSession === groupSession.recordId,
          ),
      );
      if (!weekWithGroupSession) {
        throw new Error('No week with group sessions found');
      }
      if (!groupSession) {
        throw new Error('No group session found');
      }
      render(
        <MockAllProviders>
          <WeeksTable weeks={[weekWithGroupSession]} />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText(groupSession.sessionType)).toBeInTheDocument();
      });
    });
  });
  describe('private call cell', () => {
    it('renders with private calls', async () => {
      const weekWithPrivateCall = generatedMockData.weeks.find(
        (week) => week.privateCallsCompleted > 0,
      );
      const privateCall = generatedMockData.calls.find(
        (call) => call.relatedWeek === weekWithPrivateCall?.recordId,
      );
      if (!weekWithPrivateCall) {
        throw new Error('No week with private calls found');
      }
      if (!privateCall) {
        throw new Error('No private call found');
      }
      render(
        <MockAllProviders>
          <WeeksTable weeks={[weekWithPrivateCall]} />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText(privateCall.rating)).toBeInTheDocument();
      });
    });
  });
  describe('hold week cell', () => {
    it('renders with hold week', async () => {
      const weekWithHoldWeek = generatedMockData.weeks.find(
        (week) => week.holdWeek,
      );
      if (!weekWithHoldWeek) {
        throw new Error('No week with hold week found');
      }
      render(
        <MockAllProviders>
          <WeeksTable weeks={[weekWithHoldWeek]} />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByAltText('Checkmark')).toBeInTheDocument();
      });
    });
  });
  describe('records complete cell', () => {
    it('renders with records complete', async () => {
      const weekWithRecordsComplete = generatedMockData.weeks.find(
        (week) => week.recordsComplete,
      );
      if (!weekWithRecordsComplete) {
        throw new Error('No week with records complete found');
      }
      render(
        <MockAllProviders>
          <WeeksTable weeks={[weekWithRecordsComplete]} />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByAltText('Checkmark')).toBeInTheDocument();
      });
    });
  });
});
