import type { PaginationState } from '@application/units/Pagination/usePagination';
import type { UseFlashcardManagerReturn } from '@application/useCases/useFlashcardManager';
import type { ResultsPagination } from '@interface/components/studentFlashcards/ResultsSection';
import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import type { JSX, ReactNode } from 'react';
import type * as ReactRouterDom from 'react-router-dom';
import {
  defaultMockUseFlashcardManager,
  mockUseFlashcardManager,
  overrideMockUseFlashcardManager,
  resetMockUseFlashcardManager,
} from '@application/useCases/useFlashcardManager/useFlashcardManager.mock';
import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import FlashcardManager from '@interface/pages/FlashcardManager';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { trackedRejection } from '@testing/utils/trackedRejection';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn<(to: string) => void>();
const mockWriteTableToClipboard = vi.fn<(examples: unknown[]) => void>();
const mockOpenModal = vi.fn<(props: ModalProbeProps) => void>();
const mockCloseModal = vi.fn<() => void>();
const mockToastError = vi.fn<(message: string, options?: unknown) => void>();

interface ModalProbeProps {
  title: string;
  body: string;
  type: string;
  confirmFunction?: () => void;
}

vi.mock('@application/useCases/useFlashcardManager', () => ({
  default: mockUseFlashcardManager,
}));

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

// The v2 page still relies on the real router to strip `enableFiltering`, so
// navigation is spied on rather than replaced.
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof ReactRouterDom>('react-router-dom');
  return {
    ...actual,
    useNavigate: (): ((
      to: string,
      options?: { replace?: boolean },
    ) => void) => {
      const navigate = actual.useNavigate();
      return (to, options) => {
        mockNavigate(to);
        navigate(to, options);
      };
    },
  };
});

vi.mock('@interface/components/Tables/units/functions', () => ({
  writeTableToClipboard: (examples: unknown[]) =>
    mockWriteTableToClipboard(examples),
}));

vi.mock('@interface/hooks/useModal', () => ({
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
}));

vi.mock('react-toastify', () => ({
  toast: {
    error: (message: string, options?: unknown) =>
      mockToastError(message, options),
  },
}));

vi.mock('@interface/components/Filters', () => ({
  CloseableFilterPanel: ({
    isOpen,
    requireAudioOnly,
    requireNoSpanglish,
  }: {
    isOpen: boolean;
    requireAudioOnly: boolean;
    requireNoSpanglish: boolean;
  }) => (
    <div
      data-testid="closeable-filter-panel"
      data-open={String(isOpen)}
      data-audio={String(requireAudioOnly)}
      data-spanglish={String(requireNoSpanglish)}
    />
  ),
}));

vi.mock('@interface/components/Tables', () => ({
  FlashcardTable: () => <div data-testid="flashcard-table" />,
}));

vi.mock('@interface/components/Loading', () => ({
  Loading: ({ message }: { message: string }) => <div>{message}</div>,
}));

vi.mock('@interface/components/studentFlashcards/FilterSection', () => ({
  FilterSection: ({ onResetAll }: { onResetAll?: () => void }) => (
    <div data-testid="filter-section">
      <button type="button" onClick={onResetAll}>
        mock-reset
      </button>
    </div>
  ),
}));

