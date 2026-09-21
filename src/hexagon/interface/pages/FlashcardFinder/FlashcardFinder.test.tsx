import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import {
  mockUseFlashcardFinder,
  overrideMockUseFlashcardFinder,
  resetMockUseFlashcardFinder,
} from '@application/useCases/useFlashcardFinder/useFlashcardFinder.mock';
import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import FlashcardFinder from '@interface/pages/FlashcardFinder';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn<(to: string) => void>();
const mockCopyTableToClipboard = vi.fn();

vi.mock('@application/useCases/useFlashcardFinder', () => ({
  default: mockUseFlashcardFinder,
}));

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@interface/components/Tables/units/functions', () => ({
  copyTableToClipboard: (...args: unknown[]) =>
    mockCopyTableToClipboard(...args),
}));

vi.mock('@interface/components/Filters', () => ({
  FilterPanel: ({
    requireAudioOnly,
    requireNoSpanglish,
  }: {
    requireAudioOnly: boolean;
    requireNoSpanglish: boolean;
  }) => (
    <div
      data-testid="filter-panel"
      data-audio={String(requireAudioOnly)}
      data-spanglish={String(requireNoSpanglish)}
    />
  ),
}));

vi.mock('@interface/components/Tables', () => ({
  ExampleTable: () => <div data-testid="example-table" />,
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
  ResultsSection: ({
    examples,
    firstPageLoading,
    filteredExamplesLoading,
    mobileLayout,
    rowAction,
    onApplyFilters,
    onCreateQuiz,
    onCopyPage,
    onCopyAll,
    onSelectionChange,
    onNotice,
  }: {
    examples: ExampleWithVocabulary[];
    firstPageLoading?: boolean;
    filteredExamplesLoading?: boolean;
    mobileLayout?: boolean;
    rowAction?: string;
    onApplyFilters?: () => void;
    onCreateQuiz?: () => void;
    onCopyPage?: () => void;
    onCopyAll?: () => void;
    onSelectionChange?: (ids: ReadonlySet<number>) => void;
    onNotice?: (message: string) => void;
  }) => (
    <div
      data-testid="results-section"
      data-first-page-loading={String(firstPageLoading ?? false)}
      data-filtered-loading={String(filteredExamplesLoading ?? false)}
      data-mobile-layout={String(mobileLayout ?? false)}
      data-row-action={String(rowAction)}
    >
      <button type="button" onClick={onApplyFilters}>
        mock-apply-filters
      </button>
      <button type="button" onClick={onCreateQuiz}>
        mock-create-quiz
      </button>
      <button type="button" onClick={onCopyPage}>
        mock-copy-page
      </button>
      <button type="button" onClick={onCopyAll}>
        mock-copy-all
      </button>
      <button
        type="button"
        onClick={() => {
          onSelectionChange?.(new Set(examples.map((example) => example.id)));
        }}
      >
        mock-select
      </button>
      <button
        type="button"
        onClick={() => {
          onNotice?.('Filters applied to your flashcards.');
        }}
      >
        mock-notice
      </button>
      <button
        type="button"
        onClick={() => {
          onNotice?.('Quiz created from 12 examples.');
        }}
      >
        mock-notice-replace
      </button>
    </div>
  ),
}));

vi.mock('@interface/components/studentFlashcards/FinderBottomBar', () => ({
  FinderBottomBar: ({
    notice,
    selectedCount,
    onClearSelection,
    onCollect,
    onDismissNotice,
  }: {
    notice?: string | null;
    selectedCount?: number;
    onClearSelection?: () => void;
    onCollect?: () => void;
    onDismissNotice?: () => void;
  }) => (
    <div data-testid="finder-bottom-bar">
      {notice ? <span data-testid="notice">{notice}</span> : null}
      <span data-testid="selected-count">{selectedCount ?? 0}</span>
      <button type="button" onClick={onClearSelection}>
        mock-clear
      </button>
      <button type="button" onClick={onCollect}>
        mock-collect
      </button>
      <button type="button" onClick={onDismissNotice}>
        mock-dismiss
      </button>
    </div>
  ),
}));

function renderFinder(): void {
  render(
    <MemoryRouter>
      <FlashcardFinder />
    </MemoryRouter>,
  );
}

