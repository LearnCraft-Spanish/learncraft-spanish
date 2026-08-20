import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { DataTableColumn } from '@interface/components/general/DataTable/DataTable';
import type { PlayingClip } from '@interface/components/studentFlashcards/ResultsSection/ExampleRow';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import type { JSX } from 'react';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { DataTable } from '@interface/components/general/DataTable/DataTable';
import { EmptyState } from '@interface/components/general/EmptyState/EmptyState';
import { PaginationV2 } from '@interface/components/general/PaginationV2/PaginationV2';
import { Skeleton } from '@interface/components/general/Skeleton/Skeleton';
import { FinderActionsMenu } from '@interface/components/studentFlashcards/FinderActionsMenu';
import { buildExampleRow } from '@interface/components/studentFlashcards/ResultsSection/ExampleRow';
import { useEffect, useRef, useState } from 'react';
import styles from './ResultsSection.module.scss';

export interface ResultsSectionProps {
  examples: ExampleWithVocabulary[];
  totalCount: number;
  studentFlashcards: UseStudentFlashcardsReturn;
  pagination: QueryPaginationState;
  totalPages: number | null;
  lessonPopup: LessonPopup;
  filteredExamplesLoading: boolean;
  firstPageLoading: boolean;
  newPageLoading: boolean;
  isAdmin: boolean;
  onNotice?: (message: string) => void;
  onApplyFilters?: () => void;
  onCreateQuiz?: () => void;
  onCopyPage?: () => void;
  onCopyAll?: () => void;
  selectedIds?: ReadonlySet<number>;
  onSelectionChange?: (selectedIds: ReadonlySet<number>) => void;
  /** Increment to collapse expanded rows (reset-all). */
  resetEpoch?: number;
}

const COLUMNS: DataTableColumn[] = [
  { id: 'select', header: '' },
  { id: 'spanish', header: 'Spanish' },
  { id: 'english', header: 'English' },
  { id: 'actions', header: '', align: 'end' },
];

const COLUMN_TEMPLATE = '44px minmax(240px, 1fr) minmax(240px, 1fr) 132px';

function ignoreAction(): void {}

