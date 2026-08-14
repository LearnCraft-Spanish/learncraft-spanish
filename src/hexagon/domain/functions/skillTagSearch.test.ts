import type {
  ConjugationSkillTag,
  IdiomSkillTag,
  SkillTag,
  SubcategorySkillTag,
  VerbSkillTag,
  VocabularySkillTag,
} from '@learncraft-spanish/shared';
import { searchSkillTags } from '@domain/functions/skillTagSearch';
import { PartOfSpeech, SkillType } from '@learncraft-spanish/shared';
import { describe, expect, it } from 'vitest';

function vocabularyTag({
  id,
  name,
  descriptor = `descriptor-${id}`,
  frequency = null,
}: {
  id: number;
  name: string;
  descriptor?: string;
  frequency?: number | null;
}): VocabularySkillTag {
  return {
    type: SkillType.Vocabulary,
    key: `Vocabulary-${id}`,
    name,
    descriptor,
    vocabularyId: id,
    subcategoryName: 'Prepositions',
    frequency,
  };
}

function idiomTag({
  id,
  name,
  frequency = null,
}: {
  id: number;
  name: string;
  frequency?: number | null;
}): IdiomSkillTag {
  return {
    type: SkillType.Idiom,
    key: `Idiom-${id}`,
    name,
    vocabularyId: id,
    subcategoryName: 'Cluster, Idiom',
    frequency,
  };
}

function subcategoryTag({
  id,
  name,
  partOfSpeech = PartOfSpeech.Noun,
}: {
  id: number;
  name: string;
  partOfSpeech?: PartOfSpeech;
}): SubcategorySkillTag {
  return {
    type: SkillType.Subcategory,
    key: `Subcategory-${id}`,
    name,
    subcategoryId: id,
    partOfSpeech,
    subcategory: name,
  };
}

function verbTag({
  id,
  name,
  verbTags = [],
}: {
  id: number;
  name: string;
  verbTags?: string[];
}): VerbSkillTag {
  return {
    type: SkillType.Verb,
    key: `Verb-${id}`,
    name,
    verbId: id,
    verbTags,
  };
}

function conjugationTag(name: string): ConjugationSkillTag {
  return {
    type: SkillType.Conjugation,
    key: `Conjugation-${name}`,
    name,
  };
}

const keysOf = (tags: SkillTag[]) => tags.map((tag) => tag.key);

