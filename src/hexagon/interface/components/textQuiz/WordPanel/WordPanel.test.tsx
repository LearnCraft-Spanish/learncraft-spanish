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

const VERB_VOCABULARY = {
  id: 204,
  word: 'tengo',
  descriptor: '"tengo": "I have"',
  type: 'verb',
  spellings: ['tengo'],
  subcategory: {
    id: 2004,
    name: 'Present',
    category: 'Present',
    partOfSpeech: 'Verb',
  },
  verb: { id: 5, infinitive: 'tener' },
  conjugationTags: ['Irregular', 'irreg: added letter'],
  frequency: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
} as unknown as Vocabulary;

function verbVocabInfoHook(
  conjugationTags: string[],
): (vocab: Vocabulary) => VocabInfo {
  return (vocab: Vocabulary): VocabInfo =>
    ({
      word: vocab.word,
      descriptor: vocab.descriptor,
      subcategory: vocab.subcategory,
      verb: { id: 5, infinitive: 'tener' },
      conjugationTags,
      lessons: [],
      lessonsLoading: false,
    }) as unknown as VocabInfo;
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

  it('renders no verb details for a non-verb', () => {
    render(<WordPanel vocabulary={VOCABULARY} vocabInfoHook={vocabInfoHook} />);

    expect(screen.queryByText(/Verb Infinitive/)).toBeNull();
    expect(screen.queryByText(/Conjugation Notes/)).toBeNull();
  });

  it('renders the infinitive and conjugation notes for a verb', () => {
    render(
      <WordPanel
        vocabulary={VERB_VOCABULARY}
        vocabInfoHook={verbVocabInfoHook(['Irregular', 'irreg: added letter'])}
      />,
    );

    expect(screen.getByText('Verb Infinitive: tener')).toBeTruthy();
    expect(
      screen.getByText('Conjugation Notes: Irregular, irreg: added letter'),
    ).toBeTruthy();
  });

  it('omits conjugation notes for a verb with no conjugation tags', () => {
    render(
      <WordPanel
        vocabulary={VERB_VOCABULARY}
        vocabInfoHook={verbVocabInfoHook([])}
      />,
    );

    expect(screen.getByText('Verb Infinitive: tener')).toBeTruthy();
    expect(screen.queryByText(/Conjugation Notes/)).toBeNull();
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
