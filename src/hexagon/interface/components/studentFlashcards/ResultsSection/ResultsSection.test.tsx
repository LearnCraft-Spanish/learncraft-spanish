import type { PaginationState } from '@application/units/Pagination/usePagination';
import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { ResultsSectionProps } from '@interface/components/studentFlashcards/ResultsSection/ResultsSection';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { ContextualMenuProvider } from '@composition/providers/ContextualMenuProvider';
import chipStyles from '@interface/components/general/Chip/Chip.module.scss';
import styles from '@interface/components/general/DataTable/DataTable.module.scss';
import paginationStyles from '@interface/components/general/PaginationV2/PaginationV2.module.scss';
import skeletonStyles from '@interface/components/general/Skeleton/Skeleton.module.scss';
import {
  formatRangeLabel,
  ResultsSection,
  toResultsPagination,
} from '@interface/components/studentFlashcards/ResultsSection/ResultsSection';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { createMockVocabulary } from '@testing/factories/vocabularyFactories';
import { afterEach, describe, expect, it, vi } from 'vitest';
import resultsStyles from './ResultsSection.module.scss';

function makePagination(
  overrides: Partial<QueryPaginationState> = {},
): QueryPaginationState {
  return {
    page: 1,
    queryPage: 1,
    pageSize: 25,
    pagesPerQuery: 6,
    pageWithinQueryBatch: 0,
    maxPageNumber: 1,
    maxPageName: '1',
    nextPage: vi.fn(),
    previousPage: vi.fn(),
    goToPage: vi.fn(),
    resetPagination: vi.fn(),
    ...overrides,
  };
}

function makeFlashcards(
  overrides: Partial<UseStudentFlashcardsReturn> = {},
): UseStudentFlashcardsReturn {
  return {
    flashcards: undefined,
    flashcardsDueForReview: undefined,
    customFlashcards: undefined,
    customFlashcardsDueForReview: undefined,
    audioFlashcards: undefined,
    collectedExamples: undefined,
    getRandomFlashcards: vi.fn(() => []),
    isFlashcardCollected: vi.fn(() => false),
    isExampleCollected: vi.fn(() => false),
    isCustomFlashcard: vi.fn(() => false),
    isAddingFlashcard: vi.fn(() => false),
    isRemovingFlashcard: vi.fn(() => false),
    isPendingFlashcard: vi.fn(() => false),
    isLoading: false,
    error: null,
    createFlashcards: vi.fn(async () => []),
    deleteFlashcards: vi.fn(async () => 0),
    updateFlashcards: vi.fn(async () => []),
    updateFlashcardInterval: vi.fn(async () => 1),
    getFlashcardByExampleId: vi.fn(() => undefined),
    ...overrides,
  };
}

function makeExample(
  overrides: Partial<ExampleWithVocabulary> = {},
): ExampleWithVocabulary {
  const vocab = createMockVocabulary({
    word: 'eso',
    spellings: ['eso'],
  });
  return {
    ...createMockExampleWithVocabularyList(1, {
      spanish: 'No quiero eso aquí.',
      english: "I don't want that here.",
      spanishAudio: 'https://cdn.example.com/es.mp3',
      englishAudio: 'https://cdn.example.com/en.mp3',
      spanglish: false,
      vocabulary: [vocab],
    })[0],
    ...overrides,
  };
}

const emptyLessonPopup: LessonPopup = {
  lessonsByVocabulary: [],
  lessonsLoading: false,
};

/**
 * Row controls are named after the sentence the row shows, so every query goes
 * through the default `makeExample` text rather than an opaque id.
 */
const SELECT_LABEL = 'Select No quiero eso aquí.';
const EXPAND_LABEL = 'Expand row: No quiero eso aquí.';
const COLLAPSE_LABEL = 'Collapse row: No quiero eso aquí.';

