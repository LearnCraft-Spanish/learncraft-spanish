import type { VocabInfo } from '@application/units/useVocabInfo';
import type { AudioQuizV2Props } from '@interface/components/audioQuiz/AudioQuizV2/AudioQuizV2.types';
import type { Vocabulary } from '@learncraft-spanish/shared';
import type { ComponentProps } from 'react';
import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';
import { AudioQuizV2 } from '@interface/components/audioQuiz/AudioQuizV2/AudioQuizV2';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

const VOCABULARY: Vocabulary[] = [
  {
    id: 101,
    word: 'sabré',
    descriptor: '"sabré": "I will know"',
    type: 'verb',
    spellings: ['sabré'],
    subcategory: {
      id: 901,
      name: 'Irregular future',
      category: 'Irregular future',
      partOfSpeech: 'Verb',
    },
    frequency: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  } as unknown as Vocabulary,
];

function vocabInfoHook(vocab: Vocabulary): VocabInfo {
  return {
    word: vocab.word,
    descriptor: vocab.descriptor,
    subcategory: vocab.subcategory,
    verb: null,
    conjugationTags: null,
    lessons: [{ id: 1, courseName: 'LearnCraft Spanish', lessonNumber: 88 }],
    lessonsLoading: false,
  } as unknown as VocabInfo;
}

/**
 * Stubs `matchMedia` (absent in jsdom) so `useMediaQuery` can match.
 * `matches` is the max-width result. Pointer and hover default to a desktop
 * so keyboard shortcuts stay on unless a test opts into a touch tablet.
 */
