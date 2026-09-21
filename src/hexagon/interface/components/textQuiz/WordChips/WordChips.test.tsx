import type { Vocabulary } from '@learncraft-spanish/shared';
import { WordChips } from '@interface/components/textQuiz/WordChips/WordChips';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

function vocab(id: number, word: string): Vocabulary {
  return { id, word } as unknown as Vocabulary;
}

const VOCABULARY = [vocab(1, 'lo'), vocab(2, 'sabré'), vocab(3, 'cuando')];

describe('word chips', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders every vocabulary word as a chip', () => {
    render(
      <WordChips
        vocabulary={VOCABULARY}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    );

    for (const { word } of VOCABULARY) {
      expect(screen.getByRole('button', { name: word })).toBeTruthy();
    }
  });

  it('calls onSelect with the word id when a chip is clicked', async () => {
    const onSelect = vi.fn();
    render(
      <WordChips
        vocabulary={VOCABULARY}
        selectedId={null}
        onSelect={onSelect}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'sabré' }));

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it('marks only the selected chip as pressed', () => {
    render(
      <WordChips vocabulary={VOCABULARY} selectedId={2} onSelect={vi.fn()} />,
    );

    expect(
      screen
        .getByRole('button', { name: 'sabré' })
        .getAttribute('aria-pressed'),
    ).toBe('true');
    expect(
      screen.getByRole('button', { name: 'lo' }).getAttribute('aria-pressed'),
    ).toBe('false');
  });

  it('renders the panel only when a word is selected', () => {
    const panel = <div>word details</div>;
    const { rerender } = render(
      <WordChips
        vocabulary={VOCABULARY}
        selectedId={null}
        onSelect={vi.fn()}
        panel={panel}
      />,
    );
    expect(screen.queryByText('word details')).toBeNull();

    rerender(
      <WordChips
        vocabulary={VOCABULARY}
        selectedId={1}
        onSelect={vi.fn()}
        panel={panel}
      />,
    );
    expect(screen.getByText('word details')).toBeTruthy();
  });
});
