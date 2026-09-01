import { SelectorCard } from '@interface/components/customQuiz/SelectorCard/SelectorCard';
import tileStyles from '@interface/components/general/IconTile/IconTile.module.scss';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import styles from './SelectorCard.module.scss';

describe('selectorCard', () => {
  it('reports selection through the radio role', () => {
    render(
      <SelectorCard
        icon="cards"
        label="Flashcards"
        selected
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('radio', { name: 'Flashcards' })).toBeChecked();
  });

  it('is unchecked when not selected', () => {
    render(
      <SelectorCard
        icon="volume"
        label="Audio"
        selected={false}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('radio', { name: 'Audio' })).not.toBeChecked();
  });

  it('calls back on click', async () => {
    const onSelect = vi.fn();
    render(
      <SelectorCard
        icon="volume"
        label="Audio"
        selected={false}
        onSelect={onSelect}
      />,
    );

    await userEvent.click(screen.getByRole('radio', { name: 'Audio' }));

    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('the inline variant drops the roomy padding', () => {
    render(
      <SelectorCard
        icon="search"
        label="Search tags"
        variant="inline"
        selected={false}
        onSelect={vi.fn()}
      />,
    );

    const card = screen.getByRole('radio', { name: 'Search tags' });
    expect(card).toHaveClass(styles.compact);
    expect(card).not.toHaveClass(styles.roomy);
  });

  it('compactTile keeps the tinted tile at the tighter size', () => {
    render(
      <SelectorCard
        icon="headphones"
        label="Listening"
        variant="compactTile"
        selected={false}
        onSelect={vi.fn()}
      />,
    );

    const card = screen.getByRole('radio', { name: 'Listening' });
    expect(card).toHaveClass(styles.compact);
    expect(card.querySelector(`.${tileStyles.root}`)).toBeInTheDocument();
  });
});
