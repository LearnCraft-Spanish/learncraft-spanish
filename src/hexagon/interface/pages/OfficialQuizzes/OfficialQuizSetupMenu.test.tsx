import type { OfficialQuizSetupMenuProps } from '@interface/pages/OfficialQuizzes/OfficialQuizSetupMenu';
import type { OfficialQuizRecord, QuizGroup } from '@learncraft-spanish/shared';
import { OfficialQuizSetupMenu } from '@interface/pages/OfficialQuizzes/OfficialQuizSetupMenu';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  createMockOfficialQuizRecord,
  createMockQuizGroup,
} from '@testing/factories/quizFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { describe, expect, it, vi } from 'vitest';

/**
 * Creates realistic quiz records for a course with descriptive titles
 */
function createRealisticQuizzes(
  quizGroupId: number,
  courseName: string,
  lessonNumbers: number[],
  startId: number = 1,
): OfficialQuizRecord[] {
  return lessonNumbers.map((lessonNum, idx) =>
    createMockOfficialQuizRecord({
      id: startId + idx,
      relatedQuizGroupId: quizGroupId,
      quizNumber: lessonNum,
      quizTitle: `${courseName} - Lesson ${lessonNum}`,
      published: true,
    }),
  );
}

/**
 * Creates mock quiz groups that represent realistic course data
 */
function createMockQuizGroups(): QuizGroup[] {
  return [
    createMockQuizGroup({
      id: 1,
      name: 'LearnCraft Spanish',
      urlSlug: 'lcsp',
      courseId: 1,
      published: true,
      quizzes: createRealisticQuizzes(
        1,
        'LCSP',
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        1,
      ),
    }),
    createMockQuizGroup({
      id: 2,
      name: 'Spanish in One Month',
      urlSlug: 'si1m',
      courseId: 2,
      published: true,
      quizzes: createRealisticQuizzes(2, 'SI1M', [1, 2, 3, 4, 5], 101),
    }),
    createMockQuizGroup({
      id: 3,
      name: 'Post-1MC Cohort',
      urlSlug: 'post-1mc',
      courseId: 3,
      published: true,
      quizzes: createRealisticQuizzes(
        3,
        'Post-1MC',
        [1, 2, 3, 4, 5, 6, 7, 8],
        201,
      ),
    }),
    createMockQuizGroup({
      id: 4,
      name: 'Subjunctives Challenge',
      urlSlug: 'subjunctive',
      courseId: 4,
      published: true,
      quizzes: [
        createMockOfficialQuizRecord({
          id: 301,
          relatedQuizGroupId: 4,
          quizNumber: 101,
          quizTitle: 'Subjunctives Challenge - Unit 1',
          published: true,
        }),
        createMockOfficialQuizRecord({
          id: 302,
          relatedQuizGroupId: 4,
          quizNumber: 201,
          quizTitle: 'Subjunctives Challenge - Unit 2',
          published: true,
        }),
        createMockOfficialQuizRecord({
          id: 303,
          relatedQuizGroupId: 4,
          quizNumber: 301,
          quizTitle: 'Subjunctives Challenge - Unit 3',
          published: true,
        }),
      ],
    }),
  ];
}

const mockQuizGroups = createMockQuizGroups();
const lcspGroup = mockQuizGroups[0];

const defaultProps: OfficialQuizSetupMenuProps = {
  selectedQuizGroup: lcspGroup,
  setSelectedQuizGroup: vi.fn(),
  quizNumber: 0,
  setUserSelectedQuizNumber: vi.fn(),
  quizOptions: lcspGroup.quizzes,
  quizGroups: mockQuizGroups,
  startQuiz: vi.fn(),
};

function renderWithOverrides(overrides?: Partial<OfficialQuizSetupMenuProps>) {
  return render(
    <MockAllProviders>
      <OfficialQuizSetupMenu {...defaultProps} {...(overrides ?? {})} />
    </MockAllProviders>,
  );
}

