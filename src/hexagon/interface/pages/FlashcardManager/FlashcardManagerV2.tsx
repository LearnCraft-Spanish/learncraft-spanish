import type { UseCombinedFiltersWithVocabularyReturnType } from '@application/units/Filtering/useCombinedFiltersWithVocabulary';
import type { PaginationState } from '@application/units/Pagination/usePagination';
import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { FlashcardReviewDates } from '@domain/functions/formatFlashcardReviewDates';
import type { IconName } from '@interface/components/general/Icon/Icon';
import type { Flashcard } from '@learncraft-spanish/shared';
import type { JSX } from 'react';
import useFlashcardManager from '@application/useCases/useFlashcardManager';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { Toggle } from '@interface/components/general/Toggle/Toggle';
import { FilterSection } from '@interface/components/studentFlashcards/FilterSection';
import { FinderBottomBar } from '@interface/components/studentFlashcards/FinderBottomBar';
import { ManagerActionsMenu } from '@interface/components/studentFlashcards/ManagerActionsMenu';
import {
  ResultsSection,
  toResultsPagination,
} from '@interface/components/studentFlashcards/ResultsSection';
import { writeTableToClipboard } from '@interface/components/Tables/units/functions';
import { useEnableFilteringParam } from '@interface/hooks/useEnableFilteringParam';
import { useModal } from '@interface/hooks/useModal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './FlashcardManager.module.scss';

interface FlashcardManagerV2LoadedProps {
  /** The whole filtered collection, not just the current page. */
  allFlashcards: Flashcard[];
  displayFlashcards: Flashcard[];
  paginationState: PaginationState;
  filterOwnedFlashcards: boolean;
  setFilterOwnedFlashcards: (filterOwnedFlashcards: boolean) => void;
  onGoingToQuiz: () => void;
  exampleFilter: UseCombinedFiltersWithVocabularyReturnType;
  resetFilters: () => void;
  lessonPopup: LessonPopup;
  flashcardsQuery: UseStudentFlashcardsReturn;
  getReviewSchedule: (exampleId: number) => FlashcardReviewDates | undefined;
  spanglishFlashcardCount: number;
  deleteAllOwnedSpanglish: () => Promise<number>;
  studentFlashcardsLoading: boolean;
  filteredFlashcardsLoading: boolean;
  dependenciesLoading: boolean;
}

/**
 * Two kinds of rejection arrive here and only one of them is announced. A
 * mutation that fails is toasted by `useFlashcardsQuery`'s `onError`, so
 * repeating it would double the surface. The access guard in the same file
 * (`deleteFlashcards` with no student role) only `console.error`s and rejects,
 * so that path is silent to the student — deliberately, since it means a
 * misrouted session rather than a failed removal, and it is the query layer's
 * call to make. Either way the page owes a handler so the rejection is not
 * unhandled, and silence rather than a success notice.
 */
function ignoreRemovalRejection(): void {}

function flashcardCountPhrase(count: number): string {
  return count === 1 ? '1 flashcard' : `${count} flashcards`;
}

function spanglishCountPhrase(count: number): string {
  return count === 1
    ? '1 Spanglish flashcard'
    : `${count} Spanglish flashcards`;
}

function spanglishConfirmBody(count: number): string {
  return `You have ${count} spanglish flashcard${
    count === 1 ? '' : 's'
  }. Are you sure you want to delete them?`;
}

