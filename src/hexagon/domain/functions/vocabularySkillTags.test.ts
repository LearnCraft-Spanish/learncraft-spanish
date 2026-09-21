import type {
  ConjugationSkillTag,
  IdiomSkillTag,
  SkillTag,
  SubcategorySkillTag,
  VerbSkillTag,
  VocabularySkillTag,
} from '@learncraft-spanish/shared';
import {
  filterToVocabularyTags,
  vocabularyIdFromSkillTag,
} from '@domain/functions/vocabularySkillTags';
import { PartOfSpeech, SkillType } from '@learncraft-spanish/shared';
import { describe, expect, it } from 'vitest';

function vocabularyTag(id: number): VocabularySkillTag {
  return {
    type: SkillType.Vocabulary,
    key: `Vocabulary-${id}`,
    name: `word-${id}`,
    descriptor: `descriptor-${id}`,
    vocabularyId: id,
    subcategoryName: 'Prepositions',
    frequency: null,
  };
}

function idiomTag(id: number): IdiomSkillTag {
  return {
    type: SkillType.Idiom,
    key: `Idiom-${id}`,
    name: `idiom-${id}`,
    vocabularyId: id,
    subcategoryName: 'Cluster, Idiom',
    frequency: null,
  };
}

function subcategoryTag(id: number): SubcategorySkillTag {
  return {
    type: SkillType.Subcategory,
    key: `Subcategory-${id}`,
    name: `subcat-${id}`,
    subcategoryId: id,
    partOfSpeech: PartOfSpeech.Noun,
    subcategory: `subcat-${id}`,
  };
}

function verbTag(id: number): VerbSkillTag {
  return {
    type: SkillType.Verb,
    key: `Verb-${id}`,
    name: `verb-${id}`,
    verbId: id,
    verbTags: [],
  };
}

function conjugationTag(name: string): ConjugationSkillTag {
  return {
    type: SkillType.Conjugation,
    key: `Conjugation-${name}`,
    name,
  };
}

describe('vocabularyIdFromSkillTag', () => {
  it('returns vocabularyId for Vocabulary tags', () => {
    expect(vocabularyIdFromSkillTag(vocabularyTag(42))).toBe(42);
  });

  it('returns vocabularyId for Idiom tags', () => {
    expect(vocabularyIdFromSkillTag(idiomTag(7))).toBe(7);
  });

  it('returns null for structural tags', () => {
    expect(vocabularyIdFromSkillTag(subcategoryTag(1))).toBeNull();
    expect(vocabularyIdFromSkillTag(verbTag(2))).toBeNull();
    expect(vocabularyIdFromSkillTag(conjugationTag('present'))).toBeNull();
  });
});

describe('filterToVocabularyTags', () => {
  it('keeps Vocabulary and Idiom tags and drops structural ones', () => {
    const tags: SkillTag[] = [
      vocabularyTag(1),
      subcategoryTag(2),
      idiomTag(3),
      verbTag(4),
      conjugationTag('past'),
    ];

    expect(filterToVocabularyTags(tags)).toEqual([
      vocabularyTag(1),
      idiomTag(3),
    ]);
  });

  it('returns an empty array when nothing qualifies', () => {
    expect(filterToVocabularyTags([subcategoryTag(1), verbTag(2)])).toEqual([]);
  });
});
