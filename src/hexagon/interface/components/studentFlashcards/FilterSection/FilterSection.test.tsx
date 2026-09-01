import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { CourseWithLessons, SkillTag } from '@learncraft-spanish/shared';
import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import cardStyles from '@interface/components/general/Card/Card.module.scss';
import popoverStyles from '@interface/components/general/Popover/Popover.module.scss';
import { FilterSection } from '@interface/components/studentFlashcards/FilterSection/FilterSection';
import suggestionStyles from '@interface/components/tagFilter/TagSuggestionList/TagSuggestionList.module.scss';
import { PartOfSpeech, SkillType } from '@learncraft-spanish/shared';
import { cleanup, render, screen, within } from '@testing-library/react';
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
  frequency: 42,
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

function scopeSelectIds(): string[] {
  const grid = document.querySelector(`.${styles.scopeGrid}`);
  expect(grid).not.toBeNull();
  return Array.from(grid!.querySelectorAll('select')).map((el) => el.id);
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
    expect(screen.getByLabelText('From lesson')).toHaveDisplayValue(
      'Lesson 1 — from the start',
    );
    expect(screen.getByLabelText('Through lesson')).toHaveDisplayValue(
      'Lesson 8',
    );
    expect(scopeSelectIds()).toEqual([
      'finder-course',
      'finder-from-lesson',
      'finder-to-lesson',
    ]);
    expect(
      screen.queryByRole('switch', { name: 'Set a starting lesson' }),
    ).not.toBeInTheDocument();
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
    const searchTab = screen.getByRole('tab', { name: 'Search tags' });
    const presetsTab = screen.getByRole('tab', { name: 'Presets' });
    expect(searchTab).toHaveAttribute('aria-selected', 'true');
    expect(presetsTab).toHaveAttribute('aria-selected', 'false');
    expect(searchTab).toHaveClass(styles.modeTabOn);
    expect(presetsTab).not.toHaveClass(styles.modeTabOn);
    expect(searchTab.closest(`.${styles.modeTabs}`)).not.toBeNull();
    expect(
      screen.queryByRole('button', { name: /Ser\/Estar/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'No tags applied. Results cover every flashcard in the lesson range.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('One click applies a saved group of tags.'),
    ).not.toBeInTheDocument();
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
      screen.getByLabelText('From lesson').querySelectorAll('option'),
    ).toHaveLength(0);
    expect(
      screen.getByLabelText('Through lesson').querySelectorAll('option'),
    ).toHaveLength(0);
    expect(scopeSelectIds()).toEqual([
      'finder-course',
      'finder-from-lesson',
      'finder-to-lesson',
    ]);
    expect(
      screen.queryByRole('switch', { name: 'Set a starting lesson' }),
    ).not.toBeInTheDocument();
  });

  it('renders an empty from-lesson select when the course has no lessons', () => {
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

    expect(
      screen.getByLabelText('From lesson').querySelectorAll('option'),
    ).toHaveLength(0);
  });

  it('calls onResetAll without a starting-lesson toggle', async () => {
    const user = userEvent.setup();
    const onResetAll = vi.fn<() => void>();
    const exampleFilter = createFilter({ fromLessonNumber: 8 });
    renderSection(exampleFilter, onResetAll);

    expect(screen.getByLabelText('From lesson')).toHaveDisplayValue('Lesson 8');

    await user.click(screen.getByRole('button', { name: 'Reset all filters' }));

    expect(onResetAll).toHaveBeenCalledOnce();
    expect(screen.getByLabelText('From lesson')).toBeInTheDocument();
    expect(
      screen.queryByRole('switch', { name: 'Set a starting lesson' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Search tags' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
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

  it('updates the from-lesson select', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter();
    renderSection(exampleFilter);

    const fromLesson = screen.getByLabelText('From lesson');
    expect(fromLesson.tagName).toBe('SELECT');
    await user.selectOptions(fromLesson, '2');

    expect(exampleFilter.updateFromLessonNumber).toHaveBeenCalledWith(2);
  });

  it('marks only the course starting lesson with the from-the-start suffix', () => {
    renderSection();

    const fromLesson = screen.getByLabelText('From lesson');
    expect(
      within(fromLesson).getByRole('option', {
        name: 'Lesson 1 — from the start',
      }),
    ).toBeInTheDocument();
    expect(
      within(fromLesson).getByRole('option', { name: /^Lesson 2$/ }),
    ).toBeInTheDocument();
    expect(
      within(fromLesson).queryByRole('option', {
        name: 'Lesson 2 — from the start',
      }),
    ).not.toBeInTheDocument();
  });

  it('puts the from-the-start suffix on the prerequisite, not lesson 1', () => {
    renderSection(
      createFilter({
        course: postChallengeCourse,
        courseId: postChallengeCourse.id,
        fromLessonNumber: -5001,
        toLessonNumber: 2,
        coursesWithLessons: [postChallengeCourse],
      }),
    );

    const fromLesson = screen.getByLabelText('From lesson');
    expect(fromLesson).toHaveDisplayValue(
      'All si1m Lessons (1-20) — from the start',
    );
    expect(
      within(fromLesson).getByRole('option', {
        name: 'All si1m Lessons (1-20) — from the start',
      }),
    ).toBeInTheDocument();
    expect(
      within(fromLesson).getByRole('option', { name: /^Lesson 1$/ }),
    ).toBeInTheDocument();
    expect(
      within(fromLesson).queryByRole('option', {
        name: 'Lesson 1 — from the start',
      }),
    ).not.toBeInTheDocument();
  });

  it('lists every through-lesson when from is a prerequisite', () => {
    renderSection(
      createFilter({
        course: postChallengeCourse,
        courseId: postChallengeCourse.id,
        fromLessonNumber: -5001,
        toLessonNumber: 2,
        coursesWithLessons: [postChallengeCourse],
      }),
    );

    const throughLesson = screen.getByLabelText('Through lesson');
    expect(
      within(throughLesson).getByRole('option', { name: /^Lesson 1$/ }),
    ).toBeInTheDocument();
    expect(
      within(throughLesson).getByRole('option', { name: /^Lesson 2$/ }),
    ).toBeInTheDocument();
  });

  it('omits regular from-lessons until a through-lesson is chosen', () => {
    renderSection(
      createFilter({
        toLesson: null,
        toLessonNumber: null,
      }),
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

  it('filters from-lessons to those at or before through', () => {
    renderSection(createFilter({ toLessonNumber: 2 }));

    const fromLesson = screen.getByLabelText('From lesson');
    expect(fromLesson).toHaveTextContent('Lesson 1 — from the start');
    expect(fromLesson).toHaveTextContent('Lesson 2');
    expect(fromLesson).not.toHaveTextContent('Lesson 8');
  });

  it('lists every through-lesson when from is unset', () => {
    renderSection(createFilter({ fromLesson: null, fromLessonNumber: null }));

    expect(
      within(screen.getByLabelText('Through lesson')).getByRole('option', {
        name: /^Lesson 1$/,
      }),
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
      screen.getByRole('option', { name: 'Essential 500 vocabulary' }),
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

  it('shows vocabulary and verb descriptors and labels vocabulary tags as vocabulary', () => {
    const emptyDescriptorTag: SkillTag = {
      type: SkillType.Vocabulary,
      key: 'Vocabulary-empty',
      name: 'sin',
      descriptor: '   ',
      vocabularyId: 9,
      subcategoryName: 'Prepositions',
      frequency: null,
    };
    const emptyVerbTag: SkillTag = {
      type: SkillType.Verb,
      key: 'Verb-empty',
      name: 'haber',
      verbId: 2,
      verbTags: [],
    };
    const multiVerbTag: SkillTag = {
      type: SkillType.Verb,
      key: 'Verb-multi',
      name: 'Poder',
      verbId: 3,
      verbTags: ['direct and indirect', 'Er', 'irreg: stem change'],
    };

    renderSection(
      createFilter({
        skillTagSearch: {
          tagSearchTerm: 'a',
          tagSuggestions: [
            vocabularyTag,
            frequencyTag,
            idiomTag,
            subcategoryTag,
            multiVerbTag,
            emptyDescriptorTag,
          ],
          updateTagSearchTerm: vi.fn(),
          removeTagFromSuggestions: vi.fn(),
          addTagBackToSuggestions: vi.fn(),
          isLoading: false,
          error: null,
        },
      }),
    );

    const vocabOption = screen.getByRole('option', { name: 'por vocabulary' });
    expect(vocabOption).toHaveClass(suggestionStyles.suggestionVocabulary);
    expect(vocabOption).toHaveTextContent('for');
    expect(
      vocabOption.querySelector(`.${suggestionStyles.suggestionDescriptor}`),
    ).toHaveTextContent('for');

    const rankedVocab = screen.getByRole('option', {
      name: 'Essential 500 vocabulary',
    });
    expect(rankedVocab).toHaveClass(suggestionStyles.suggestionVocabulary);
    expect(rankedVocab).toHaveTextContent('high frequency');
    // Frequency ranks suggestions; the numeric value and the old "frequency"
    // type label must not appear. Descriptor text may still say "frequency".
    expect(rankedVocab.textContent).not.toContain(
      String(frequencyTag.frequency),
    );
    expect(
      rankedVocab.querySelector(`.${suggestionStyles.suggestionMeta}`),
    ).toHaveTextContent('vocabulary');
    expect(
      screen.queryByRole('option', { name: /Essential 500 frequency/i }),
    ).not.toBeInTheDocument();

    const idiomOption = screen.getByRole('option', {
      name: 'por eso idiom',
    });
    expect(idiomOption).toHaveClass(suggestionStyles.suggestionIdiom);
    expect(
      idiomOption.querySelector(`.${suggestionStyles.suggestionDescriptor}`),
    ).toHaveTextContent('Cluster, Idiom');

    const subcategoryOption = screen.getByRole('option', {
      name: 'Idioms cluster subcategory',
    });
    expect(subcategoryOption).toHaveClass(
      suggestionStyles.suggestionSubcategory,
    );
    expect(
      subcategoryOption.querySelector(
        `.${suggestionStyles.suggestionDescriptor}`,
      ),
    ).toBeNull();

    const verbOption = screen.getByRole('option', {
      name: 'Poder verb',
    });
    expect(verbOption).toHaveClass(suggestionStyles.suggestionVerb);
    expect(
      verbOption.querySelector(`.${suggestionStyles.suggestionDescriptor}`),
    ).toHaveTextContent('direct and indirect - Er - irreg: stem change');

    const blankDescriptorOption = screen.getByRole('option', {
      name: 'sin vocabulary',
    });
    expect(
      blankDescriptorOption.querySelector(
        `.${suggestionStyles.suggestionDescriptor}`,
      ),
    ).toBeNull();

    cleanup();
    renderSection(
      createFilter({
        skillTagSearch: {
          tagSearchTerm: 'hab',
          tagSuggestions: [emptyVerbTag],
          updateTagSearchTerm: vi.fn(),
          removeTagFromSuggestions: vi.fn(),
          addTagBackToSuggestions: vi.fn(),
          isLoading: false,
          error: null,
        },
      }),
    );
    const blankVerbOption = screen.getByRole('option', {
      name: 'haber verb',
    });
    expect(
      blankVerbOption.querySelector(
        `.${suggestionStyles.suggestionDescriptor}`,
      ),
    ).toBeNull();
  });

  it('keeps suggestion order from the search results', () => {
    renderSection(
      createFilter({
        skillTagSearch: {
          tagSearchTerm: 'por',
          // Application ranks most-frequent first; FilterSection must not reorder.
          tagSuggestions: [frequencyTag, vocabularyTag, idiomTag],
          updateTagSearchTerm: vi.fn(),
          removeTagFromSuggestions: vi.fn(),
          addTagBackToSuggestions: vi.fn(),
          isLoading: false,
          error: null,
        },
      }),
    );

    const listbox = screen.getByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveAccessibleName('Essential 500 vocabulary');
    expect(options[1]).toHaveAccessibleName('por vocabulary');
    expect(options[2]).toHaveAccessibleName('por eso idiom');
  });

  it('paints the tag sheet outside the unclipped card without stretching it', () => {
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
    expect(card).toHaveClass(cardStyles.unclipped);
    expect(search).toHaveClass(styles.tagSearchOpen);
    expect(card?.contains(search)).toBe(true);
    expect(tagsSection).not.toBeNull();
    expect(card?.contains(tagsSection ?? null)).toBe(true);
    expect(panel).not.toBeNull();
    expect(panel).toHaveClass(popoverStyles.panel);
    expect(card?.getBoundingClientRect().height).toBe(closedHeight);
    expect(search).toHaveClass(styles.tagSearch);
    expect(footer).not.toBeNull();
    expect(card?.contains(footer ?? null)).toBe(true);
  });

  it('labels suggestion categories for every skill type', () => {
    renderSection(
      createFilter({
        skillTagSearch: {
          tagSearchTerm: 'a',
          tagSuggestions: [
            vocabularyTag,
            subcategoryTag,
            verbTag,
            conjugationTag,
            idiomTag,
          ],
          updateTagSearchTerm: vi.fn(),
          removeTagFromSuggestions: vi.fn(),
          addTagBackToSuggestions: vi.fn(),
          isLoading: false,
          error: null,
        },
      }),
    );

    const vocabularyOption = screen.getByRole('option', {
      name: 'por vocabulary',
    });
    const idiomOption = screen.getByRole('option', { name: 'por eso idiom' });
    const subcategoryOption = screen.getByRole('option', {
      name: 'Idioms cluster subcategory',
    });
    const verbOption = screen.getByRole('option', { name: 'ser verb' });
    const conjugationOption = screen.getByRole('option', {
      name: 'Subjunctive present conjugation',
    });

    expect(vocabularyOption).toHaveClass(suggestionStyles.suggestionVocabulary);
    expect(idiomOption).toHaveClass(suggestionStyles.suggestionIdiom);
    expect(subcategoryOption).toHaveClass(
      suggestionStyles.suggestionSubcategory,
    );
    expect(verbOption).toHaveClass(suggestionStyles.suggestionVerb);
    expect(conjugationOption).toHaveClass(
      suggestionStyles.suggestionConjugation,
    );

    // One distinct lowercase label per SkillType — not collapsed/renamed.
    expect(
      vocabularyOption.querySelector(`.${suggestionStyles.suggestionMeta}`),
    ).toHaveTextContent('vocabulary');
    expect(
      idiomOption.querySelector(`.${suggestionStyles.suggestionMeta}`),
    ).toHaveTextContent('idiom');
    expect(
      subcategoryOption.querySelector(`.${suggestionStyles.suggestionMeta}`),
    ).toHaveTextContent('subcategory');
    expect(
      verbOption.querySelector(`.${suggestionStyles.suggestionMeta}`),
    ).toHaveTextContent('verb');
    expect(
      conjugationOption.querySelector(`.${suggestionStyles.suggestionMeta}`),
    ).toHaveTextContent('conjugation');
    expect(screen.getAllByText('vocabulary')).toHaveLength(1);
    expect(screen.getAllByText('idiom')).toHaveLength(1);
    expect(screen.getAllByText('subcategory')).toHaveLength(1);
    expect(screen.getAllByText('verb')).toHaveLength(1);
    expect(screen.getAllByText('conjugation')).toHaveLength(1);
    expect(screen.queryByText('grammar')).not.toBeInTheDocument();
    expect(screen.queryByText('verb form')).not.toBeInTheDocument();
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
      screen.getByPlaceholderText('Search tags — vocabulary, idiom, verb…'),
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

    const chipHost = screen.getByText('por').closest(`.${styles.appliedTag}`);
    expect(
      screen.getByText('por').closest(`.${styles.appliedTags}`),
    ).not.toBeNull();
    expect(chipHost).not.toBeNull();
    expect(chipHost?.querySelector(`.${styles.appliedTagHint}`)).toHaveClass(
      styles.appliedTagHint,
    );
  });

  it('surfaces the shared descriptor on selected tags that have one', () => {
    const multiVerbTag: SkillTag = {
      type: SkillType.Verb,
      key: 'Verb-multi',
      name: 'Poder',
      verbId: 3,
      verbTags: ['direct and indirect', 'Er', 'irreg: stem change'],
    };
    const emptyDescriptorTag: SkillTag = {
      type: SkillType.Vocabulary,
      key: 'Vocabulary-empty',
      name: 'sin',
      descriptor: '   ',
      vocabularyId: 9,
      subcategoryName: 'Prepositions',
      frequency: null,
    };
    const emptyIdiomTag: SkillTag = {
      type: SkillType.Idiom,
      key: 'Idiom-empty',
      name: 'de nada',
      vocabularyId: 99,
      subcategoryName: '  ',
      frequency: null,
    };

    renderSection(
      createFilter({
        selectedSkillTags: [
          vocabularyTag,
          multiVerbTag,
          idiomTag,
          subcategoryTag,
          conjugationTag,
          emptyDescriptorTag,
          emptyIdiomTag,
        ],
      }),
    );

    const vocabChip = screen
      .getByRole('button', { name: 'Remove por' })
      .closest(`.${styles.appliedTag}`);
    expect(vocabChip).not.toBeNull();
    const vocabHint = vocabChip?.querySelector(`.${styles.appliedTagHint}`);
    expect(vocabHint).toHaveTextContent('for');
    expect(vocabHint).toHaveAttribute('aria-hidden', 'true');

    const verbChip = screen
      .getByRole('button', { name: 'Remove Poder' })
      .closest(`.${styles.appliedTag}`);
    expect(
      verbChip?.querySelector(`.${styles.appliedTagHint}`),
    ).toHaveTextContent('direct and indirect - Er - irreg: stem change');

    const idiomChip = screen
      .getByRole('button', { name: 'Remove por eso' })
      .closest(`.${styles.appliedTag}`);
    expect(
      idiomChip?.querySelector(`.${styles.appliedTagHint}`),
    ).toHaveTextContent('Cluster, Idiom');

    const subcategoryChip = screen
      .getByRole('button', { name: 'Remove Idioms cluster' })
      .closest(`.${styles.appliedTag}`);
    expect(
      subcategoryChip?.querySelector(`.${styles.appliedTagHint}`),
    ).toBeNull();

    const conjugationChip = screen
      .getByRole('button', { name: 'Remove Subjunctive present' })
      .closest(`.${styles.appliedTag}`);
    expect(
      conjugationChip?.querySelector(`.${styles.appliedTagHint}`),
    ).toBeNull();

    const blankVocabChip = screen
      .getByRole('button', { name: 'Remove sin' })
      .closest(`.${styles.appliedTag}`);
    expect(
      blankVocabChip?.querySelector(`.${styles.appliedTagHint}`),
    ).toBeNull();

    const blankIdiomChip = screen
      .getByRole('button', { name: 'Remove de nada' })
      .closest(`.${styles.appliedTag}`);
    expect(
      blankIdiomChip?.querySelector(`.${styles.appliedTagHint}`),
    ).toBeNull();
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

  it('switches between search tags and presets tabs', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter({
      skillTagSearch: {
        tagSearchTerm: 'por',
        tagSuggestions: [vocabularyTag],
        updateTagSearchTerm: vi.fn(),
        removeTagFromSuggestions: vi.fn(),
        addTagBackToSuggestions: vi.fn(),
        isLoading: false,
        error: null,
      },
    });
    renderSection(exampleFilter);

    expect(
      screen.getByPlaceholderText('Search tags — vocabulary, idiom, verb…'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Presets' }));

    expect(screen.getByRole('tab', { name: 'Presets' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Presets' })).toHaveClass(
      styles.modeTabOn,
    );
    expect(screen.getByRole('tab', { name: 'Search tags' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(
      screen.queryByPlaceholderText('Search tags — vocabulary, idiom, verb…'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('One click applies a saved group of tags.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Ser\/Estar/ }),
    ).toBeInTheDocument();
    expect(
      exampleFilter.skillTagSearch.updateTagSearchTerm,
    ).toHaveBeenCalledWith();

    await user.click(screen.getByRole('tab', { name: 'Search tags' }));

    expect(screen.getByRole('tab', { name: 'Search tags' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByPlaceholderText('Search tags — vocabulary, idiom, verb…'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Ser\/Estar/ }),
    ).not.toBeInTheDocument();
  });

  it('opens on the presets tab when a preset is already applied', () => {
    renderSection(
      createFilter({
        filterPreset: PreSetQuizPreset.SerEstar,
      }),
    );

    expect(screen.getByRole('tab', { name: 'Presets' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Presets' })).toHaveClass(
      styles.modeTabOn,
    );
    expect(
      screen.getByRole('button', { name: /Ser\/Estar/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('Search tags — vocabulary, idiom, verb…'),
    ).not.toBeInTheDocument();
  });

  it('returns to the search tags tab when all filters are reset', async () => {
    const user = userEvent.setup();
    const onResetAll = vi.fn<() => void>();
    renderSection(
      createFilter({
        filterPreset: PreSetQuizPreset.SerEstar,
      }),
      onResetAll,
    );

    await user.click(screen.getByRole('button', { name: 'Reset all filters' }));

    expect(onResetAll).toHaveBeenCalledOnce();
    expect(screen.getByRole('tab', { name: 'Search tags' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByPlaceholderText('Search tags — vocabulary, idiom, verb…'),
    ).toBeInTheDocument();
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
      'Search tags — vocabulary, idiom, verb…',
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
