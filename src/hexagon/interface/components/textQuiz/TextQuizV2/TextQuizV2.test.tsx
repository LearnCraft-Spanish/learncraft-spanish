import type { VocabInfo } from '@application/units/useVocabInfo';
import type { FlashcardForDisplay } from '@domain/quizzing';
import type { Vocabulary } from '@learncraft-spanish/shared';
import { TextQuizV2 } from '@interface/components/textQuiz/TextQuizV2/TextQuizV2';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

const VOCABULARY: Vocabulary[] = [
  {
    id: 101,
    word: 'lo',
    descriptor: '"lo": "it"',
    type: 'nonverb',
    spellings: ['lo'],
    subcategory: {
      id: 901,
      name: 'Direct object',
      category: 'Direct object',
      partOfSpeech: 'Pronoun',
    },
    frequency: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  } as unknown as Vocabulary,
];

const QUIZ_EXAMPLE = {
  question: { spanish: false, text: 'I know it.', hasAudio: false },
  answer: {
    spanish: true,
    text: 'Lo **sé**.',
    hasAudio: false,
    owned: false,
    vocabulary: VOCABULARY,
    vocabComplete: true,
  },
  exampleIsCollected: false,
  exampleIsCustom: false,
  exampleIsAdding: false,
  exampleIsRemoving: false,
} as unknown as FlashcardForDisplay;

function vocabInfoHook(vocab: Vocabulary): VocabInfo {
  return {
    word: vocab.word,
    descriptor: vocab.descriptor,
    subcategory: vocab.subcategory,
    verb: null,
    conjugationTags: null,
    lessons: [{ id: 1, courseName: 'LearnCraft Spanish', lessonNumber: 12 }],
    lessonsLoading: false,
  } as unknown as VocabInfo;
}

/** Stubs `matchMedia` (absent in jsdom) so `useMediaQuery` can match. */
function stubMobile(matches: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

function renderQuiz(): void {
  render(
    <TextQuizV2
      srs={false}
      quizTitle="Lessons 1–111 · 249 cards"
      exampleNumber={1}
      quizLength={249}
      quizExample={QUIZ_EXAMPLE}
      answerShowing
      toggleAnswer={vi.fn()}
      getHelpIsOpen
      setGetHelpIsOpen={vi.fn()}
      vocabInfoHook={vocabInfoHook}
      addPendingRemoveProps={undefined}
      onPrevious={vi.fn()}
      onNext={vi.fn()}
    />,
  );
}

describe('text quiz v2 word details', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('opens word details in a modal dialog on mobile', async () => {
    stubMobile(true);
    renderQuiz();

    await userEvent.click(screen.getByRole('button', { name: 'lo' }));

    const dialog = screen.getByRole('dialog', { name: 'Details for lo' });
    expect(dialog).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Close word details' }),
    ).toBeTruthy();
    expect(screen.getByText(/LearnCraft Spanish lesson 12/)).toBeTruthy();
  });

  it('closes the mobile modal from its X button', async () => {
    stubMobile(true);
    renderQuiz();

    await userEvent.click(screen.getByRole('button', { name: 'lo' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Close word details' }),
    );

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('anchors word details under the chip row on desktop — no dialog', async () => {
    stubMobile(false);
    renderQuiz();

    await userEvent.click(screen.getByRole('button', { name: 'lo' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText(/LearnCraft Spanish lesson 12/)).toBeTruthy();
  });

  it('closes the desktop panel from its X button', async () => {
    stubMobile(false);
    renderQuiz();

    await userEvent.click(screen.getByRole('button', { name: 'lo' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Close word details' }),
    );

    expect(screen.queryByText(/LearnCraft Spanish lesson 12/)).toBeNull();
  });
});
