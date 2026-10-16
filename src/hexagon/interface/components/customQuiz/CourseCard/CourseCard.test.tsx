import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { CourseWithLessons } from '@learncraft-spanish/shared';
import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { CourseCard } from '@interface/components/customQuiz/CourseCard/CourseCard';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

const course: CourseWithLessons = {
  id: 2,
  name: 'LearnCraft Spanish',
  published: true,
  lessons: [
    { id: 1, lessonNumber: 1, courseName: 'LearnCraft Spanish' },
    { id: 2, lessonNumber: 2, courseName: 'LearnCraft Spanish' },
    { id: 8, lessonNumber: 8, courseName: 'LearnCraft Spanish' },
  ],
};

const otherCourse: CourseWithLessons = {
  id: 3,
  name: 'Essential Spanish',
  published: true,
  lessons: [{ id: 30, lessonNumber: 1, courseName: 'Essential Spanish' }],
};

/**
 * Mirrors `FilterSection.test.tsx`'s fixture: `CourseCard` takes the same
 * `UseCombinedFiltersReturnType` shape, so the same synthetic filter serves
 * both of its consumers (Custom Quiz here, Finder/Manager there).
 */
function createFilter(
  overrides: Partial<UseCombinedFiltersReturnType> = {},
): UseCombinedFiltersReturnType {
  return {
    isAdmin: false,
    filterState: {
      lessonRanges: [],
      excludeSpanglish: false,
      audioOnly: false,
      skillTags: [],
      includeUnpublished: false,
    },
    isLoading: false,
    error: null,
    filterStateWithoutLesson: {
      excludeSpanglish: false,
      audioOnly: false,
      skillTagKeys: [],
      includeUnpublished: false,
    },
    batchUpdateFilterStateWithoutLesson: vi.fn(),
    audioOnly: false,
    updateAudioOnly: vi.fn(),
    excludeSpanglish: false,
    updateExcludeSpanglish: vi.fn(),
    includeUnpublished: false,
    updateIncludeUnpublished: vi.fn(),
    selectedSkillTags: [],
    outOfRangeSkillTagKeys: [],
    addSkillTagToFilters: vi.fn(),
    removeSkillTagFromFilters: vi.fn(),
    bulkUpdateSkillTagKeys: vi.fn(),
    course,
    courseId: course.id,
    updateUserSelectedCourseId: vi.fn(),
    fromLesson: course.lessons[0] ?? null,
    fromLessonNumber: 1,
    updateFromLessonNumber: vi.fn(),
    toLesson: course.lessons[2] ?? null,
    toLessonNumber: 8,
    updateToLessonNumber: vi.fn(),
    skillTagSearch: {
      tagSearchTerm: '',
      tagSuggestions: [],
      updateTagSearchTerm: vi.fn(),
      removeTagFromSuggestions: vi.fn(),
      addTagBackToSuggestions: vi.fn(),
      isLoading: false,
      error: null,
    },
    filterPreset: PreSetQuizPreset.None,
    setFilterPreset: vi.fn(),
    coursesWithLessons: [course, otherCourse],
    ...overrides,
  };
}

function renderCard(
  exampleFilter: UseCombinedFiltersReturnType = createFilter(),
): UseCombinedFiltersReturnType {
  render(<CourseCard exampleFilter={exampleFilter} />);
  return exampleFilter;
}

describe('course card', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows the course as identity and both lesson ends on the card', () => {
    renderCard();

    expect(screen.getByText('LearnCraft Spanish')).toBeInTheDocument();
    expect(screen.getByLabelText('From lesson')).toHaveValue(
      'Lesson 1 — from the start',
    );
    expect(screen.getByLabelText('Up to lesson')).toHaveValue('Lesson 8');
    expect(
      screen.queryByRole('button', { name: /advanced settings/i }),
    ).not.toBeInTheDocument();
  });

  it('keeps the course dropdown behind the change action', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter();
    renderCard(exampleFilter);

    expect(screen.queryByLabelText('Course')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Change course' }));
    await user.selectOptions(screen.getByLabelText('Course'), '3');

    expect(exampleFilter.updateUserSelectedCourseId).toHaveBeenCalledWith(3);
  });

  it('sets the from-lesson by typing to filter', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter();
    renderCard(exampleFilter);

    await user.click(screen.getByLabelText('From lesson'));
    await user.keyboard('2');

    expect(screen.getAllByRole('option')).toHaveLength(1);
    await user.keyboard('{Enter}');
    expect(exampleFilter.updateFromLessonNumber).toHaveBeenCalledWith(2);
  });

  it('sets the up-to-lesson by typing to filter', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter();
    renderCard(exampleFilter);

    await user.click(screen.getByLabelText('Up to lesson'));
    await user.keyboard('2');
    await user.click(screen.getByRole('option', { name: 'Lesson 2' }));

    expect(exampleFilter.updateToLessonNumber).toHaveBeenCalledWith(2);
  });

  /**
   * Regression coverage for item 8 (v2-redesign-fix-batch-1, Task 7). The
   * gate (`isAdmin === true`) was already correct; a sighting of the toggle
   * was traced to an account-role artifact (student-admin fixtures /
   * `authAdapter.mock.ts` defaulting `isAdmin: true`), not a code leak. This
   * pins what a student-role account actually sees so the gate cannot
   * silently regress. Do not change the gate to "fix" this test.
   */
  it('hides the unpublished-lessons toggle for a student-role account', () => {
    renderCard(createFilter({ isAdmin: false }));

    expect(screen.queryByText('Admin only')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Include unpublished lessons'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('switch', { name: 'Include unpublished lessons' }),
    ).not.toBeInTheDocument();
  });

  it('shows and wires the unpublished-lessons toggle for an admin account', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter({ isAdmin: true });
    renderCard(exampleFilter);

    expect(screen.getByText('Admin only')).toBeInTheDocument();
    const toggle = screen.getByRole('switch', {
      name: 'Include unpublished lessons',
    });
    expect(toggle).toBeInTheDocument();

    await user.click(toggle);

    expect(exampleFilter.updateIncludeUnpublished).toHaveBeenCalledWith(true);
  });
});
