import {
  mockAuthAdapter,
  resetMockAuthAdapter,
} from '@application/adapters/authAdapter.mock';
import mockUseAllCoachesQuery, {
  overrideMockUseAllCoachesQuery,
  resetMockUseAllCoachesQuery,
} from '@application/queries/CoachQueries/useAllCoachesQuery.mock';
import {
  mockUseGroupCallMutations,
  overrideMockUseGroupCallMutations,
  resetMockUseGroupCallMutations,
} from '@application/queries/GroupCallQueries/useGroupCallMutations.mock';
import mockUseGroupCallLookupsQuery, {
  overrideMockUseGroupCallLookupsQuery,
  resetMockUseGroupCallLookupsQuery,
} from '@application/queries/useGroupCallLookupsQuery.mock';
import mockUseWeeksByStartDate, {
  overrideMockUseWeeksByStartDate,
  resetMockUseWeeksByStartDate,
} from '@application/queries/useWeeksByStartDate/useWeeksByStartDate.mock';
import { NewGroupSessionView } from '@interface/components/CoachingRecords/NewGroupSessionView';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { baseGroupSessionFactory } from '@testing/factories/groupCallsFactory';
import { createMockFurnishedWeekWithCoach } from '@testing/factories/weekFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/queries/GroupCallQueries/useGroupCallMutations', () => ({
  useGroupCallMutations: mockUseGroupCallMutations,
}));

vi.mock('@application/queries/useGroupCallLookupsQuery', () => ({
  useGroupCallLookupsQuery: () => mockUseGroupCallLookupsQuery,
}));

vi.mock('@application/queries/CoachQueries/useAllCoachesQuery', () => ({
  useAllCoachesQuery: () => mockUseAllCoachesQuery,
}));

vi.mock('@application/queries/useWeeksByStartDate/useWeeksByStartDate', () => ({
  useWeeksByStartDate: () => mockUseWeeksByStartDate,
}));

vi.mock('src/components/Coaching/general/CustomStudentSelector', () => ({
  CustomStudentSelector: ({
    onChange,
    excludedWeekIds,
  }: {
    onChange: (weekId: number) => void;
    excludedWeekIds: number[];
  }) => (
    <button
      type="button"
      data-testid="select-student"
      data-excluded-week-ids={excludedWeekIds.join(',')}
      onClick={() => onChange(7)}
    >
      select student
    </button>
  ),
}));

const coach = {
  coach_id: 3,
  fullName: 'Coach Example',
  email: mockAuthAdapter.authUser.email,
};

const sessionType = {
  groupSessionTypeId: 1,
  groupSessionType: 'Grammar',
};

const sessionTopic = {
  groupSessionTopicId: 1,
  groupSessionTopic: 'Preterite',
};

const attendeeWeek = createMockFurnishedWeekWithCoach({ weekId: 7 });

const createdGroupSession = baseGroupSessionFactory({
  groupSessionId: 99,
  coach,
  groupSessionType: sessionType,
  groupSessionTopic: sessionTopic,
  attendees: [
    {
      groupAttendeeId: 1,
      groupSessionId: 99,
      weekId: 7,
      studentFullName: attendeeWeek.student?.fullName || 'No Student',
    },
  ],
});

describe('component NewGroupSessionView', () => {
  beforeEach(() => {
    resetMockAuthAdapter();
    resetMockUseAllCoachesQuery();
    resetMockUseGroupCallMutations();
    resetMockUseGroupCallLookupsQuery();
    resetMockUseWeeksByStartDate();
    overrideMockUseAllCoachesQuery({ coaches: [coach] });
    overrideMockUseGroupCallLookupsQuery({
      groupSessionTypes: [sessionType],
      groupSessionTopics: [sessionTopic],
    });
    overrideMockUseWeeksByStartDate({ weeks: [attendeeWeek] });
    overrideMockUseGroupCallMutations({
      createGroupCallMutation: {
        ...mockUseGroupCallMutations().createGroupCallMutation,
        mutate: vi.fn((_command, options) => {
          options?.onSuccess?.(createdGroupSession);
        }),
      },
    });
  });

  function renderView(onSuccess?: () => void): void {
    render(
      <MockAllProviders>
        <NewGroupSessionView
          weekStartsDefaultValue="2026-07-05"
          onSuccess={onSuccess}
        />
      </MockAllProviders>,
    );
  }

  it('adds and removes an attendee', async () => {
    renderView();

    fireEvent.click(screen.getByTestId('select-student'));
    await waitFor(() => {
      expect(screen.getByTestId('select-student')).toHaveAttribute(
        'data-excluded-week-ids',
        '7',
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Remove Attendee' }));
    await waitFor(() => {
      expect(screen.getByTestId('select-student')).toHaveAttribute(
        'data-excluded-week-ids',
        '',
      );
    });
  });

  it('creates a group session with the selected attendee', async () => {
    const onSuccess = vi.fn();
    renderView(onSuccess);

    fireEvent.click(screen.getByTestId('select-student'));
    fireEvent.change(screen.getByLabelText(/Session Type:/), {
      target: { value: sessionType.groupSessionType },
    });
    fireEvent.change(screen.getByLabelText(/Topic:/), {
      target: { value: sessionTopic.groupSessionTopic },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        mockUseGroupCallMutations().createGroupCallMutation.mutate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          coach: coach.coach_id,
          groupSessionType: sessionType,
          groupSessionTopic: sessionTopic,
          attendeeWeekIds: [7],
        }),
        expect.any(Object),
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