vi.mock('@interface/components/studentFlashcards/ResultsSection', () => ({
  toResultsPagination: (pagination: PaginationState): ResultsPagination => ({
    page: pagination.pageNumber,
    pageSize: pagination.pageSize,
    maxPageNumber: pagination.maxPageNumber,
    goToPage: pagination.goToPage,
  }),
  ResultsSection: ({
    examples,
    totalCount,
    totalPages,
    pagination,
    rowAction,
    mobileLayout,
    countLabel,
    rangeNoun,
    caption,
    emptyTitle,
    emptyGuidance,
    emptyIcon,
    firstPageLoading,
    filteredExamplesLoading,
    newPageLoading,
    isAdmin,
    actionsMenu,
    getReviewSchedule,
    selectedIds,
    onSelectionChange,
    focusRequest,
  }: {
    examples: ExampleWithVocabulary[];
    totalCount: number;
    totalPages: number | null;
    pagination: ResultsPagination;
    rowAction?: string;
    mobileLayout?: boolean;
    countLabel?: string;
    rangeNoun?: string;
    caption?: string;
    emptyTitle?: string;
    emptyGuidance?: string;
    emptyIcon?: string;
    firstPageLoading?: boolean;
    filteredExamplesLoading?: boolean;
    newPageLoading?: boolean;
    isAdmin?: boolean;
    actionsMenu?: ReactNode;
    getReviewSchedule?: (exampleId: number) => unknown;
    selectedIds?: ReadonlySet<number>;
    onSelectionChange?: (selectedIds: ReadonlySet<number>) => void;
    focusRequest?: number;
  }) => (
    <div
      data-testid="results-section"
      data-focus-request={String(focusRequest)}
      data-total-count={String(totalCount)}
      data-total-pages={String(totalPages)}
      data-page={String(pagination.page)}
      data-row-action={String(rowAction)}
      data-mobile-layout={String(mobileLayout ?? false)}
      data-count-label={countLabel}
      data-range-noun={rangeNoun}
      data-caption={caption}
      data-empty-title={emptyTitle}
      data-empty-guidance={emptyGuidance}
      data-empty-icon={emptyIcon}
      data-first-page-loading={String(firstPageLoading ?? false)}
      data-filtered-loading={String(filteredExamplesLoading ?? false)}
      data-new-page-loading={String(newPageLoading ?? false)}
      data-is-admin={String(isAdmin)}
      data-selected-ids={[...(selectedIds ?? [])].join(',')}
    >
      {actionsMenu}
      <span data-testid="review-schedule">
        {JSON.stringify(getReviewSchedule?.(1) ?? null)}
      </span>
      <span data-testid="review-schedule-missing">
        {JSON.stringify(getReviewSchedule?.(9999) ?? null)}
      </span>
      <button
        type="button"
        onClick={() => {
          onSelectionChange?.(new Set(examples.map((example) => example.id)));
        }}
      >
        mock-select-page
      </button>
      <button
        type="button"
        onClick={() => {
          onSelectionChange?.(new Set([999]));
        }}
      >
        mock-select-unknown
      </button>
    </div>
  ),
}));

vi.mock('@interface/components/studentFlashcards/FinderBottomBar', () => ({
  FinderBottomBar: ({
    notice,
    selectedCount,
    primaryActionLabel,
    onClearSelection,
    onCollect,
    onDismissNotice,
  }: {
    notice?: string | null;
    selectedCount?: number;
    primaryActionLabel?: string;
    onClearSelection?: () => void;
    onCollect?: () => void;
    onDismissNotice?: () => void;
  }) => (
    <div
      data-testid="finder-bottom-bar"
      data-primary-label={primaryActionLabel}
    >
      {notice ? <span data-testid="notice">{notice}</span> : null}
      <span data-testid="selected-count">{selectedCount ?? 0}</span>
      <button type="button" onClick={onClearSelection}>
        mock-clear
      </button>
      <button type="button" onClick={onCollect}>
        mock-remove
      </button>
      <button type="button" onClick={onDismissNotice}>
        mock-dismiss
      </button>
    </div>
  ),
}));

function LocationProbe(): JSX.Element {
  const location = useLocation();

  return (
    <div data-testid="location">{`${location.pathname}${location.search}`}</div>
  );
}

function managerTree(initialEntry: string): JSX.Element {
  return (
    <MemoryRouter initialEntries={[initialEntry]}>
      <FlashcardManager />
      <LocationProbe />
    </MemoryRouter>
  );
}

function renderManager(
  initialEntry = '/manage-flashcards',
): ReturnType<typeof render> {
  return render(managerTree(initialEntry));
}

function renderV2(
  initialEntry = '/manage-flashcards',
): ReturnType<typeof render> {
  overrideMockUseStudentUiVersion({ version: 'v2' });
  return renderManager(initialEntry);
}

/** Re-renders the page so a changed use-case mock reaches it. */
function rerenderV2(
  rerender: ReturnType<typeof render>['rerender'],
  initialEntry = '/manage-flashcards',
): void {
  rerender(managerTree(initialEntry));
}

function exampleIds(flashcards: Flashcard[]): number[] {
  return flashcards.map((flashcard) => flashcard.example.id);
}

/** A slice of the owned collection, as a narrower filter would leave it. */
function filtered(start: number, end: number): Flashcard[] {
  return defaultMockUseFlashcardManager.allFlashcards.slice(start, end);
}

/**
 * Re-renders with a different filtered collection, keeping filtering on. The
 * page derives its live selection from `allFlashcards`, so this is how the
 * tests move cards in and out from under a standing selection.
 */
function rerenderFiltered(
  rerender: ReturnType<typeof render>['rerender'],
  allFlashcards: Flashcard[],
  displayFlashcards: Flashcard[] = allFlashcards,
): void {
  overrideMockUseFlashcardManager({
    filterOwnedFlashcards: true,
    allFlashcards,
    displayFlashcards,
  });
  rerenderV2(rerender);
}

/**
 * The overrideable mock re-wraps every function it returns, so the callable
 * spies live on its result rather than on the exported default fixture.
 */
function managerSpies(): UseFlashcardManagerReturn {
  return mockUseFlashcardManager({ enableFilteringByDefault: false });
}