export function formatRangeLabel(
  page: number,
  pageSize: number,
  totalCount: number,
): string {
  if (totalCount === 0) {
    return 'No matches';
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  return `Showing ${start}–${end} of ${totalCount} matches`;
}

export function ResultsSection({
  examples,
  totalCount,
  studentFlashcards,
  pagination,
  totalPages,
  lessonPopup,
  filteredExamplesLoading,
  firstPageLoading,
  isAdmin,
  onNotice,
  onApplyFilters,
  onCreateQuiz,
  onCopyPage,
  onCopyAll,
  selectedIds: selectedIdsProp,
  onSelectionChange,
  resetEpoch = 0,
}: ResultsSectionProps): JSX.Element {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [internalSelectedIds, setInternalSelectedIds] = useState<
    ReadonlySet<number>
  >(() => new Set());
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [openVocabId, setOpenVocabId] = useState<number | null>(null);
  const [playing, setPlaying] = useState<PlayingClip | null>(null);

  const selectedIds = selectedIdsProp ?? internalSelectedIds;
  const exampleKey = examples.map((example) => example.id).join(',');

  const updateSelectedIds = (next: ReadonlySet<number>): void => {
    if (selectedIdsProp === undefined) {
      setInternalSelectedIds(next);
    }
    onSelectionChange?.(next);
  };

  useEffect(() => {
    setExpandedId(null);
    setOpenVocabId(null);
    setPlaying(null);
    audioRef.current?.pause();
  }, [pagination.page, exampleKey, resetEpoch]);

  const showSkeleton =
    (firstPageLoading || filteredExamplesLoading) && examples.length === 0;
  const allPageSelected =
    examples.length > 0 &&
    examples.every((example) => selectedIds.has(example.id));
  const pageCount = Math.max(1, totalPages ?? pagination.maxPageNumber);

  const rows = showSkeleton
    ? []
    : examples.map((example) =>
        buildExampleRow({
          example,
          selected: selectedIds.has(example.id),
          expanded: expandedId === example.id,
          playing,
          openVocabId,
          studentFlashcards,
          lessonPopup,
          onToggleSelected: (exampleId, selected) => {
            const next = new Set(selectedIds);
            if (selected) {
              next.add(exampleId);
            } else {
              next.delete(exampleId);
            }
            updateSelectedIds(next);
          },
          onToggleExpanded: (exampleId) => {
            setExpandedId((current) =>
              current === exampleId ? null : exampleId,
            );
            setOpenVocabId(null);
          },
          onTogglePlay: (clip, url) => {
            const audio = audioRef.current;
            if (playing === clip) {
              audio?.pause();
              setPlaying(null);
              return;
            }
            if (audio !== null && url.length > 0) {
              audio.src = url;
              void audio.play();
            } else {
              audio?.pause();
            }
            setPlaying(clip);
          },
          onToggleVocab: (vocabId) => {
            setOpenVocabId((current) => (current === vocabId ? null : vocabId));
          },
        }),
      );

  const handlePageChange = (nextPage: number): void => {
    if (nextPage === pagination.page) {
      return;
    }
    pagination.goToPage(nextPage);
  };

  const handleSelectAll = (): void => {
    if (allPageSelected) {
      updateSelectedIds(new Set());
      return;
    }
    updateSelectedIds(new Set(examples.map((example) => example.id)));
  };

  return (
    <section>
      <div className={styles.countRow}>
        <div className={styles.count}>
          {!showSkeleton && (
            <>
              <span className={styles.countNumber}>{totalCount}</span>
              <span className={styles.countLabel}>flashcards match</span>
            </>
          )}
        </div>
        <div className={styles.countTools}>
          {examples.length > 0 && (
            <span className={styles.selectAll}>
              <Button variant="ghost" size="inline" onClick={handleSelectAll}>
                {allPageSelected
                  ? 'Deselect all'
                  : `Select all ${examples.length}`}
              </Button>
            </span>
          )}
          <div className={styles.actionsMenu}>
            <FinderActionsMenu
              isAdmin={isAdmin}
              pageExampleCount={examples.length}
              totalExampleCount={totalCount}
              onApplyFilters={onApplyFilters ?? ignoreAction}
              onCreateQuiz={onCreateQuiz ?? ignoreAction}
              onCopyPage={onCopyPage ?? ignoreAction}
              onCopyAll={onCopyAll ?? ignoreAction}
              onNotice={onNotice ?? ignoreAction}
            />
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <audio
          className={styles.audio}
          ref={audioRef}
          onEnded={() => {
            setPlaying(null);
          }}
        />
        <DataTable
          columns={COLUMNS}
          rows={rows}
          columnTemplate={COLUMN_TEMPLATE}
          caption="Flashcard finder results"
          expandTone="flush"
          groupSelection
          disableRowHover
          emptyState={
            showSkeleton ? (
              <div className={styles.skeletonBody}>
                <Skeleton count={5} label="Loading flashcards" variant="rows" />
              </div>
            ) : (
              <div className={styles.finderEmpty}>
                <EmptyState
                  icon="searchOff"
                  title="No flashcards match"
                  guidance="Try removing a tag or widening the lesson range."
                />
              </div>
            )
          }
        />
        <footer className={styles.footer}>
          <span className={styles.range}>
            {showSkeleton
              ? null
              : formatRangeLabel(
                  pagination.page,
                  pagination.pageSize,
                  totalCount,
                )}
          </span>
          <PaginationV2
            page={pagination.page}
            pageCount={pageCount}
            onPageChange={handlePageChange}
            unavailableTreatment="parchment"
          />
        </footer>
      </div>
    </section>
  );
}
