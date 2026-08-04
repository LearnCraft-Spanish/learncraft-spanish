import {
  overrideMockAuthAdapter,
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
  resetMockUseGroupCallLookupsQuery,
} from '@application/queries/useGroupCallLookupsQuery.mock';
import mockUseWeeksByStartDate, {
  resetMockUseWeeksByStartDate,
} from '@application/queries/useWeeksByStartDate/useWeeksByStartDate.mock';
import { GroupSessionView } from '@interface/components/CoachingRecords/GroupSessionView';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { baseGroupSessionFactory } from '@testing/factories/groupCallsFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/queries/GroupCallQueries/useGroupCallMutations', () => ({
  useGroupCallMutations: mockUseGroupCallMutations,
}));

vi.mock('@application/queries/useGroupCallLookupsQuery', () => ({
  useGroupCallLookupsQuery: () => mockUseGroupCallLookupsQuery,
}));

vi.mock('@application/queries/useWeeksByStartDate/useWeeksByStartDate', () => ({
  useWeeksByStartDate: () => mockUseWeeksByStartDate,
}));

vi.mock('@application/queries/CoachQueries/useAllCoachesQuery', () => ({
  useAllCoachesQuery: () => mockUseAllCoachesQuery,
}));

vi.mock('src/components/Coaching/general/CustomStudentSelector', () => ({
  CustomStudentSelector: () => <div data-testid="student-selector" />,
}));

const coach = {
  coach_id: 1,
  fullName: 'Coach Example',
  email: 'coach@example.com',
};

const groupSession = baseGroupSessionFactory({
  groupSessionId: 9,
  coach,
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
      groupSessionId: 9,
      weekId: 1,
      studentFullName: 'Student Example',
    },
  ],
});

describe('component GroupSessionView', () => {
  beforeEach(() => {
    resetMockAuthAdapter();
    resetMockUseGroupCallMutations();
    resetMockUseGroupCallLookupsQuery();
    resetMockUseWeeksByStartDate();
    resetMockUseAllCoachesQuery();
    overrideMockUseAllCoachesQuery({ coaches: [coach] });
    overrideMockUseGroupCallMutations({
      updateGroupCallMutation: {
        ...mockUseGroupCallMutations().updateGroupCallMutation,
        mutate: vi.fn((_command, options) => {
          options?.onSuccess?.(groupSession);
        }),
      },
      deleteGroupCallMutation: {
        ...mockUseGroupCallMutations().deleteGroupCallMutation,
        mutate: vi.fn((_command, options) => {
          options?.onSuccess?.(undefined);
        }),
      },
    });
  });

  function renderView(): void {
    render(
      <MockAllProviders>
        <GroupSessionView groupSession={groupSession} tableEditMode={false} />
      </MockAllProviders>,
    );
  }

  async function enterEditMode(): Promise<void> {
    fireEvent.click(screen.getByAltText('edit record'));
    await waitFor(() => {
      expect(screen.getByText('Edit Group Session')).toBeInTheDocument();
    });
  }

  it('renders group session details in read mode', () => {
    renderView();
    expect(screen.getByText(/Grammar on/)).toBeInTheDocument();
    expect(screen.getByText('Great class participation')).toBeInTheDocument();
    expect(screen.getByText('Student Example')).toBeInTheDocument();
    expect(screen.getByText('Coach Example')).toBeInTheDocument();
  });

  it('submits an edit when comments change', async () => {
    const onSuccess = vi.fn();
    render(
      <MockAllProviders>
        <GroupSessionView
          groupSession={groupSession}
          tableEditMode={false}
          onSuccess={onSuccess}
        />
      </MockAllProviders>,
    );

    await enterEditMode();
    fireEvent.change(screen.getByLabelText(/Comments:/), {
      target: { value: 'Updated comments' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        mockUseGroupCallMutations().updateGroupCallMutation.mutate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          groupSessionId: 9,
          comments: 'Updated comments',
          attendeeWeekIds: [1],
        }),
        expect.any(Object),
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('shows admin-gated delete and deletes the group session', async () => {
    overrideMockAuthAdapter({ isAdmin: true });
    renderView();
    await enterEditMode();

    fireEvent.click(screen.getByRole('button', { name: 'Delete Record' }));
    await waitFor(() => {
      expect(
        screen.getByText('Are you sure you want to delete this record?'),
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(
        mockUseGroupCallMutations().deleteGroupCallMutation.mutate,
      ).toHaveBeenCalledWith({ groupSessionId: 9 }, expect.any(Object));
    });
  });

  it('hides delete when the user is not an admin', async () => {
    overrideMockAuthAdapter({ isAdmin: false });
    renderView();
    await enterEditMode();
    expect(
      screen.queryByRole('button', { name: 'Delete Record' }),
    ).not.toBeInTheDocument();
  });
});
