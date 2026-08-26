import type { ManagerActionsMenuProps } from '@interface/components/studentFlashcards/ManagerActionsMenu/ManagerActionsMenu';
import { ManagerActionsMenu } from '@interface/components/studentFlashcards/ManagerActionsMenu/ManagerActionsMenu';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

function renderMenu(
  overrides: Partial<ManagerActionsMenuProps> = {},
): ManagerActionsMenuProps {
  const props: ManagerActionsMenuProps = {
    pageItemCount: 25,
    totalItemCount: 140,
    onCopyPage: vi.fn<() => void>(),
    onCopyAll: vi.fn<() => void>(),
    onDeleteAllSpanglish: vi.fn<() => void>(),
    onFindMore: vi.fn<() => void>(),
    onQuizFiltered: vi.fn<() => void>(),
    ...overrides,
  };

  render(<ManagerActionsMenu {...props} />);

  return props;
}

async function openMenu(): Promise<void> {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Do more with these' }));
}

describe('manager actions menu', () => {
  afterEach(() => {
    cleanup();
  });

  it('lists the five manager actions', async () => {
    renderMenu();
    await openMenu();

    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('Copy this page to clipboard')).toBeInTheDocument();
    expect(
      screen.getByText('Copy all results to clipboard'),
    ).toBeInTheDocument();
    expect(screen.getByText('Delete all owned Spanglish')).toBeInTheDocument();
    expect(
      screen.getByText('Find more matching flashcards'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Quiz my flashcards matching these filters'),
    ).toBeInTheDocument();
  });

  it('fills live counts into the copy hints', async () => {
    renderMenu({ pageItemCount: 25, totalItemCount: 140 });
    await openMenu();

    expect(
      screen.getByText('Copies the 25 rows on this page.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Copies all 140 matches, not just this page.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Removes every Spanglish flashcard you own.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Search the catalog with these same filters.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Quiz only the flashcards these filters match.'),
    ).toBeInTheDocument();
  });

  it('copies this page', async () => {
    const user = userEvent.setup();
    const props = renderMenu();
    await openMenu();

    await user.click(
      screen.getByRole('button', { name: /Copy this page to clipboard/ }),
    );

    expect(props.onCopyPage).toHaveBeenCalledOnce();
  });

  it('copies all results', async () => {
    const user = userEvent.setup();
    const props = renderMenu();
    await openMenu();

    await user.click(
      screen.getByRole('button', { name: /Copy all results to clipboard/ }),
    );

    expect(props.onCopyAll).toHaveBeenCalledOnce();
  });

  it('asks the page to delete all owned Spanglish', async () => {
    const user = userEvent.setup();
    const props = renderMenu();
    await openMenu();

    await user.click(
      screen.getByRole('button', { name: /Delete all owned Spanglish/ }),
    );

    expect(props.onDeleteAllSpanglish).toHaveBeenCalledOnce();
  });

  it('sends the student to the finder', async () => {
    const user = userEvent.setup();
    const props = renderMenu();
    await openMenu();

    await user.click(
      screen.getByRole('button', { name: /Find more matching flashcards/ }),
    );

    expect(props.onFindMore).toHaveBeenCalledOnce();
  });

  it('quizzes the filtered flashcards', async () => {
    const user = userEvent.setup();
    const props = renderMenu();
    await openMenu();

    await user.click(
      screen.getByRole('button', {
        name: /Quiz my flashcards matching these filters/,
      }),
    );

    expect(props.onQuizFiltered).toHaveBeenCalledOnce();
  });
});
