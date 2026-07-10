import type {
  BaseAssignment,
  BaseGroupSession,
  FurnishedWeekWithCoach,
} from '@learncraft-spanish/shared';
import { render, screen } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { baseAssignmentFactory } from 'src/hexagon/testing/factories/assignmentsFactory';
import { baseGroupSessionFactory } from 'src/hexagon/testing/factories/groupCallsFactory';
import { createMockFurnishedWeek } from 'src/hexagon/testing/factories/weekFactory';
import { describe, expect, it, vi } from 'vitest';
import WeeksTable from './WeeksTable';

vi.mock('src/hexagon/application/queries/useSrLessonsQuery', () => ({
  useSrLessonsQuery: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));

vi.mock('src/hexagon/application/queries/WeekQueries/useWeekMutations', () => ({
  useWeekMutations: () => ({
    updateWeekMutation: {
      mutate: vi.fn(),
      isPending: false,
    },
  }),
}));

const assignment = baseAssignmentFactory({
  assignmentId: 1,
  weekId: 1,
  assignmentType: {
    assignmentTypeId: 1,
    assignmentType: 'Writing',
  },
  assignmentRating: {
    assignmentRatingId: 1,
    assignmentRating: 'Excellent',
  },
});

const groupSession = baseGroupSessionFactory({
  groupSessionId: 1,
  groupSessionType: {
    groupSessionTypeId: 1,
    groupSessionType: 'Grammar',
  },
});

function createWeek(
  overrides: Partial<FurnishedWeekWithCoach> = {},
): FurnishedWeekWithCoach {
  return {
    ...createMockFurnishedWeek({
      weekId: 1,
      notes: '',
      holdWeek: false,
      recordComplete: false,
      assignments: [],
      groupCalls: [],
      privateCalls: [],
    }),
    coach: {
      coach_id: 1,
      fullName: 'Coach Example',
      email: 'coach@example.com',
    },
    student: {
      student_id: 1,
      fullName: 'Student Example',
      email: 'student@example.com',
    },
    srCourseName: 'Level 1',
    ...overrides,
  } as FurnishedWeekWithCoach;
}

function renderTable(weeks: FurnishedWeekWithCoach[]) {
  render(
    <MockAllProviders>
      <WeeksTable
        weeks={weeks}
        tableEditMode={false}
        hiddenFields={[]}
        sortByStudent={false}
        handleUpdateSortByStudent={() => {}}
        sortDirection="none"
      />
    </MockAllProviders>,
  );
}

describe('component WeeksTable', () => {
  it('renders without crashing', () => {
    renderTable([createWeek()]);
    expect(screen.getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('Assignments')).toBeInTheDocument();
    expect(screen.getByText('Group Calls')).toBeInTheDocument();
    expect(screen.getByText('Private Calls')).toBeInTheDocument();
    expect(screen.getByText('Records Complete')).toBeInTheDocument();
  });

  describe('assignment cell', () => {
    it('renders with assignments', async () => {
      renderTable([
        createWeek({
          assignments: [assignment] as BaseAssignment[],
        }),
      ]);
      expect(
        await screen.findByText(
          `${assignment.assignmentType.assignmentType}: ${assignment.assignmentRating.assignmentRating}`,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('group session cell', () => {
    it('renders with group sessions', async () => {
      renderTable([
        createWeek({
          groupCalls: [groupSession] as BaseGroupSession[],
        }),
      ]);
      expect(
        await screen.findByText(
          groupSession.groupSessionType!.groupSessionType,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('hold week cell', () => {
    it('renders with hold week', async () => {
      renderTable([createWeek({ holdWeek: true })]);
      expect(await screen.findByAltText('Checkmark')).toBeInTheDocument();
    });
  });

  describe('records complete cell', () => {
    it('renders with records complete', async () => {
      renderTable([createWeek({ recordComplete: true })]);
      expect(await screen.findByAltText('Checkmark')).toBeInTheDocument();
    });
  });
});
