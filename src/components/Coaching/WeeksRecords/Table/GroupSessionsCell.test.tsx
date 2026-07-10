import type {
  BaseGroupSession,
  FurnishedWeekWithCoach,
} from '@learncraft-spanish/shared';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { baseGroupSessionFactory } from 'src/hexagon/testing/factories/groupCallsFactory';
import { describe, expect, it, vi } from 'vitest';
import GroupSessionsCell from './GroupSessionsCell';

vi.mock('@application/adapters/authAdapter', () => ({
  useAuthAdapter: () => ({
    isAdmin: true,
    authUser: { email: 'coach@example.com' },
  }),
}));

vi.mock('@application/queries/CoachQueries/useAllCoachesQuery', () => ({
  useAllCoachesQuery: () => ({
    coaches: [
      {
        coach_id: 1,
        fullName: 'Coach Example',
        email: 'coach@example.com',
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

vi.mock(
  'src/hexagon/application/queries/GroupCallQueries/useGroupCallMutations',
  () => ({
    useGroupCallMutations: () => ({
      createGroupCallMutation: { mutate: vi.fn() },
      updateGroupCallMutation: { mutate: vi.fn() },
      deleteGroupCallMutation: { mutate: vi.fn() },
    }),
  }),
);

vi.mock('src/hexagon/application/queries/useGroupCallLookupsQuery', () => ({
  useGroupCallLookupsQuery: () => ({
    groupSessionTypes: [
      {
        groupSessionTypeId: 1,
        groupSessionType: 'Grammar',
      },
    ],
    groupSessionTopics: [
      {
        groupSessionTopicId: 1,
        groupSessionTopic: 'Preterite',
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

vi.mock(
  'src/hexagon/application/queries/useWeeksByStartDate/useWeeksByStartDate',
  () => ({
    useWeeksByStartDate: () => ({
      weeks: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      getWeekById: vi.fn(),
    }),
  }),
);

const week = {
  weekId: 1,
  student: {
    student_id: 1,
    fullName: 'Student Example',
    email: 'student@example.com',
  },
} as unknown as FurnishedWeekWithCoach;

const groupSession = baseGroupSessionFactory({
  groupSessionId: 1,
  coach: {
    coach_id: 1,
    fullName: 'Coach Example',
    email: 'coach@example.com',
  },
  comments: 'Great class participation',
  zoomLink: 'https://example.com/zoom',
  callDocument: 'https://example.com/document',
  callDate: '2026-07-08',
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
      groupSessionId: 1,
      weekId: 1,
      studentFullName: 'Student Example',
    },
  ],
});

describe('component GroupSessionsCell', () => {
  function renderComponent(session: BaseGroupSession = groupSession) {
    render(
      <MockAllProviders>
        <GroupSessionsCell
          week={week}
          groupSessions={[session]}
          tableEditMode={false}
        />
      </MockAllProviders>,
    );
  }

  async function renderWithPopupActive() {
    renderComponent();
    expect(
      screen.getByText(groupSession.groupSessionType!.groupSessionType),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByText(groupSession.groupSessionType!.groupSessionType),
    );
    await waitFor(() => {
      expect(screen.getByText('Attendees:')).toBeInTheDocument();
    });
  }

  it('default view renders without crashing', () => {
    renderComponent();
    expect(
      screen.getByText(groupSession.groupSessionType!.groupSessionType),
    ).toBeInTheDocument();
  });

  describe('contextual menu view', () => {
    it('contextual menu view renders without crashing', async () => {
      await renderWithPopupActive();
      expect(screen.getByText('Student Example')).toBeInTheDocument();
    });

    it('contextual menu view renders the correct data', async () => {
      await renderWithPopupActive();
      const requiredFields = [
        'Coach:',
        'Date:',
        'Session Type:',
        'Topic:',
        'Comments:',
        'Attendees:',
      ];
      requiredFields.forEach((field) => {
        expect(screen.getByText(field)).toBeInTheDocument();
      });
      expect(screen.getByText('Coach Example')).toBeInTheDocument();
      expect(screen.getAllByText('Grammar').length).toBeGreaterThan(0);
      expect(screen.getByText('Preterite')).toBeInTheDocument();
      expect(screen.getByText('Great class participation')).toBeInTheDocument();
    });

    it('contextual menu view renders the session documents if they exist on the group session', async () => {
      await renderWithPopupActive();
      expect(screen.getByText('Zoom Link:')).toBeInTheDocument();
      expect(screen.getByText('Call Document:')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Zoom Link' })).toHaveAttribute(
        'href',
        groupSession.zoomLink,
      );
      expect(
        screen.getByRole('link', { name: 'Call Document' }),
      ).toHaveAttribute('href', groupSession.callDocument);
    });
  });
});