function stubMobile(
  matches: boolean,
  input: { finePointer?: boolean; canHover?: boolean } = {},
): void {
  const finePointer = input.finePointer ?? true;
  const canHover = input.canHover ?? true;
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('max-width')
      ? matches
      : query.includes('pointer') && query.includes('fine')
        ? finePointer
        : query.includes('hover')
          ? canHover
          : matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

let restoreNavigator: (() => void) | undefined;

/** Overrides the iPad signals `shouldEnableQuizKeyboardShortcuts` reads. */
function stubNavigator(overrides: {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
}): void {
  restoreNavigator?.();
  const keys = ['userAgent', 'platform', 'maxTouchPoints'] as const;
  const previous = keys.map((key) => ({
    key,
    descriptor: Object.getOwnPropertyDescriptor(navigator, key),
  }));

  Object.defineProperty(navigator, 'userAgent', {
    configurable: true,
    get: () => overrides.userAgent,
  });
  Object.defineProperty(navigator, 'platform', {
    configurable: true,
    get: () => overrides.platform,
  });
  Object.defineProperty(navigator, 'maxTouchPoints', {
    configurable: true,
    get: () => overrides.maxTouchPoints,
  });

  restoreNavigator = () => {
    for (const { key, descriptor } of previous) {
      if (descriptor) {
        Object.defineProperty(navigator, key, descriptor);
      } else {
        Reflect.deleteProperty(navigator, key);
      }
    }
    restoreNavigator = undefined;
  };
}

type AudioQuizV2TestProps = Partial<ComponentProps<typeof AudioQuizV2>>;

function renderQuiz(overrides: AudioQuizV2TestProps = {}): {
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  onPrimary: ReturnType<typeof vi.fn>;
  onReplay: ReturnType<typeof vi.fn>;
  onPrevious: ReturnType<typeof vi.fn>;
  onNext: ReturnType<typeof vi.fn>;
  onExit: ReturnType<typeof vi.fn>;
  setGetHelpIsOpen: ReturnType<typeof vi.fn>;
} {
  const play = vi.fn();
  const pause = vi.fn();
  const onPrimary = vi.fn();
  const onReplay = vi.fn();
  const onPrevious = vi.fn();
  const onNext = vi.fn();
  const onExit = vi.fn();
  const setGetHelpIsOpen = vi.fn();

  const defaultProps: AudioQuizV2Props = {
    audioQuizType: AudioQuizType.Speaking,
    quizCategory: 'custom',
    autoplay: true,
    exampleNumber: 1,
    quizLength: 20,
    currentStep: AudioQuizStep.Question,
    displayText: 'I will know it.',
    isSpanishText: false,
    progressStatus: 42,
    isPlaying: false,
    play,
    pause,
    onPrimary,
    onReplay,
    onPrevious,
    onNext,
    onExit,
    getHelpIsOpen: false,
    setGetHelpIsOpen,
    vocabulary: VOCABULARY,
    vocabComplete: true,
    vocabInfoHook,
    addPendingRemoveProps: undefined,
  };

  render(<AudioQuizV2 {...defaultProps} {...overrides} />);

  return {
    play,
    pause,
    onPrimary,
    onReplay,
    onPrevious,
    onNext,
    onExit,
    setGetHelpIsOpen,
  };
}

describe('audioQuizV2 — smoke render', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders the current step sentence text', () => {
    stubMobile(false);
    renderQuiz();

    expect(screen.getByText('I will know it.')).toBeTruthy();
  });

  it('bolds only the **target** run of a sentence step', () => {
    stubMobile(false);
    renderQuiz({
      audioQuizType: AudioQuizType.Speaking,
      currentStep: AudioQuizStep.Answer,
      displayText: 'Lo **sabré** cuando ellos lo sepan.',
      isSpanishText: true,
    });

    const bold = screen.getByText('sabré');
    expect(bold.className).toMatch(/bold/);
  });

  it('shows the "Make a Guess!" instruction on the guess step', () => {
    stubMobile(false);
    renderQuiz({ currentStep: AudioQuizStep.Guess, displayText: '' });

    expect(screen.getByText('Make a Guess!')).toBeTruthy();
  });

  it('shows the deck position and quiz title in the header', () => {
    stubMobile(false);
    renderQuiz({ exampleNumber: 12, quizLength: 20 });

    expect(screen.getByText('12 / 20')).toBeTruthy();
    expect(screen.getByText('Custom Quiz')).toBeTruthy();
    expect(screen.getByText('Speaking Quiz')).toBeTruthy();
  });

  it('shows the listening quiz subtitle for a listening quiz', () => {
    stubMobile(false);
    renderQuiz({
      audioQuizType: AudioQuizType.Listening,
      currentStep: AudioQuizStep.Hint,
      displayText: 'Lo sabré.',
      isSpanishText: true,
    });

    expect(screen.getByText('Listening Quiz')).toBeTruthy();
  });

  it('shows the "My Flashcards Quiz" eyebrow for that category', () => {
    stubMobile(false);
    renderQuiz({ quizCategory: 'myFlashcards' });

    expect(screen.getByText('My Flashcards Quiz')).toBeTruthy();
  });

  it('calls onExit when the desktop back arrow is clicked', async () => {
    stubMobile(false);
    const { onExit } = renderQuiz();

    await userEvent.click(
      screen.getByRole('button', { name: 'Back to quiz setup' }),
    );

    expect(onExit).toHaveBeenCalledOnce();
  });
});

describe('audioQuizV2 — primary / replay dock', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('shows "Skip to guess" on the question step with autoplay on', () => {
    stubMobile(false);
    renderQuiz({ autoplay: true, currentStep: AudioQuizStep.Question });

    expect(screen.getByRole('button', { name: /Skip to guess/ })).toBeTruthy();
  });

  it('shows "Finish" on the primary button on the last card\'s answer step', () => {
    stubMobile(false);
    renderQuiz({
      currentStep: AudioQuizStep.Answer,
      exampleNumber: 20,
      quizLength: 20,
      displayText: 'Lo sabré.',
      isSpanishText: true,
    });

    expect(screen.getByRole('button', { name: /Finish/ })).toBeTruthy();
  });

  it('calls onPrimary when the primary dock button is clicked', async () => {
    stubMobile(false);
    const { onPrimary } = renderQuiz();

    await userEvent.click(
      screen.getByRole('button', { name: /Skip to guess/ }),
    );

    expect(onPrimary).toHaveBeenCalledOnce();
  });

  it('calls onReplay when the replay dock button is clicked', async () => {
    stubMobile(false);
    const { onReplay } = renderQuiz();

    await userEvent.click(
      screen.getByRole('button', { name: /Replay English/ }),
    );

    expect(onReplay).toHaveBeenCalledOnce();
  });

  it('labels speaking answer replay as Replay Spanish', () => {
    stubMobile(false);
    renderQuiz({
      currentStep: AudioQuizStep.Answer,
      displayText: 'Lo sabré.',
      isSpanishText: true,
    });

    expect(screen.getByRole('button', { name: /Replay Spanish/ })).toBeTruthy();
  });

  it('disables "Previous card" on the first card', () => {
    stubMobile(false);
    renderQuiz({ exampleNumber: 1 });

    expect(
      screen.getByRole('button', { name: /Previous card/ }),
    ).toBeDisabled();
  });

  it('calls onNext when "Next card" is clicked', async () => {
    stubMobile(false);
    const { onNext } = renderQuiz({ exampleNumber: 2 });

    await userEvent.click(screen.getByRole('button', { name: /Next card/ }));

    expect(onNext).toHaveBeenCalledOnce();
  });
});

