import { beforeAll, describe, it, vi, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import GroupSessionsCell from './GroupSessionsCell';
import mockData from 'mocks/data/serverlike/studentRecords/studentRecordsMockData';
import { act } from 'react';

const week = mockData.lastThreeWeeks[0];
// const relatedGroupSession = mockData.groupSessions.find((groupSession) => {
//   return groupSession.related === week.relatedGroupSession;
// });

// Same flow useCoaching helper function uses to get related group session(s) to week
const attendeeList = mockData.groupAttendees.filter(
  (attendee) => attendee.student === week.recordId,
);
const groupSessionList = mockData.groupSessions.filter((groupSession) =>
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
        <GroupSessionsCell week={week} />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(
        screen.getByText(relatedGroupSession.sessionType),
      ).toBeInTheDocument();
    });
  });
  it('errors with invalid data', async () => {
    const consoleSpy = vi.spyOn(console, 'error');
    render(
      <MockAllProviders>
        <GroupSessionsCell week={{ ...week, recordId: 0 }} />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(consoleSpy).toBeCalled();
    });

    vi.restoreAllMocks();
  });
  describe('contextual menu view', () => {
    // Helper function for successful render
    async function renderWithPopupActive() {
      render(
        <MockAllProviders>
          <GroupSessionsCell week={week} />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText(relatedGroupSession.sessionType))
          .toBeInTheDocument;
      });
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
        expect(screen.getByText('Session Documents:')).toBeInTheDocument();
      });
    });
  });
});
