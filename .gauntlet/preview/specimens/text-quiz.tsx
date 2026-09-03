import type { TextQuizV2Props } from '@interface/components/textQuiz/TextQuizV2/TextQuizV2.types';
import type { JSX } from 'react';
import { TextQuizV2 } from '@interface/components/textQuiz/TextQuizV2';
import { useEffect } from 'react';
import {
  ADD_PENDING_REMOVE_PROPS,
  EXAMPLE_NUMBER,
  EXTRA_VOCABULARY,
  QUIZ_EXAMPLE,
  QUIZ_LENGTH,
  QUIZ_TITLE_PLAIN,
  QUIZ_TITLE_SRS,
  TALLIES,
  VOCABULARY,
  WORD_TEXTS,
  vocabInfoHook,
} from './text-quiz.fixtures';

declare global {
  interface Window {
    __SPECIMEN__?: {
      ready: boolean;
      name: string;
      variant?: string;
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
      `[text-quiz specimen] word=${index} out of range (0..${WORD_TEXTS.length - 1})`,
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
  console.warn(`[text-quiz specimen] no chip found for "${word}"`);
}

/**
 * Auth0-free specimen for the text quiz v2 redesign loop.
 * Query params match the prior Downloads harness capture matrix.
 */
export function TextQuizSpecimen(): JSX.Element {
  const params = new URLSearchParams(window.location.search);
  const variant = params.get('variant') ?? 'srs';
  const srs = variant !== 'plain';
  const answerShowing = flag('flipped', false);
  const getHelpIsOpen = flag('help', false);
  const exampleNumber = flag('first', false)
    ? 1
    : flag('last', false)
      ? QUIZ_LENGTH
      : EXAMPLE_NUMBER;

  const rawWord = params.get('word');
  const wordIndex =
    rawWord === null || rawWord === '' ? null : Number.parseInt(rawWord, 10);

  /* `legacy=1` drops the 100vh flex wrapper, mounting the quiz the way the
   * real app does today — plain block divs with no height — so captures
   * prove `TextQuizV2` fills the viewport on its own (`height: 100dvh -
   * --lcs-app-header-height`) instead of leaning on a flex ancestor. */
  const legacy = flag('legacy', false);

  /** Match bar crops: A-help clips to 1 taught-in row; B-help shows 2. */
  const rawLessons = params.get('lessons');
  const lessonLimit =
    rawLessons === null || rawLessons === ''
      ? null
      : Number.parseInt(rawLessons, 10);

  /* `extrawords=1` appends longer chips so mobile captures exercise chip
   * wrapping (the base five short words fit one row even at 390px). */
  const quizExample = flag('extrawords', false)
    ? ({
        ...QUIZ_EXAMPLE,
        answer: {
          ...QUIZ_EXAMPLE.answer,
          vocabulary: [...VOCABULARY, ...EXTRA_VOCABULARY],
        },
      } as unknown as TextQuizV2Props['quizExample'])
    : QUIZ_EXAMPLE;

  const noop = (): void => {};

  function specimenVocabInfoHook(
    vocab: Parameters<typeof vocabInfoHook>[0],
  ): ReturnType<typeof vocabInfoHook> {
    const info = vocabInfoHook(vocab);
    if (lessonLimit === null || !Number.isFinite(lessonLimit)) {
      return info;
    }
    if (lessonLimit <= info.lessons.length || info.lessons.length === 0) {
      return {
        ...info,
        lessons: info.lessons.slice(0, Math.max(0, lessonLimit)),
      };
    }
    /* Pad with synthetic lessons past the fixture's two so desktop overflow
     * states (panel spilling the card, then capping at 50vh) can be
     * captured. */
    const lessons = [...info.lessons];
    for (let index = lessons.length; index < lessonLimit; index += 1) {
      const template = info.lessons[index % info.lessons.length];
      lessons.push({
        ...template,
        id: 1000 + index,
        courseName: `${template.courseName} ${index + 1}`,
      });
    }
    return { ...info, lessons };
  }

  const props: TextQuizV2Props = {
    srs,
    quizTitle: srs ? QUIZ_TITLE_SRS : QUIZ_TITLE_PLAIN,
    exampleNumber,
    quizLength: QUIZ_LENGTH,
    quizExample,
    answerShowing,
    toggleAnswer: noop,
    getHelpIsOpen,
    setGetHelpIsOpen: noop,
    vocabInfoHook: specimenVocabInfoHook,
    addPendingRemoveProps: ADD_PENDING_REMOVE_PROPS,
    onPrevious: noop,
    onNext: noop,
    onExit: noop,
    ...(srs ? { onGrade: noop, tallies: TALLIES } : {}),
  };

  useEffect(() => {
    let cancelled = false;

    async function ready(): Promise<void> {
      if (wordIndex !== null && Number.isFinite(wordIndex)) {
        await selectWord(wordIndex);
      }
      if (!cancelled) {
        window.__SPECIMEN__ = {
          ready: true,
          name: 'text-quiz',
          variant,
          wordIndex,
        };
      }
    }

    void ready();
    return () => {
      cancelled = true;
    };
  }, [variant, wordIndex]);

  const chromeStyle = {
    /* Literal parchment — token resolves the same, but force so captures
     * cannot pick up a cooler html/body default behind the specimen. */
    background: '#F0EDE6',
    color: 'var(--lcs-color-ink)',
    fontFamily: 'var(--lcs-font-sans)',
    boxSizing: 'border-box',
  } as const;

  return (
    <div
      data-gauntlet-specimen="text-quiz"
      style={
        legacy
          ? chromeStyle
          : {
              ...chromeStyle,
              height: '100vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }
      }
    >
      <TextQuizV2 {...props} />
    </div>
  );
}