async function openActionsMenu(): Promise<void> {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Do more with these' }));
}

const REMOVAL_ERROR = 'No access to delete flashcards';

function resetMocks(): void {
  resetMockUseFlashcardManager();
  resetMockUseStudentUiVersion();
  mockUseFlashcardManager.mockClear();
  mockNavigate.mockReset();
  mockWriteTableToClipboard.mockReset();
  mockOpenModal.mockReset();
  mockCloseModal.mockReset();
  mockToastError.mockReset();
  cleanup();
}

describe('flashcard manager page', () => {
  afterEach(resetMocks);

  it('renders the v1 heading, filter panel, and table when the version is v1', () => {
    renderManager();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Flashcard Manager' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('closeable-filter-panel')).toHaveAttribute(
      'data-audio',
      'false',
    );
    expect(screen.getByTestId('closeable-filter-panel')).toHaveAttribute(
      'data-spanglish',
      'false',
    );
    expect(screen.getByTestId('flashcard-table')).toBeInTheDocument();
  });

  it('renders the v1 loading state while student flashcards load', () => {
    overrideMockUseFlashcardManager({ studentFlashcardsLoading: true });

    renderManager();

    expect(screen.getByText('Loading Flashcard Manager')).toBeInTheDocument();
    expect(screen.queryByTestId('flashcard-table')).not.toBeInTheDocument();
  });

  it('renders the v1 loading state while dependencies load', () => {
    overrideMockUseFlashcardManager({ dependenciesLoading: true });

    renderManager();

    expect(screen.getByText('Loading Flashcard Manager')).toBeInTheDocument();
  });

  it('renders the v1 error state', () => {
    overrideMockUseFlashcardManager({ error: new Error('failed') });

    renderManager();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Error Loading Flashcard Manager',
      }),
    ).toBeInTheDocument();
  });

  it('renders the v2 heading, toggle, and results without the legacy tree', () => {
    renderV2();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Flashcard Manager' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'Filter my flashcards' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('results-section')).toBeInTheDocument();
    expect(screen.getByTestId('finder-bottom-bar')).toBeInTheDocument();
    expect(
      screen.queryByTestId('closeable-filter-panel'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('flashcard-table')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Loading Flashcard Manager'),
    ).not.toBeInTheDocument();
  });

  it('keeps the v2 shell and skeletons the table instead of a spinner', () => {
    overrideMockUseFlashcardManager({
      studentFlashcardsLoading: true,
      dependenciesLoading: true,
    });

    renderV2();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Flashcard Manager' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-first-page-loading',
      'true',
    );
    expect(
      screen.queryByText('Loading Flashcard Manager'),
    ).not.toBeInTheDocument();
  });

  it('maps dependency loading alone to first-page loading', () => {
    overrideMockUseFlashcardManager({ dependenciesLoading: true });

    renderV2();

    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-first-page-loading',
      'true',
    );
  });

  it('maps filtered-flashcard loading to the filtered results flag', () => {
    overrideMockUseFlashcardManager({ filteredFlashcardsLoading: true });

    renderV2();

    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-first-page-loading',
      'false',
    );
    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-filtered-loading',
      'true',
    );
    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-new-page-loading',
      'false',
    );
  });

  it('renders the v2 error state', () => {
    overrideMockUseFlashcardManager({ error: new Error('failed') });

    renderV2();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Error Loading Flashcard Manager',
      }),
    ).toBeInTheDocument();
  });
});