function renderSection(
  overrides: Partial<ResultsSectionProps> = {},
): ReturnType<typeof render> {
  const examples = overrides.examples ?? [makeExample({ id: 11 })];
  return render(
    <ContextualMenuProvider>
      <ResultsSection
        examples={examples}
        totalCount={overrides.totalCount ?? examples.length}
        studentFlashcards={overrides.studentFlashcards ?? makeFlashcards()}
        pagination={overrides.pagination ?? makePagination()}
        totalPages={
          overrides.totalPages !== undefined ? overrides.totalPages : 1
        }
        lessonPopup={overrides.lessonPopup ?? emptyLessonPopup}
        filteredExamplesLoading={overrides.filteredExamplesLoading ?? false}
        firstPageLoading={overrides.firstPageLoading ?? false}
        newPageLoading={overrides.newPageLoading ?? false}
        isAdmin={overrides.isAdmin}
        onNotice={overrides.onNotice}
        onApplyFilters={overrides.onApplyFilters}
        onCreateQuiz={overrides.onCreateQuiz}
        onCopyPage={overrides.onCopyPage}
        onCopyAll={overrides.onCopyAll}
        selectedIds={overrides.selectedIds}
        onSelectionChange={overrides.onSelectionChange}
        resetEpoch={overrides.resetEpoch}
        countLabel={overrides.countLabel}
        rangeNoun={overrides.rangeNoun}
        caption={overrides.caption}
        emptyTitle={overrides.emptyTitle}
        emptyGuidance={overrides.emptyGuidance}
        emptyIcon={overrides.emptyIcon}
        actionsMenu={overrides.actionsMenu}
        rowAction={overrides.rowAction}
        getReviewSchedule={overrides.getReviewSchedule}
        mobileLayout={overrides.mobileLayout}
        focusRequest={overrides.focusRequest}
      />
    </ContextualMenuProvider>,
  );
}

describe('toResultsPagination', () => {
  it('renames the sliced-list page so the section can take either unit', () => {
    const goToPage = vi.fn<(page: number) => void>();
    const managerPagination: PaginationState = {
      totalItems: 140,
      pageNumber: 3,
      maxPageNumber: 6,
      startIndex: 50,
      endIndex: 75,
      pageSize: 25,
      isOnFirstPage: false,
      isOnLastPage: false,
      previousPage: vi.fn<() => void>(),
      nextPage: vi.fn<() => void>(),
      goToFirstPage: vi.fn<() => void>(),
      goToPage,
    };

    const pagination = toResultsPagination(managerPagination);

    expect(pagination.page).toBe(3);
    expect(pagination.pageSize).toBe(25);
    expect(pagination.maxPageNumber).toBe(6);

    pagination.goToPage(4);

    expect(goToPage).toHaveBeenCalledWith(4);
  });
});

describe('formatRangeLabel', () => {
  it('reports no matches when the set is empty', () => {
    expect(formatRangeLabel(1, 25, 0)).toBe('No matches');
  });

  it('uses the current page and page size, not the prototype page of 5', () => {
    expect(formatRangeLabel(1, 25, 40)).toBe('Showing 1–25 of 40 matches');
    expect(formatRangeLabel(2, 25, 40)).toBe('Showing 26–40 of 40 matches');
  });

  it('counts the noun it is given instead of hardcoding matches', () => {
    expect(formatRangeLabel(1, 25, 0, 'flashcards')).toBe('No flashcards');
    expect(formatRangeLabel(1, 25, 32, 'flashcards')).toBe(
      'Showing 1–25 of 32 flashcards',
    );
    expect(formatRangeLabel(2, 25, 32, 'flashcards')).toBe(
      'Showing 26–32 of 32 flashcards',
    );
  });
});

