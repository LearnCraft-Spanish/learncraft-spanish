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
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn<(to: string) => void>();
const mockCopyTableToClipboard = vi.fn();
const mockCopyAllExamplesToClipboard = vi.fn();

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

vi.mock(
  '@interface/components/Tables/units/CopyAllExamplesToClipboard',
  () => ({
    copyAllExamplesToClipboard: (...args: unknown[]) =>
      mockCopyAllExamplesToClipboard(...args),
  }),
);

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
    mockCopyAllExamplesToClipboard.mockReset();
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

  it('renders the context bar and heading when the version is v2', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });

    renderFinder();

    expect(screen.getByText('Building for')).toBeInTheDocument();
    expect(screen.getByText('Alex Rivera · Lesson 8')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Flashcard Finder' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('filter-section')).toBeInTheDocument();
    expect(screen.getByTestId('results-section')).toBeInTheDocument();
    expect(screen.getByTestId('finder-bottom-bar')).toBeInTheDocument();
    expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('example-table')).not.toBeInTheDocument();
  });

  it('keeps the v2 shell and uses skeleton loading, not a spinner page', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });
    overrideMockUseFlashcardFinder({ initialLoading: true });

    renderFinder();

    expect(screen.getByText('Building for')).toBeInTheDocument();
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
    mockCopyAllExamplesToClipboard.mockReset();
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

  it('copies all matches through CopyAllExamplesToClipboard', async () => {
    const user = userEvent.setup();
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-copy-all' }));

    expect(mockCopyAllExamplesToClipboard).toHaveBeenCalledOnce();
  });

  it('lifts selection into the bottom bar and collects the flashcards', async () => {
    const user = userEvent.setup();
    const examples = [
      { ...createMockExampleWithVocabularyList(1)[0], id: 11 },
      { ...createMockExampleWithVocabularyList(1)[0], id: 12 },
    ];
    const createFlashcards = vi.fn(async () => []);
    overrideMockUseFlashcardFinder({
      displayExamples: examples,
      flashcardsQuery: {
        ...mockUseFlashcardFinder().flashcardsQuery,
        createFlashcards,
        isExampleCollected: vi.fn(() => false),
      },
    });
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-select' }));

    expect(screen.getByTestId('selected-count')).toHaveTextContent('2');

    await user.click(screen.getByRole('button', { name: 'mock-collect' }));

    expect(createFlashcards).toHaveBeenCalledWith(examples);
    expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
  });

  it('skips examples that are already owned', async () => {
    const user = userEvent.setup();
    const examples = [
      { ...createMockExampleWithVocabularyList(1)[0], id: 11 },
      { ...createMockExampleWithVocabularyList(1)[0], id: 12 },
    ];
    const createFlashcards = vi.fn(async () => []);
    overrideMockUseFlashcardFinder({
      displayExamples: examples,
      flashcardsQuery: {
        ...mockUseFlashcardFinder().flashcardsQuery,
        createFlashcards,
        isExampleCollected: vi.fn(
          ({ exampleId }: { exampleId: number }) => exampleId === 11,
        ),
      },
    });
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-select' }));
    await user.click(screen.getByRole('button', { name: 'mock-collect' }));

    expect(createFlashcards).toHaveBeenCalledWith([examples[1]]);
  });

  it('clears selection from the bottom bar', async () => {
    const user = userEvent.setup();
    const examples = createMockExampleWithVocabularyList(2);
    overrideMockUseFlashcardFinder({ displayExamples: examples });
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-select' }));
    await user.click(screen.getByRole('button', { name: 'mock-clear' }));

    expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
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
    overrideMockUseFlashcardFinder({
      displayExamples: examples,
      resetFilters,
    });
    renderV2();

    await user.click(screen.getByRole('button', { name: 'mock-select' }));
    await user.click(screen.getByRole('button', { name: 'mock-notice' }));
    await user.click(screen.getByRole('button', { name: 'mock-reset' }));

    expect(resetFilters).toHaveBeenCalledOnce();
    expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
    expect(screen.queryByTestId('notice')).not.toBeInTheDocument();
  });
});
