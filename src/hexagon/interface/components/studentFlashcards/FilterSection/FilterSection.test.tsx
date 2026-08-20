import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { CourseWithLessons, SkillTag } from '@learncraft-spanish/shared';
import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import cardStyles from '@interface/components/general/Card/Card.module.scss';
import popoverStyles from '@interface/components/general/Popover/Popover.module.scss';
import { FilterSection } from '@interface/components/studentFlashcards/FilterSection/FilterSection';
import { PartOfSpeech, SkillType } from '@learncraft-spanish/shared';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './FilterSection.module.scss';

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

const postChallengeCourse: CourseWithLessons = {
  id: 5,
  name: 'Post-Challenge Lessons',
  published: true,
  lessons: [
    { id: 50, lessonNumber: 1, courseName: 'Post-Challenge Lessons' },
    { id: 51, lessonNumber: 2, courseName: 'Post-Challenge Lessons' },
  ],
};

const emptyCourse: CourseWithLessons = {
  id: 99,
  name: 'Empty Course',
  published: true,
  lessons: [],
};

const vocabularyTag: SkillTag = {
  type: SkillType.Vocabulary,
  key: 'Vocabulary-1',
  name: 'por',
  descriptor: 'for',
  vocabularyId: 1,
  subcategoryName: 'Prepositions',
  frequency: null,
};

const frequencyTag: SkillTag = {
  type: SkillType.Vocabulary,
  key: 'Vocabulary-500',
  name: 'Essential 500',
  descriptor: 'high frequency',
  vocabularyId: 500,
  subcategoryName: 'Frequency',
  frequency: 1,
};

const idiomTag: SkillTag = {
  type: SkillType.Idiom,
  key: 'Idiom-57',
  name: 'por eso',
  vocabularyId: 57,
  subcategoryName: 'Cluster, Idiom',
  frequency: null,
};

const subcategoryTag: SkillTag = {
  type: SkillType.Subcategory,
  key: 'Subcategory-49',
  name: 'Idioms',
  subcategoryId: 49,
  partOfSpeech: PartOfSpeech.Noun,
  subcategory: 'Idioms cluster',
};

const verbTag: SkillTag = {
  type: SkillType.Verb,
  key: 'Verb-1',
  name: 'ser',
  verbId: 1,
  verbTags: ['copula'],
};

const conjugationTag: SkillTag = {
  type: SkillType.Conjugation,
  key: 'Conjugation-Subjunctive present',
  name: 'Subjunctive present',
};

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

function renderSection(
  exampleFilter: UseCombinedFiltersReturnType = createFilter(),
  onResetAll?: () => void,
): UseCombinedFiltersReturnType {
  render(
    <FilterSection exampleFilter={exampleFilter} onResetAll={onResetAll} />,
  );
  return exampleFilter;
}

function fromLessonPlate(): HTMLElement {
  const plate = document.querySelector(`.${styles.fromLessonPlate}`);
  expect(plate).not.toBeNull();
  return plate as HTMLElement;
}