describe('flashcard finder page', () => {
  afterEach(() => {
    resetMockUseFlashcardFinder();
    resetMockUseStudentUiVersion();
    mockNavigate.mockReset();
    mockCopyTableToClipboard.mockReset();
    cleanup();
  });

  it('renders the v1 heading and tree when the version is v1', () => {
    renderFinder();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Flashcard Finder' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('filter-panel')).toHaveAttribute(
      'data-audio',
      'false',
    );
    expect(screen.getByTestId('filter-panel')).toHaveAttribute(
      'data-spanglish',
      'false',
    );
    expect(screen.getByTestId('example-table')).toBeInTheDocument();
    expect(screen.queryByText('Building for')).not.toBeInTheDocument();
    expect(screen.queryByTestId('filter-section')).not.toBeInTheDocument();
  });

  it('renders the v1 loading state', () => {
    overrideMockUseFlashcardFinder({ initialLoading: true });

    renderFinder();

    expect(screen.getByText('Loading Flashcard Finder')).toBeInTheDocument();
  });

  it('passes first-page loading to the v1 table', () => {
    overrideMockUseFlashcardFinder({
      exampleQuery: {
        ...mockUseFlashcardFinder().exampleQuery,
        isLoading: true,
        page: 1,
      },
    });

    renderFinder();

    expect(screen.getByTestId('example-table')).toBeInTheDocument();
  });

  it('passes later-page loading to the v1 table', () => {
    overrideMockUseFlashcardFinder({
      exampleQuery: {
        ...mockUseFlashcardFinder().exampleQuery,
        isLoading: true,
        page: 2,
      },
    });

    renderFinder();

    expect(screen.getByTestId('example-table')).toBeInTheDocument();
  });

  it('renders the v1 error state', () => {
    overrideMockUseFlashcardFinder({ error: new Error('failed') });

    renderFinder();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Error Loading Flashcard Finder',
      }),
    ).toBeInTheDocument();
  });

  it('renders the heading and sections when the version is v2', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });

    renderFinder();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Flashcard Finder' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('filter-section')).toBeInTheDocument();
    expect(screen.getByTestId('results-section')).toBeInTheDocument();
    // STUDENT_FLASHCARDS.md requires the results row to reflow below 768px
    // rather than scroll sideways.
    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-mobile-layout',
      'true',
    );
    // Finder omits rowAction so ResultsSection defaults to `collect` — Owned
    // at rest on collected rows, never the Manager's always-Remove treatment.
    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-row-action',
      'undefined',
    );
    expect(screen.getByTestId('finder-bottom-bar')).toBeInTheDocument();
    expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('example-table')).not.toBeInTheDocument();
  });

  it('keeps the v2 shell and uses skeleton loading, not a spinner page', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });
    overrideMockUseFlashcardFinder({ initialLoading: true });

    renderFinder();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Flashcard Finder' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('filter-section')).toBeInTheDocument();
    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-first-page-loading',
      'true',
    );
    expect(
      screen.queryByText('Loading Flashcard Finder'),
    ).not.toBeInTheDocument();
  });

  it('renders the v2 error state', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });
    overrideMockUseFlashcardFinder({ error: new Error('failed') });

    renderFinder();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Error Loading Flashcard Finder',
      }),
    ).toBeInTheDocument();
  });

  it('passes first-page loading through to v2 results', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });
    overrideMockUseFlashcardFinder({
      exampleQuery: {
        ...mockUseFlashcardFinder().exampleQuery,
        isLoading: true,
        page: 1,
        totalCount: 10,
      },
      exampleFilter: {
        ...mockUseFlashcardFinder().exampleFilter,
        isAdmin: true,
      },
    });

    renderFinder();

    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-first-page-loading',
      'true',
    );
  });

  it('passes later-page loading through to v2 results', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });
    overrideMockUseFlashcardFinder({
      exampleQuery: {
        ...mockUseFlashcardFinder().exampleQuery,
        isLoading: true,
        page: 2,
      },
      filteredExamplesLoading: true,
    });

    renderFinder();

    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-first-page-loading',
      'false',
    );
    expect(screen.getByTestId('results-section')).toHaveAttribute(
      'data-filtered-loading',
      'true',
    );
  });
});