describe('searchSkillTags', () => {
  describe('match tiers', () => {
    it('ranks an exact name match above a partial name match', () => {
      const tags = [
        vocabularyTag({ id: 2, name: 'porque' }),
        vocabularyTag({ id: 1, name: 'por' }),
      ];

      expect(keysOf(searchSkillTags(tags, 'por'))).toEqual([
        'Vocabulary-1',
        'Vocabulary-2',
      ]);
    });

    it('ranks a partial name match above an exact description match', () => {
      const tags = [
        verbTag({ id: 7, name: 'lavarse', verbTags: ['reflexive'] }),
        subcategoryTag({ id: 49, name: 'Pronoun, Reflexive' }),
      ];

      expect(keysOf(searchSkillTags(tags, 'reflexive'))).toEqual([
        'Subcategory-49',
        'Verb-7',
      ]);
    });

    it('ranks an exact description match above a partial description match', () => {
      const tags = [
        verbTag({ id: 8, name: 'poder', verbTags: ['irregular stem'] }),
        verbTag({ id: 7, name: 'ser', verbTags: ['irregular'] }),
      ];

      expect(keysOf(searchSkillTags(tags, 'irregular'))).toEqual([
        'Verb-7',
        'Verb-8',
      ]);
    });

    it('orders all four tiers together', () => {
      const tags = [
        verbTag({ id: 4, name: 'poder', verbTags: ['porous stem'] }),
        verbTag({ id: 3, name: 'lavarse', verbTags: ['por'] }),
        vocabularyTag({ id: 2, name: 'porque' }),
        vocabularyTag({ id: 1, name: 'por' }),
      ];

      expect(keysOf(searchSkillTags(tags, 'por'))).toEqual([
        'Vocabulary-1',
        'Vocabulary-2',
        'Verb-3',
        'Verb-4',
      ]);
    });

    it('gives a tag its best tier even when it matches on several', () => {
      // "reflexive" is both this verb's name substring and an exact verb tag;
      // the name match must win.
      const tags = [
        verbTag({ id: 7, name: 'otro', verbTags: ['reflexive'] }),
        verbTag({ id: 8, name: 'reflexive-ish', verbTags: ['reflexive'] }),
      ];

      expect(keysOf(searchSkillTags(tags, 'reflexive'))).toEqual([
        'Verb-8',
        'Verb-7',
      ]);
    });

    it('matches a subcategory on its part of speech', () => {
      const tags = [subcategoryTag({ id: 49, name: 'Time, general' })];

      expect(keysOf(searchSkillTags(tags, 'noun'))).toEqual(['Subcategory-49']);
    });

    it('drops tags that match neither name nor description', () => {
      const tags = [
        vocabularyTag({ id: 1, name: 'casa', descriptor: 'house' }),
        conjugationTag('Subjunctive present'),
      ];

      expect(searchSkillTags(tags, 'zzz')).toEqual([]);
    });

    it('ignores case and surrounding whitespace', () => {
      const tags = [vocabularyTag({ id: 1, name: 'Por' })];

      expect(keysOf(searchSkillTags(tags, '  POR  '))).toEqual([
        'Vocabulary-1',
      ]);
    });

    it('searches idiom and conjugation tags by name only', () => {
      const tags = [
        idiomTag({ id: 57, name: 'por favor' }),
        conjugationTag('Subjunctive present'),
      ];

      expect(keysOf(searchSkillTags(tags, 'por'))).toEqual(['Idiom-57']);
      expect(searchSkillTags(tags, 'Cluster, Idiom')).toEqual([]);
    });
  });

  describe('frequency ordering', () => {
    it('orders vocabulary within a tier by ascending frequency', () => {
      const tags = [
        vocabularyTag({ id: 3, name: 'portal', frequency: 900 }),
        vocabularyTag({ id: 1, name: 'porque', frequency: 12 }),
        vocabularyTag({ id: 2, name: 'porción', frequency: 400 }),
      ];

      expect(keysOf(searchSkillTags(tags, 'por'))).toEqual([
        'Vocabulary-1',
        'Vocabulary-2',
        'Vocabulary-3',
      ]);
    });

    it('sorts tags with no frequency last', () => {
      const tags = [
        vocabularyTag({ id: 1, name: 'portal', frequency: null }),
        vocabularyTag({ id: 2, name: 'porque', frequency: 900 }),
      ];

      expect(keysOf(searchSkillTags(tags, 'por'))).toEqual([
        'Vocabulary-2',
        'Vocabulary-1',
      ]);
    });

    it('orders idioms and vocabulary together by frequency', () => {
      const tags = [
        vocabularyTag({ id: 1, name: 'porque', frequency: 500 }),
        idiomTag({ id: 57, name: 'por favor', frequency: 30 }),
      ];

      expect(keysOf(searchSkillTags(tags, 'por'))).toEqual([
        'Idiom-57',
        'Vocabulary-1',
      ]);
    });

    it('leads each tier with structural tags in catalog order', () => {
      // All three are partial name matches, so only the structural rule
      // separates them — a frequency of 1 does not promote the vocabulary tag.
      const tags = [
        vocabularyTag({ id: 1, name: 'porquería', frequency: 1 }),
        subcategoryTag({ id: 49, name: 'Porque group' }),
        verbTag({ id: 7, name: 'porquear' }),
      ];

      expect(keysOf(searchSkillTags(tags, 'porque'))).toEqual([
        'Subcategory-49',
        'Verb-7',
        'Vocabulary-1',
      ]);
    });

    it('does not let the structural rule outrank match quality', () => {
      const tags = [
        subcategoryTag({ id: 49, name: 'Porque group' }),
        vocabularyTag({ id: 1, name: 'porque' }),
      ];

      expect(keysOf(searchSkillTags(tags, 'porque'))).toEqual([
        'Vocabulary-1',
        'Subcategory-49',
      ]);
    });

    it('does not let frequency outrank match quality', () => {
      const tags = [
        vocabularyTag({ id: 2, name: 'porque', frequency: 1 }),
        vocabularyTag({ id: 1, name: 'por', frequency: 9000 }),
      ];

      expect(keysOf(searchSkillTags(tags, 'por'))).toEqual([
        'Vocabulary-1',
        'Vocabulary-2',
      ]);
    });

    it('keeps equal frequencies in catalog order', () => {
      const tags = [
        vocabularyTag({ id: 1, name: 'porta', frequency: 100 }),
        vocabularyTag({ id: 2, name: 'porte', frequency: 100 }),
      ];

      expect(keysOf(searchSkillTags(tags, 'por'))).toEqual([
        'Vocabulary-1',
        'Vocabulary-2',
      ]);
    });
  });

  describe('limit', () => {
    const manyTags = Array.from({ length: 30 }, (_, index) =>
      vocabularyTag({ id: index + 1, name: `porque-${index}` }),
    );

    it('returns at most 20 suggestions by default', () => {
      expect(searchSkillTags(manyTags, 'por')).toHaveLength(20);
    });

    it('honors an explicit limit', () => {
      expect(searchSkillTags(manyTags, 'por', { limit: 3 })).toHaveLength(3);
    });

    it('keeps the best matches when truncating', () => {
      const tags = [
        ...manyTags,
        vocabularyTag({ id: 999, name: 'por', frequency: 5 }),
      ];

      expect(searchSkillTags(tags, 'por', { limit: 1 })[0].key).toBe(
        'Vocabulary-999',
      );
    });
  });

  describe('empty input', () => {
    it('returns nothing for an empty search term', () => {
      expect(
        searchSkillTags([vocabularyTag({ id: 1, name: 'por' })], ''),
      ).toEqual([]);
    });

    it('returns nothing for a whitespace-only search term', () => {
      expect(
        searchSkillTags([vocabularyTag({ id: 1, name: 'por' })], '   '),
      ).toEqual([]);
    });

    it('returns nothing when there are no tags', () => {
      expect(searchSkillTags([], 'por')).toEqual([]);
    });

    it('does not mutate the input array order', () => {
      const tags = [
        vocabularyTag({ id: 2, name: 'porque', frequency: 900 }),
        vocabularyTag({ id: 1, name: 'por', frequency: 5 }),
      ];

      searchSkillTags(tags, 'por');

      expect(keysOf(tags)).toEqual(['Vocabulary-2', 'Vocabulary-1']);
    });
  });
});
