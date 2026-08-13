import type { SkillTag } from '@learncraft-spanish/shared';
import {
  filterSkillTagsByKnownVocabulary,
  isSkillTagInKnownVocabulary,
} from '@domain/functions/skillTagLessonRange';
import { PartOfSpeech, SkillType } from '@learncraft-spanish/shared';
import { describe, expect, it } from 'vitest';

const vocabularyTag: SkillTag = {
  type: SkillType.Vocabulary,
  key: 'Vocabulary-1',
  name: 'por',
  descriptor: 'for',
  vocabularyId: 1,
  subcategoryName: 'Prepositions',
};

const idiomTag: SkillTag = {
  type: SkillType.Idiom,
  key: 'Idiom-57',
  name: 'por favor',
  vocabularyId: 57,
  subcategoryName: 'Idioms',
};

const subcategoryTag: SkillTag = {
  type: SkillType.Subcategory,
  key: 'Subcategory-49',
  name: 'Idioms',
  subcategoryId: 49,
  partOfSpeech: PartOfSpeech.Noun,
  subcategory: 'Idioms',
};

const verbTag: SkillTag = {
  type: SkillType.Verb,
  key: 'Verb-1',
  name: 'ser',
  verbId: 1,
  verbTags: ['irregular'],
};

const conjugationTag: SkillTag = {
  type: SkillType.Conjugation,
  key: 'Conjugation-Subjunctive present',
  name: 'Subjunctive present',
};

describe('isSkillTagInKnownVocabulary', () => {
  it('keeps a vocabulary tag whose vocabularyId is known', () => {
    expect(isSkillTagInKnownVocabulary(vocabularyTag, new Set([1, 2]))).toBe(
      true,
    );
  });

  it('rejects a vocabulary tag whose vocabularyId is not known', () => {
    expect(isSkillTagInKnownVocabulary(vocabularyTag, new Set([2, 3]))).toBe(
      false,
    );
  });

  it('keeps an idiom tag whose vocabularyId is known', () => {
    expect(isSkillTagInKnownVocabulary(idiomTag, new Set([57]))).toBe(true);
  });

  it('rejects an idiom tag whose vocabularyId is not known', () => {
    expect(isSkillTagInKnownVocabulary(idiomTag, new Set([1]))).toBe(false);
  });

  it.each([
    ['subcategory', subcategoryTag],
    ['verb', verbTag],
    ['conjugation', conjugationTag],
  ])('always keeps a %s tag, which carries no vocabularyId', (_label, tag) => {
    expect(isSkillTagInKnownVocabulary(tag, new Set())).toBe(true);
  });
});

describe('filterSkillTagsByKnownVocabulary', () => {
  const allTags: SkillTag[] = [
    vocabularyTag,
    idiomTag,
    subcategoryTag,
    verbTag,
    conjugationTag,
  ];

  it('keeps only the vocabulary and idiom tags within the known set', () => {
    const result = filterSkillTagsByKnownVocabulary(allTags, new Set([1]));

    expect(result.map((tag) => tag.key)).toEqual([
      'Vocabulary-1',
      'Subcategory-49',
      'Verb-1',
      'Conjugation-Subjunctive present',
    ]);
  });

  it('drops every vocabulary and idiom tag when the known set is empty', () => {
    const result = filterSkillTagsByKnownVocabulary(allTags, new Set());

    expect(result.map((tag) => tag.key)).toEqual([
      'Subcategory-49',
      'Verb-1',
      'Conjugation-Subjunctive present',
    ]);
  });

  it('keeps every tag when the known set covers all vocabulary ids', () => {
    const result = filterSkillTagsByKnownVocabulary(allTags, new Set([1, 57]));

    expect(result).toHaveLength(allTags.length);
  });

  it('returns an empty list for an empty input', () => {
    expect(filterSkillTagsByKnownVocabulary([], new Set([1]))).toEqual([]);
  });
});
