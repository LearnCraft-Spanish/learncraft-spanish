import type { VocabInfo } from '@application/units/useVocabInfo';
import type { Vocabulary } from '@learncraft-spanish/shared';
import { WordPanel } from '@interface/components/textQuiz/WordPanel/WordPanel';
import { cleanup, render, screen } from '@testing-library/react';
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
    lessons: [
      { id: 1, courseName: 'LearnCraft Spanish', lessonNumber: 28 },
      { id: 2, courseName: 'Subjunctives Challenge', lessonNumber: 1 },
    ],
    lessonsLoading: false,
  } as unknown as VocabInfo;
}

describe('word panel', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the word, gloss, part of speech, and lessons', () => {
    render(<WordPanel vocabulary={VOCABULARY} vocabInfoHook={vocabInfoHook} />);

    expect(screen.getByText('cuando')).toBeTruthy();
    expect(screen.getByText('"cuando": "when"')).toBeTruthy();
    expect(screen.getByText(/Conjunction/)).toBeTruthy();
    expect(screen.getByText(/LearnCraft Spanish lesson 28/)).toBeTruthy();
    expect(screen.getByText(/Subjunctives Challenge lesson 1/)).toBeTruthy();
  });

  it('renders no close button without an onClose prop', () => {
    render(<WordPanel vocabulary={VOCABULARY} vocabInfoHook={vocabInfoHook} />);

    expect(
      screen.queryByRole('button', { name: 'Close word details' }),
    ).toBeNull();
  });

  it('renders a close button when onClose is given, and it calls onClose', async () => {
    const onClose = vi.fn();
    render(
      <WordPanel
        vocabulary={VOCABULARY}
        vocabInfoHook={vocabInfoHook}
        onClose={onClose}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Close word details' }),
    );

    expect(onClose).toHaveBeenCalledOnce();
  });
});
