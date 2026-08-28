import { EntryCard } from '@interface/components/home/EntryCard/EntryCard';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('entry card', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the title and meta line', () => {
    render(
      <EntryCard
        icon="cards"
        title="My flashcards"
        meta="128 cards"
        onGo={vi.fn()}
      />,
    );

    expect(screen.getByText('My flashcards')).toBeInTheDocument();
    expect(screen.getByText('128 cards')).toBeInTheDocument();
  });

  it('is one keyboard-reachable button for the whole tile', async () => {
    const user = userEvent.setup();
    const onGo = vi.fn();
    render(
      <EntryCard
        icon="cards"
        title="My flashcards"
        meta="128 cards"
        onGo={onGo}
      />,
    );

    await user.click(screen.getByRole('button', { name: /My flashcards/ }));

    expect(onGo).toHaveBeenCalledOnce();
  });
});
