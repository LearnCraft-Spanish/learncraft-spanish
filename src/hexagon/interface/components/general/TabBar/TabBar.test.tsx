import type { TabBarItem } from '@interface/components/general/TabBar/TabBar';
import { TabBar } from '@interface/components/general/TabBar/TabBar';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

function buildItems(onSelect: () => void): TabBarItem[] {
  return [
    { id: 'home', icon: 'home', label: 'Home', active: true, onSelect },
    { id: 'search', icon: 'search', label: 'Finder', onSelect: vi.fn() },
    { id: 'cards', icon: 'cards', label: 'Flashcards', onSelect: vi.fn() },
  ];
}

describe('tab bar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a tab per item as a labelled navigation', () => {
    render(<TabBar items={buildItems(vi.fn())} />);

    expect(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('marks the active tab with aria-current', () => {
    render(<TabBar items={buildItems(vi.fn())} />);

    expect(screen.getByRole('button', { name: /Home/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: /Finder/ })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('calls the item handler when a tab is chosen', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TabBar items={buildItems(onSelect)} />);

    await user.click(screen.getByRole('button', { name: /Home/ }));

    expect(onSelect).toHaveBeenCalledOnce();
  });
});