describe('filter section', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the scope header, real courses, and options footer', () => {
    renderSection();

    expect(
      screen.getByRole('heading', { name: 'Scope · required' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reset all filters' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Course')).toHaveDisplayValue(
      'LearnCraft Spanish',
    );
    expect(
      screen.getByRole('option', { name: 'Essential Spanish' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Through lesson')).toHaveDisplayValue(
      'Lesson 8',
    );
    const fromLesson = fromLessonPlate();
    expect(fromLesson.tagName).toBe('DIV');
    expect(fromLesson).toHaveTextContent('Lesson 1 — from the start');
    expect(fromLesson).not.toHaveAttribute('tabindex');
    expect(fromLesson.closest(`.${styles.fromLesson}`)).not.toBeNull();
    expect(
      screen.queryByDisplayValue('Lesson 1 — from the start'),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText('From lesson')).not.toBeInTheDocument();
    expect(
      screen
        .getByRole('button', { name: 'Reset all filters' })
        .closest(`.${styles.inlineAction}`),
    ).not.toBeNull();
    expect(
      screen.getByRole('heading', { name: 'Scope · required' }).className,
    ).toMatch(/regular/);
    expect(
      screen.getByRole('heading', { name: 'Scope · required' }).className,
    ).toMatch(/leadingBody/);
    expect(screen.getByRole('heading', { name: 'Tags' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tags' }).className).toMatch(
      /regular/,
    );
    expect(screen.getByRole('heading', { name: 'Tags' }).className).toMatch(
      /leadingBody/,
    );
    expect(screen.getByText('Presets').className).toMatch(/regular/);
    expect(screen.getByText('Presets').className).toMatch(/leadingBody/);
    expect(
      screen.getByText(
        'No tags applied. Results cover every flashcard in the lesson range.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('One click applies a saved group of tags.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'Exclude Spanglish' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'Audio flashcards only' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/any of these tags/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/all of these tags/i)).not.toBeInTheDocument();
  });

  it('falls back to the selected course when the catalog is missing', () => {
    renderSection(createFilter({ coursesWithLessons: undefined }));

    expect(screen.getByLabelText('Course')).toHaveDisplayValue(
      'LearnCraft Spanish',
    );
    expect(
      screen.queryByRole('option', { name: 'Essential Spanish' }),
    ).not.toBeInTheDocument();
  });

  it('falls back to the selected course when the catalog is empty', () => {
    renderSection(createFilter({ coursesWithLessons: [] }));

    expect(screen.getByLabelText('Course')).toHaveDisplayValue(
      'LearnCraft Spanish',
    );
  });

  it('renders empty course and lesson controls when nothing is selected', () => {
    renderSection(
      createFilter({
        course: null,
        courseId: null,
        fromLesson: null,
        fromLessonNumber: null,
        toLesson: null,
        toLessonNumber: null,
        coursesWithLessons: [],
      }),
    );

    expect(screen.getByLabelText('Course')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Course').querySelectorAll('option'),
    ).toHaveLength(0);
    expect(
      screen.getByLabelText('Through lesson').querySelectorAll('option'),
    ).toHaveLength(0);
    expect(fromLessonPlate()).toHaveTextContent('');
  });

  it('opens an empty from-lesson select when there is no course', async () => {
    const user = userEvent.setup();
    renderSection(
      createFilter({
        course: null,
        courseId: null,
        fromLesson: null,
        fromLessonNumber: null,
        toLesson: null,
        toLessonNumber: null,
        coursesWithLessons: [],
      }),
    );

    await user.click(
      screen.getByRole('switch', { name: 'Set a starting lesson' }),
    );

    expect(
      screen.getByLabelText('From lesson').querySelectorAll('option'),
    ).toHaveLength(0);

    await user.click(
      screen.getByRole('switch', { name: 'Set a starting lesson' }),
    );

    expect(fromLessonPlate()).toHaveTextContent('');
    expect(screen.queryByLabelText('From lesson')).not.toBeInTheDocument();
  });

  it('shows a blank from-lesson readout when the course has no lessons', () => {
    renderSection(
      createFilter({
        course: emptyCourse,
        courseId: emptyCourse.id,
        fromLesson: null,
        fromLessonNumber: null,
        toLesson: null,
        toLessonNumber: null,
        coursesWithLessons: [emptyCourse],
      }),
    );

    expect(fromLessonPlate()).toHaveTextContent('');
  });

  it('calls onResetAll and restores the from-lesson readout', async () => {
    const user = userEvent.setup();
    const onResetAll = vi.fn<() => void>();
    const exampleFilter = createFilter({ fromLessonNumber: 8 });
    renderSection(exampleFilter, onResetAll);

    expect(screen.getByLabelText('From lesson')).toHaveDisplayValue('Lesson 8');

    await user.click(screen.getByRole('button', { name: 'Reset all filters' }));

    expect(onResetAll).toHaveBeenCalledOnce();
    expect(fromLessonPlate()).toHaveTextContent('Lesson 1 — from the start');
    expect(screen.queryByLabelText('From lesson')).not.toBeInTheDocument();
  });

  it('does not throw when Reset is clicked without onResetAll', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByRole('button', { name: 'Reset all filters' }));

    expect(
      screen.getByRole('button', { name: 'Reset all filters' }),
    ).toBeInTheDocument();
  });

  it('hides the admin strip for non-admins', () => {
    renderSection();

    expect(screen.queryByText('Admin only')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('switch', {
        name: 'Include unpublished courses and lessons',
      }),
    ).not.toBeInTheDocument();
  });

  it('marks the admin-only badge inside the admin strip', () => {
    renderSection(createFilter({ isAdmin: true }));

    expect(
      screen.getByText('Admin only').closest(`.${styles.adminStrip}`),
    ).not.toBeNull();
  });

  it('lets an admin include unpublished courses and lessons', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter({ isAdmin: true });
    renderSection(exampleFilter);

    await user.click(
      screen.getByRole('switch', {
        name: 'Include unpublished courses and lessons',
      }),
    );

    expect(exampleFilter.updateIncludeUnpublished).toHaveBeenCalledWith(true);
  });

  it('updates the selected course', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter();
    renderSection(exampleFilter);

    await user.selectOptions(screen.getByLabelText('Course'), '3');

    expect(exampleFilter.updateUserSelectedCourseId).toHaveBeenCalledWith(3);
  });

  it('updates the through-lesson with the emphasized control', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter();
    renderSection(exampleFilter);

    await user.selectOptions(screen.getByLabelText('Through lesson'), '2');

    expect(exampleFilter.updateToLessonNumber).toHaveBeenCalledWith(2);
  });

  it('turns the from-lesson readout into a live select', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter();
    renderSection(exampleFilter);

    await user.click(
      screen.getByRole('switch', { name: 'Set a starting lesson' }),
    );

    const fromLesson = screen.getByLabelText('From lesson');
    expect(fromLesson.tagName).toBe('SELECT');
    await user.selectOptions(fromLesson, '2');

    expect(exampleFilter.updateFromLessonNumber).toHaveBeenCalledWith(2);
  });

  it('resets from-lesson to the start when the toggle is turned off', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter({ fromLessonNumber: 8 });
    renderSection(exampleFilter);

    await user.click(
      screen.getByRole('switch', { name: 'Set a starting lesson' }),
    );

    expect(exampleFilter.updateFromLessonNumber).toHaveBeenCalledWith(1);
    expect(fromLessonPlate()).toHaveTextContent('Lesson 1 — from the start');
    expect(screen.queryByLabelText('From lesson')).not.toBeInTheDocument();
  });

  it('uses the prerequisite as the from-the-start readout', () => {
    renderSection(
      createFilter({
        course: postChallengeCourse,
        courseId: postChallengeCourse.id,
        fromLessonNumber: -5001,
        toLessonNumber: 2,
        coursesWithLessons: [postChallengeCourse],
      }),
    );

    expect(fromLessonPlate()).toHaveTextContent(
      'All si1m Lessons (1-20) — from the start',
    );
    expect(screen.queryByLabelText('From lesson')).not.toBeInTheDocument();
  });

  it('lists every through-lesson when from is a prerequisite', async () => {
    const user = userEvent.setup();
    renderSection(
      createFilter({
        course: postChallengeCourse,
        courseId: postChallengeCourse.id,
        fromLessonNumber: -5001,
        toLessonNumber: 2,
        coursesWithLessons: [postChallengeCourse],
      }),
    );

    await user.click(
      screen.getByRole('switch', { name: 'Set a starting lesson' }),
    );

    expect(
      screen.getByRole('option', { name: 'All si1m Lessons (1-20)' }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('option', { name: 'Lesson 1' }).length,
    ).toBeGreaterThan(0);
  });

  it('omits regular from-lessons until a through-lesson is chosen', async () => {
    const user = userEvent.setup();
    renderSection(
      createFilter({
        toLesson: null,
        toLessonNumber: null,
      }),
    );

    await user.click(
      screen.getByRole('switch', { name: 'Set a starting lesson' }),
    );

    const fromLesson = screen.getByLabelText('From lesson');
    expect(fromLesson).not.toHaveTextContent('Lesson 8');
  });

  it('filters through-lessons to those at or after from', () => {
    renderSection(createFilter({ fromLessonNumber: 8 }));

    const throughLesson = screen.getByLabelText('Through lesson');
    expect(throughLesson).not.toHaveTextContent('Lesson 1');
    expect(throughLesson).toHaveTextContent('Lesson 8');
  });

  it('lists every through-lesson when from is unset', () => {
    renderSection(createFilter({ fromLesson: null, fromLessonNumber: null }));

    expect(
      screen.getByRole('option', { name: 'Lesson 1' }),
    ).toBeInTheDocument();
  });

  it('searches tags and adds a suggestion', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter({
      skillTagSearch: {
        tagSearchTerm: 'por',
        tagSuggestions: [vocabularyTag, frequencyTag, idiomTag],
        updateTagSearchTerm: vi.fn(),
        removeTagFromSuggestions: vi.fn(),
        addTagBackToSuggestions: vi.fn(),
        isLoading: false,
        error: null,
      },
    });
    renderSection(exampleFilter);

    expect(
      screen.getByRole('option', { name: 'por vocabulary' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Essential 500 frequency' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'por vocabulary' }));

    expect(exampleFilter.addSkillTagToFilters).toHaveBeenCalledWith(
      vocabularyTag.key,
    );
    expect(
      exampleFilter.skillTagSearch.removeTagFromSuggestions,
    ).toHaveBeenCalledWith(vocabularyTag.key);
    expect(
      exampleFilter.skillTagSearch.updateTagSearchTerm,
    ).toHaveBeenCalledWith();
  });

  it('overlays a six-row tag sheet without stretching the clipped card', () => {
    const extras: SkillTag[] = Array.from({ length: 6 }, (_, index) => ({
      type: SkillType.Conjugation,
      key: `Conjugation-open-${index}`,
      name: `Form ${index}`,
    }));

    const { unmount } = render(
      <FilterSection exampleFilter={createFilter()} />,
    );
    const closedCard = document.querySelector(`.${cardStyles.card}`);
    expect(closedCard).not.toBeNull();
    const closedHeight = (closedCard as HTMLElement).getBoundingClientRect()
      .height;
    unmount();

    renderSection(
      createFilter({
        skillTagSearch: {
          tagSearchTerm: 'form',
          tagSuggestions: extras,
          updateTagSearchTerm: vi.fn(),
          removeTagFromSuggestions: vi.fn(),
          addTagBackToSuggestions: vi.fn(),
          isLoading: false,
          error: null,
        },
      }),
    );

    const options = screen.getAllByRole('option', { name: /Form / });
    const option = options[0];
    const card = option?.closest(`.${cardStyles.card}`);
    const search = option?.closest(`.${styles.tagSearch}`);
    const panel = search?.querySelector(':scope > div > div:last-child');
    const tagsSection = search?.parentElement;
    const footer = card?.querySelector(`.${cardStyles.footerStrip}`);
    expect(options).toHaveLength(6);
    expect(card).not.toBeNull();
    expect(card).not.toHaveClass(cardStyles.unclipped);
    expect(search).toHaveClass(styles.tagSearchOpen);
    expect(card?.contains(search)).toBe(true);
    expect(tagsSection).not.toBeNull();
    expect(card?.contains(tagsSection)).toBe(true);
    expect(panel).not.toBeNull();
    expect(panel).toHaveClass(popoverStyles.panel);
    expect(card?.getBoundingClientRect().height).toBe(closedHeight);
    expect(search).toHaveClass(styles.tagSearch);
    expect(footer).not.toBeNull();
    expect(card?.contains(footer)).toBe(true);
  });

  it('labels suggestion categories for every skill type', () => {
    renderSection(
      createFilter({
        skillTagSearch: {
          tagSearchTerm: 'a',
          tagSuggestions: [subcategoryTag, verbTag, conjugationTag, idiomTag],
          updateTagSearchTerm: vi.fn(),
          removeTagFromSuggestions: vi.fn(),
          addTagBackToSuggestions: vi.fn(),
          isLoading: false,
          error: null,
        },
      }),
    );

    expect(
      screen.getByRole('option', { name: /Idioms cluster/ }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('grammar')).toHaveLength(1);
    expect(screen.getAllByText('verb form')).toHaveLength(2);
    expect(screen.getByText('vocabulary')).toBeInTheDocument();
  });

  it('caps suggestions at six and hides tags that are already applied', () => {
    const extras: SkillTag[] = Array.from({ length: 8 }, (_, index) => ({
      type: SkillType.Conjugation,
      key: `Conjugation-${index}`,
      name: `Form ${index}`,
    }));
    renderSection(
      createFilter({
        selectedSkillTags: [extras[0]],
        skillTagSearch: {
          tagSearchTerm: 'form',
          tagSuggestions: extras,
          updateTagSearchTerm: vi.fn(),
          removeTagFromSuggestions: vi.fn(),
          addTagBackToSuggestions: vi.fn(),
          isLoading: false,
          error: null,
        },
      }),
    );

    expect(screen.getAllByRole('option', { name: /Form / })).toHaveLength(6);
    expect(
      screen.queryByRole('option', { name: /Form 0/ }),
    ).not.toBeInTheDocument();
  });

  it('says when no tags match the query', () => {
    renderSection(
      createFilter({
        skillTagSearch: {
          tagSearchTerm: 'zzzz',
          tagSuggestions: [],
          updateTagSearchTerm: vi.fn(),
          removeTagFromSuggestions: vi.fn(),
          addTagBackToSuggestions: vi.fn(),
          isLoading: false,
          error: null,
        },
      }),
    );

    expect(screen.getByText('No tags match that.')).toBeInTheDocument();
  });

  it('forwards tag search keystrokes and dismisses the popover', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter({
      skillTagSearch: {
        tagSearchTerm: 've',
        tagSuggestions: [verbTag],
        updateTagSearchTerm: vi.fn(),
        removeTagFromSuggestions: vi.fn(),
        addTagBackToSuggestions: vi.fn(),
        isLoading: false,
        error: null,
      },
    });
    renderSection(exampleFilter);

    await user.type(
      screen.getByPlaceholderText(
        'Search tags — grammar, vocabulary, verb form…',
      ),
      'r',
    );
    expect(exampleFilter.skillTagSearch.updateTagSearchTerm).toHaveBeenCalled();

    await user.keyboard('{Escape}');
    expect(
      exampleFilter.skillTagSearch.updateTagSearchTerm,
    ).toHaveBeenCalledWith();
  });

  it('renders applied tags as compact filter tokens', () => {
    renderSection(
      createFilter({
        selectedSkillTags: [vocabularyTag],
      }),
    );

    expect(
      screen.getByText('por').closest(`.${styles.appliedTags}`),
    ).not.toBeNull();
  });

  it('clears a single applied tag and the full set', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter({
      selectedSkillTags: [vocabularyTag, subcategoryTag],
    });
    renderSection(exampleFilter);

    const clearTags = screen.getByRole('button', { name: 'Clear 2 tags' });
    expect(clearTags.closest(`.${styles.inlineAction}`)).not.toBeNull();
    expect(clearTags).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove por' }));
    expect(exampleFilter.removeSkillTagFromFilters).toHaveBeenCalledWith(
      vocabularyTag.key,
    );
    expect(
      exampleFilter.skillTagSearch.addTagBackToSuggestions,
    ).toHaveBeenCalledWith(vocabularyTag.key);

    await user.click(screen.getByRole('button', { name: 'Clear 2 tags' }));
    expect(exampleFilter.bulkUpdateSkillTagKeys).toHaveBeenCalledWith([]);
    expect(
      exampleFilter.skillTagSearch.addTagBackToSuggestions,
    ).toHaveBeenCalledWith(subcategoryTag.key);
  });

  it('applies a preset and clears it when it is already on', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter({
      filterPreset: PreSetQuizPreset.SerEstar,
    });
    renderSection(exampleFilter);

    const serEstar = screen.getByRole('button', { name: /Ser\/Estar/ });
    expect(serEstar).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('1 tag')).toBeInTheDocument();

    await user.click(serEstar);
    expect(exampleFilter.setFilterPreset).toHaveBeenCalledWith(
      PreSetQuizPreset.None,
    );

    await user.click(screen.getByRole('button', { name: /Subjunctives/ }));
    expect(exampleFilter.setFilterPreset).toHaveBeenCalledWith(
      PreSetQuizPreset.Subjunctives,
    );
  });

  it('toggles exclude-Spanglish and audio-only', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter();
    renderSection(exampleFilter);

    await user.click(screen.getByRole('switch', { name: 'Exclude Spanglish' }));
    expect(exampleFilter.updateExcludeSpanglish).toHaveBeenCalledWith(true);

    await user.click(
      screen.getByRole('switch', { name: 'Audio flashcards only' }),
    );
    expect(exampleFilter.updateAudioOnly).toHaveBeenCalledWith(true);
  });

  it('forwards tag search keystrokes to the existing updater', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter();
    renderSection(exampleFilter);

    const tagSearch = screen.getByPlaceholderText(
      'Search tags — grammar, vocabulary, verb form…',
    );
    expect(tagSearch.closest(`.${styles.tagSearch}`)).not.toHaveClass(
      styles.tagSearchOpen,
    );

    await user.type(tagSearch, 'a');

    expect(
      exampleFilter.skillTagSearch.updateTagSearchTerm,
    ).toHaveBeenCalledWith(expect.objectContaining({ value: 'a' }));
  });
});