describe('flashcard manager v2 results wiring', () => {
  afterEach(resetMocks);

  it('passes the manager row action, mobile reflow, caption, and counts', () => {
    renderV2();

    const results = screen.getByTestId('results-section');
    // Manager passes `remove` so every row gets always-visible Remove (not
    // the Finder's Owned ↔ hover-Remove). Same mutation; different labelMode.
    expect(results).toHaveAttribute('data-row-action', 'remove');
    // STUDENT_FLASHCARDS.md requires the results row to reflow below 768px
    // rather than scroll sideways.
    expect(results).toHaveAttribute('data-mobile-layout', 'true');
    expect(results).toHaveAttribute(
      'data-caption',
      'Flashcard manager results',
    );
    expect(results).toHaveAttribute('data-total-count', '32');
    expect(results).toHaveAttribute('data-total-pages', '2');
    expect(results).toHaveAttribute('data-page', '1');
    expect(screen.getByTestId('finder-bottom-bar')).toHaveAttribute(
      'data-primary-label',
      'Remove flashcards',
    );
  });

  it('describes the count as the whole collection when filtering is off', () => {
    renderV2();

    const results = screen.getByTestId('results-section');
    expect(results).toHaveAttribute(
      'data-count-label',
      'flashcards in your collection',
    );
    // Nothing is being matched while filtering is off, so the footer must not
    // say "matches" under an empty state that says "No flashcards yet".
    expect(results).toHaveAttribute('data-range-noun', 'flashcards');
    expect(results).toHaveAttribute('data-empty-title', 'No flashcards yet');
    expect(results).toHaveAttribute(
      'data-empty-guidance',
      'Use the Flashcard Finder to collect your first flashcards.',
    );
    expect(results).toHaveAttribute('data-empty-icon', 'search');
  });

  it('describes the count as matches when filtering is on', () => {
    overrideMockUseFlashcardManager({ filterOwnedFlashcards: true });

    renderV2();

    const results = screen.getByTestId('results-section');
    expect(results).toHaveAttribute('data-count-label', 'flashcards match');
    expect(results).toHaveAttribute('data-range-noun', 'matches');
    expect(results).toHaveAttribute('data-empty-title', 'No flashcards match');
    expect(results).toHaveAttribute(
      'data-empty-guidance',
      'Try removing a tag or widening the lesson range.',
    );
    expect(results).toHaveAttribute('data-empty-icon', 'searchOff');
  });

  it('does not drill isAdmin, which only feeds the overridden finder menu', () => {
    renderV2();

    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-is-admin',
      'undefined',
    );
  });

  it('supplies the review schedule for a flashcard by example id', () => {
    const [firstFlashcard] = defaultMockUseFlashcardManager.allFlashcards;

    renderV2();

    expect(screen.getByTestId('review-schedule')).toHaveTextContent(
      JSON.stringify({
        addedOn: firstFlashcard.dateCreated,
        lastReviewed: firstFlashcard.lastReviewed,
        nextReview: firstFlashcard.nextReview,
      }),
    );
  });

  it('supplies no review schedule for an example it does not own', () => {
    renderV2();

    expect(screen.getByTestId('review-schedule-missing')).toHaveTextContent(
      'null',
    );
  });
});

describe('flashcard manager v2 filtering toggle', () => {
  afterEach(resetMocks);

  it('renders no filter section while filtering is off', () => {
    renderV2();

    expect(screen.queryByTestId('filter-section')).not.toBeInTheDocument();
  });

  it('turns filtering on through the title-row toggle', async () => {
    const user = userEvent.setup();
    renderV2();

    await user.click(
      screen.getByRole('switch', { name: 'Filter my flashcards' }),
    );

    expect(managerSpies().setFilterOwnedFlashcards).toHaveBeenCalledWith(true);
  });

  it('renders the filter section while filtering is on', () => {
    overrideMockUseFlashcardManager({ filterOwnedFlashcards: true });

    renderV2();

    expect(screen.getByTestId('filter-section')).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'Filter my flashcards' }),
    ).toBeChecked();
  });

  it('clears selection and notice when all filters are reset', async () => {
    const user = userEvent.setup();
    overrideMockUseFlashcardManager({ filterOwnedFlashcards: true });
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-select-page' }));
    await openActionsMenu();
    await user.click(
      screen.getByRole('button', { name: /Copy this page to clipboard/ }),
    );
    expect(screen.getByTestId('notice')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'mock-reset' }));

    expect(managerSpies().resetFilters).toHaveBeenCalledOnce();
    expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
    expect(screen.queryByTestId('notice')).not.toBeInTheDocument();
  });
});

