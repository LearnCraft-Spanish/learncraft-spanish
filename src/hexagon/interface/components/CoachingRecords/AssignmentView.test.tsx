import mockUseAssignmentLookupsQuery, {
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
import { AssignmentView } from '@interface/components/CoachingRecords/AssignmentView';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { baseAssignmentFactory } from '@testing/factories/assignmentsFactory';
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

const homeworkCorrector = {
  coach_id: 1,
  fullName: 'Coach Example',
  email: 'coach@example.com',
};

const assignment = baseAssignmentFactory({
  assignmentId: 42,
  weekId: 7,
  homeworkCorrector,
  notes: 'Original notes',
  areasOfDifficulty: 'Accent marks',
  assignmentLink: 'https://example.com/assignment',
  assignmentType: {
    assignmentTypeId: 1,
    assignmentType: 'Writing',
  },
  assignmentRating: {
    assignmentRatingId: 1,
    assignmentRating: 'Excellent',
  },
});

describe('component AssignmentView', () => {
  beforeEach(() => {
    resetMockUseAssignmentMutations();
    resetMockUseAssignmentLookupsQuery();
    resetMockUseAllCoachesQuery();
    overrideMockUseAllCoachesQuery({
      coaches: [homeworkCorrector],
    });
    overrideMockUseAssignmentMutations({
      updateAssignmentMutation: {
        ...mockUseAssignmentMutations().updateAssignmentMutation,
        mutate: vi.fn((_command, options) => {
          options?.onSuccess?.(assignment);
        }),
      },
      deleteAssignmentMutation: {
        ...mockUseAssignmentMutations().deleteAssignmentMutation,
        mutate: vi.fn((_command, options) => {
          options?.onSuccess?.(undefined);
        }),
      },
    });
  });

  function renderView(): void {
    render(
      <MockAllProviders>
        <AssignmentView
          assignment={assignment}
          displayContext={{ studentName: 'Student Example' }}
          tableEditMode={false}
        />
      </MockAllProviders>,
    );
  }

  async function enterEditMode(): Promise<void> {
    fireEvent.click(screen.getByAltText('edit record'));
    await waitFor(() => {
      expect(screen.getByText('Edit Assignment')).toBeInTheDocument();
    });
  }

  it('renders assignment details in read mode', () => {
    renderView();
    expect(screen.getByText('Writing by Student Example')).toBeInTheDocument();
    expect(screen.getByText('Original notes')).toBeInTheDocument();
    expect(screen.getByText('Accent marks')).toBeInTheDocument();
    expect(screen.getByText('Coach Example')).toBeInTheDocument();
  });

  it('submits an edit when notes change', async () => {
    const onSuccess = vi.fn();
    render(
      <MockAllProviders>
        <AssignmentView
          assignment={assignment}
          displayContext={{ studentName: 'Student Example' }}
          tableEditMode={false}
          onSuccess={onSuccess}
        />
      </MockAllProviders>,
    );

    await enterEditMode();
    fireEvent.change(screen.getByLabelText(/Notes:/), {
      target: { value: 'Updated notes' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        mockUseAssignmentMutations().updateAssignmentMutation.mutate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          assignmentId: 42,
          notes: 'Updated notes',
        }),
        expect.any(Object),
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('deletes the assignment from edit mode', async () => {
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
        mockUseAssignmentMutations().deleteAssignmentMutation.mutate,
      ).toHaveBeenCalledWith({ assignmentId: 42 }, expect.any(Object));
    });
  });
});
