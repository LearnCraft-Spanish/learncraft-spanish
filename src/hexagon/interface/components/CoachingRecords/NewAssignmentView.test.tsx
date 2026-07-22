import { mockAuthAdapter } from '@application/adapters/authAdapter.mock';
import mockUseAssignmentLookupsQuery, {
  overrideMockUseAssignmentLookupsQuery,
  resetMockUseAssignmentLookupsQuery,
} from '@application/queries/AssignmentsQueries/useAssignmentLookupsQuery.mock';
import {
  mockUseAssignmentMutations,
  overrideMockUseAssignmentMutations,
  resetMockUseAssignmentMutations,
} from '@application/queries/AssignmentsQueries/useAssignmentMutations.mock';
import mockUseAllCoachesQuery, {
  overrideMockUseAllCoachesQuery,
  resetMockUseAllCoachesQuery,
} from '@application/queries/CoachQueries/useAllCoachesQuery.mock';
import mockUseWeeksByStartDate, {
  overrideMockUseWeeksByStartDate,
  resetMockUseWeeksByStartDate,
} from '@application/queries/useWeeksByStartDate/useWeeksByStartDate.mock';
import { NewAssignmentView } from '@interface/components/CoachingRecords/NewAssignmentView';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { baseAssignmentFactory } from '@testing/factories/assignmentsFactory';
import { createMockFurnishedWeekWithCoach } from '@testing/factories/weekFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@application/queries/AssignmentsQueries/useAssignmentMutations',
  () => ({
    useAssignmentsMutations: mockUseAssignmentMutations,
  }),
);

vi.mock(
  '@application/queries/AssignmentsQueries/useAssignmentLookupsQuery',
  () => ({
    useAssignmentLookupsQuery: () => mockUseAssignmentLookupsQuery,
  }),
);

vi.mock('@application/queries/CoachQueries/useAllCoachesQuery', () => ({
  useAllCoachesQuery: () => mockUseAllCoachesQuery,
}));

vi.mock('@application/queries/useWeeksByStartDate/useWeeksByStartDate', () => ({
  useWeeksByStartDate: () => mockUseWeeksByStartDate,
}));

vi.mock('src/components/Coaching/general/CustomStudentSelector', () => ({
  CustomStudentSelector: ({
    onChange,
  }: {
    onChange: (weekId: number) => void;
  }) => (
    <button
      type="button"
      data-testid="select-student"
      onClick={() => onChange(7)}
    >
      select student
    </button>
  ),
}));

const assignmentType = { assignmentTypeId: 1, assignmentType: 'Writing' };
const assignmentRating = {
  assignmentRatingId: 1,
  assignmentRating: 'Excellent',
};

const homeworkCorrector = {
  coach_id: 1,
  fullName: 'Coach Example',
  email: mockAuthAdapter.authUser.email,
};

const week = createMockFurnishedWeekWithCoach({ weekId: 7 });

const createdAssignment = baseAssignmentFactory({
  assignmentId: 123,
  weekId: 7,
  homeworkCorrector,
  assignmentType,
  assignmentRating,
});

function ContextualProbe(): React.JSX.Element {
  const { contextual } = useContextualMenu();
  return <div data-testid="contextual-value">{contextual}</div>;
}

describe('component NewAssignmentView', () => {
  beforeEach(() => {
    resetMockUseAssignmentMutations();
    resetMockUseAssignmentLookupsQuery();
    resetMockUseAllCoachesQuery();
    resetMockUseWeeksByStartDate();
    overrideMockUseAllCoachesQuery({ coaches: [homeworkCorrector] });
    overrideMockUseAssignmentLookupsQuery({
      assignmentTypes: [assignmentType],
      assignmentRatings: [assignmentRating],
    });
    overrideMockUseWeeksByStartDate({ weeks: [week] });
    overrideMockUseAssignmentMutations({
      createAssignmentMutation: {
        ...mockUseAssignmentMutations().createAssignmentMutation,
        mutate: vi.fn((_command, options) => {
          options?.onSuccess?.(createdAssignment);
        }),
      },
    });
  });

  it('opens the created record in its edit context instead of re-creating', async () => {
    const onSuccess = vi.fn();
    render(
      <MockAllProviders>
        <NewAssignmentView
          weekStartsDefaultValue="2026-07-05"
          onSuccess={onSuccess}
        />
        <ContextualProbe />
      </MockAllProviders>,
    );

    fireEvent.click(screen.getByTestId('select-student'));
    fireEvent.change(screen.getByLabelText(/Assignment Type:/), {
      target: { value: assignmentType.assignmentType },
    });
    fireEvent.change(screen.getByLabelText(/Rating:/), {
      target: { value: assignmentRating.assignmentRating },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        mockUseAssignmentMutations().createAssignmentMutation.mutate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          weekId: 7,
          assignmentType,
          assignmentRating,
        }),
        expect.any(Object),
      );
      expect(onSuccess).toHaveBeenCalled();
      // After create, navigate to the real edit view for the new record so
      // subsequent edits update it instead of creating a duplicate.
      expect(screen.getByTestId('contextual-value')).toHaveTextContent(
        'assignment123',
      );
    });

    expect(
      mockUseAssignmentMutations().createAssignmentMutation.mutate,
    ).toHaveBeenCalledTimes(1);
  });
});