describe('flashcard finder v2 interactions', () => {
  afterEach(() => {
    resetMockUseFlashcardFinder();
    resetMockUseStudentUiVersion();
    mockNavigate.mockReset();
    mockCopyTableToClipboard.mockReset();
    cleanup();
  });

  function renderV2(): void {
    overrideMockUseStudentUiVersion({ version: 'v2' });
    renderFinder();
  }

  it('applies filters by navigating to the manager with filtering enabled', async () => {
    const user = userEvent.setup();
    renderV2();

    await user.click(
      screen.getByRole('button', { name: 'mock-apply-filters' }),
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      '/manage-flashcards?enableFiltering=true',
    );
  });

  it('creates a quiz by navigating to custom quiz', async () => {
    const user = userEvent.setup();
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-create-quiz' }));

    expect(mockNavigate).toHaveBeenCalledWith('/customquiz');
  });

  it('copies the current page of examples', async () => {
    const user = userEvent.setup();
    const examples = createMockExampleWithVocabularyList(2);
    overrideMockUseFlashcardFinder({ displayExamples: examples });
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-copy-page' }));

    expect(mockCopyTableToClipboard).toHaveBeenCalledWith({
      displayOrder: examples.map((example) => ({ recordId: example.id })),
      getExampleOrFlashcardById: expect.any(Function),
    });
  });

  it('copies every match the use case loads', async () => {
    const user = userEvent.setup();
    const examples = createMockExampleWithVocabularyList(2);
    const copyAllMatchingExamples = vi.fn(async () => examples);
    overrideMockUseFlashcardFinder({ copyAllMatchingExamples });
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-copy-all' }));

    expect(copyAllMatchingExamples).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(mockCopyTableToClipboard).toHaveBeenCalledWith({
        displayOrder: examples.map((example) => ({ recordId: example.id })),
        getExampleOrFlashcardById: expect.any(Function),
      });
    });
  });

  it('shows the use case selection and forwards selection changes', async () => {
    const user = userEvent.setup();
    const examples = createMockExampleWithVocabularyList(2);
    const changeSelection = vi.fn();
    overrideMockUseFlashcardFinder({
      displayExamples: examples,
      selectedIds: new Set(examples.map((example) => example.id)),
      changeSelection,
    });
    renderV2();

    expect(screen.getByTestId('selected-count')).toHaveTextContent('2');

    await user.click(screen.getByRole('button', { name: 'mock-select' }));

    expect(changeSelection).toHaveBeenCalledWith(
      new Set(examples.map((example) => example.id)),
    );
  });

  it('collects through the use case', async () => {
    const user = userEvent.setup();
    const collectSelected = vi.fn(async () => {});
    overrideMockUseFlashcardFinder({ collectSelected });
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-collect' }));

    expect(collectSelected).toHaveBeenCalledOnce();
  });

  it('clears selection through the use case', async () => {
    const user = userEvent.setup();
    const clearSelection = vi.fn();
    overrideMockUseFlashcardFinder({ clearSelection });
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-clear' }));

    expect(clearSelection).toHaveBeenCalledOnce();
  });

  it('replaces notices rather than stacking them', async () => {
    const user = userEvent.setup();
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-notice' }));
    expect(screen.getByTestId('notice')).toHaveTextContent(
      'Filters applied to your flashcards.',
    );

    await user.click(
      screen.getByRole('button', { name: 'mock-notice-replace' }),
    );
    expect(screen.getByTestId('notice')).toHaveTextContent(
      'Quiz created from 12 examples.',
    );
    expect(
      screen.queryByText('Filters applied to your flashcards.'),
    ).not.toBeInTheDocument();
  });

  it('dismisses the notice', async () => {
    const user = userEvent.setup();
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-notice' }));
    await user.click(screen.getByRole('button', { name: 'mock-dismiss' }));

    expect(screen.queryByTestId('notice')).not.toBeInTheDocument();
  });

  it('clears selection and notice when all filters are reset', async () => {
    const user = userEvent.setup();
    const examples = createMockExampleWithVocabularyList(2);
    const resetFilters = vi.fn();
    const clearSelection = vi.fn();
    overrideMockUseFlashcardFinder({
      displayExamples: examples,
      resetFilters,
      clearSelection,
    });
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-notice' }));
    await user.click(screen.getByRole('button', { name: 'mock-reset' }));

    expect(resetFilters).toHaveBeenCalledOnce();
    expect(clearSelection).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('notice')).not.toBeInTheDocument();
  });

  it('shows a notice when copying every match fails', async () => {
    const user = userEvent.setup();
    overrideMockUseFlashcardFinder({
      copyAllMatchingExamples: vi.fn(async () => {
        throw new Error('catalog down');
      }),
    });
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-copy-all' }));

    expect(await screen.findByTestId('notice')).toHaveTextContent(
      'Could not copy examples.',
    );
  });
});
