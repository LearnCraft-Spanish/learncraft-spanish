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
      eyebrow="My Flashcards Quiz"
      subtitle="Lessons 1–111 · 249 cards"
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

  it('orders help chips by first appearance in the Spanish text', () => {
    stubMobile(false);
    renderQuizWithProps({
      quizExample: {
        ...QUIZ_EXAMPLE,
        answer: {
          ...QUIZ_EXAMPLE.answer,
          text: 'El gato come pescado.',
          vocabulary: [
            { id: 3, word: 'pescado' },
            { id: 1, word: 'el' },
            { id: 2, word: 'come' },
          ],
        },
      } as unknown as FlashcardForDisplay,
    });

    const chips = screen.getAllByRole('button', { pressed: false });
    expect(chips.map((chip) => chip.textContent)).toEqual([
      'el',
      'come',
      'pescado',
    ]);
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
        eyebrow="My Flashcards Quiz"
        subtitle="Lessons 1–111 · 249 cards"
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
        eyebrow="My Flashcards Quiz"
        subtitle="Lessons 1–111 · 249 cards"
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
        eyebrow="My Flashcards Quiz"
        subtitle="Lessons 1–111 · 249 cards"
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
        eyebrow="My Flashcards Quiz"
        subtitle="Lessons 1–111 · 249 cards"
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
        eyebrow="My Flashcards Quiz"
        subtitle="Lessons 1–111 · 249 cards"
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
        eyebrow="My Flashcards Quiz"
        subtitle="Lessons 1–111 · 249 cards"
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

describe('text quiz v2 keyboard legend', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  function expectFullSrsLegend(): void {
    expect(screen.getByText('previous')).toBeTruthy();
    expect(screen.getByText('flip')).toBeTruthy();
    expect(screen.getByText('next')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('hard')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('easy')).toBeTruthy();
  }

  it('shows the full SRS legend on the prompt side', () => {
    stubMobile(false);
    renderQuizWithProps({
      srs: true,
      answerShowing: false,
      getHelpIsOpen: false,
      tallies: { hard: 0, easy: 0 },
      exampleNumber: 2,
    });

    expectFullSrsLegend();
  });

  it('shows the full SRS legend on the answer side', () => {
    stubMobile(false);
    renderQuizWithProps({
      srs: true,
      answerShowing: true,
      getHelpIsOpen: false,
      tallies: { hard: 0, easy: 0 },
      exampleNumber: 2,
    });

    expectFullSrsLegend();
  });
});

describe('text quiz v2 keyboard navigation', () => {
  const originalPaused = Object.getOwnPropertyDescriptor(
    HTMLMediaElement.prototype,
    'paused',
  );

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    if (originalPaused) {
      Object.defineProperty(
        HTMLMediaElement.prototype,
        'paused',
        originalPaused,
      );
    }
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
          eyebrow="My Flashcards Quiz"
          subtitle="Lessons 1–111 · 249 cards"
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

  it('navigates with arrow keys on the SRS answer side instead of grading', () => {
    stubMobile(false);
    const { onGrade, onPrevious, onNext } = renderQuizWithProps({
      srs: true,
      answerShowing: true,
      getHelpIsOpen: false,
      tallies: { hard: 0, easy: 0 },
      exampleNumber: 2,
    });

    getQuizCard().focus();
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'ArrowRight' });

    expect(onPrevious).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
    expect(onGrade).not.toHaveBeenCalled();
  });

  it('grades with 1 and 2 on the SRS answer side', () => {
    stubMobile(false);
    const { onGrade, onPrevious, onNext } = renderQuizWithProps({
      srs: true,
      answerShowing: true,
      getHelpIsOpen: false,
      tallies: { hard: 0, easy: 0 },
      exampleNumber: 2,
    });

    getQuizCard().focus();
    fireEvent.keyDown(document, { key: '1' });
    fireEvent.keyDown(document, { key: '2' });

    expect(onGrade).toHaveBeenCalledTimes(2);
    expect(onGrade).toHaveBeenNthCalledWith(1, 'hard');
    expect(onGrade).toHaveBeenNthCalledWith(2, 'easy');
    expect(onPrevious).not.toHaveBeenCalled();
    expect(onNext).not.toHaveBeenCalled();
  });

  it('grades with 1 and 2 on the SRS prompt side', () => {
    stubMobile(false);
    const { onGrade, onPrevious, onNext } = renderQuizWithProps({
      srs: true,
      answerShowing: false,
      getHelpIsOpen: false,
      tallies: { hard: 0, easy: 0 },
      exampleNumber: 2,
    });

    fireEvent.keyDown(document, { key: '1' });
    fireEvent.keyDown(document, { key: '2' });

    expect(onGrade).toHaveBeenCalledTimes(2);
    expect(onGrade).toHaveBeenNthCalledWith(1, 'hard');
    expect(onGrade).toHaveBeenNthCalledWith(2, 'easy');
    expect(onPrevious).not.toHaveBeenCalled();
    expect(onNext).not.toHaveBeenCalled();
  });

  it('does not grade with 1 and 2 on a non-SRS quiz', () => {
    stubMobile(false);
    const { onGrade } = renderQuizWithProps({
      srs: false,
      answerShowing: true,
      getHelpIsOpen: false,
      exampleNumber: 2,
    });

    fireEvent.keyDown(document, { key: '1' });
    fireEvent.keyDown(document, { key: '2' });

    expect(onGrade).not.toHaveBeenCalled();
  });

  it('navigates with arrow keys on the SRS prompt side', () => {
    stubMobile(false);
    const { onGrade, onPrevious, onNext } = renderQuizWithProps({
      srs: true,
      answerShowing: false,
      getHelpIsOpen: false,
      tallies: { hard: 0, easy: 0 },
      exampleNumber: 2,
    });

    getQuizCard().focus();
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'ArrowRight' });

    expect(onPrevious).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
    expect(onGrade).not.toHaveBeenCalled();
  });

  it('flips with ArrowUp and ArrowDown', () => {
    stubMobile(false);
    const { toggleAnswer } = renderQuizWithProps({
      getHelpIsOpen: false,
      exampleNumber: 2,
    });

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    fireEvent.keyDown(document, { key: 'ArrowDown' });

    expect(toggleAnswer).toHaveBeenCalledTimes(2);
  });

  it('does not flip with Space', () => {
    stubMobile(false);
    const { toggleAnswer } = renderQuizWithProps({
      getHelpIsOpen: false,
      exampleNumber: 2,
    });

    fireEvent.keyDown(document, { key: ' ' });

    expect(toggleAnswer).not.toHaveBeenCalled();
  });

  it('does not flip when Space is pressed on a focused dock button', () => {
    stubMobile(false);
    const { toggleAnswer } = renderQuizWithProps({
      getHelpIsOpen: false,
      exampleNumber: 2,
    });

    screen.getByRole('button', { name: /Next/ }).focus();
    fireEvent.keyDown(document, { key: ' ' });

    expect(toggleAnswer).not.toHaveBeenCalled();
  });

  it('plays flashcard audio with Space when audio is available', () => {
    stubMobile(false);
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);

    renderQuizWithProps({
      getHelpIsOpen: false,
      exampleNumber: 2,
      answerShowing: false,
      quizExample: {
        ...QUIZ_EXAMPLE,
        question: {
          ...QUIZ_EXAMPLE.question,
          hasAudio: true,
          audioUrl: 'https://example.com/audio.mp3',
        },
      },
    });

    fireEvent.keyDown(document, { key: ' ' });

    expect(play).toHaveBeenCalled();
    play.mockRestore();
  });

  it('pauses playing flashcard audio with Space', () => {
    stubMobile(false);
    const pause = vi
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => {});
    Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
      configurable: true,
      get: () => false,
    });

    renderQuizWithProps({
      getHelpIsOpen: false,
      exampleNumber: 2,
      answerShowing: false,
      quizExample: {
        ...QUIZ_EXAMPLE,
        question: {
          ...QUIZ_EXAMPLE.question,
          hasAudio: true,
          audioUrl: 'https://example.com/audio.mp3',
        },
      },
    });

    fireEvent.keyDown(document, { key: ' ' });

    expect(pause).toHaveBeenCalled();
  });

  it('does not play audio with Space while a dock button is focused', () => {
    stubMobile(false);
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);

    renderQuizWithProps({
      getHelpIsOpen: false,
      exampleNumber: 2,
      answerShowing: true,
      quizExample: {
        ...QUIZ_EXAMPLE,
        question: {
          ...QUIZ_EXAMPLE.question,
          hasAudio: true,
          audioUrl: 'https://example.com/audio.mp3',
        },
      },
    });

    screen.getByRole('button', { name: /Next/ }).focus();
    fireEvent.keyDown(document, { key: ' ' });

    expect(play).not.toHaveBeenCalled();
    play.mockRestore();
  });

  it('does not flip with ArrowUp while a text field is focused', () => {
    stubMobile(false);
    const toggleAnswer = vi.fn();

    render(
      <>
        <input aria-label="Test input" />
        <TextQuizV2
          srs={false}
          eyebrow="My Flashcards Quiz"
          subtitle="Lessons 1–111 · 249 cards"
          exampleNumber={2}
          quizLength={249}
          quizExample={QUIZ_EXAMPLE}
          answerShowing
          toggleAnswer={toggleAnswer}
          getHelpIsOpen={false}
          setGetHelpIsOpen={vi.fn()}
          vocabInfoHook={vocabInfoHook}
          addPendingRemoveProps={undefined}
          onPrevious={vi.fn()}
          onNext={vi.fn()}
          onExit={vi.fn()}
        />
      </>,
    );

    screen.getByLabelText('Test input').focus();
    fireEvent.keyDown(document, { key: 'ArrowUp' });

    expect(toggleAnswer).not.toHaveBeenCalled();
  });

  it('does not grade with 1 while a text field is focused', () => {
    stubMobile(false);
    const onGrade = vi.fn();

    render(
      <>
        <input aria-label="Test input" />
        <TextQuizV2
          srs
          eyebrow="My Flashcards Quiz"
          subtitle="Lessons 1–111 · 249 cards"
          exampleNumber={2}
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
          onGrade={onGrade}
          tallies={{ hard: 0, easy: 0 }}
          onExit={vi.fn()}
        />
      </>,
    );

    screen.getByLabelText('Test input').focus();
    fireEvent.keyDown(document, { key: '1' });

    expect(onGrade).not.toHaveBeenCalled();
  });
});
