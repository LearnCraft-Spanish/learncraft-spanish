import type { MenuItem } from '@interface/components/general/Menu/Menu';
import type { JSX } from 'react';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { Menu } from '@interface/components/general/Menu/Menu';
import { useState } from 'react';
import styles from './FinderActionsMenu.module.scss';

export interface FinderActionsMenuProps {
  /** When false, the admin-only "Copy all examples" row is omitted. */
  isAdmin: boolean;
  /** Rows on the current results page — used in the copy-page hint and notice. */
  pageExampleCount: number;
  /** Matches across every page — used in the quiz / copy-all hint and notice. */
  totalExampleCount: number;
  onApplyFilters: () => void;
  onCreateQuiz: () => void;
  onCopyPage: () => void;
  onCopyAll: () => void;
  /** Prototype confirmation copy. The page owns the notice slot. */
  onNotice: (message: string) => void;
}

/**
 * Results-header "Do more with these" menu. Presentational: the page supplies
 * counts, admin gating, and the real apply / quiz / copy work.
 */
export function FinderActionsMenu({
  isAdmin,
  pageExampleCount,
  totalExampleCount,
  onApplyFilters,
  onCreateQuiz,
  onCopyPage,
  onCopyAll,
  onNotice,
}: FinderActionsMenuProps): JSX.Element {
  const [open, setOpen] = useState(false);

  const run = (action: () => void, message: string): void => {
    action();
    onNotice(message);
  };

  const items: MenuItem[] = [
    {
      id: 'apply-filters',
      icon: 'filter',
      label: 'Apply these filters to my flashcards',
      hint: 'Filter your owned flashcards the same way.',
      onSelect: () => {
        run(onApplyFilters, 'Filters applied to your flashcards.');
      },
    },
    {
      id: 'create-quiz',
      icon: 'checklist',
      label: 'Create a quiz from these examples',
      hint: `${totalExampleCount} examples in total.`,
      onSelect: () => {
        run(onCreateQuiz, `Quiz created from ${totalExampleCount} examples.`);
      },
    },
    {
      id: 'copy-page',
      icon: 'clipboard',
      label: 'Copy this page of examples',
      hint: `Copies the ${pageExampleCount} rows on this page.`,
      onSelect: () => {
        run(onCopyPage, `${pageExampleCount} examples copied to clipboard.`);
      },
    },
  ];

  if (isAdmin) {
    items.push({
      id: 'copy-all',
      icon: 'clipboardCopy',
      label: 'Copy all examples',
      hint: `Copies all ${totalExampleCount} matches, not just this page.`,
      badge: 'Admin only',
      onSelect: () => {
        run(onCopyAll, `${totalExampleCount} examples copied to clipboard.`);
      },
    });
  }

  return (
    <div className={styles.root} data-state={open ? 'open' : 'closed'}>
      <Menu
        open={open}
        onDismiss={() => {
          setOpen(false);
        }}
        align="end"
        density="list"
        label="Do more with these"
        trigger={
          <Button
            variant="secondary"
            size="sm"
            leadingIcon="bolt"
            trailingIcon={open ? 'chevronUp' : 'chevronDown'}
            onClick={() => {
              setOpen((isOpen) => !isOpen);
            }}
          >
            Do more with these
          </Button>
        }
        items={items}
      />
    </div>
  );
}
