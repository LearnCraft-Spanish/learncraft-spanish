import { render, screen, waitFor } from '@testing-library/react';
import { generatedMockData } from 'mocks/data/serverlike/studentRecords/studentRecordsMockData';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { act } from 'react';
import { DateRangeProvider } from 'src/components/Coaching/WeeksRecords/DateRangeProvider';
import { describe, expect, it } from 'vitest';
import GroupSessionsCell from './GroupSessionsCell';

const week = generatedMockData.weeks.find(
  (week) => week.groupCallComments.length > 0,
)!;
// const relatedGroupSession = mockData.groupSessions.find((groupSession) => {
//   return groupSession.related === week.relatedGroupSession;
// });

// Same flow useCoaching helper function uses to get related group session(s) to week
const attendeeList = generatedMockData.groupAttendees.filter(
  (attendee) => attendee.student === week.recordId,
);
const groupSessionList = generatedMockData.groupSessions.filter(
  (groupSession) =>
    attendeeList.find(
      (attendee) => attendee.groupSession === groupSession.recordId,
    ),
);
if (groupSessionList.length === 0) {
  throw new Error('No group session related to week record');
}
const relatedGroupSession = groupSessionList[0];
if (!(relatedGroupSession.callDocument || relatedGroupSession.zoomLink)) {
  throw new Error('mock Group Session is missing required fields');
}

describe('component StudentCell', () => {
  it('renders with valid data', async () => {
    render(
      <MockAllProviders>
        <DateRangeProvider>
          <GroupSessionsCell
            week={week}
            groupSessions={[relatedGroupSession]}
            tableEditMode={false}
          />
        </DateRangeProvider>
      </MockAllProviders>,
    );

    // Wait for the component to render (component only renders when groupSessionsQuery.isSuccess)
    // Use a more flexible matcher and longer timeout to handle query loading
    await waitFor(
      () => {
        expect(
          screen.getByText(relatedGroupSession.sessionType),
        ).toBeInTheDocument();
      },
      { timeout: 10000, interval: 100 },
    );
  });
  describe('contextual menu view', () => {
    // Helper function for successful render
    async function renderWithPopupActive() {
      render(
        <MockAllProviders>
          <DateRangeProvider>
            <GroupSessionsCell
              week={week}
              groupSessions={[relatedGroupSession]}
              tableEditMode={false}
            />
          </DateRangeProvider>
        </MockAllProviders>,
      );

      // Wait for the component to render (component only renders when groupSessionsQuery.isSuccess)
      await waitFor(
        () => {
          expect(
            screen.getByText(relatedGroupSession.sessionType),
          ).toBeInTheDocument();
        },
        { timeout: 10000, interval: 100 },
      );
      act(() => {
        screen.getByText(relatedGroupSession.sessionType).click();
      });
      await waitFor(() => {
        expect(
          screen.getByText('Session:', { exact: false }),
        ).toBeInTheDocument();
      });
    }

    it('contextual menu view renders without crashing', async () => {
      await renderWithPopupActive();
      await waitFor(() => {
        expect(screen.getByText('Attendees:')).toBeInTheDocument();
      });
    });

    it('contextual menu view renders the correct data', async () => {
      await renderWithPopupActive();
      const requiredFields = [
        'Session:',
        'Coach:',
        'Topic:',
        'Comments:',
        'Attendees:',
      ];
      await waitFor(() => {
        requiredFields.forEach((field) => {
          expect(screen.getByText(field, { exact: false })).toBeInTheDocument();
        });
      });
    });

    it('contextual menu view renders the session documents if they exist on the Group Session', async () => {
      await renderWithPopupActive();
      await waitFor(() => {
        expect(screen.getByText('Zoom Link:')).toBeInTheDocument();
        expect(screen.getByText('Call Document:')).toBeInTheDocument();
      });
    });
  });
});
