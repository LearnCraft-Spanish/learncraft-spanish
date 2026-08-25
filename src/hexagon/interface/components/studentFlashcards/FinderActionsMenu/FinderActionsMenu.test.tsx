import type { FinderActionsMenuProps } from '@interface/components/studentFlashcards/FinderActionsMenu/FinderActionsMenu';
import { FinderActionsMenu } from '@interface/components/studentFlashcards/FinderActionsMenu/FinderActionsMenu';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './FinderActionsMenu.module.scss';

function renderMenu(
  overrides: Partial<FinderActionsMenuProps> = {},
): FinderActionsMenuProps {
  const props: FinderActionsMenuProps = {
    isAdmin: true,
    pageExampleCount: 5,
    totalExampleCount: 12,
    onApplyFilters: vi.fn<() => void>(),
    onCreateQuiz: vi.fn<() => void>(),
    onCopyPage: vi.fn<() => void>(),
    onCopyAll: vi.fn<() => void>(),
    onNotice: vi.fn<(message: string) => void>(),
    ...overrides,
  };

  render(<FinderActionsMenu {...props} />);

  return props;
}

async function openMenu(): Promise<void> {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Do more with these' }));
}

describe('finder actions menu', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the closed trigger without listing actions', () => {
    const { container } = render(
      <FinderActionsMenu
        isAdmin
        pageExampleCount={5}
        totalExampleCount={12}
        onApplyFilters={vi.fn()}
        onCreateQuiz={vi.fn()}
        onCopyPage={vi.fn()}
        onCopyAll={vi.fn()}
        onNotice={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Do more with these' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: /Apply these filters to my flashcards/,
      }),
    ).not.toBeInTheDocument();
    expect(container.querySelector('[data-state]')).toHaveAttribute(
      'data-state',
      'closed',
    );
    expect(
      screen
        .getByRole('button', { name: 'Do more with these' })
        .closest(`.${styles.root}`),
    ).not.toBeNull();
  });

  it('opens on the trigger and lists admin actions', async () => {
    const { container } = render(
      <FinderActionsMenu
        isAdmin
        pageExampleCount={5}
        totalExampleCount={12}
        onApplyFilters={vi.fn()}
        onCreateQuiz={vi.fn()}
        onCopyPage={vi.fn()}
        onCopyAll={vi.fn()}
        onNotice={vi.fn()}
      />,
    );
    await openMenu();

    expect(container.querySelector('[data-state]')).toHaveAttribute(
      'data-state',
      'open',
    );
    expect(screen.getByRole('list')).toHaveAccessibleName('Do more with these');
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(
      screen.getByRole('button', {
        name: /Copy all examples/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Admin only')).toBeInTheDocument();
  });

  it('omits copy-all when the user is not an admin', async () => {
    renderMenu({ isAdmin: false });
    await openMenu();

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(
      screen.queryByRole('button', { name: /Copy all examples/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Admin only')).not.toBeInTheDocument();
  });

  it('fills live counts into the hints', async () => {
    renderMenu({ pageExampleCount: 5, totalExampleCount: 12 });
    await openMenu();

    expect(
      screen.getByText('Filter your owned flashcards the same way.'),
    ).toBeInTheDocument();
    expect(screen.getByText('12 examples in total.')).toBeInTheDocument();
    expect(
      screen.getByText('Copies the 5 rows on this page.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Copies all 12 matches, not just this page.'),
    ).toBeInTheDocument();
  });

  it('applies filters, notices, and closes', async () => {
    const user = userEvent.setup();
    const props = renderMenu();
    await openMenu();

    await user.click(
      screen.getByRole('button', {
        name: /Apply these filters to my flashcards/,
      }),
    );

    expect(props.onApplyFilters).toHaveBeenCalledOnce();
    expect(props.onNotice).toHaveBeenCalledWith(
      'Filters applied to your flashcards.',
    );
    expect(
      screen.queryByRole('button', {
        name: /Apply these filters to my flashcards/,
      }),
    ).not.toBeInTheDocument();
  });

  it('creates a quiz, notices, and closes', async () => {
    const user = userEvent.setup();
    const props = renderMenu({ totalExampleCount: 12 });
    await openMenu();

    await user.click(
      screen.getByRole('button', {
        name: /Create a quiz from these examples/,
      }),
    );

    expect(props.onCreateQuiz).toHaveBeenCalledOnce();
    expect(props.onNotice).toHaveBeenCalledWith(
      'Quiz created from 12 examples.',
    );
  });

  it('copies this page, notices, and closes', async () => {
    const user = userEvent.setup();
    const props = renderMenu({ pageExampleCount: 5 });
    await openMenu();

    await user.click(
      screen.getByRole('button', {
        name: /Copy this page of examples/,
      }),
    );

    expect(props.onCopyPage).toHaveBeenCalledOnce();
    expect(props.onNotice).toHaveBeenCalledWith(
      '5 examples copied to clipboard.',
    );
  });

  it('copies all matches, notices, and closes', async () => {
    const user = userEvent.setup();
    const props = renderMenu({ totalExampleCount: 12 });
    await openMenu();

    await user.click(screen.getByRole('button', { name: /Copy all examples/ }));

    expect(props.onCopyAll).toHaveBeenCalledOnce();
    expect(props.onNotice).toHaveBeenCalledWith(
      '12 examples copied to clipboard.',
    );
  });

  it('does not call copy-all from a non-admin session', async () => {
    const props = renderMenu({ isAdmin: false });
    await openMenu();

    expect(props.onCopyAll).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: /Copy all examples/ }),
    ).not.toBeInTheDocument();
  });

  it('toggles closed from the trigger without running an action', async () => {
    const user = userEvent.setup();
    const props = renderMenu();
    await openMenu();

    expect(
      screen.getByRole('button', {
        name: /Apply these filters to my flashcards/,
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Do more with these' }),
    );

    expect(
      screen.queryByRole('button', {
        name: /Apply these filters to my flashcards/,
      }),
    ).not.toBeInTheDocument();
    expect(props.onApplyFilters).not.toHaveBeenCalled();
    expect(props.onNotice).not.toHaveBeenCalled();
  });

  it('dismisses on Escape without running an action', async () => {
    const user = userEvent.setup();
    const props = renderMenu();
    await openMenu();

    await user.keyboard('{Escape}');

    expect(
      screen.queryByRole('button', {
        name: /Apply these filters to my flashcards/,
      }),
    ).not.toBeInTheDocument();
    expect(props.onCreateQuiz).not.toHaveBeenCalled();
    expect(props.onNotice).not.toHaveBeenCalled();
  });
});
