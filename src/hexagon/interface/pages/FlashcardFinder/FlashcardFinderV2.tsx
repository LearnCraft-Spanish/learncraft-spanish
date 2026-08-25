import type { UseExampleQueryReturnType } from '@application/queries/ExampleQueries/useExampleQuery';
import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import type { JSX } from 'react';
import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import useFlashcardFinder from '@application/useCases/useFlashcardFinder';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { FilterSection } from '@interface/components/studentFlashcards/FilterSection';
import { FinderBottomBar } from '@interface/components/studentFlashcards/FinderBottomBar';
import { ResultsSection } from '@interface/components/studentFlashcards/ResultsSection';
import { copyAllExamplesToClipboard } from '@interface/components/Tables/units/CopyAllExamplesToClipboard';
import { copyTableToClipboard } from '@interface/components/Tables/units/functions';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FlashcardFinder.module.scss';

interface FlashcardFinderV2LoadedProps {
  exampleQuery: UseExampleQueryReturnType;
  displayExamples: ExampleWithVocabulary[];
  flashcardsQuery: UseStudentFlashcardsReturn;
  pagination: QueryPaginationState;
  totalPages: number | null;
  lessonPopup: LessonPopup;
  filteredExamplesLoading: boolean;
  initialLoading: boolean;
  exampleFilter: UseCombinedFiltersReturnType;
  resetFilters: () => void;
}

function copyPageExamples(examples: ExampleWithVocabulary[]): void {
  copyTableToClipboard({
    displayOrder: examples.map((example) => ({ recordId: example.id })),
    getExampleOrFlashcardById: (id) =>
      examples.find((example) => example.id === id) ?? null,
  });
}

function FlashcardFinderV2Loaded({
  exampleQuery,
  displayExamples,
  flashcardsQuery,
  pagination,
  totalPages,
  lessonPopup,
  filteredExamplesLoading,
  initialLoading,
  exampleFilter,
  resetFilters,
}: FlashcardFinderV2LoadedProps): JSX.Element {
  const navigate = useNavigate();
  const exampleAdapter = useExampleAdapter();
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const [resetEpoch, setResetEpoch] = useState(0);
  const selectedExamplesRef = useRef<Map<number, ExampleWithVocabulary>>(
    new Map(),
  );

  const handleSelectionChange = (next: ReadonlySet<number>): void => {
    for (const id of [...selectedExamplesRef.current.keys()]) {
      if (!next.has(id)) {
        selectedExamplesRef.current.delete(id);
      }
    }
    for (const example of displayExamples) {
      if (next.has(example.id)) {
        selectedExamplesRef.current.set(example.id, example);
      }
    }
    setSelectedIds(next);
  };

  const handleClearSelection = (): void => {
    selectedExamplesRef.current.clear();
    setSelectedIds(new Set());
  };

  const handleCollect = (): void => {
    const toCollect = [...selectedIds]
      .map((id) => selectedExamplesRef.current.get(id))
      .filter(
        (example): example is ExampleWithVocabulary => example !== undefined,
      )
      .filter(
        (example) =>
          !flashcardsQuery.isExampleCollected({ exampleId: example.id }),
      );

    handleClearSelection();

    if (toCollect.length > 0) {
      void flashcardsQuery.createFlashcards(toCollect);
    }
  };

  const handleResetAll = (): void => {
    resetFilters();
    handleClearSelection();
    setNotice(null);
    setResetEpoch((current) => current + 1);
  };

  const handleApplyFilters = (): void => {
    navigate('/manage-flashcards?enableFiltering=true');
  };

  const handleCreateQuiz = (): void => {
    navigate('/customquiz');
  };

  const handleCopyPage = (): void => {
    copyPageExamples(displayExamples);
  };

  const handleCopyAll = (): void => {
    void copyAllExamplesToClipboard(exampleAdapter, exampleFilter.filterState);
  };

  return (
    <PageShell reserveBottomBar flushHorizontal>
      <div className={styles.measure}>
        <div className={styles.titleRow}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Flashcard Finder</h1>
          </div>
        </div>
        <FilterSection
          exampleFilter={exampleFilter}
          onResetAll={handleResetAll}
        />
        <ResultsSection
          examples={displayExamples}
          totalCount={exampleQuery.totalCount ?? 0}
          studentFlashcards={flashcardsQuery}
          pagination={pagination}
          totalPages={totalPages}
          lessonPopup={lessonPopup}
          filteredExamplesLoading={filteredExamplesLoading}
          firstPageLoading={
            initialLoading ||
            (exampleQuery.isLoading && exampleQuery.page === 1)
          }
          newPageLoading={exampleQuery.isLoading && exampleQuery.page > 1}
          isAdmin={exampleFilter.isAdmin === true}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          onNotice={setNotice}
          onApplyFilters={handleApplyFilters}
          onCreateQuiz={handleCreateQuiz}
          onCopyPage={handleCopyPage}
          onCopyAll={handleCopyAll}
          resetEpoch={resetEpoch}
        />
        <FinderBottomBar
          notice={notice}
          onDismissNotice={() => {
            setNotice(null);
          }}
          selectedCount={selectedIds.size}
          onClearSelection={handleClearSelection}
          onCollect={handleCollect}
        />
      </div>
    </PageShell>
  );
}

export function FlashcardFinderV2(): JSX.Element {
  const {
    exampleQuery,
    displayExamples,
    flashcardsQuery,
    pagination,
    totalPages,
    lessonPopup,
    initialLoading,
    filteredExamplesLoading,
    error,
    exampleFilter,
    resetFilters,
  } = useFlashcardFinder();

  if (error) {
    return <h2>Error Loading Flashcard Finder</h2>;
  }

  return (
    <FlashcardFinderV2Loaded
      exampleQuery={exampleQuery}
      displayExamples={displayExamples}
      flashcardsQuery={flashcardsQuery}
      pagination={pagination}
      totalPages={totalPages}
      lessonPopup={lessonPopup}
      filteredExamplesLoading={filteredExamplesLoading}
      initialLoading={initialLoading}
      exampleFilter={exampleFilter}
      resetFilters={resetFilters}
    />
  );
}
