import type { MenuItem } from '@interface/components/general/Menu/Menu';
import type { JSX } from 'react';
import { ActionsMenu } from '@interface/components/studentFlashcards/ActionsMenu';
import styles from './ManagerActionsMenu.module.scss';

export interface ManagerActionsMenuProps {
  /** Rows on the current page — used in the copy-page hint. */
  pageItemCount: number;
  /** Owned flashcards matching the filters — used in the copy-all hint. */
  totalItemCount: number;
  onCopyPage: () => void;
  onCopyAll: () => void;
  /** The page owns the confirmation modal for this one. */
  onDeleteAllSpanglish: () => void;
  onFindMore: () => void;
  onQuizFiltered: () => void;
}

/**
 * Results-header menu for the flashcard manager. Presentational: the page
 * supplies counts and does the copying, deleting, and navigating.
 */
export function ManagerActionsMenu({
  pageItemCount,
  totalItemCount,
  onCopyPage,
  onCopyAll,
  onDeleteAllSpanglish,
  onFindMore,
  onQuizFiltered,
}: ManagerActionsMenuProps): JSX.Element {
  const items: MenuItem[] = [
    {
      id: 'copy-page',
      icon: 'clipboard',
      label: 'Copy this page to clipboard',
      hint: `Copies the ${pageItemCount} rows on this page.`,
      onSelect: onCopyPage,
    },
    {
      id: 'copy-all',
      icon: 'clipboardCopy',
      label: 'Copy all results to clipboard',
      hint: `Copies all ${totalItemCount} matches, not just this page.`,
      onSelect: onCopyAll,
    },
    {
      id: 'delete-spanglish',
      icon: 'language',
      label: 'Delete all owned Spanglish',
      hint: 'Removes every Spanglish flashcard you own.',
      onSelect: onDeleteAllSpanglish,
    },
    {
      id: 'find-more',
      icon: 'search',
      label: 'Find more matching flashcards',
      hint: 'Search the catalog with these same filters.',
      onSelect: onFindMore,
    },
    {
      id: 'quiz-filtered',
      icon: 'checklist',
      label: 'Quiz my flashcards matching these filters',
      hint: 'Quiz only the flashcards these filters match.',
      onSelect: onQuizFiltered,
    },
  ];

  return (
    <ActionsMenu
      className={styles.root}
      label="Do more with these"
      items={items}
    />
  );
}