describe('component OfficialQuizSetupMenu', () => {
  describe('rendering', () => {
    it('renders course and quiz selects with all quiz groups and quizzes', () => {
      const quizGroups = createMockQuizGroups();
      const selectedGroup = quizGroups[0];

      renderWithOverrides({
        selectedQuizGroup: selectedGroup,
        quizOptions: selectedGroup.quizzes,
        quizGroups,
      });

      expect(screen.getByText('Official Quizzes')).toBeInTheDocument();

      // Verify course select is rendered with correct value
      const courseSelect = screen.getByLabelText(
        'Select Course',
      ) as HTMLSelectElement;
      expect(courseSelect).toBeInTheDocument();
      expect(courseSelect.value).toBe(selectedGroup.id.toString());

      // Verify all quiz groups appear as options
      for (const group of quizGroups) {
        expect(
          screen.getByRole('option', { name: group.name }),
        ).toBeInTheDocument();
      }

      // Verify quiz select is rendered
      const quizSelect = screen.getByLabelText(
        'Select Quiz',
      ) as HTMLSelectElement;
      expect(quizSelect).toBeInTheDocument();

      // Verify default "Select a Quiz" option
      expect(
        screen.getByRole('option', { name: 'Select a Quiz' }),
      ).toBeInTheDocument();

      // Verify all quizzes for selected group appear
      for (const quiz of selectedGroup.quizzes) {
        expect(
          screen.getByRole('option', { name: quiz.quizTitle }),
        ).toBeInTheDocument();
      }

      // MenuButton stub rendered
      expect(screen.getByText('Back to Home')).toBeInTheDocument();
    });

    it('renders multiple quiz options for LCSP course with 12 lessons', () => {
      const quizGroups = createMockQuizGroups();
      const lcspGroup = quizGroups.find((g) => g.urlSlug === 'lcsp')!;

      renderWithOverrides({
        selectedQuizGroup: lcspGroup,
        quizOptions: lcspGroup.quizzes,
        quizGroups,
      });

      // Verify we have all 12 LCSP lessons
      expect(lcspGroup.quizzes).toHaveLength(12);
      expect(
        screen.getByRole('option', { name: 'LCSP - Lesson 1' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'LCSP - Lesson 12' }),
      ).toBeInTheDocument();
    });

    it('renders subjunctive quizzes with special numbering system', () => {
      const quizGroups = createMockQuizGroups();
      const subjunctiveGroup = quizGroups.find(
        (g) => g.urlSlug === 'subjunctive',
      )!;

      renderWithOverrides({
        selectedQuizGroup: subjunctiveGroup,
        quizOptions: subjunctiveGroup.quizzes,
        quizGroups,
      });

      // Verify subjunctive has special quiz numbering (101, 201, 301)
      expect(
        screen.getByRole('option', { name: 'Subjunctives Challenge - Unit 1' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Subjunctives Challenge - Unit 2' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Subjunctives Challenge - Unit 3' }),
      ).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('changing course calls setSelectedQuizGroup with group ID and resets quiz number', () => {
      const quizGroups = createMockQuizGroups();
      const lcspGroup = quizGroups[0];
      const si1mGroup = quizGroups[1];
      const setSelectedQuizGroup = vi.fn();
      const setUserSelectedQuizNumber = vi.fn();

      renderWithOverrides({
        selectedQuizGroup: lcspGroup,
        quizNumber: 5,
        quizOptions: lcspGroup.quizzes,
        quizGroups,
        setSelectedQuizGroup,
        setUserSelectedQuizNumber,
      });

      const courseSelect = screen.getByLabelText(
        'Select Course',
      ) as HTMLSelectElement;

      // Change to Spanish in One Month course
      fireEvent.change(courseSelect, { target: { value: si1mGroup.id } });

      expect(setSelectedQuizGroup).toHaveBeenCalledWith(si1mGroup.id);
      expect(setUserSelectedQuizNumber).toHaveBeenCalledWith(0);
    });

    it('changing quiz calls setUserSelectedQuizNumber with quiz number', () => {
      const setUserSelectedQuizNumber = vi.fn();
      const quizGroups = createMockQuizGroups();
      const lcspGroup = quizGroups[0];

      renderWithOverrides({
        selectedQuizGroup: lcspGroup,
        quizOptions: lcspGroup.quizzes,
        setUserSelectedQuizNumber,
      });

      const quizSelect = screen.getByLabelText(
        'Select Quiz',
      ) as HTMLSelectElement;

      // Select lesson 5
      fireEvent.change(quizSelect, { target: { value: '5' } });

      expect(setUserSelectedQuizNumber).toHaveBeenCalledWith(5);
    });

    it('changing from LCSP to subjunctive course updates correctly', () => {
      const quizGroups = createMockQuizGroups();
      const lcspGroup = quizGroups[0];
      const subjunctiveGroup = quizGroups[3];
      const setSelectedQuizGroup = vi.fn();
      const setUserSelectedQuizNumber = vi.fn();

      renderWithOverrides({
        selectedQuizGroup: lcspGroup,
        quizOptions: lcspGroup.quizzes,
        quizGroups,
        setSelectedQuizGroup,
        setUserSelectedQuizNumber,
      });

      const courseSelect = screen.getByLabelText(
        'Select Course',
      ) as HTMLSelectElement;

      fireEvent.change(courseSelect, {
        target: { value: subjunctiveGroup.id },
      });

      expect(setSelectedQuizGroup).toHaveBeenCalledWith(subjunctiveGroup.id);
      expect(setUserSelectedQuizNumber).toHaveBeenCalledWith(0);
    });
  });

  describe('begin Review button', () => {
    it('is disabled when no quiz is selected (quizNumber = 0)', () => {
      const quizGroups = createMockQuizGroups();
      const lcspGroup = quizGroups[0];

      renderWithOverrides({
        selectedQuizGroup: lcspGroup,
        quizOptions: lcspGroup.quizzes,
        quizGroups,
        quizNumber: 0,
      });

      const button = screen.getByRole('button', { name: 'Begin Review' });
      expect(button).toBeDisabled();
    });

    it('is disabled when selected quiz number does not exist in quizOptions', () => {
      const quizGroups = createMockQuizGroups();
      const lcspGroup = quizGroups[0];

      renderWithOverrides({
        selectedQuizGroup: lcspGroup,
        quizOptions: lcspGroup.quizzes,
        quizGroups,
        quizNumber: 999, // Non-existent quiz number
      });

      const button = screen.getByRole('button', { name: 'Begin Review' });
      expect(button).toBeDisabled();
    });

    it('is enabled when a valid quiz is selected', () => {
      const quizGroups = createMockQuizGroups();
      const lcspGroup = quizGroups[0];

      renderWithOverrides({
        selectedQuizGroup: lcspGroup,
        quizOptions: lcspGroup.quizzes,
        quizGroups,
        quizNumber: 5, // Valid quiz number
      });

      const button = screen.getByRole('button', { name: 'Begin Review' });
      expect(button).toBeEnabled();
    });

    it('calls startQuiz when clicked with valid selection', () => {
      const startQuiz = vi.fn();
      const quizGroups = createMockQuizGroups();
      const lcspGroup = quizGroups[0];

      renderWithOverrides({
        selectedQuizGroup: lcspGroup,
        quizOptions: lcspGroup.quizzes,
        quizGroups,
        quizNumber: 3,
        startQuiz,
      });

      const button = screen.getByRole('button', { name: 'Begin Review' });
      fireEvent.click(button);

      expect(startQuiz).toHaveBeenCalledTimes(1);
    });

    it('works correctly with subjunctive special numbering', () => {
      const quizGroups = createMockQuizGroups();
      const subjunctiveGroup = quizGroups[3];
      const startQuiz = vi.fn();

      renderWithOverrides({
        selectedQuizGroup: subjunctiveGroup,
        quizOptions: subjunctiveGroup.quizzes,
        quizGroups,
        quizNumber: 201, // Subjunctive Unit 2
        startQuiz,
      });

      const button = screen.getByRole('button', { name: 'Begin Review' });
      expect(button).toBeEnabled();

      fireEvent.click(button);
      expect(startQuiz).toHaveBeenCalledTimes(1);
    });
  });

  describe('quiz group switching', () => {
    it('shows correct quiz options when switching between courses', () => {
      const quizGroups = createMockQuizGroups();
      const lcspGroup = quizGroups[0];
      const si1mGroup = quizGroups[1];

      const { rerender } = render(
        <MockAllProviders>
          <OfficialQuizSetupMenu
            selectedQuizGroup={lcspGroup}
            setSelectedQuizGroup={vi.fn()}
            quizNumber={0}
            setUserSelectedQuizNumber={vi.fn()}
            quizOptions={lcspGroup.quizzes}
            quizGroups={quizGroups}
            startQuiz={vi.fn()}
          />
        </MockAllProviders>,
      );

      // Verify LCSP quizzes are shown (12 lessons)
      expect(screen.getAllByRole('option').length).toBe(
        12 + 1 + 4, // 12 quizzes + 1 "Select a Quiz" + 4 course options
      );
      expect(
        screen.getByRole('option', { name: 'LCSP - Lesson 1' }),
      ).toBeInTheDocument();

      // Switch to SI1M
      rerender(
        <MockAllProviders>
          <OfficialQuizSetupMenu
            selectedQuizGroup={si1mGroup}
            setSelectedQuizGroup={vi.fn()}
            quizNumber={0}
            setUserSelectedQuizNumber={vi.fn()}
            quizOptions={si1mGroup.quizzes}
            quizGroups={quizGroups}
            startQuiz={vi.fn()}
          />
        </MockAllProviders>,
      );

      // Verify SI1M quizzes are shown (5 lessons)
      expect(screen.getAllByRole('option').length).toBe(
        5 + 1 + 4, // 5 quizzes + 1 "Select a Quiz" + 4 course options
      );
      expect(
        screen.getByRole('option', { name: 'SI1M - Lesson 1' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'SI1M - Lesson 5' }),
      ).toBeInTheDocument();
    });
  });
});
