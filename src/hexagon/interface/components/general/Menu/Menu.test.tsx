import type { MenuItem } from '@interface/components/general/Menu/Menu';
import { Menu } from '@interface/components/general/Menu/Menu';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

function buildItems(onSelect: () => void): MenuItem[] {
  return [
    {
      id: 'apply',
      icon: 'filter',
      label: 'Apply these filters to my flashcards',
      hint: 'Your own set',
      onSelect,
    },
    {
      id: 'copy-all',
      icon: 'clipboardCopy',
      label: 'Copy all examples',
      badge: 'Admin only',
      onSelect: vi.fn(),
    },
  ];
}

describe('menu', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders nothing but the trigger while closed', () => {
    render(
      <Menu
        open={false}
        onDismiss={vi.fn()}
        trigger={<button>Do more with these</button>}
        items={buildItems(vi.fn())}
        label="Do more with these"
      />,
    );

    expect(
      screen.queryByRole('button', { name: /Apply these filters/ }),
    ).not.toBeInTheDocument();
  });

  it('lists every item when open', () => {
    render(
      <Menu
        open
        onDismiss={vi.fn()}
        trigger={<button>Do more with these</button>}
        items={buildItems(vi.fn())}
        label="Do more with these"
      />,
    );

    expect(screen.getByRole('list')).toHaveAccessibleName('Do more with these');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('calls the item handler when a row is chosen', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn<() => void>();
    render(
      <Menu
        open
        onDismiss={vi.fn()}
        trigger={<button>Do more with these</button>}
        items={buildItems(onSelect)}
        label="Do more with these"
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: /Apply these filters to my flashcards/,
      }),
    );

    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('closes after a row is chosen', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn<() => void>();
    render(
      <Menu
        open
        onDismiss={onDismiss}
        trigger={<button>Do more with these</button>}
        items={buildItems(vi.fn())}
        label="Do more with these"
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: /Apply these filters to my flashcards/,
      }),
    );

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('dismisses on Escape', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn<() => void>();
    render(
      <Menu
        open
        onDismiss={onDismiss}
        trigger={<button>Do more with these</button>}
        items={buildItems(vi.fn())}
        label="Do more with these"
      />,
    );

    await user.keyboard('{Escape}');

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('shows hints and badges where the item has them', () => {
    render(
      <Menu
        open
        onDismiss={vi.fn()}
        trigger={<button>Do more with these</button>}
        items={buildItems(vi.fn())}
        label="Do more with these"
      />,
    );

    expect(screen.getByText('Your own set')).toBeInTheDocument();
    expect(screen.getByText('Admin only')).toBeInTheDocument();
  });
});
