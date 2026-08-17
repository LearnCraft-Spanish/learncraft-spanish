import type { SkillTag } from '@learncraft-spanish/shared';
import { SkillType } from '@learncraft-spanish/shared';

const DEFAULT_LIMIT = 20;

/**
 * Match quality, best first. A name match always outranks a description match,
 * so searching "reflexive" surfaces the "Pronoun, Reflexive" subcategory ahead
 * of every verb merely tagged reflexive.
 */
const MatchTier = {
  ExactName: 0,
  PartialName: 1,
  ExactDescription: 2,
  PartialDescription: 3,
} as const;

type MatchTierValue = (typeof MatchTier)[keyof typeof MatchTier];

interface RankedTag {
  tag: SkillTag;
  tier: MatchTierValue;
  /** Position in the source catalog, used to keep ties in a stable order. */
  catalogIndex: number;
}

/**
 * The secondary text a tag can be matched on, lowercased. Each variant of the
 * union keeps its descriptive detail under a different key, and Idiom and
 * Conjugation tags are searched by name only.
 */
function searchableDescriptions(tag: SkillTag): string[] {
  switch (tag.type) {
    case SkillType.Vocabulary:
      return [tag.descriptor.toLowerCase()];
    case SkillType.Subcategory:
      return [tag.partOfSpeech.toLowerCase()];
    case SkillType.Verb:
      return tag.verbTags.map((verbTag) => verbTag.toLowerCase());
    default:
      return [];
  }
}

/** The best tier the tag qualifies for, or null when it does not match. */
function matchTier(tag: SkillTag, searchTerm: string): MatchTierValue | null {
  const name = tag.name.toLowerCase();

  if (name === searchTerm) return MatchTier.ExactName;
  if (name.includes(searchTerm)) return MatchTier.PartialName;

  const descriptions = searchableDescriptions(tag);

  if (descriptions.includes(searchTerm)) {
    return MatchTier.ExactDescription;
  }
  if (descriptions.some((description) => description.includes(searchTerm))) {
    return MatchTier.PartialDescription;
  }

  return null;
}

/**
 * Only Vocabulary and Idiom tags describe a single term and so can carry a
 * usage frequency. Structural tags (Subcategory, Verb, Conjugation) span many
 * terms and have none.
 */
function frequencyOf(tag: SkillTag): number | null {
  switch (tag.type) {
    case SkillType.Vocabulary:
    case SkillType.Idiom:
      return tag.frequency;
    default:
      return null;
  }
}

function isStructural(tag: SkillTag): boolean {
  return tag.type !== SkillType.Vocabulary && tag.type !== SkillType.Idiom;
}

/**
 * Within a tier: structural tags first in catalog order, then individual terms
 * from most to least common, with unranked terms last.
 */
function compareRankedTags(a: RankedTag, b: RankedTag): number {
  if (a.tier !== b.tier) return a.tier - b.tier;

  const aStructural = isStructural(a.tag);
  const bStructural = isStructural(b.tag);

  if (aStructural !== bStructural) return aStructural ? -1 : 1;

  if (!aStructural && !bStructural) {
    const aFrequency = frequencyOf(a.tag) ?? Number.POSITIVE_INFINITY;
    const bFrequency = frequencyOf(b.tag) ?? Number.POSITIVE_INFINITY;
    if (aFrequency !== bFrequency) return aFrequency - bFrequency;
  }

  return a.catalogIndex - b.catalogIndex;
}

/**
 * Ranks skill tags against a search term, best match first.
 *
 * Tags matching neither their name nor their description are dropped.
 */
export function searchSkillTags(
  tags: SkillTag[],
  searchTerm: string,
  options?: { limit?: number },
): SkillTag[] {
  const term = searchTerm.toLowerCase().trim();

  if (!term || !tags.length) return [];

  const ranked: RankedTag[] = [];

  tags.forEach((tag, catalogIndex) => {
    const tier = matchTier(tag, term);
    if (tier !== null) {
      ranked.push({ tag, tier, catalogIndex });
    }
  });

  return ranked
    .sort(compareRankedTags)
    .slice(0, options?.limit ?? DEFAULT_LIMIT)
    .map((entry) => entry.tag);
}
