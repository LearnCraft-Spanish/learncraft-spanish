import type { AddPendingRemoveProps } from '@application/units/useTextQuiz';
import type { VocabInfo } from '@application/units/useVocabInfo';
import type { SrsTallies } from '@domain/functions/srsTallies';
import type { FlashcardForDisplay } from '@domain/quizzing';
import type { Lesson, Vocabulary } from '@learncraft-spanish/shared';

/**
 * Fixture data transcribed from the design prototype's placeholder content so
 * specimen screenshots are directly comparable to
 * `Quiz Card Redesign.dc.html` frames.
 *
 * Ported from the prior Downloads handoff harness attempt.
 */

export const ENGLISH_TEXT = 'I will know it when they know it.';
/** Target word marked with `**…**` so `quizFaceRuns` bolds it at weight 900. */
export const SPANISH_TEXT = 'Lo **sabré** cuando ellos lo sepan.';

/** SRS due-review title (handoff A frames). */
export const QUIZ_TITLE_SRS = 'Lessons 1–111 · 249 due';
/** Plain quiz title (handoff B frames). */
export const QUIZ_TITLE_PLAIN = 'Lessons 1–111 · 249 cards';
export const EXAMPLE_NUMBER = 10;
export const QUIZ_LENGTH = 249;

export const TALLIES: SrsTallies = { hard: 7, easy: 2 };

const AUDIO_URL = '/gauntlet-fixture-audio.mp3';

interface MockWord {
  id: number;
  word: string;
  descriptor: string;
  type: 'verb' | 'nonverb';
  partOfSpeech: string;
  category: string;
  infinitive?: string;
  lessons: { courseName: string; lessonNumber: number }[];
}

/** Chip order; `word` query indexes this. Index 2 is `cuando` (help frames). */
const WORDS: MockWord[] = [
  {
    id: 101,
    word: 'lo',
    descriptor: '"lo": "it" (direct object pronoun)',
    type: 'nonverb',
    partOfSpeech: 'Pronoun',
    category: 'Direct object',
    lessons: [
      { courseName: 'LearnCraft Spanish', lessonNumber: 12 },
      { courseName: 'Spanish in One Month', lessonNumber: 6 },
    ],
  },
  {
    id: 102,
    word: 'sabré',
    descriptor: '"sabré": "I will know" (saber, future)',
    type: 'verb',
    partOfSpeech: 'Verb',
    category: 'Irregular future',
    infinitive: 'saber',
    lessons: [
      { courseName: 'LearnCraft Spanish', lessonNumber: 24 },
      { courseName: 'Spanish in One Month', lessonNumber: 11 },
    ],
  },
  {
    id: 103,
    word: 'cuando',
    descriptor: '"cuando": "when" (sometimes followed by a subjunctive)',
    type: 'nonverb',
    partOfSpeech: 'Conjunction',
    category: 'Subordinating, potential subjunctive',
    /* Help frames (A/B-mobile-help): two taught-in rows for cuando. */
    lessons: [
      { courseName: 'LearnCraft Spanish', lessonNumber: 28 },
      { courseName: 'Subjunctives Challenge', lessonNumber: 1 },
    ],
  },
  {
    id: 104,
    word: 'ellos',
    descriptor: '"ellos": "they" (masculine)',
    type: 'nonverb',
    partOfSpeech: 'Pronoun',
    category: 'Subject',
    lessons: [{ courseName: 'LearnCraft Spanish', lessonNumber: 3 }],
  },
  {
    id: 105,
    word: 'sepan',
    descriptor: '"sepan": "they know" (saber, present subjunctive)',
    type: 'verb',
    partOfSpeech: 'Verb',
    category: 'Present subjunctive',
    infinitive: 'saber',
    lessons: [
      { courseName: 'LearnCraft Spanish', lessonNumber: 28 },
      { courseName: 'Subjunctives Challenge', lessonNumber: 2 },
    ],
  },
];

/**
 * Longer words appended by `extrawords=1` so mobile captures exercise chip
 * wrapping — the base five short words fit one row even at 390px, while real
 * sentences tag enough vocabulary to overflow it.
 */
