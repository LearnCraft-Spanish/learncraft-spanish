import type { AudioQuizV2Props } from '@interface/components/audioQuiz/AudioQuizV2/AudioQuizV2.types';
import type { JSX } from 'react';
import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';
import { AudioQuizEndV2 } from '@interface/components/audioQuiz/AudioQuizEndV2';
import { AudioQuizV2 } from '@interface/components/audioQuiz/AudioQuizV2';
import { useEffect } from 'react';
import {
  ADD_PENDING_REMOVE_PROPS,
  ADD_PENDING_REMOVE_PROPS_ADDED,
  ENGLISH_TEXT,
  EXAMPLE_NUMBER,
  QUIZ_LENGTH,
  SPANISH_TEXT,
  VOCABULARY,
  WORD_TEXTS,
  vocabInfoHook,
} from './audio-quiz.fixtures';

declare global {
  interface Window {
    __SPECIMEN__?: {
      ready: boolean;
      name: string;
      step?: string;
      wordIndex?: number | null;
    };
  }
}

/** `1`/`0` (also true/false/yes/no). Absent means `fallback`. */
function flag(name: string, fallback: boolean): boolean {
  const raw = new URLSearchParams(window.location.search).get(name);
  if (raw === null || raw === '') {
    return fallback;
  }
  return !['0', 'false', 'no'].includes(raw.toLowerCase());
}

function parseStep(raw: string | null): AudioQuizStep {
  switch (raw) {
    case 'guess':
      return AudioQuizStep.Guess;
    case 'hint':
      return AudioQuizStep.Hint;
    case 'answer':
      return AudioQuizStep.Answer;
    case 'question':
    default:
      return AudioQuizStep.Question;
  }
}

/**
 * Display text for the current step — mirrors `useAudioQuizMapper` /
 * handoff `view()`: English on speaking-question and listening-answer;
 * Spanish on speaking-answer and listening-hint; placeholders otherwise
 * (guess / audio-only steps ignore the string and show an instruction).
 */
function displayForStep(
  type: AudioQuizType,
  step: AudioQuizStep,
): { text: string; spanish: boolean } {
  const speaking = type === AudioQuizType.Speaking;
  if (step === AudioQuizStep.Guess) {
    return { text: 'Make a Guess!', spanish: false };
  }
  if (speaking && step === AudioQuizStep.Question) {
    return { text: ENGLISH_TEXT, spanish: false };
  }
  if (speaking && step === AudioQuizStep.Hint) {
    return { text: 'Spanish audio playing', spanish: true };
  }
  if (speaking && step === AudioQuizStep.Answer) {
    return { text: SPANISH_TEXT, spanish: true };
  }
  if (!speaking && step === AudioQuizStep.Question) {
    return { text: 'Spanish audio playing', spanish: true };
  }
  if (!speaking && step === AudioQuizStep.Hint) {
    return { text: SPANISH_TEXT, spanish: true };
  }
  // listening answer
  return { text: ENGLISH_TEXT, spanish: false };
}

function findChip(word: string): HTMLElement | null {
  const leaves = [...document.querySelectorAll<HTMLElement>('*')]
    .filter(
      (el) => el.childElementCount === 0 && el.textContent?.trim() === word,
    )
    .map((el) => ({
      el,
      clickable: el.closest<HTMLElement>('button, [role="button"], [tabindex]'),
    }));

  const interactive = leaves.find((leaf) => leaf.clickable !== null);
  if (interactive?.clickable) {
    return interactive.clickable;
  }
  return leaves.at(-1)?.el ?? null;
}