describe('results section', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('shows the match count and table headers without a lesson column', () => {
    renderSection({ totalCount: 6 });

    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('flashcards match')).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Spanish' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'English' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('columnheader', { name: /lesson/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('table').parentElement).toHaveClass(
      resultsStyles.tableCard,
    );
    expect(
      screen
        .getByRole('columnheader', { name: 'Spanish' })
        .closest(`.${resultsStyles.tableCard}`),
    ).not.toBeNull();
  });

  it('sizes Select all as the 40px owned-flashcards ghost, not gallery inline', () => {
    renderSection({
      examples: [makeExample({ id: 11 }), makeExample({ id: 12 })],
    });

    expect(
      screen
        .getByRole('button', { name: 'Select all 2' })
        .closest(`.${resultsStyles.selectAll}`),
    ).not.toBeNull();
  });

  it('keeps the desktop four-column grid instead of a stacked mobile layout', () => {
    renderSection();

    const row = screen.getAllByRole('row')[1];

    expect(row.style.getPropertyValue('--dt-columns')).toBe(
      '44px minmax(240px, 1fr) minmax(240px, 1fr) 132px',
    );
    expect(row.style.getPropertyValue('--dt-mobile-columns')).toBe('');
    expect(screen.getByText("I don't want that here.")).not.toHaveClass(
      styles.hiddenOnMobile,
    );
  });

  it('puts the range on the left of the footer and omits PaginationV2 rangeLabel', () => {
    renderSection({
      totalCount: 40,
      pagination: makePagination({ page: 1, pageSize: 25, maxPageNumber: 2 }),
      totalPages: 2,
    });

    expect(screen.getByText('Showing 1–25 of 40 matches')).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Pagination' }),
    ).not.toHaveTextContent('Showing');
  });

  it('selects every row on the current page, then deselects them', async () => {
    const user = userEvent.setup();
    const second = makeExample({
      id: 12,
      spanish: 'Necesito eso para mañana.',
      english: 'I need that for tomorrow.',
    });
    renderSection({ examples: [makeExample({ id: 11 }), second] });

    await user.click(screen.getByRole('button', { name: 'Select all 2' }));

    expect(screen.getAllByRole('row', { selected: true })).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: 'Deselect all' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Deselect all' }));

    expect(
      screen.queryByRole('row', { selected: true }),
    ).not.toBeInTheDocument();
  });

  it('toggles a single row checkbox', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByRole('checkbox', { name: SELECT_LABEL }));

    expect(screen.getAllByRole('row', { selected: true })).toHaveLength(1);
  });

  it('covers the expand panel with the same selected record as the sentence', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByRole('button', { name: EXPAND_LABEL }));
    await user.click(screen.getByRole('checkbox', { name: SELECT_LABEL }));

    const sentence = screen.getByRole('row', { selected: true });
    const tags = screen.getByText('Vocabulary tags');
    const expand = tags.closest('[role="row"]');

    expect(sentence.parentElement).toHaveClass(styles.selectedRecord);
    expect(sentence.parentElement).toContainElement(tags);
    expect(sentence).not.toHaveClass(styles.selected);
    expect(expand).toHaveClass(styles.expandFlush);
  });

  it('paints unavailable pagination as parchment, not a faded outline', () => {
    renderSection({
      totalCount: 40,
      pagination: makePagination({ page: 1, pageSize: 25, maxPageNumber: 2 }),
      totalPages: 2,
    });

    const previous = screen.getByRole('button', { name: 'Previous page' });

    expect(previous).toBeDisabled();
    expect(previous.parentElement).toHaveClass(paginationStyles.parchmentEnd);
  });

  it('collects an example that is not owned', async () => {
    const user = userEvent.setup();
    const studentFlashcards = makeFlashcards();
    renderSection({ studentFlashcards });

    await user.click(screen.getByRole('button', { name: 'Collect' }));

    expect(studentFlashcards.createFlashcards).toHaveBeenCalledWith([
      expect.objectContaining({ id: 11 }),
    ]);
  });

  it('removes an example that is already owned', async () => {
    const user = userEvent.setup();
    const studentFlashcards = makeFlashcards({
      isExampleCollected: vi.fn(() => true),
    });
    renderSection({ studentFlashcards });

    await user.click(screen.getByRole('button', { name: 'Owned' }));

    expect(studentFlashcards.deleteFlashcards).toHaveBeenCalledWith([11]);
  });

  it('expands one row at a time and closes vocabulary detail when collapsing', async () => {
    const user = userEvent.setup();
    const first = makeExample({ id: 11 });
    const second = makeExample({
      id: 12,
      spanish: 'Necesito eso para mañana.',
      english: 'I need that for tomorrow.',
    });
    renderSection({ examples: [first, second] });

    await user.click(screen.getAllByRole('button', { name: EXPAND_LABEL })[0]);

    expect(screen.getByText('Vocabulary tags')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: COLLAPSE_LABEL }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: COLLAPSE_LABEL }));

    expect(screen.queryByText('Vocabulary tags')).not.toBeInTheDocument();
  });

  it('opens vocabulary detail in a popover', async () => {
    const user = userEvent.setup();
    const vocab = createMockVocabulary({
      id: 88,
      word: 'eso',
      spellings: ['eso'],
    });
    renderSection({
      examples: [
        makeExample({
          id: 11,
          vocabulary: [vocab],
        }),
      ],
      lessonPopup: {
        lessonsLoading: false,
        lessonsByVocabulary: [
          { id: 2, courseName: 'Unit 1 · Demonstratives', lessonNumber: 2 },
        ],
      },
    });

    await user.click(screen.getByRole('button', { name: EXPAND_LABEL }));
    await user.click(screen.getByRole('button', { name: 'eso' }));

    expect(screen.getByText('Taught in')).toBeInTheDocument();
    expect(screen.getByText('Lesson 2')).toBeInTheDocument();
    expect(screen.getByText('Unit 1 · Demonstratives')).toBeInTheDocument();
    expect(
      screen.queryByText("Click a tag to see where it's taught."),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'eso' })).toHaveClass(
      chipStyles.selectedNavy,
    );
    expect(screen.getByRole('button', { name: 'eso' })).not.toHaveClass(
      chipStyles.selected,
    );
  });

  it('closes the vocabulary detail when the same chip is clicked again', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByRole('button', { name: EXPAND_LABEL }));
    await user.click(screen.getByRole('button', { name: 'eso' }));
    await user.click(screen.getByRole('button', { name: 'eso' }));

    expect(
      screen.getByText("Click a tag to see where it's taught."),
    ).toBeInTheDocument();
  });

  it('shows special tags and the empty special copy', async () => {
    const user = userEvent.setup();
    const withTags = makeExample({
      id: 11,
      spanglish: true,
      spanishAudio: 'https://cdn.example.com/es.mp3',
    });
    const withoutTags = makeExample({
      id: 12,
      spanish: 'Sí, eso nada rápidamente.',
      english: 'Yes, that swims quickly.',
      spanglish: false,
      spanishAudio: '',
    });
    const studentFlashcards = makeFlashcards({
      isCustomFlashcard: vi.fn(
        ({ exampleId }: { exampleId: number }) => exampleId === 11,
      ),
    });
    renderSection({
      examples: [withTags, withoutTags],
      studentFlashcards,
    });

    await user.click(screen.getByRole('button', { name: EXPAND_LABEL }));

    expect(screen.getByText('Spanglish')).toBeInTheDocument();
    expect(screen.getByText('Audio flashcard')).toBeInTheDocument();
    expect(screen.getByText('Custom flashcard')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'Expand row: Sí, eso nada rápidamente.',
      }),
    );

    expect(
      screen.getByText('No special tags on this flashcard.'),
    ).toBeInTheDocument();
  });

  it('marks a volume icon as playing and stops it on a second click', async () => {
    const user = userEvent.setup();
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue();
    const pause = vi
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => undefined);
    renderSection();

    const spanish = screen.getByRole('button', { name: 'Play Spanish' });
    await user.click(spanish);

    expect(spanish).toHaveAttribute('aria-pressed', 'true');
    expect(play).toHaveBeenCalled();

    await user.click(spanish);

    expect(spanish).toHaveAttribute('aria-pressed', 'false');
    expect(pause).toHaveBeenCalled();

    play.mockRestore();
    pause.mockRestore();
  });

  it('plays English independently and keeps a single active clip', async () => {
    const user = userEvent.setup();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(
      () => undefined,
    );
    renderSection();

    await user.click(screen.getByRole('button', { name: 'Play Spanish' }));
    await user.click(screen.getByRole('button', { name: 'Play English' }));

    expect(
      screen.getByRole('button', { name: 'Play Spanish' }),
    ).toHaveAttribute('aria-pressed', 'false');
    expect(
      screen.getByRole('button', { name: 'Play English' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('steps pagination forward, back, and to an arbitrary page', async () => {
    const user = userEvent.setup();
    const pagination = makePagination({
      page: 2,
      pageSize: 25,
      maxPageNumber: 3,
    });
    renderSection({
      pagination,
      totalPages: 3,
      totalCount: 60,
    });

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(pagination.goToPage).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(pagination.goToPage).toHaveBeenCalledWith(1);

    await user.click(screen.getByRole('button', { name: 'Page 1' }));
    expect(pagination.goToPage).toHaveBeenCalledWith(1);
  });

  it('jumps more than one step with goToPage', async () => {
    const user = userEvent.setup();
    const pagination = makePagination({
      page: 1,
      pageSize: 25,
      maxPageNumber: 3,
    });
    renderSection({
      pagination,
      totalPages: 3,
      totalCount: 60,
    });

    await user.click(screen.getByRole('button', { name: 'Page 3' }));

    expect(pagination.goToPage).toHaveBeenCalledWith(3);
  });

  it('shows the empty state when nothing matches', () => {
    renderSection({ examples: [], totalCount: 0 });

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('flashcards match')).toBeInTheDocument();
    expect(screen.getByText('No flashcards match')).toBeInTheDocument();
    expect(
      screen.getByText('Try removing a tag or widening the lesson range.'),
    ).toBeInTheDocument();
    expect(screen.getByText('No matches')).toBeInTheDocument();
    const glyph = screen
      .getByText('No flashcards match')
      .parentElement?.querySelector('svg');
    expect(glyph).toHaveAttribute('width', '28');
    expect(glyph).toHaveAttribute('height', '28');
  });

  it('shows a skeleton while the first page is loading', () => {
    renderSection({
      examples: [],
      totalCount: 0,
      firstPageLoading: true,
    });

    const status = screen.getByRole('status', { name: 'Loading flashcards' });
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass(skeletonStyles.rows);
    expect(status.children).toHaveLength(5);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.queryByText('flashcards match')).not.toBeInTheDocument();
    expect(screen.queryByText('No matches')).not.toBeInTheDocument();
    expect(screen.queryByText('No flashcards match')).not.toBeInTheDocument();
  });

  it('renders the do-more menu trigger for the overlays slot', () => {
    renderSection({ isAdmin: true });

    expect(
      screen.getByRole('button', { name: 'Do more with these' }),
    ).toBeInTheDocument();
  });

  it('collapses an expanded row when the page of examples changes', async () => {
    const user = userEvent.setup();
    const { rerender } = renderSection({ examples: [makeExample({ id: 11 })] });

    await user.click(screen.getByRole('button', { name: EXPAND_LABEL }));
    expect(screen.getByText('Vocabulary tags')).toBeInTheDocument();

    rerender(
      <ContextualMenuProvider>
        <ResultsSection
          examples={[makeExample({ id: 99, spanish: 'Otro eso.' })]}
          totalCount={1}
          studentFlashcards={makeFlashcards()}
          pagination={makePagination({ page: 2 })}
          totalPages={2}
          lessonPopup={emptyLessonPopup}
          filteredExamplesLoading={false}
          firstPageLoading={false}
          newPageLoading={false}
          isAdmin={false}
        />
      </ContextualMenuProvider>,
    );

    expect(screen.queryByText('Vocabulary tags')).not.toBeInTheDocument();
  });

  it('unchecks a selected row', async () => {
    const user = userEvent.setup();
    renderSection();

    const box = screen.getByRole('checkbox', { name: SELECT_LABEL });
    await user.click(box);
    await user.click(box);

    expect(
      screen.queryByRole('row', { selected: true }),
    ).not.toBeInTheDocument();
  });

  it('does nothing when the current page button is clicked', async () => {
    const user = userEvent.setup();
    const pagination = makePagination({ page: 1, maxPageNumber: 2 });
    renderSection({ pagination, totalPages: 2, totalCount: 40 });

    await user.click(screen.getByRole('button', { name: 'Page 1' }));

    expect(pagination.nextPage).not.toHaveBeenCalled();
    expect(pagination.previousPage).not.toHaveBeenCalled();
    expect(pagination.goToPage).not.toHaveBeenCalled();
    expect(pagination.resetPagination).not.toHaveBeenCalled();
  });

  it('does not show play buttons when the example has no audio links', () => {
    renderSection({
      examples: [
        makeExample({
          spanishAudio: '',
          englishAudio: '',
        }),
      ],
    });

    expect(
      screen.queryByRole('button', { name: 'Play Spanish' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Play English' }),
    ).not.toBeInTheDocument();
  });

  it('clears playing state when audio ends', async () => {
    const user = userEvent.setup();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    renderSection();

    await user.click(screen.getByRole('button', { name: 'Play Spanish' }));
    const audio = document.querySelector('audio');
    if (audio !== null) {
      fireEvent.ended(audio);
    }

    expect(
      screen.getByRole('button', { name: 'Play Spanish' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('forwards a notice from the actions menu', async () => {
    const user = userEvent.setup();
    const onNotice = vi.fn<(message: string) => void>();
    renderSection({ onNotice });

    await user.click(
      screen.getByRole('button', { name: 'Do more with these' }),
    );
    await user.click(
      screen.getByRole('button', {
        name: /Apply these filters to my flashcards/,
      }),
    );

    expect(onNotice).toHaveBeenCalledWith(
      'Filters applied to your flashcards.',
    );
  });

  it('still runs menu actions when no notice handler is passed', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.click(
      screen.getByRole('button', { name: 'Do more with these' }),
    );
    await user.click(
      screen.getByRole('button', {
        name: /Create a quiz from these examples/,
      }),
    );

    expect(
      screen.queryByRole('button', {
        name: /Create a quiz from these examples/,
      }),
    ).not.toBeInTheDocument();
  });

  it('shows a skeleton while filtered examples are loading', () => {
    renderSection({
      examples: [],
      totalCount: 0,
      filteredExamplesLoading: true,
    });

    expect(
      screen.getByRole('status', { name: 'Loading flashcards' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.queryByText('flashcards match')).not.toBeInTheDocument();
    expect(screen.queryByText('No matches')).not.toBeInTheDocument();
    expect(screen.queryByText('No flashcards match')).not.toBeInTheDocument();
  });

  it('falls back to pagination.maxPageNumber when totalPages is unknown', () => {
    renderSection({
      totalPages: null,
      totalCount: 60,
      pagination: makePagination({ maxPageNumber: 3 }),
    });

    expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument();
  });

  it('reports selection changes from a row checkbox and select-all', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn<(ids: ReadonlySet<number>) => void>();
    renderSection({
      examples: [
        makeExample({ id: 11 }),
        makeExample({ id: 12, spanish: 'Necesito eso para mañana.' }),
      ],
      onSelectionChange,
    });

    await user.click(screen.getByRole('checkbox', { name: SELECT_LABEL }));

    expect(onSelectionChange).toHaveBeenCalledWith(new Set([11]));

    await user.click(screen.getByRole('button', { name: 'Select all 2' }));

    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set([11, 12]));
  });

  it('honors a controlled selectedIds set from the parent', () => {
    renderSection({ selectedIds: new Set([11]) });

    expect(screen.getAllByRole('row', { selected: true })).toHaveLength(1);
  });

  it('runs apply, quiz, copy-page, and copy-all menu callbacks', async () => {
    const user = userEvent.setup();
    const onApplyFilters = vi.fn<() => void>();
    const onCreateQuiz = vi.fn<() => void>();
    const onCopyPage = vi.fn<() => void>();
    const onCopyAll = vi.fn<() => void>();
    renderSection({
      isAdmin: true,
      onApplyFilters,
      onCreateQuiz,
      onCopyPage,
      onCopyAll,
    });

    await user.click(
      screen.getByRole('button', { name: 'Do more with these' }),
    );
    await user.click(
      screen.getByRole('button', {
        name: /Apply these filters to my flashcards/,
      }),
    );
    expect(onApplyFilters).toHaveBeenCalledOnce();

    await user.click(
      screen.getByRole('button', { name: 'Do more with these' }),
    );
    await user.click(
      screen.getByRole('button', {
        name: /Create a quiz from these examples/,
      }),
    );
    expect(onCreateQuiz).toHaveBeenCalledOnce();

    await user.click(
      screen.getByRole('button', { name: 'Do more with these' }),
    );
    await user.click(
      screen.getByRole('button', {
        name: /Copy this page of examples/,
      }),
    );
    expect(onCopyPage).toHaveBeenCalledOnce();

    await user.click(
      screen.getByRole('button', { name: 'Do more with these' }),
    );
    await user.click(screen.getByRole('button', { name: /Copy all examples/ }));
    expect(onCopyAll).toHaveBeenCalledOnce();
  });

  it('takes manager copy for the count, caption, and empty state', () => {
    renderSection({
      examples: [],
      totalCount: 0,
      countLabel: 'flashcards in your collection',
      caption: 'Flashcard manager results',
      emptyTitle: 'No flashcards yet',
      emptyGuidance: 'Collect flashcards from the finder to see them here.',
      emptyIcon: 'bookmark',
    });

    expect(
      screen.getByText('flashcards in your collection'),
    ).toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveAccessibleName(
      'Flashcard manager results',
    );
    expect(screen.getByText('No flashcards yet')).toBeInTheDocument();
    expect(
      screen.getByText('Collect flashcards from the finder to see them here.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('flashcards match')).not.toBeInTheDocument();
  });

  it('counts flashcards rather than matches when given the manager noun', () => {
    renderSection({
      totalCount: 32,
      pagination: makePagination({ page: 1, pageSize: 25, maxPageNumber: 2 }),
      totalPages: 2,
      rangeNoun: 'flashcards',
    });

    expect(
      screen.getByText('Showing 1–25 of 32 flashcards'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/matches/)).not.toBeInTheDocument();
  });

  it('says no flashcards rather than no matches when the collection is empty', () => {
    renderSection({
      examples: [],
      totalCount: 0,
      countLabel: 'flashcards in your collection',
      emptyTitle: 'No flashcards yet',
      rangeNoun: 'flashcards',
    });

    expect(screen.getByText('No flashcards')).toBeInTheDocument();
    expect(screen.queryByText('No matches')).not.toBeInTheDocument();
  });

  it('renders a supplied actions menu instead of the finder one', () => {
    renderSection({
      actionsMenu: <button type="button">Manager actions</button>,
    });

    expect(
      screen.getByRole('button', { name: 'Manager actions' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Do more with these' }),
    ).not.toBeInTheDocument();
  });

  it('passes the remove row action down to every row', async () => {
    const user = userEvent.setup();
    const studentFlashcards = makeFlashcards({
      isExampleCollected: vi.fn(() => true),
    });
    renderSection({ studentFlashcards, rowAction: 'remove' });

    expect(
      screen.queryByRole('button', { name: 'Owned' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(studentFlashcards.deleteFlashcards).toHaveBeenCalledWith([11]);
  });

  it('defaults to the collect row action so the finder is unaffected', async () => {
    const user = userEvent.setup();
    const studentFlashcards = makeFlashcards();
    renderSection({ studentFlashcards });

    expect(
      screen.queryByRole('button', { name: 'Remove' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Collect' }));

    expect(studentFlashcards.createFlashcards).toHaveBeenCalled();
  });

  it('looks up review dates per example for the expand panel', async () => {
    const user = userEvent.setup();
    const getReviewSchedule = vi.fn((exampleId: number) =>
      exampleId === 11
        ? {
            addedOn: '2024-03-07T12:00:00Z',
            lastReviewed: '',
            nextReview: '2025-01-09T12:00:00Z',
          }
        : undefined,
    );
    renderSection({ getReviewSchedule });

    await user.click(screen.getByRole('button', { name: EXPAND_LABEL }));

    expect(getReviewSchedule).toHaveBeenCalledWith(11);
    expect(screen.getByText('Added on:')).toBeInTheDocument();
    expect(screen.getByText('03/07/2024')).toBeInTheDocument();
    expect(screen.getByText('Never')).toBeInTheDocument();
    expect(screen.getByText('01/09/2025')).toBeInTheDocument();
  });

  it('reflows the row below 768px only when mobile layout is on', () => {
    renderSection({ mobileLayout: true });

    const row = screen.getAllByRole('row')[1];

    expect(row.style.getPropertyValue('--dt-mobile-columns')).toBe(
      '44px 1fr 44px',
    );
    expect(row.style.getPropertyValue('--dt-mobile-areas')).toBe(
      '"select spanish expand" "select english expand"',
    );
    expect(
      screen
        .getByRole('columnheader', { name: 'Spanish' })
        .style.getPropertyValue('--dt-mobile-area'),
    ).toBe('spanish');
    expect(screen.getByRole('table')).not.toHaveTextContent(
      'No flashcards match',
    );
  });

  it('collapses an expanded row when resetEpoch increments', async () => {
    const user = userEvent.setup();
    const { rerender } = renderSection({
      examples: [makeExample({ id: 11 })],
      resetEpoch: 0,
    });

    await user.click(screen.getByRole('button', { name: EXPAND_LABEL }));
    expect(screen.getByText('Vocabulary tags')).toBeInTheDocument();

    rerender(
      <ContextualMenuProvider>
        <ResultsSection
          examples={[makeExample({ id: 11 })]}
          totalCount={1}
          studentFlashcards={makeFlashcards()}
          pagination={makePagination()}
          totalPages={1}
          lessonPopup={emptyLessonPopup}
          filteredExamplesLoading={false}
          firstPageLoading={false}
          newPageLoading={false}
          isAdmin={false}
          resetEpoch={1}
        />
      </ContextualMenuProvider>,
    );

    expect(screen.queryByText('Vocabulary tags')).not.toBeInTheDocument();
  });
});

/**
 * Every destructive action on the manager destroys the control that ran it, so
 * without this the browser drops focus on `<body>` — above the filter card and
 * up to 25 rows from where the student was. The finder's rows swap Collect for
 * Owned in place, so it omits `focusRequest` and nothing here applies to it.
 */
describe('results section focus recovery', () => {
  afterEach(() => {
    cleanup();
  });

  function anchor(): HTMLElement {
    return screen.getByRole('group', { name: 'Flashcard finder results' });
  }

  function rerenderWithFocusRequest(
    rerender: ReturnType<typeof render>['rerender'],
    focusRequest: number,
    studentFlashcards = makeFlashcards({
      isExampleCollected: vi.fn(() => true),
    }),
  ): void {
    rerender(
      <ContextualMenuProvider>
        <ResultsSection
          examples={[makeExample({ id: 11 })]}
          totalCount={1}
          studentFlashcards={studentFlashcards}
          pagination={makePagination()}
          totalPages={1}
          lessonPopup={emptyLessonPopup}
          filteredExamplesLoading={false}
          firstPageLoading={false}
          newPageLoading={false}
          rowAction="remove"
          focusRequest={focusRequest}
        />
      </ContextualMenuProvider>,
    );
  }

  it('offers a named landing spot that is not in the tab order', () => {
    renderSection({ focusRequest: 0 });

    expect(anchor()).toHaveAttribute('tabindex', '-1');
    expect(anchor()).toHaveAccessibleName('Flashcard finder results');
  });

  it('takes no focus on first render', () => {
    renderSection({ focusRequest: 0 });

    expect(document.activeElement).toBe(document.body);
  });

  it('takes no focus on a re-render that is not a fresh request', async () => {
    const user = userEvent.setup();
    const { rerender } = renderSection({
      rowAction: 'remove',
      focusRequest: 3,
    });

    await user.click(screen.getByRole('button', { name: EXPAND_LABEL }));
    const chevron = screen.getByRole('button', { name: COLLAPSE_LABEL });
    chevron.focus();

    rerenderWithFocusRequest(rerender, 3);

    expect(document.activeElement).toBe(chevron);
  });

  it('lands focus on the results region when the request increments', () => {
    const { rerender } = renderSection({
      rowAction: 'remove',
      focusRequest: 0,
    });

    rerenderWithFocusRequest(rerender, 1);

    expect(document.activeElement).toBe(anchor());
  });

  it('lands focus on the results region when a row Remove fires', async () => {
    const user = userEvent.setup();
    const studentFlashcards = makeFlashcards({
      isExampleCollected: vi.fn(() => true),
    });
    renderSection({ studentFlashcards, rowAction: 'remove', focusRequest: 0 });

    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(studentFlashcards.deleteFlashcards).toHaveBeenCalledWith([11]);
    expect(document.activeElement).toBe(anchor());
  });

  it('leaves the finder untouched: no anchor, and focus stays on the row', async () => {
    const user = userEvent.setup();
    const studentFlashcards = makeFlashcards({
      isExampleCollected: vi.fn(() => true),
    });
    renderSection({ studentFlashcards });

    const owned = screen.getByRole('button', { name: 'Owned' });
    await user.click(owned);

    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(owned);
  });
});
