import type { AddPendingRemoveProps } from '@application/units/useTextQuiz';
import type { VocabInfo } from '@application/units/useVocabInfo';
import type { Lesson, Vocabulary } from '@learncraft-spanish/shared';

/**
 * Fixture data aligned with the audio-quiz design handoff so specimen
 * screenshots are directly comparable to `.gauntlet/bars/audio-quiz/`.
 */

export const ENGLISH_TEXT = 'I will know it when they know it.';
/** Target word marked with `**…**` for `audioQuizTextRuns` bold emphasis. */
export const SPANISH_TEXT = 'Lo **sabré** cuando ellos lo sepan.';

export const EXAMPLE_NUMBER = 12;
export const QUIZ_LENGTH = 20;

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

/** Chip order; `word` query indexes this. Index 4 is `sepan` (help-word frames). */
const WORDS: MockWord[] = [
  {
    id: 101,
    word: 'lo',
    descriptor: 'Direct object pronoun — "it".',
    type: 'nonverb',
    partOfSpeech: 'Pronoun',
    category: 'Object pronouns',
    lessons: [
      { courseName: 'LearnCraft Spanish', lessonNumber: 24 },
      { courseName: 'LearnCraft Spanish', lessonNumber: 31 },
    ],
  },
  {
    id: 102,
    word: 'sabré',
    descriptor: 'Future of saber — "I will know".',
    type: 'verb',
    partOfSpeech: 'Verb',
    category: 'Irregular future',
    infinitive: 'saber',
    lessons: [
      { courseName: 'LearnCraft Spanish', lessonNumber: 88 },
      { courseName: 'LearnCraft Spanish', lessonNumber: 92 },
    ],
  },
  {
    id: 103,
    word: 'cuando',
    descriptor: 'Time conjunction — triggers subjunctive for future events.',
    type: 'nonverb',
    partOfSpeech: 'Conjunction',
    category: 'Subjunctive triggers',
    lessons: [{ courseName: 'LearnCraft Spanish', lessonNumber: 104 }],
  },
  {
    id: 104,
    word: 'ellos',
    descriptor: 'Third person plural subject pronoun.',
    type: 'nonverb',
    partOfSpeech: 'Pronoun',
    category: 'Subject pronouns',
    lessons: [{ courseName: 'LearnCraft Spanish', lessonNumber: 3 }],
  },
  {
    id: 105,
    word: 'sepan',
    descriptor: 'Present subjunctive of saber, third plural.',
    type: 'verb',
    partOfSpeech: 'Verb',
    category: 'Subjunctive',
    infinitive: 'saber',
    lessons: [
      { courseName: 'LearnCraft Spanish', lessonNumber: 101 },
      { courseName: 'LearnCraft Spanish', lessonNumber: 104 },
    ],
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

function toLessons(entry: MockWord): Lesson[] {
  return entry.lessons.map((lesson, index) => ({
    id: entry.id * 10 + index,
    courseName: lesson.courseName,
    lessonNumber: lesson.lessonNumber,
  })) as unknown as Lesson[];
}

const VOCAB_INFO_BY_ID = new Map<number, VocabInfo>(
  WORDS.map((entry) => [
    entry.id,
    {
      word:
        entry.type === 'verb' && entry.infinitive
          ? `${entry.infinitive} (${entry.word})`
          : entry.word,
      descriptor: entry.descriptor,
      subcategory: subcategoryOf(entry),
      verb: entry.type === 'verb' ? verbOf(entry) : null,
      conjugationTags: entry.type === 'verb' ? [] : null,
      lessons: toLessons(entry),
      lessonsLoading: false,
      currentCourseName: 'LearnCraft Spanish',
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

export const ADD_PENDING_REMOVE_PROPS: AddPendingRemoveProps = {
  isAdding: false,
  isRemoving: false,
  isCollected: false,
  isCustom: false,
  addFlashcard: noop,
  removeFlashcard: noop,
};

export const ADD_PENDING_REMOVE_PROPS_ADDED: AddPendingRemoveProps = {
  ...ADD_PENDING_REMOVE_PROPS,
  isCollected: true,
};
