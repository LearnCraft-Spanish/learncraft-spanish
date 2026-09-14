import type { VocabInfo } from '@application/units/useVocabInfo';
import type { SkillTag, Vocabulary } from '@learncraft-spanish/shared';
import { SkillType } from '@learncraft-spanish/shared';

export const VOCABULARY = {
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

export const SUGGESTIONS: SkillTag[] = [
  {
    type: SkillType.Vocabulary,
    key: 'Vocabulary-103',
    name: 'cuando',
    descriptor: 'when',
    vocabularyId: 103,
    subcategoryName: 'Subordinating',
    frequency: 10,
  },
  {
    type: SkillType.Idiom,
    key: 'Idiom-50',
    name: 'de vez en cuando',
    vocabularyId: 50,
    subcategoryName: 'Cluster, Idiom',
    frequency: 5,
  },
  {
    type: SkillType.Vocabulary,
    key: 'Vocabulary-44',
    name: 'cuanto',
    descriptor: 'how much',
    vocabularyId: 44,
    subcategoryName: 'Adverbs',
    frequency: 8,
  },
];

export function vocabInfoHook(vocab: Vocabulary): VocabInfo {
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
    currentCourseName: 'LearnCraft Spanish',
  } as unknown as VocabInfo;
}
