import type { VocabInfo } from '@application/units/useVocabInfo';
import type { Vocabulary } from '@learncraft-spanish/shared';
import { WordPanelModal } from '@interface/components/textQuiz/WordPanelModal/WordPanelModal';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

const VOCABULARY = {
  id: 103,
  word: 'cuando',
  descriptor: '"cuando": "when"',
  type: 'nonverb',
  spellings: ['cuando'],
  subcategory: {
    id: 1003,
    name: 'Subordinating',
    category: 'Subordinating',
    partOfSpeech: 'Conjunction',
  },
  frequency: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
} as unknown as Vocabulary;

function vocabInfoHook(vocab: Vocabulary): VocabInfo {
  return {
    word: vocab.word,
    descriptor: vocab.descriptor,
    subcategory: vocab.subcategory,
    verb: null,
    conjugationTags: null,
    lessons: [{ id: 1, courseName: 'LearnCraft Spanish', lessonNumber: 28 }],
    lessonsLoading: false,
  } as unknown as VocabInfo;
}

function renderModal(onClose: () => void = vi.fn()): { onClose: () => void } {
  render(
    <WordPanelModal
      vocabulary={VOCABULARY}
      vocabInfoHook={vocabInfoHook}
      onClose={onClose}
    />,
  );
  return { onClose };
}

describe('word panel modal', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the word details in a dialog portaled to body', () => {
    renderModal();

    const dialog = screen.getByRole('dialog', { name: 'Details for cuando' });
    expect(dialog.parentElement?.parentElement).toBe(document.body);
    expect(screen.getByText('cuando')).toBeTruthy();
    expect(screen.getByText('"cuando": "when"')).toBeTruthy();
    expect(screen.getByText(/LearnCraft Spanish lesson 28/)).toBeTruthy();
  });

  it('closes from the X button', async () => {
    const { onClose } = renderModal();

    await userEvent.click(
      screen.getByRole('button', { name: 'Close word details' }),
    );

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes on Escape', () => {
    const { onClose } = renderModal();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes on a scrim click, but not on a dialog click', () => {
    const { onClose } = renderModal();

    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('dialog').parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('locks body scroll while open and restores it on unmount', () => {
    const { unmount } = render(
      <WordPanelModal
        vocabulary={VOCABULARY}
        vocabInfoHook={vocabInfoHook}
        onClose={vi.fn()}
      />,
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
  });
});