function FlashcardManagerV2Loaded({
  allFlashcards,
  displayFlashcards,
  paginationState,
  filterOwnedFlashcards,
  setFilterOwnedFlashcards,
  onGoingToQuiz,
  exampleFilter,
  resetFilters,
  lessonPopup,
  flashcardsQuery,
  getReviewSchedule,
  spanglishFlashcardCount,
  deleteAllOwnedSpanglish,
  studentFlashcardsLoading,
  filteredFlashcardsLoading,
  dependenciesLoading,
}: FlashcardManagerV2LoadedProps): JSX.Element {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const [resetEpoch, setResetEpoch] = useState(0);
  const [resultsFocusRequest, setResultsFocusRequest] = useState(0);

  const pageExamples = displayFlashcards.map((flashcard) => flashcard.example);
  const allExamples = allFlashcards.map((flashcard) => flashcard.example);

  /**
   * Selection is held against the whole filtered collection so it survives
   * paging, and liveness is derived every render rather than trimmed into
   * state: while the lesson-vocabulary query refetches, the collection is
   * briefly empty, and a trim would destroy the selection instead of letting
   * it come back with the data. The derived set is the only one the count, the
   * checkboxes, and the bulk removal read, so a student can never remove a row
   * that is not in front of them. Deriving is safe only because every writer
   * hands back an ABSOLUTE set built from `liveSelectedIds` —
   * `ResultsSection` rebuilds one from the trimmed prop, `handleClearSelection`
   * passes an empty one. An updater reading `prev` would resurrect ids that
   * left the collection for good.
   */
  const liveIds = new Set(
    allFlashcards.map((flashcard) => flashcard.example.id),
  );
  const liveSelectedIds = new Set(
    [...selectedIds].filter((id) => liveIds.has(id)),
  );

  const handleClearSelection = (): void => {
    setSelectedIds(new Set());
  };

  /**
   * Bulk Remove and Clear selection unmount the button that was activated, so
   * focus would land on `<body>`, above the filter card and up to a page of
   * rows away. Hand it to the results region instead.
   */
  const requestResultsFocus = (): void => {
    setResultsFocusRequest((current) => current + 1);
  };

  const handleClearSelectionFromBar = (): void => {
    handleClearSelection();
    requestResultsFocus();
  };

  const handleRemoveSelected = (): void => {
    const toRemove = [...liveSelectedIds];

    handleClearSelection();
    requestResultsFocus();

    if (toRemove.length === 0) {
      return;
    }

    // The mutation resolves with the number of cards the API actually deleted,
    // which can be fewer than were asked for. Reporting the request size would
    // let the bar claim 25 removals under a toast saying 20 of 25 succeeded.
    void flashcardsQuery
      .deleteFlashcards(toRemove)
      .then((removedCount) => {
        setNotice(
          `${flashcardCountPhrase(removedCount)} removed from your collection.`,
        );
      })
      .catch(ignoreRemovalRejection);
  };

  const handleResetAll = (): void => {
    resetFilters();
    handleClearSelection();
    setNotice(null);
    setResetEpoch((current) => current + 1);
  };

  const handleCopyPage = (): void => {
    writeTableToClipboard(pageExamples);
    setNotice(
      `${flashcardCountPhrase(pageExamples.length)} copied to clipboard.`,
    );
  };

  const handleCopyAll = (): void => {
    writeTableToClipboard(allExamples);
    setNotice(
      `${flashcardCountPhrase(allExamples.length)} copied to clipboard.`,
    );
  };

  const handleDeleteAllSpanglish = (): void => {
    if (spanglishFlashcardCount === 0) {
      toast.error('You do not have any spanglish flashcards.', {
        autoClose: 3000,
      });
      return;
    }
    openModal({
      title: 'Delete All Owned Spanglish Flashcards?',
      body: spanglishConfirmBody(spanglishFlashcardCount),
      type: 'confirm',
      confirmFunction: () => {
        // Also resolves with the number actually deleted, so the notice counts
        // rather than claiming the whole set is gone.
        void deleteAllOwnedSpanglish()
          .then((removedCount) => {
            setNotice(
              `${spanglishCountPhrase(
                removedCount,
              )} removed from your collection.`,
            );
          })
          .catch(ignoreRemovalRejection);
        closeModal();
      },
    });
  };

  const handleFindMore = (): void => {
    navigate('/flashcardfinder');
  };

  const handleQuizFiltered = (): void => {
    onGoingToQuiz();
    navigate('/myflashcards?enableFiltering=true');
  };

  const emptyTitle = filterOwnedFlashcards
    ? 'No flashcards match'
    : 'No flashcards yet';
  const emptyGuidance = filterOwnedFlashcards
    ? 'Try removing a tag or widening the lesson range.'
    : 'Use the Flashcard Finder to collect your first flashcards.';
  const emptyIcon: IconName = filterOwnedFlashcards ? 'searchOff' : 'search';

  return (
    <PageShell reserveBottomBar flushHorizontal>
      <div className={styles.measure}>
        <div className={styles.titleRow}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Flashcard Manager</h1>
          </div>
          <div className={styles.filterToggle}>
            <Toggle
              id="manager-filter-owned"
              checked={filterOwnedFlashcards}
              onChange={setFilterOwnedFlashcards}
              label="Filter my flashcards"
            />
          </div>
        </div>
        {filterOwnedFlashcards && (
          <FilterSection
            exampleFilter={exampleFilter}
            onResetAll={handleResetAll}
          />
        )}
        <ResultsSection
          mobileLayout
          rowAction="remove"
          examples={pageExamples}
          totalCount={allFlashcards.length}
          studentFlashcards={flashcardsQuery}
          pagination={toResultsPagination(paginationState)}
          totalPages={paginationState.maxPageNumber}
          lessonPopup={lessonPopup}
          filteredExamplesLoading={filteredFlashcardsLoading}
          firstPageLoading={studentFlashcardsLoading || dependenciesLoading}
          newPageLoading={false}
          selectedIds={liveSelectedIds}
          onSelectionChange={setSelectedIds}
          resetEpoch={resetEpoch}
          focusRequest={resultsFocusRequest}
          countLabel={
            filterOwnedFlashcards
              ? 'flashcards match'
              : 'flashcards in your collection'
          }
          rangeNoun={filterOwnedFlashcards ? 'matches' : 'flashcards'}
          caption="Flashcard manager results"
          emptyTitle={emptyTitle}
          emptyGuidance={emptyGuidance}
          emptyIcon={emptyIcon}
          getReviewSchedule={getReviewSchedule}
          actionsMenu={
            <ManagerActionsMenu
              pageItemCount={pageExamples.length}
              totalItemCount={allFlashcards.length}
              onCopyPage={handleCopyPage}
              onCopyAll={handleCopyAll}
              onDeleteAllSpanglish={handleDeleteAllSpanglish}
              onFindMore={handleFindMore}
              onQuizFiltered={handleQuizFiltered}
            />
          }
        />
        <FinderBottomBar
          notice={notice}
          onDismissNotice={() => {
            setNotice(null);
          }}
          selectedCount={liveSelectedIds.size}
          onClearSelection={handleClearSelectionFromBar}
          onCollect={handleRemoveSelected}
          primaryActionLabel="Remove flashcards"
        />
      </div>
    </PageShell>
  );
}

