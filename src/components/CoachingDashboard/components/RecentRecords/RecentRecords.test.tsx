import {
  mockUseRecentRecordsQuery,
  overrideMockUseRecentRecordsQuery,
  resetMockUseRecentRecordsQuery,
} from '@application/queries/CoachQueries/useRecentRecordsQuery.mock';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { baseAssignmentFactory } from '@testing/factories/assignmentsFactory';
import { baseGroupSessionFactory } from '@testing/factories/groupCallsFactory';
import { basePrivateCallFactory } from '@testing/factories/privateCallsFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RecentRecords from './RecentRecords';

vi.mock('@application/queries/CoachQueries/useRecentRecordsQuery', () => ({
  useRecentRecordsQuery: mockUseRecentRecordsQuery,
}));

vi.mock('@interface/components/CoachingRecords', () => ({
  AssignmentView: ({
    assignment,
  }: {
    assignment: { assignmentId: number };
  }) => <div>{`AssignmentView:${assignment.assignmentId}`}</div>,
  PrivateCallView: ({ call }: { call: { callId: number } }) => (
    <div>{`PrivateCallView:${call.callId}`}</div>
  ),
  GroupSessionView: ({
    groupSession,
  }: {
    groupSession: { groupSessionId: number };
  }) => <div>{`GroupSessionView:${groupSession.groupSessionId}`}</div>,
  NewAssignmentView: () => <div>NewAssignmentView</div>,
  NewPrivateCallView: () => <div>NewPrivateCallView</div>,
  NewGroupSessionView: () => <div>NewGroupSessionView</div>,
}));

const assignment = baseAssignmentFactory({
  assignmentId: 101,
  weekId: 5,
  assignmentType: {
    assignmentTypeId: 1,
    assignmentType: 'Writing',
  },
  assignmentRating: {
    assignmentRatingId: 1,
    assignmentRating: 'Excellent',
  },
  homeworkCorrector: {
    coach_id: 1,
    fullName: 'Coach Example',
    email: 'coach@example.com',
  },
});

const privateCall = basePrivateCallFactory({
  callId: 202,
  weekId: 5,
  callDate: '2026-07-08',
  caller: {
    coach_id: 1,
    fullName: 'Coach Example',
    email: 'coach@example.com',
  },
  callRating: {
    callRatingId: 1,
    rating: 'Excellent',
  },
  callType: {
    callTypeId: 1,
    callType: 'Monthly Call',
  },
});

const groupSession = baseGroupSessionFactory({
  groupSessionId: 303,
  callDate: '2026-07-08',
  coach: {
    coach_id: 1,
    fullName: 'Coach Example',
    email: 'coach@example.com',
  },
  groupSessionType: {
    groupSessionTypeId: 1,
    groupSessionType: 'Grammar',
  },
  groupSessionTopic: {
    groupSessionTopicId: 1,
    groupSessionTopic: 'Preterite',
  },
  attendees: [
    {
      groupAttendeeId: 1,
      groupSessionId: 303,
      weekId: 5,
      studentFullName: 'Student Example',
    },
  ],
});

describe('component RecentRecords', () => {
  beforeEach(() => {
    resetMockUseRecentRecordsQuery();
    overrideMockUseRecentRecordsQuery({
      recentRecords: {
        assignments: [assignment],
        privateCalls: [privateCall],
        groupCalls: [groupSession],
      },
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: null,
    });
  });

  async function openRecentRecords(): Promise<void> {
    render(
      <MockAllProviders>
        <RecentRecords coachId={1} />
      </MockAllProviders>,
    );
    fireEvent.click(screen.getByText('My Recent Records'));
    await waitFor(() => {
      expect(screen.getByText('Assignments')).toBeInTheDocument();
    });
  }

  it('opens the create assignment contextual from New Assignment', async () => {
    await openRecentRecords();
    fireEvent.click(screen.getByText('Assignments'));
    fireEvent.click(screen.getByRole('button', { name: 'New Assignment' }));

    await waitFor(() => {
      expect(screen.getByText('NewAssignmentView')).toBeInTheDocument();
    });
  });

  it('opens the create private call contextual from New Private Call', async () => {
    await openRecentRecords();
    fireEvent.click(screen.getByText('Private Calls'));
    fireEvent.click(screen.getByRole('button', { name: 'New Private Call' }));

    await waitFor(() => {
      expect(screen.getByText('NewPrivateCallView')).toBeInTheDocument();
    });
  });

  it('opens assignment edit contextual when a row view button is clicked', async () => {
    await openRecentRecords();
    fireEvent.click(screen.getByText('Assignments'));

    fireEvent.click(screen.getByAltText('view assignment'));

    await waitFor(() => {
      expect(screen.getByText('AssignmentView:101')).toBeInTheDocument();
    });
  });

  it('opens private call edit contextual when a row view button is clicked', async () => {
    await openRecentRecords();
    fireEvent.click(screen.getByText('Private Calls'));

    fireEvent.click(screen.getByAltText('view private call'));

    await waitFor(() => {
      expect(screen.getByText('PrivateCallView:202')).toBeInTheDocument();
    });
  });

  it('opens group session edit contextual when a row view button is clicked', async () => {
    await openRecentRecords();
    fireEvent.click(screen.getByText('Group Sessions'));

    fireEvent.click(screen.getByAltText('view group session'));

    await waitFor(() => {
      expect(screen.getByText('GroupSessionView:303')).toBeInTheDocument();
    });
  });
});