describe('flashcard manager v2 selection', () => {
  afterEach(resetMocks);

  it('lifts selection and bulk removes the selected flashcards', async () => {
    const user = userEvent.setup();
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-select-page' }));
    expect(screen.getByTestId('selected-count')).toHaveTextContent('25');

    await user.click(screen.getByRole('button', { name: 'mock-remove' }));

    expect(
      defaultMockUseFlashcardManager.flashcardsQuery.deleteFlashcards,
    ).toHaveBeenCalledWith(
      defaultMockUseFlashcardManager.displayFlashcards.map(
        (flashcard) => flashcard.example.id,
      ),
    );
    expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
    expect(await screen.findByTestId('notice')).toHaveTextContent(
      '25 flashcards removed from your collection.',
    );
  });

  it('reports a single removal in the singular', async () => {
    const user = userEvent.setup();
    overrideMockUseFlashcardManager({
      displayFlashcards: defaultMockUseFlashcardManager.allFlashcards.slice(
        0,
        1,
      ),
    });
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-select-page' }));
    await user.click(screen.getByRole('button', { name: 'mock-remove' }));

    expect(await screen.findByTestId('notice')).toHaveTextContent(
      '1 flashcard removed from your collection.',
    );
  });

  it('drops a flashcard from the count and the removal once it leaves the collection', async () => {
    const user = userEvent.setup();
    const { rerender } = renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-select-page' }));
    expect(screen.getByTestId('selected-count')).toHaveTextContent('25');

    // A per-row Remove takes one selected card out of the owned collection
    // without going through the checkbox path.
    const [removed, ...survivors] =
      defaultMockUseFlashcardManager.displayFlashcards;
    overrideMockUseFlashcardManager({
      allFlashcards: defaultMockUseFlashcardManager.allFlashcards.filter(
        (flashcard) => flashcard.example.id !== removed.example.id,
      ),
      displayFlashcards: survivors,
    });
    rerenderV2(rerender);

    expect(screen.getByTestId('selected-count')).toHaveTextContent('24');
    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-selected-ids',
      survivors.map((flashcard) => flashcard.example.id).join(','),
    );

    await user.click(screen.getByRole('button', { name: 'mock-remove' }));

    expect(
      defaultMockUseFlashcardManager.flashcardsQuery.deleteFlashcards,
    ).toHaveBeenCalledWith(survivors.map((flashcard) => flashcard.example.id));
    expect(await screen.findByTestId('notice')).toHaveTextContent(
      '24 flashcards removed from your collection.',
    );
  });

  it('drops cards that fall out of a narrowed filter from the count and the removal', async () => {
    const user = userEvent.setup();
    overrideMockUseFlashcardManager({ filterOwnedFlashcards: true });
    const { rerender } = renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-select-page' }));
    expect(screen.getByTestId('selected-count')).toHaveTextContent('25');

    const stillMatching = filtered(0, 10);
    rerenderFiltered(rerender, stillMatching);

    expect(screen.getByTestId('selected-count')).toHaveTextContent('10');
    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-selected-ids',
      exampleIds(stillMatching).join(','),
    );

    // A row the student cannot see cannot be removed by the bulk action.
    await user.click(screen.getByRole('button', { name: 'mock-remove' }));

    expect(
      defaultMockUseFlashcardManager.flashcardsQuery.deleteFlashcards,
    ).toHaveBeenCalledWith(exampleIds(stillMatching));
  });

  /**
   * Leaving the filter is not deletion. The card is still owned, so widening
   * the range brings it back checked — the student never asked to deselect it.
   */
  it('restores a selection when the filter widens again', async () => {
    const user = userEvent.setup();
    overrideMockUseFlashcardManager({ filterOwnedFlashcards: true });
    const { rerender } = renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-select-page' }));
    rerenderFiltered(rerender, filtered(0, 10));
    expect(screen.getByTestId('selected-count')).toHaveTextContent('10');

    rerenderFiltered(
      rerender,
      defaultMockUseFlashcardManager.allFlashcards,
      defaultMockUseFlashcardManager.displayFlashcards,
    );

    expect(screen.getByTestId('selected-count')).toHaveTextContent('25');
    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-selected-ids',
      exampleIds(defaultMockUseFlashcardManager.displayFlashcards).join(','),
    );
  });

  it('never brings back a card that was deleted, only ones the filter hid', async () => {
    const user = userEvent.setup();
    overrideMockUseFlashcardManager({ filterOwnedFlashcards: true });
    const { rerender } = renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-select-page' }));

    // A per-row Remove takes the first card out of the collection for good.
    const [deleted, ...owned] = defaultMockUseFlashcardManager.allFlashcards;
    rerenderFiltered(rerender, owned, owned.slice(0, 24));
    expect(screen.getByTestId('selected-count')).toHaveTextContent('24');

    rerenderFiltered(rerender, owned.slice(0, 10));
    expect(screen.getByTestId('selected-count')).toHaveTextContent('10');

    rerenderFiltered(rerender, owned, owned.slice(0, 24));

    // The fourteen the filter had hidden are back; the deleted one is not.
    expect(screen.getByTestId('selected-count')).toHaveTextContent('24');
    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-selected-ids',
      exampleIds(owned.slice(0, 24)).join(','),
    );
    expect(exampleIds(owned.slice(0, 24)).includes(deleted.example.id)).toBe(
      false,
    );
  });

  /**
   * `useLessonWithVocab` sets no `placeholderData`, so changing the course or
   * the lesson range empties `lessonVocabKnown` until the fetch lands and the
   * filtered collection is transiently []. Trimming the stored selection to the
   * live one during render turned that blink into permanent selection loss.
   */
  it('keeps the selection through the gap while the vocabulary query refetches', async () => {
    const user = userEvent.setup();
    overrideMockUseFlashcardManager({ filterOwnedFlashcards: true });
    const { rerender } = renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-select-page' }));
    expect(screen.getByTestId('selected-count')).toHaveTextContent('25');

    rerenderFiltered(rerender, [], []);
    expect(screen.getByTestId('selected-count')).toHaveTextContent('0');

    rerenderFiltered(
      rerender,
      defaultMockUseFlashcardManager.allFlashcards,
      defaultMockUseFlashcardManager.displayFlashcards,
    );

    expect(screen.getByTestId('selected-count')).toHaveTextContent('25');
    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-selected-ids',
      exampleIds(defaultMockUseFlashcardManager.displayFlashcards).join(','),
    );
  });

  it('never counts a selected id that is not in the collection', async () => {
    const user = userEvent.setup();
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-select-page' }));
    await user.click(
      screen.getByRole('button', { name: 'mock-select-unknown' }),
    );

    // A populated count can no longer coexist with an empty removal list.
    expect(screen.getByTestId('selected-count')).toHaveTextContent('0');

    await user.click(screen.getByRole('button', { name: 'mock-remove' }));

    expect(
      defaultMockUseFlashcardManager.flashcardsQuery.deleteFlashcards,
    ).not.toHaveBeenCalled();
    expect(screen.queryByTestId('notice')).not.toBeInTheDocument();
  });

  /**
   * The query layer owns error toasts app-wide, so a rejected removal must not
   * get a second surface here. What the page still owes is silence rather than
   * a success claim, and a handled rejection.
   */
  it('claims nothing and adds no notice when the removal rejects', async () => {
    const user = userEvent.setup();
    const rejection = trackedRejection(REMOVAL_ERROR);
    overrideMockUseFlashcardManager({
      flashcardsQuery: {
        ...defaultMockUseFlashcardManager.flashcardsQuery,
        deleteFlashcards: vi.fn(rejection.reject),
      },
    });
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-select-page' }));
    await user.click(screen.getByRole('button', { name: 'mock-remove' }));

    expect(
      screen.queryByText('25 flashcards removed from your collection.'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('notice')).not.toBeInTheDocument();
    expect(rejection.wasHandled()).toBe(true);
  });

  it('reports the number the mutation actually removed, not the number asked for', async () => {
    const user = userEvent.setup();
    // The API deleted 20 of the 25 requested; useFlashcardsQuery has already
    // toasted that. The bar must not say 25.
    const deleteFlashcards = vi.fn<(exampleIds: number[]) => Promise<number>>(
      async () => 20,
    );
    overrideMockUseFlashcardManager({
      flashcardsQuery: {
        ...defaultMockUseFlashcardManager.flashcardsQuery,
        deleteFlashcards,
      },
    });
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-select-page' }));
    await user.click(screen.getByRole('button', { name: 'mock-remove' }));

    expect(deleteFlashcards).toHaveBeenCalledWith(
      defaultMockUseFlashcardManager.displayFlashcards.map(
        (flashcard) => flashcard.example.id,
      ),
    );
    expect(await screen.findByTestId('notice')).toHaveTextContent(
      '20 flashcards removed from your collection.',
    );
    expect(
      screen.queryByText('25 flashcards removed from your collection.'),
    ).not.toBeInTheDocument();
  });

  it('removes nothing when the selection is empty', async () => {
    const user = userEvent.setup();
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-remove' }));

    expect(
      defaultMockUseFlashcardManager.flashcardsQuery.deleteFlashcards,
    ).not.toHaveBeenCalled();
  });

  it('clears the selection from the bottom bar', async () => {
    const user = userEvent.setup();
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-select-page' }));
    await user.click(screen.getByRole('button', { name: 'mock-clear' }));

    expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
  });

  /**
   * Where focus actually lands is asserted against `document.activeElement` in
   * FlashcardManagerFocus.test.tsx, which renders the real results section.
   * These only pin the wiring: the two actions that unmount their own button
   * ask for focus, and nothing else does.
   */
  it('asks the results region for focus after a bulk removal and a clear', async () => {
    const user = userEvent.setup();
    renderV2();

    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-focus-request',
      '0',
    );

    await user.click(screen.getByRole('button', { name: 'mock-select-page' }));
    await user.click(screen.getByRole('button', { name: 'mock-remove' }));

    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-focus-request',
      '1',
    );

    await user.click(screen.getByRole('button', { name: 'mock-select-page' }));
    await user.click(screen.getByRole('button', { name: 'mock-clear' }));

    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-focus-request',
      '2',
    );
  });

  it('leaves focus alone for actions that keep their own button', async () => {
    const user = userEvent.setup();
    overrideMockUseFlashcardManager({ filterOwnedFlashcards: true });
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-select-page' }));
    await openActionsMenu();
    await user.click(
      screen.getByRole('button', { name: /Copy this page to clipboard/ }),
    );
    await user.click(screen.getByRole('button', { name: 'mock-reset' }));

    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-focus-request',
      '0',
    );
  });

  it('dismisses the notice', async () => {
    const user = userEvent.setup();
    renderV2();

    await openActionsMenu();
    await user.click(
      screen.getByRole('button', { name: /Copy this page to clipboard/ }),
    );
    await user.click(screen.getByRole('button', { name: 'mock-dismiss' }));

    expect(screen.queryByTestId('notice')).not.toBeInTheDocument();
  });
});

