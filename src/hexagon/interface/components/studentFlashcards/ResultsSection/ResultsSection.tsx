import type { PaginationState } from '@application/units/Pagination/usePagination';
import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { FlashcardReviewDates } from '@domain/functions/formatFlashcardReviewDates';
import type {
  DataTableColumn,
  DataTableMobileLayout,
} from '@interface/components/general/DataTable/DataTable';
import type { IconName } from '@interface/components/general/Icon/Icon';
import type {
  ExampleRowAction,
  PlayingClip,
} from '@interface/components/studentFlashcards/ResultsSection/ExampleRow';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import type { HTMLAttributes, JSX, ReactNode } from 'react';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { DataTable } from '@interface/components/general/DataTable/DataTable';
import { EmptyState } from '@interface/components/general/EmptyState/EmptyState';
import { PaginationV2 } from '@interface/components/general/PaginationV2/PaginationV2';
import { Skeleton } from '@interface/components/general/Skeleton/Skeleton';
import { FinderActionsMenu } from '@interface/components/studentFlashcards/FinderActionsMenu';
import { buildExampleRow } from '@interface/components/studentFlashcards/ResultsSection/ExampleRow';
import { useEffect, useRef, useState } from 'react';
import styles from './ResultsSection.module.scss';

/**
 * The slice of a pagination unit this section actually uses.
 * `QueryPaginationState` satisfies it as-is; `PaginationState` names its page
 * `pageNumber`, so pass it through `toResultsPagination`.
 */
export interface ResultsPagination {
  page: number;
  pageSize: number;
  maxPageNumber: number;
  goToPage: (page: number) => void;
}

export function toResultsPagination(
  pagination: PaginationState,
): ResultsPagination {
  return {
    page: pagination.pageNumber,
    pageSize: pagination.pageSize,
    maxPageNumber: pagination.maxPageNumber,
    goToPage: pagination.goToPage,
  };
}

export interface ResultsSectionProps {
  examples: ExampleWithVocabulary[];
  totalCount: number;
  studentFlashcards: UseStudentFlashcardsReturn;
  pagination: ResultsPagination;
  totalPages: number | null;
  lessonPopup: LessonPopup;
  filteredExamplesLoading: boolean;
  firstPageLoading: boolean;
  newPageLoading: boolean;
  /** Only reaches the built-in finder actions menu. Omit when replacing it. */
  isAdmin?: boolean;
  onNotice?: (message: string) => void;
  onApplyFilters?: () => void;
  onCreateQuiz?: () => void;
  onCopyPage?: () => void;
  onCopyAll?: () => void;
  selectedIds?: ReadonlySet<number>;
  onSelectionChange?: (selectedIds: ReadonlySet<number>) => void;
  /** Increment to collapse expanded rows (reset-all). */
  resetEpoch?: number;
  /**
   * Opt in to focus recovery, and increment to trigger it. Passing this makes
   * the count row a labelled `tabIndex={-1}` landing spot and moves focus there
   * whenever the number changes or a row Remove fires, so a destroyed control
   * does not drop a keyboard user on `<body>`. Omitted on the finder, whose row
   * action swaps Collect for Owned in place — a focusable button always
   * survives there, so nothing should move.
   */
  focusRequest?: number;
  /** Noun beside the count, e.g. "flashcards match". */
  countLabel?: string;
  /**
   * Noun the footer range counts, e.g. `No matches` / `… of 32 matches`. The
   * manager only matches while its filters are on, so it says `flashcards`
   * otherwise.
   */
  rangeNoun?: string;
  /** Accessible name for the table. */
  caption?: string;
  emptyTitle?: string;
  emptyGuidance?: string;
  emptyIcon?: IconName;
  /** Replaces the built-in finder actions menu in the count row. */
  actionsMenu?: ReactNode;
  /** `remove` gives every row a single Remove button. */
  rowAction?: ExampleRowAction;
  /** Supplies the expand panel's review-schedule column, per example. */
  getReviewSchedule?: (exampleId: number) => FlashcardReviewDates | undefined;
  /** Opt in to the sub-768px reflow. Off keeps the desktop grid at any width. */
  mobileLayout?: boolean;
}