const EXTRA_WORDS: MockWord[] = [
  {
    id: 106,
    word: 'desafortunadamente',
    descriptor: '"desafortunadamente": "unfortunately"',
    type: 'nonverb',
    partOfSpeech: 'Adverb',
    category: 'Sentence adverb',
    lessons: [{ courseName: 'LearnCraft Spanish', lessonNumber: 40 }],
  },
  {
    id: 107,
    word: 'arrepentimiento',
    descriptor: '"arrepentimiento": "regret"',
    type: 'nonverb',
    partOfSpeech: 'Noun',
    category: 'Abstract',
    lessons: [{ courseName: 'LearnCraft Spanish', lessonNumber: 55 }],
  },
  {
    id: 108,
    word: 'inmediatamente',
    descriptor: '"inmediatamente": "immediately"',
    type: 'nonverb',
    partOfSpeech: 'Adverb',
    category: 'Time',
    lessons: [{ courseName: 'LearnCraft Spanish', lessonNumber: 31 }],
  },
];

export const WORD_TEXTS: string[] = WORDS.map((entry) => entry.word);

function subcategoryOf(entry: MockWord) {
  return {
    id: entry.id + 900,
    name: entry.category,
    category: entry.category,
    partOfSpeech: entry.partOfSpeech,
  };
}

function verbOf(entry: MockWord) {
  return { id: entry.id + 800, infinitive: entry.infinitive };
}

function toVocabulary(entry: MockWord): Vocabulary {
  const base = {
    id: entry.id,
    word: entry.word,
    descriptor: entry.descriptor,
    type: entry.type,
    spellings: [entry.word],
    subcategory: subcategoryOf(entry),
    frequency: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };
  const verbFields =
    entry.type === 'verb' ? { verb: verbOf(entry), conjugationTags: [] } : {};
  return { ...base, ...verbFields } as unknown as Vocabulary;
}

export const VOCABULARY: Vocabulary[] = WORDS.map(toVocabulary);
export const EXTRA_VOCABULARY: Vocabulary[] = EXTRA_WORDS.map(toVocabulary);

function toLessons(entry: MockWord): Lesson[] {
  return entry.lessons.map((lesson, index) => ({
    id: entry.id * 10 + index,
    courseName: lesson.courseName,
    lessonNumber: lesson.lessonNumber,
  })) as unknown as Lesson[];
}

const VOCAB_INFO_BY_ID = new Map<number, VocabInfo>(
  [...WORDS, ...EXTRA_WORDS].map((entry) => [
    entry.id,
    {
      word: entry.word,
      descriptor: entry.descriptor,
      subcategory: subcategoryOf(entry),
      verb: entry.type === 'verb' ? verbOf(entry) : null,
      conjugationTags: entry.type === 'verb' ? [] : null,
      lessons: toLessons(entry),
      lessonsLoading: false,
    } as unknown as VocabInfo,
  ]),
);

/** Pure stub — no React hook, no network. */
export function vocabInfoHook(vocab: Vocabulary): VocabInfo {
  const info = VOCAB_INFO_BY_ID.get(vocab.id);
  if (info) {
    return info;
  }
  return {
    word: vocab.word,
    descriptor: vocab.descriptor,
    subcategory: vocab.subcategory,
    verb: null,
    conjugationTags: null,
    lessons: [],
    lessonsLoading: false,
  } as unknown as VocabInfo;
}

const noop = (): void => {};

export const QUIZ_EXAMPLE: FlashcardForDisplay = {
  question: {
    spanish: false,
    text: ENGLISH_TEXT,
    hasAudio: true,
    audioUrl: AUDIO_URL,
  },
  answer: {
    spanish: true,
    text: SPANISH_TEXT,
    hasAudio: true,
    audioUrl: AUDIO_URL,
    owned: false,
    vocabulary: VOCABULARY,
    vocabComplete: true,
    addFlashcard: noop,
    removeFlashcard: noop,
    updateFlashcardInterval: noop,
  },
  exampleIsCollected: false,
  exampleIsCustom: false,
  exampleIsAdding: false,
  exampleIsRemoving: false,
} as unknown as FlashcardForDisplay;

export const ADD_PENDING_REMOVE_PROPS: AddPendingRemoveProps = {
  isAdding: false,
  isRemoving: false,
  isCollected: false,
  isCustom: false,
  addFlashcard: noop,
  removeFlashcard: noop,
};