describe('flashcard manager v2 actions menu', () => {
  afterEach(resetMocks);

  it('copies the current page with the manager clipboard writer', async () => {
    const user = userEvent.setup();
    renderV2();

    await openActionsMenu();
    await user.click(
      screen.getByRole('button', { name: /Copy this page to clipboard/ }),
    );

    expect(mockWriteTableToClipboard).toHaveBeenCalledWith(
      defaultMockUseFlashcardManager.displayFlashcards.map(
        (flashcard) => flashcard.example,
      ),
    );
    expect(screen.getByTestId('notice')).toHaveTextContent(
      '25 flashcards copied to clipboard.',
    );
  });

  it('copies every result with the manager clipboard writer', async () => {
    const user = userEvent.setup();
    renderV2();

    await openActionsMenu();
    await user.click(
      screen.getByRole('button', { name: /Copy all results to clipboard/ }),
    );

    expect(mockWriteTableToClipboard).toHaveBeenCalledWith(
      defaultMockUseFlashcardManager.allFlashcards.map(
        (flashcard) => flashcard.example,
      ),
    );
    expect(screen.getByTestId('notice')).toHaveTextContent(
      '32 flashcards copied to clipboard.',
    );
  });

  it('reports a single copied flashcard in the singular', async () => {
    const user = userEvent.setup();
    overrideMockUseFlashcardManager({
      displayFlashcards: defaultMockUseFlashcardManager.allFlashcards.slice(
        0,
        1,
      ),
    });
    renderV2();

    await openActionsMenu();
    await user.click(
      screen.getByRole('button', { name: /Copy this page to clipboard/ }),
    );

    expect(screen.getByTestId('notice')).toHaveTextContent(
      '1 flashcard copied to clipboard.',
    );
  });

  it('toasts instead of confirming when no Spanglish is owned', async () => {
    const user = userEvent.setup();
    overrideMockUseFlashcardManager({ spanglishFlashcardCount: 0 });
    renderV2();

    await openActionsMenu();
    await user.click(
      screen.getByRole('button', { name: /Delete all owned Spanglish/ }),
    );

    expect(mockToastError).toHaveBeenCalledWith(
      'You do not have any spanglish flashcards.',
      { autoClose: 3000 },
    );
    expect(mockOpenModal).not.toHaveBeenCalled();
  });

  it('confirms before deleting all owned Spanglish', async () => {
    const user = userEvent.setup();
    renderV2();

    await openActionsMenu();
    await user.click(
      screen.getByRole('button', { name: /Delete all owned Spanglish/ }),
    );

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Delete All Owned Spanglish Flashcards?',
        body: 'You have 3 spanglish flashcards. Are you sure you want to delete them?',
        type: 'confirm',
      }),
    );
    expect(managerSpies().deleteAllOwnedSpanglish).not.toHaveBeenCalled();

    const [modalProps] = mockOpenModal.mock.calls[0];
    modalProps.confirmFunction?.();

    expect(managerSpies().deleteAllOwnedSpanglish).toHaveBeenCalledOnce();
    expect(mockCloseModal).toHaveBeenCalledOnce();
    expect(await screen.findByTestId('notice')).toHaveTextContent(
      '3 Spanglish flashcards removed from your collection.',
    );
  });

  it('reports the number of Spanglish flashcards actually removed', async () => {
    const user = userEvent.setup();
    // Two of the three owned Spanglish cards were deleted, so the bar cannot
    // claim every one of them is gone.
    const deleteAllOwnedSpanglish = vi.fn<() => Promise<number>>(async () => 2);
    overrideMockUseFlashcardManager({ deleteAllOwnedSpanglish });
    renderV2();

    await openActionsMenu();
    await user.click(
      screen.getByRole('button', { name: /Delete all owned Spanglish/ }),
    );
    const [modalProps] = mockOpenModal.mock.calls[0];
    modalProps.confirmFunction?.();

    expect(await screen.findByTestId('notice')).toHaveTextContent(
      '2 Spanglish flashcards removed from your collection.',
    );
    expect(
      screen.queryByText(
        '3 Spanglish flashcards removed from your collection.',
      ),
    ).not.toBeInTheDocument();
  });

  it('reports a single removed Spanglish flashcard in the singular', async () => {
    const user = userEvent.setup();
    overrideMockUseFlashcardManager({
      spanglishFlashcardCount: 1,
      deleteAllOwnedSpanglish: vi.fn<() => Promise<number>>(async () => 1),
    });
    renderV2();

    await openActionsMenu();
    await user.click(
      screen.getByRole('button', { name: /Delete all owned Spanglish/ }),
    );
    const [modalProps] = mockOpenModal.mock.calls[0];
    modalProps.confirmFunction?.();

    expect(await screen.findByTestId('notice')).toHaveTextContent(
      '1 Spanglish flashcard removed from your collection.',
    );
  });

  it('claims nothing and adds no notice when the Spanglish removal rejects', async () => {
    const user = userEvent.setup();
    const rejection = trackedRejection(REMOVAL_ERROR);
    overrideMockUseFlashcardManager({
      deleteAllOwnedSpanglish: vi.fn(rejection.reject),
    });
    renderV2();

    await openActionsMenu();
    await user.click(
      screen.getByRole('button', { name: /Delete all owned Spanglish/ }),
    );
    const [modalProps] = mockOpenModal.mock.calls[0];
    modalProps.confirmFunction?.();
    // Lets the rejection reach the page's handler before the bar is inspected.
    await act(async () => {});

    expect(
      screen.queryByText(
        '3 Spanglish flashcards removed from your collection.',
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('notice')).not.toBeInTheDocument();
    expect(rejection.wasHandled()).toBe(true);
  });

  it('asks about a single Spanglish flashcard in the singular', async () => {
    const user = userEvent.setup();
    overrideMockUseFlashcardManager({ spanglishFlashcardCount: 1 });
    renderV2();

    await openActionsMenu();
    await user.click(
      screen.getByRole('button', { name: /Delete all owned Spanglish/ }),
    );

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'You have 1 spanglish flashcard. Are you sure you want to delete them?',
      }),
    );
  });

  it('sends the student to the flashcard finder', async () => {
    const user = userEvent.setup();
    renderV2();

    await openActionsMenu();
    await user.click(
      screen.getByRole('button', { name: /Find more matching flashcards/ }),
    );

    expect(mockNavigate).toHaveBeenCalledWith('/flashcardfinder');
  });

  it('enables filtering before quizzing the filtered flashcards', async () => {
    const user = userEvent.setup();
    renderV2();

    await openActionsMenu();
    await user.click(
      screen.getByRole('button', {
        name: /Quiz my flashcards matching these filters/,
      }),
    );

    const { onGoingToQuiz } = managerSpies();
    expect(onGoingToQuiz).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith(
      '/myflashcards?enableFiltering=true',
    );
    expect(vi.mocked(onGoingToQuiz).mock.invocationCallOrder[0]).toBeLessThan(
      mockNavigate.mock.invocationCallOrder[0],
    );
  });
});

