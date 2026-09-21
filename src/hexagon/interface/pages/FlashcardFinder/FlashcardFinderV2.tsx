import type { UseExampleQueryReturnType } from '@application/queries/ExampleQueries/useExampleQuery';
import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import type { JSX } from 'react';
import useFlashcardFinder from '@application/useCases/useFlashcardFinder';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { FilterSection } from '@interface/components/studentFlashcards/FilterSection';
import { FinderBottomBar } from '@interface/components/studentFlashcards/FinderBottomBar';
import { ResultsSection } from '@interface/components/studentFlashcards/ResultsSection';
import { copyTableToClipboard } from '@interface/components/Tables/units/functions';
import { useState } from 'react';
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
  copyAllMatchingExamples: () => Promise<ExampleWithVocabulary[]>;
  selectedIds: ReadonlySet<number>;
  changeSelection: (next: ReadonlySet<number>) => void;
  clearSelection: () => void;
  collectSelected: () => Promise<void>;
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
  copyAllMatchingExamples,
  selectedIds,
  changeSelection,
  clearSelection,
  collectSelected,
}: FlashcardFinderV2LoadedProps): JSX.Element {
  // Notice text and the filter-reset counter are visual. Navigation is an
  // interface concern. Collection lives on the use case.
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);
  const [resetEpoch, setResetEpoch] = useState(0);

  const handleResetAll = (): void => {
    resetFilters();
    clearSelection();
    setNotice(null);
    setResetEpoch((current) => current + 1);
  };

  const handleApplyFilters = (): void => {
    navigate('/manage-flashcards?enableFiltering=true');
  };

  const handleCreateQuiz = (): void => {
    navigate('/customquiz');
  };

  const handleCollect = (): void => {
    void collectSelected().catch(() => {
      setNotice('Could not add those flashcards.');
    });
  };

  const handleCopyPage = (): void => {
    copyPageExamples(displayExamples);
  };

  const handleCopyAll = (): void => {
    void copyAllMatchingExamples()
      .then((examples) => {
        copyTableToClipboard({
          displayOrder: examples.map((example) => ({ recordId: example.id })),
          getExampleOrFlashcardById: (id) =>
            examples.find((example) => example.id === id) ?? null,
        });
      })
      .catch(() => {
        setNotice('Could not copy examples.');
      });
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
          mobileLayout
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
          onSelectionChange={changeSelection}
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
          onClearSelection={clearSelection}
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
    copyAllMatchingExamples,
    selectedIds,
    changeSelection,
    clearSelection,
    collectSelected,
  } = useFlashcardFinder();

  if (error) {
    return (
      <PageShell>
        <h2>Error Loading Flashcard Finder</h2>
      </PageShell>
    );
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
      copyAllMatchingExamples={copyAllMatchingExamples}
      selectedIds={selectedIds}
      changeSelection={changeSelection}
      clearSelection={clearSelection}
      collectSelected={collectSelected}
    />
  );
}