export function FlashcardManagerV2(): JSX.Element {
  const enableFiltering = useEnableFilteringParam();

  const {
    allFlashcards,
    displayFlashcards,
    paginationState,
    filterOwnedFlashcards,
    setFilterOwnedFlashcards,
    onGoingToQuiz,
    exampleFilter,
    resetFilters,
    lessonPopup,
    flashcardsQuery,
    getReviewSchedule,
    spanglishFlashcardCount,
    deleteAllOwnedSpanglish,
    studentFlashcardsLoading,
    filteredFlashcardsLoading,
    dependenciesLoading,
    error,
  } = useFlashcardManager({
    enableFilteringByDefault: enableFiltering,
  });

  if (error) {
    return <h2>Error Loading Flashcard Manager</h2>;
  }

  // The shell and title stay mounted while data loads; skeletons land with the
  // filter section and results table.
  return (
    <FlashcardManagerV2Loaded
      allFlashcards={allFlashcards}
      displayFlashcards={displayFlashcards}
      paginationState={paginationState}
      filterOwnedFlashcards={filterOwnedFlashcards}
      setFilterOwnedFlashcards={setFilterOwnedFlashcards}
      onGoingToQuiz={onGoingToQuiz}
      exampleFilter={exampleFilter}
      resetFilters={resetFilters}
      lessonPopup={lessonPopup}
      flashcardsQuery={flashcardsQuery}
      getReviewSchedule={getReviewSchedule}
      spanglishFlashcardCount={spanglishFlashcardCount}
      deleteAllOwnedSpanglish={deleteAllOwnedSpanglish}
      studentFlashcardsLoading={studentFlashcardsLoading}
      filteredFlashcardsLoading={filteredFlashcardsLoading}
      dependenciesLoading={dependenciesLoading}
    />
  );
}
