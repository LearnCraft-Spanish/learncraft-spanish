import type { VocabInfo } from '@application/units/useVocabInfo';
import type { FlashcardForDisplay } from '@domain/quizzing';
import type { Vocabulary } from '@learncraft-spanish/shared';
import type { ComponentProps } from 'react';
import { TextQuizV2 } from '@interface/components/textQuiz/TextQuizV2/TextQuizV2';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
  renderQuizWithProps();
}

type TextQuizV2TestProps = Partial<ComponentProps<typeof TextQuizV2>>;

function renderQuizWithProps(overrides: TextQuizV2TestProps = {}): {
  onPrevious: ReturnType<typeof vi.fn>;
  onNext: ReturnType<typeof vi.fn>;
  onGrade: ReturnType<typeof vi.fn>;
  toggleAnswer: ReturnType<typeof vi.fn>;
  onExit: ReturnType<typeof vi.fn>;
} {
  const onPrevious = vi.fn();
  const onNext = vi.fn();
  const onGrade = vi.fn();
  const toggleAnswer = vi.fn();
  const onExit = vi.fn();

  render(
    <TextQuizV2
      srs={false}
      quizTitle="Lessons 1–111 · 249 cards"
      exampleNumber={1}
      quizLength={249}
      quizExample={QUIZ_EXAMPLE}
      answerShowing
      toggleAnswer={toggleAnswer}
      getHelpIsOpen
      setGetHelpIsOpen={vi.fn()}
      vocabInfoHook={vocabInfoHook}
      addPendingRemoveProps={undefined}
      onPrevious={onPrevious}
      onNext={onNext}
      onGrade={onGrade}
      onExit={onExit}
      {...overrides}
    />,
  );

  return { onPrevious, onNext, onGrade, toggleAnswer, onExit };
}

function getQuizCard(): HTMLElement {
  return screen.getByRole('button', { name: /Flashcard/ });
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

describe('text quiz v2 flip hint copy', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('shows "Click to flip" on desktop for question and non-SRS answer sides', () => {
    stubMobile(false);

    const { rerender } = render(
      <TextQuizV2
        srs={false}
        quizTitle="Lessons 1–111 · 249 cards"
        exampleNumber={1}
        quizLength={249}
        quizExample={QUIZ_EXAMPLE}
        answerShowing={false}
        toggleAnswer={vi.fn()}
        getHelpIsOpen={false}
        setGetHelpIsOpen={vi.fn()}
        vocabInfoHook={vocabInfoHook}
        addPendingRemoveProps={undefined}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onExit={vi.fn()}
      />,
    );

    expect(screen.getByText('Click to flip')).toBeTruthy();

    rerender(
      <TextQuizV2
        srs={false}
        quizTitle="Lessons 1–111 · 249 cards"
        exampleNumber={1}
        quizLength={249}
        quizExample={QUIZ_EXAMPLE}
        answerShowing
        toggleAnswer={vi.fn()}
        getHelpIsOpen={false}
        setGetHelpIsOpen={vi.fn()}
        vocabInfoHook={vocabInfoHook}
        addPendingRemoveProps={undefined}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onExit={vi.fn()}
      />,
    );

    expect(screen.getByText('Click to flip')).toBeTruthy();
  });

  it('shows "Tap to flip" on mobile for question and non-SRS answer sides', () => {
    stubMobile(true);

    const { rerender } = render(
      <TextQuizV2
        srs={false}
        quizTitle="Lessons 1–111 · 249 cards"
        exampleNumber={1}
        quizLength={249}
        quizExample={QUIZ_EXAMPLE}
        answerShowing={false}
        toggleAnswer={vi.fn()}
        getHelpIsOpen={false}
        setGetHelpIsOpen={vi.fn()}
        vocabInfoHook={vocabInfoHook}
        addPendingRemoveProps={undefined}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onExit={vi.fn()}
      />,
    );

    expect(screen.getByText('Tap to flip')).toBeTruthy();

    rerender(
      <TextQuizV2
        srs={false}
        quizTitle="Lessons 1–111 · 249 cards"
        exampleNumber={1}
        quizLength={249}
        quizExample={QUIZ_EXAMPLE}
        answerShowing
        toggleAnswer={vi.fn()}
        getHelpIsOpen={false}
        setGetHelpIsOpen={vi.fn()}
        vocabInfoHook={vocabInfoHook}
        addPendingRemoveProps={undefined}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onExit={vi.fn()}
      />,
    );

    expect(screen.getByText('Tap to flip')).toBeTruthy();
  });

  it('shows the SRS swipe caption on the answer side', () => {
    stubMobile(false);

    render(
      <TextQuizV2
        srs
        quizTitle="Lessons 1–111 · 249 cards"
        exampleNumber={1}
        quizLength={249}
        quizExample={QUIZ_EXAMPLE}
        answerShowing
        toggleAnswer={vi.fn()}
        getHelpIsOpen={false}
        setGetHelpIsOpen={vi.fn()}
        vocabInfoHook={vocabInfoHook}
        addPendingRemoveProps={undefined}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onGrade={vi.fn()}
        tallies={{ hard: 0, easy: 0 }}
        onExit={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Swipe to grade · left hard, right easy'),
    ).toBeTruthy();
  });

  it('shows the help-open hint when get help is open', () => {
    stubMobile(false);

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
        onExit={vi.fn()}
      />,
    );

    expect(screen.getByText('Tap a word for its lesson')).toBeTruthy();
  });
});