describe('audioQuizV2 — card tap and play/pause', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('advances on tap when autoplay is off', async () => {
    stubMobile(false);
    const { onPrimary } = renderQuiz({ autoplay: false });

    await userEvent.click(screen.getByRole('button', { name: /Flashcard/ }));

    expect(onPrimary).toHaveBeenCalledOnce();
  });

  it('is not tappable when autoplay is on', () => {
    stubMobile(false);
    renderQuiz({ autoplay: true });

    expect(screen.queryByRole('button', { name: /Flashcard/ })).toBeNull();
  });

  it('calls play when the play button is clicked while paused', async () => {
    stubMobile(false);
    const { play } = renderQuiz({ isPlaying: false });

    await userEvent.click(screen.getByRole('button', { name: 'Play audio' }));

    expect(play).toHaveBeenCalledOnce();
  });

  it('calls pause when the play button is clicked while playing', async () => {
    stubMobile(false);
    const { pause } = renderQuiz({ isPlaying: true });

    await userEvent.click(screen.getByRole('button', { name: 'Pause audio' }));

    expect(pause).toHaveBeenCalledOnce();
  });
});

describe('audioQuizV2 — help panel', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  function answerStepOverrides(): AudioQuizV2TestProps {
    return {
      currentStep: AudioQuizStep.Answer,
      displayText: 'Lo sabré cuando ellos lo sepan.',
      isSpanishText: true,
      getHelpIsOpen: true,
    };
  }

  it('shows the Get help toggle on the answer step when vocab is complete', () => {
    stubMobile(false);
    renderQuiz({ ...answerStepOverrides(), getHelpIsOpen: false });

    expect(screen.getByRole('button', { name: 'Get help' })).toBeTruthy();
  });

  it('does not show the Get help toggle off the answer step', () => {
    stubMobile(false);
    renderQuiz({ currentStep: AudioQuizStep.Question });

    expect(screen.queryByRole('button', { name: 'Get help' })).toBeNull();
  });

  it('anchors word details under the chip row on desktop — no dialog', async () => {
    stubMobile(false);
    renderQuiz(answerStepOverrides());

    await userEvent.click(screen.getByRole('button', { name: 'sabré' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText(/LearnCraft Spanish lesson 88/)).toBeTruthy();
  });

  it('opens word details in a modal dialog on mobile', async () => {
    stubMobile(true);
    renderQuiz(answerStepOverrides());

    await userEvent.click(screen.getByRole('button', { name: 'sabré' }));

    expect(
      screen.getByRole('dialog', { name: 'Details for sabré' }),
    ).toBeTruthy();
  });
});

describe('audioQuizV2 — add to flashcards', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('shows "Add to my flashcards" on the answer step for a student', () => {
    stubMobile(false);
    renderQuiz({
      currentStep: AudioQuizStep.Answer,
      displayText: 'Lo sabré.',
      isSpanishText: true,
      addPendingRemoveProps: {
        isAdding: false,
        isRemoving: false,
        isCollected: false,
        isCustom: false,
        addFlashcard: vi.fn(),
        removeFlashcard: vi.fn(),
      },
    });

    expect(
      screen.getByRole('button', { name: /Add to my flashcards/ }),
    ).toBeTruthy();
  });

  it('does not render the add pill off the answer step', () => {
    stubMobile(false);
    renderQuiz({
      currentStep: AudioQuizStep.Question,
      addPendingRemoveProps: {
        isAdding: false,
        isRemoving: false,
        isCollected: false,
        isCustom: false,
        addFlashcard: vi.fn(),
        removeFlashcard: vi.fn(),
      },
    });

    expect(
      screen.queryByRole('button', { name: /Add to my flashcards/ }),
    ).toBeNull();
  });
});