const COLUMNS: DataTableColumn[] = [
  { id: 'select', header: '' },
  { id: 'spanish', header: 'Spanish' },
  { id: 'english', header: 'English' },
  { id: 'actions', header: '', align: 'end' },
];

const MOBILE_COLUMNS: DataTableColumn[] = [
  { id: 'select', header: '', mobileArea: 'select' },
  { id: 'spanish', header: 'Spanish', mobileArea: 'spanish' },
  { id: 'english', header: 'English', mobileArea: 'english' },
  { id: 'actions', header: '', align: 'end', mobileArea: 'expand' },
];

const MOBILE_LAYOUT: DataTableMobileLayout = {
  columnTemplate: '44px 1fr 44px',
  templateAreas: '"select spanish expand" "select english expand"',
};

const COLUMN_TEMPLATE = '44px minmax(240px, 1fr) minmax(240px, 1fr) 132px';

function ignoreAction(): void {}

export function formatRangeLabel(
  page: number,
  pageSize: number,
  totalCount: number,
  noun = 'matches',
): string {
  if (totalCount === 0) {
    return `No ${noun}`;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  return `Showing ${start}–${end} of ${totalCount} ${noun}`;
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
  isAdmin = false,
  onNotice,
  onApplyFilters,
  onCreateQuiz,
  onCopyPage,
  onCopyAll,
  selectedIds: selectedIdsProp,
  onSelectionChange,
  resetEpoch = 0,
  countLabel = 'flashcards match',
  rangeNoun = 'matches',
  caption = 'Flashcard finder results',
  emptyTitle = 'No flashcards match',
  emptyGuidance = 'Try removing a tag or widening the lesson range.',
  emptyIcon = 'searchOff',
  actionsMenu,
  rowAction = 'collect',
  getReviewSchedule,
  mobileLayout = false,
  focusRequest,
}: ResultsSectionProps): JSX.Element {
  const audioRef = useRef<HTMLAudioElement>(null);
  const focusAnchorRef = useRef<HTMLDivElement>(null);
  const lastFocusRequest = useRef(focusRequest);
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

  // Seeded with the incoming value, so the first render and every re-render
  // that is not a fresh request leave focus exactly where the student put it.
  useEffect(() => {
    if (
      focusRequest === undefined ||
      focusRequest === lastFocusRequest.current
    ) {
      return;
    }
    lastFocusRequest.current = focusRequest;
    focusAnchorRef.current?.focus();
  }, [focusRequest]);

  const recoversFocus = focusRequest !== undefined;
  const focusAnchorProps: HTMLAttributes<HTMLDivElement> = recoversFocus
    ? { role: 'group', tabIndex: -1, 'aria-label': caption }
    : {};

  const focusResults = (): void => {
    focusAnchorRef.current?.focus();
  };

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
          rowAction,
          reviewSchedule: getReviewSchedule?.(example.id),
          onRemoveRequested: recoversFocus ? focusResults : undefined,
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
      <div
        className={styles.countRow}
        ref={focusAnchorRef}
        {...focusAnchorProps}
      >
        <div className={styles.count}>
          {!showSkeleton && (
            <>
              <span className={styles.countNumber}>{totalCount}</span>
              <span className={styles.countLabel}>{countLabel}</span>
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
            {actionsMenu ?? (
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
            )}
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
          columns={mobileLayout ? MOBILE_COLUMNS : COLUMNS}
          rows={rows}
          columnTemplate={COLUMN_TEMPLATE}
          mobileLayout={mobileLayout ? MOBILE_LAYOUT : undefined}
          caption={caption}
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
                  icon={emptyIcon}
                  title={emptyTitle}
                  guidance={emptyGuidance}
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
                  rangeNoun,
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