describe('text quiz v2 back navigation', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('exposes a back control with an accessible label', () => {
    stubMobile(false);
    renderQuizWithProps({ getHelpIsOpen: false });

    expect(
      screen.getAllByRole('button', { name: 'Back to quiz setup' }).length,
    ).toBeGreaterThan(0);
  });

  it('calls onExit when the back control is clicked', async () => {
    stubMobile(false);
    const { onExit } = renderQuizWithProps({ getHelpIsOpen: false });

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Back to quiz setup' })[0],
    );

    expect(onExit).toHaveBeenCalledOnce();
  });
});

describe('text quiz v2 keyboard navigation', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('navigates with arrow keys while the quiz card is focused', () => {
    stubMobile(false);
    const { onPrevious, onNext } = renderQuizWithProps({
      getHelpIsOpen: false,
      exampleNumber: 2,
    });

    getQuizCard().focus();
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    expect(onNext).toHaveBeenCalledOnce();
    expect(onPrevious).toHaveBeenCalledOnce();
  });

  it('navigates with arrow keys while a dock button is focused', () => {
    stubMobile(false);
    const { onPrevious } = renderQuizWithProps({
      getHelpIsOpen: false,
      exampleNumber: 2,
    });

    screen.getByRole('button', { name: /Next/ }).focus();
    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    expect(onPrevious).toHaveBeenCalledOnce();
  });

  it('does not navigate with arrow keys while a text field is focused', () => {
    stubMobile(false);
    const onPrevious = vi.fn();
    const onNext = vi.fn();

    render(
      <>
        <input aria-label="Test input" />
        <TextQuizV2
          srs={false}
          quizTitle="Lessons 1–111 · 249 cards"
          exampleNumber={2}
          quizLength={249}
          quizExample={QUIZ_EXAMPLE}
          answerShowing
          toggleAnswer={vi.fn()}
          getHelpIsOpen={false}
          setGetHelpIsOpen={vi.fn()}
          vocabInfoHook={vocabInfoHook}
          addPendingRemoveProps={undefined}
          onPrevious={onPrevious}
          onNext={onNext}
          onExit={vi.fn()}
        />
      </>,
    );

    screen.getByLabelText('Test input').focus();
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    expect(onNext).not.toHaveBeenCalled();
    expect(onPrevious).not.toHaveBeenCalled();
  });

  it('grades with arrow keys while the quiz card is focused in SRS mode', () => {
    stubMobile(false);
    const { onGrade } = renderQuizWithProps({
      srs: true,
      getHelpIsOpen: false,
      tallies: { hard: 0, easy: 0 },
      exampleNumber: 2,
    });

    getQuizCard().focus();
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'ArrowRight' });

    expect(onGrade).toHaveBeenCalledTimes(2);
    expect(onGrade).toHaveBeenNthCalledWith(1, 'hard');
    expect(onGrade).toHaveBeenNthCalledWith(2, 'easy');
  });

  it('does not double-flip when Space is pressed on a focused dock button', () => {
    stubMobile(false);
    const { toggleAnswer } = renderQuizWithProps({
      getHelpIsOpen: false,
      exampleNumber: 2,
    });

    screen.getByRole('button', { name: /Next/ }).focus();
    fireEvent.keyDown(document, { key: ' ' });

    expect(toggleAnswer).not.toHaveBeenCalled();
  });
});