describe('audioQuizV2 — keyboard shortcuts', () => {
  afterEach(() => {
    cleanup();
    restoreNavigator?.();
    vi.unstubAllGlobals();
  });

  it('toggles play/pause on space', () => {
    stubMobile(false);
    const { play } = renderQuiz({ isPlaying: false });

    fireEvent.keyDown(document, { key: ' ' });

    expect(play).toHaveBeenCalledOnce();
  });

  it('calls onPrimary on ArrowUp', () => {
    stubMobile(false);
    const { onPrimary } = renderQuiz();

    fireEvent.keyDown(document, { key: 'ArrowUp' });

    expect(onPrimary).toHaveBeenCalledOnce();
  });

  it('calls onPrevious/onNext on ArrowLeft/ArrowRight', () => {
    stubMobile(false);
    const { onPrevious, onNext } = renderQuiz({ exampleNumber: 2 });

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'ArrowRight' });

    expect(onPrevious).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('does not navigate with arrow keys while a text field is focused', () => {
    stubMobile(false);
    const onPrevious = vi.fn();
    const onNext = vi.fn();

    render(
      <>
        <input aria-label="Test input" />
      </>,
    );
    renderQuiz({ onPrevious, onNext, exampleNumber: 2 });

    screen.getByLabelText('Test input').focus();
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    expect(onNext).not.toHaveBeenCalled();
    expect(onPrevious).not.toHaveBeenCalled();
  });

  it('shows the keyboard legend on a fine-pointer desktop', () => {
    stubMobile(false);
    renderQuiz();

    expect(screen.getByText('play / pause')).toBeInTheDocument();
    expect(screen.getByText('next step')).toBeInTheDocument();
    expect(screen.getByText('card')).toBeInTheDocument();
  });

  it.each([
    {
      label: 'iPadOS with a trackpad',
      finePointer: true,
      canHover: true,
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
      platform: 'MacIntel',
      maxTouchPoints: 5,
    },
    {
      label: 'a touch tablet',
      finePointer: false,
      canHover: false,
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel Tablet)',
      platform: 'Linux armv8l',
      maxTouchPoints: 5,
    },
  ])(
    'ignores quiz shortcuts and hides the legend on $label',
    async ({ finePointer, canHover, userAgent, platform, maxTouchPoints }) => {
      stubMobile(false, { finePointer, canHover });
      stubNavigator({ userAgent, platform, maxTouchPoints });
      const { play, onPrimary, onPrevious, onNext } = renderQuiz({
        exampleNumber: 2,
        isPlaying: false,
      });

      fireEvent.keyDown(document, { key: ' ' });
      fireEvent.keyDown(document, { key: 'ArrowUp' });
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      fireEvent.keyDown(document, { key: 'ArrowRight' });

      expect(play).not.toHaveBeenCalled();
      expect(onPrimary).not.toHaveBeenCalled();
      expect(onPrevious).not.toHaveBeenCalled();
      expect(onNext).not.toHaveBeenCalled();
      expect(screen.queryByText('play / pause')).toBeNull();

      await userEvent.click(screen.getByRole('button', { name: 'Play audio' }));
      expect(play).toHaveBeenCalledOnce();
    },
  );

  it('still closes the word panel on Escape on iPad', async () => {
    stubMobile(true, { finePointer: false, canHover: false });
    stubNavigator({
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X)',
      platform: 'iPad',
      maxTouchPoints: 5,
    });
    renderQuiz({
      currentStep: AudioQuizStep.Answer,
      displayText: 'Lo sabré cuando ellos lo sepan.',
      isSpanishText: true,
      getHelpIsOpen: true,
    });

    await userEvent.click(screen.getByRole('button', { name: 'sabré' }));
    expect(
      screen.getByRole('dialog', { name: 'Details for sabré' }),
    ).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