async function selectWord(index: number): Promise<void> {
  const word = WORD_TEXTS[index];
  if (word === undefined) {
    console.warn(
      `[audio-quiz specimen] word=${index} out of range (0..${WORD_TEXTS.length - 1})`,
    );
    return;
  }

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const chip = findChip(word);
    if (chip) {
      chip.click();
      return;
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  console.warn(`[audio-quiz specimen] no chip found for "${word}"`);
}

/**
 * Auth0-free specimen for the audio quiz v2 redesign loop.
 * Query params drive speaking/listening, autoplay, step, help, fill, etc.
 */
export function AudioQuizSpecimen(): JSX.Element {
  const params = new URLSearchParams(window.location.search);
  const screen = params.get('screen') ?? 'quiz';
  const type =
    params.get('type') === 'listening'
      ? AudioQuizType.Listening
      : AudioQuizType.Speaking;
  const autoplay = flag('autoplay', true);
  const step = parseStep(params.get('step'));
  const help = flag('help', false);
  const playing = flag('playing', false);
  const added = flag('added', false);
  const rawFill = params.get('fill');
  const fill =
    rawFill === null || rawFill === '' ? 0 : Number.parseInt(rawFill, 10);
  const rawWord = params.get('word');
  const wordIndex =
    rawWord === null || rawWord === '' ? null : Number.parseInt(rawWord, 10);

  const noop = (): void => {};

  const chromeStyle = {
    background: '#F0EDE6',
    color: 'var(--lcs-color-ink)',
    fontFamily: 'var(--lcs-font-sans)',
    boxSizing: 'border-box',
    /* Bar body crops already strip the blue app header — zero the token so
     * the quiz fills the capture viewport the same way the bar body does. */
    ['--lcs-app-header-height' as string]: '0px',
    ['--lcs-mobile-tabbar-offset' as string]: '0px',
  } as const;

  const stepParam = params.get('step') ?? undefined;

  useEffect(() => {
    let cancelled = false;

    async function ready(): Promise<void> {
      if (
        screen === 'quiz' &&
        wordIndex !== null &&
        Number.isFinite(wordIndex)
      ) {
        await selectWord(wordIndex);
      }
      if (!cancelled) {
        window.__SPECIMEN__ = {
          ready: true,
          name: 'audio-quiz',
          step: stepParam,
          wordIndex,
        };
      }
    }

    void ready();
    return () => {
      cancelled = true;
    };
  }, [screen, wordIndex, stepParam]);

  if (screen === 'complete') {
    const countdownRaw = params.get('countdown');
    const countdown =
      countdownRaw === null || countdownRaw === ''
        ? undefined
        : Number.parseInt(countdownRaw, 10);
    const skippedRaw = params.get('skipped');
    const skipped =
      skippedRaw === null || skippedRaw === ''
        ? undefined
        : Number.parseInt(skippedRaw, 10);
    const addedCountRaw = params.get('addedCount');
    const addedCount =
      addedCountRaw === null || addedCountRaw === ''
        ? undefined
        : Number.parseInt(addedCountRaw, 10);

    return (
      <div
        data-gauntlet-specimen="audio-quiz"
        style={{
          ...chromeStyle,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AudioQuizEndV2
          speakingOrListening={
            type === AudioQuizType.Speaking ? 'speaking' : 'listening'
          }
          isAutoplay={autoplay}
          quizLength={QUIZ_LENGTH}
          restartQuiz={noop}
          returnToQuizSetup={noop}
          skippedCount={skipped}
          addedCount={addedCount}
          contextLine={flag('context', false) ? 'lessons 1–111' : undefined}
          countdown={countdown}
        />
      </div>
    );
  }

  const { text, spanish } = displayForStep(type, step);

  const props: AudioQuizV2Props = {
    audioQuizType: type,
    autoplay,
    exampleNumber: EXAMPLE_NUMBER,
    quizLength: QUIZ_LENGTH,
    currentStep: step,
    displayText: text,
    isSpanishText: spanish,
    progressStatus: Number.isFinite(fill) ? fill : 0,
    isPlaying: playing,
    play: noop,
    pause: noop,
    onPrimary: noop,
    onReplay: noop,
    onPrevious: noop,
    onNext: noop,
    onExit: noop,
    getHelpIsOpen: help,
    setGetHelpIsOpen: noop,
    vocabulary: VOCABULARY,
    vocabComplete: true,
    vocabInfoHook,
    addPendingRemoveProps: added
      ? ADD_PENDING_REMOVE_PROPS_ADDED
      : ADD_PENDING_REMOVE_PROPS,
  };

  return (
    <div
      data-gauntlet-specimen="audio-quiz"
      style={{
        ...chromeStyle,
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AudioQuizV2 {...props} />
    </div>
  );
}
