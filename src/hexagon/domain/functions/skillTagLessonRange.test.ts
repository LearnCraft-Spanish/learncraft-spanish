import type { ReachableSkills, SkillTag } from '@learncraft-spanish/shared';
import {
  filterSkillTagsByReachability,
  isSkillTagReachable,
  toReachableSkillSets,
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

const nothingReachable: ReachableSkills = {
  vocabularyIds: [],
  subcategoryIds: [],
  verbIds: [],
  conjugationTags: [],
};

function reachable(overrides: Partial<ReachableSkills>) {
  return toReachableSkillSets({ ...nothingReachable, ...overrides });
}

describe('isSkillTagReachable', () => {
  it('keeps a vocabulary tag whose vocabularyId is reachable', () => {
    expect(
      isSkillTagReachable(vocabularyTag, reachable({ vocabularyIds: [1, 2] })),
    ).toBe(true);
  });

  it('rejects a vocabulary tag whose vocabularyId is out of range', () => {
    expect(
      isSkillTagReachable(vocabularyTag, reachable({ vocabularyIds: [2, 3] })),
    ).toBe(false);
  });

  it('keeps an idiom tag whose vocabularyId is reachable', () => {
    expect(
      isSkillTagReachable(idiomTag, reachable({ vocabularyIds: [57] })),
    ).toBe(true);
  });

  it('rejects an idiom tag whose vocabularyId is out of range', () => {
    expect(
      isSkillTagReachable(idiomTag, reachable({ vocabularyIds: [1] })),
    ).toBe(false);
  });

  it('keeps a subcategory tag when the range teaches something beneath it', () => {
    expect(
      isSkillTagReachable(subcategoryTag, reachable({ subcategoryIds: [49] })),
    ).toBe(true);
  });

  it('rejects a subcategory tag the range teaches nothing beneath', () => {
    expect(
      isSkillTagReachable(subcategoryTag, reachable({ subcategoryIds: [50] })),
    ).toBe(false);
  });

  it('keeps a verb tag whose verb the range teaches', () => {
    expect(isSkillTagReachable(verbTag, reachable({ verbIds: [1] }))).toBe(
      true,
    );
  });

  it('rejects a verb tag whose verb the range does not teach', () => {
    expect(isSkillTagReachable(verbTag, reachable({ verbIds: [2] }))).toBe(
      false,
    );
  });

  it('matches a conjugation tag by name', () => {
    expect(
      isSkillTagReachable(
        conjugationTag,
        reachable({ conjugationTags: ['Subjunctive present'] }),
      ),
    ).toBe(true);
  });

  it('rejects a conjugation tag the range never conjugates', () => {
    expect(
      isSkillTagReachable(
        conjugationTag,
        reachable({ conjugationTags: ['Preterite'] }),
      ),
    ).toBe(false);
  });

  it.each([
    ['vocabulary', vocabularyTag],
    ['idiom', idiomTag],
    ['subcategory', subcategoryTag],
    ['verb', verbTag],
    ['conjugation', conjugationTag],
  ])('rejects a %s tag when nothing is reachable', (_label, tag) => {
    expect(
      isSkillTagReachable(tag, toReachableSkillSets(nothingReachable)),
    ).toBe(false);
  });
});

describe('filterSkillTagsByReachability', () => {
  const allTags: SkillTag[] = [
    vocabularyTag,
    idiomTag,
    subcategoryTag,
    verbTag,
    conjugationTag,
  ];

  it('keeps only the tags the range can reach, across every tag type', () => {
    const result = filterSkillTagsByReachability(
      allTags,
      reachable({
        vocabularyIds: [1],
        verbIds: [1],
      }),
    );

    expect(result.map((tag) => tag.key)).toEqual(['Vocabulary-1', 'Verb-1']);
  });

  it('drops every tag when the range reaches nothing', () => {
    const result = filterSkillTagsByReachability(
      allTags,
      toReachableSkillSets(nothingReachable),
    );

    expect(result).toEqual([]);
  });

  it('keeps every tag when the range reaches all four dimensions', () => {
    const result = filterSkillTagsByReachability(
      allTags,
      reachable({
        vocabularyIds: [1, 57],
        subcategoryIds: [49],
        verbIds: [1],
        conjugationTags: ['Subjunctive present'],
      }),
    );

    expect(result).toHaveLength(allTags.length);
  });

  it('returns an empty list for an empty input', () => {
    expect(
      filterSkillTagsByReachability([], reachable({ vocabularyIds: [1] })),
    ).toEqual([]);
  });
});

describe('toReachableSkillSets', () => {
  it('turns each dimension into a lookup set', () => {
    const sets = toReachableSkillSets({
      vocabularyIds: [1, 2],
      subcategoryIds: [10],
      verbIds: [200],
      conjugationTags: ['Infinitive'],
    });

    expect(sets.vocabularyIds.has(2)).toBe(true);
    expect(sets.subcategoryIds.has(10)).toBe(true);
    expect(sets.verbIds.has(200)).toBe(true);
    expect(sets.conjugationTags.has('Infinitive')).toBe(true);
    expect(sets.vocabularyIds.has(3)).toBe(false);
  });
});