describe('enableFiltering url parameter', () => {
  afterEach(resetMocks);

  // What "opens filtering" means is the use case's business: the prop seeds a
  // `useState`, so it survives the strip. That is asserted in
  // useFlashcardManager.test.ts. These only claim the handoff and the url.
  it('hands the parameter to the use case and strips it in v1', () => {
    renderManager('/manage-flashcards?enableFiltering=true');

    expect(mockUseFlashcardManager).toHaveBeenCalledWith({
      enableFilteringByDefault: true,
    });
    expect(screen.getByTestId('location').textContent).toBe(
      '/manage-flashcards',
    );
  });

  it('keeps other query parameters when stripping enableFiltering in v1', () => {
    renderManager('/manage-flashcards?enableFiltering=true&page=2');

    expect(screen.getByTestId('location').textContent).toBe(
      '/manage-flashcards?page=2',
    );
  });

  it('leaves the url alone when the parameter is absent', () => {
    renderManager('/manage-flashcards?page=2');

    expect(mockUseFlashcardManager).toHaveBeenCalledWith({
      enableFilteringByDefault: false,
    });
    expect(screen.getByTestId('location').textContent).toBe(
      '/manage-flashcards?page=2',
    );
  });

  it('hands the parameter to the use case and strips it in v2', () => {
    renderV2('/manage-flashcards?enableFiltering=true');

    expect(mockUseFlashcardManager).toHaveBeenCalledWith({
      enableFilteringByDefault: true,
    });
    expect(screen.getByTestId('location').textContent).toBe(
      '/manage-flashcards',
    );
  });

  it('keeps other query parameters when stripping enableFiltering in v2', () => {
    renderV2('/manage-flashcards?enableFiltering=true&page=2');

    expect(screen.getByTestId('location').textContent).toBe(
      '/manage-flashcards?page=2',
    );
  });
});
