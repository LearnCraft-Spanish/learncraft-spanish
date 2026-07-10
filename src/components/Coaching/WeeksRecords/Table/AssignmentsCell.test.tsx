import type {
  BaseAssignment,
  FurnishedWeekWithCoach,
} from '@learncraft-spanish/shared';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { baseAssignmentFactory } from 'src/hexagon/testing/factories/assignmentsFactory';
import { describe, expect, it, vi } from 'vitest';
import AssignmentsCell from './AssignmentsCell';

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
  'src/hexagon/application/queries/AssignmentsQueries/useAssignmentMutations',
  () => ({
    useAssignmentsMutations: () => ({
      createAssignmentMutation: { mutate: vi.fn() },
      updateAssignmentMutation: { mutate: vi.fn() },
      deleteAssignmentMutation: { mutate: vi.fn() },
    }),
  }),
);

vi.mock(
  '@application/queries/AssignmentsQueries/useAssignmentLookupsQuery',
  () => ({
    useAssignmentLookupsQuery: () => ({
      assignmentTypes: [
        {
          assignmentTypeId: 1,
          assignmentType: 'Writing',
        },
      ],
      assignmentRatings: [
        {
          assignmentRatingId: 1,
          assignmentRating: 'Excellent',
        },
      ],
      isLoading: false,
      error: null,
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

const assignment = baseAssignmentFactory({
  assignmentId: 1,
  weekId: 1,
  homeworkCorrector: {
    coach_id: 1,
    fullName: 'Coach Example',
    email: 'coach@example.com',
  },
  notes: 'Strong submission',
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

describe('component AssignmentsCell', () => {
  function assignmentLabel(targetAssignment: BaseAssignment = assignment) {
    return `${targetAssignment.assignmentType.assignmentType}: ${targetAssignment.assignmentRating.assignmentRating}`;
  }

  function renderComponent(targetAssignment: BaseAssignment = assignment) {
    render(
      <MockAllProviders>
        <AssignmentsCell
          week={week}
          assignments={[targetAssignment]}
          tableEditMode={false}
        />
      </MockAllProviders>,
    );
  }

  async function renderWithPopupActive() {
    renderComponent();
    expect(screen.getByText(assignmentLabel())).toBeInTheDocument();
    fireEvent.click(screen.getByText(assignmentLabel()));
    await waitFor(() => {
      expect(screen.getByText('Notes:')).toBeInTheDocument();
    });
  }

  it('default view renders without crashing', () => {
    renderComponent();
    expect(screen.getByText(assignmentLabel())).toBeInTheDocument();
  });

  describe('contextual menu view', () => {
    it('contextual menu view renders without crashing', async () => {
      await renderWithPopupActive();
      expect(screen.getByText('Strong submission')).toBeInTheDocument();
    });

    it('contextual menu view renders the correct data', async () => {
      await renderWithPopupActive();
      const requiredFields = [
        'Assignment Type:',
        'Corrected by:',
        'Rating:',
        'Notes:',
        'Areas of Difficulty:',
      ];
      requiredFields.forEach((field) => {
        expect(screen.getByText(field)).toBeInTheDocument();
      });
      expect(
        screen.getByText('Writing by Student Example'),
      ).toBeInTheDocument();
      expect(screen.getByText('Coach Example')).toBeInTheDocument();
      expect(screen.getByText('Excellent')).toBeInTheDocument();
      expect(screen.getByText('Accent marks')).toBeInTheDocument();
    });

    it('contextual menu view renders the session documents if they exist on the assignment', async () => {
      await renderWithPopupActive();
      expect(screen.getByText('Assignment Link:')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Assignment Link' }),
      ).toHaveAttribute('href', assignment.assignmentLink);
    });
  });
});
