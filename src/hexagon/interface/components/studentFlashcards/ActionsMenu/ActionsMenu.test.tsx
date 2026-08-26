import type { MenuItem } from '@interface/components/general/Menu/Menu';
import { ActionsMenu } from '@interface/components/studentFlashcards/ActionsMenu/ActionsMenu';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './ActionsMenu.module.scss';

function makeItems(onSelect: () => void): MenuItem[] {
  return [
    {
      id: 'first',
      icon: 'clipboard',
      label: 'Copy this page to clipboard',
      hint: 'Copies the 5 rows on this page.',
      onSelect,
    },
    {
      id: 'second',
      icon: 'search',
      label: 'Find more matching flashcards',
      onSelect: vi.fn<() => void>(),
    },
  ];
}

describe('actions menu', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a closed trigger named for the menu', () => {
    const { container } = render(
      <ActionsMenu label="Do more with these" items={makeItems(vi.fn())} />,
    );

    expect(
      screen.getByRole('button', { name: 'Do more with these' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(container.querySelector('[data-state]')).toHaveAttribute(
      'data-state',
      'closed',
    );
    expect(container.firstElementChild).toHaveClass(styles.root);
  });

  it('adds a caller class to the root beside its own', () => {
    const { container } = render(
      <ActionsMenu
        label="Do more with these"
        items={makeItems(vi.fn())}
        className="finder-hook"
      />,
    );

    expect(container.firstElementChild).toHaveClass(styles.root);
    expect(container.firstElementChild).toHaveClass('finder-hook');
  });

  it('opens the list and marks the root open', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ActionsMenu label="Do more with these" items={makeItems(vi.fn())} />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Do more with these' }),
    );

    expect(screen.getByRole('list')).toHaveAccessibleName('Do more with these');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(
      screen.getByText('Copies the 5 rows on this page.'),
    ).toBeInTheDocument();
    expect(container.querySelector('[data-state]')).toHaveAttribute(
      'data-state',
      'open',
    );
  });

  it('runs an item and closes', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn<() => void>();
    render(
      <ActionsMenu label="Do more with these" items={makeItems(onSelect)} />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Do more with these' }),
    );
    await user.click(
      screen.getByRole('button', { name: /Copy this page to clipboard/ }),
    );

    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('toggles closed from the trigger without running an action', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn<() => void>();
    render(
      <ActionsMenu label="Do more with these" items={makeItems(onSelect)} />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Do more with these' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Do more with these' }),
    );

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('dismisses on Escape', async () => {
    const user = userEvent.setup();
    render(
      <ActionsMenu label="Do more with these" items={makeItems(vi.fn())} />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Do more with these' }),
    );
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
