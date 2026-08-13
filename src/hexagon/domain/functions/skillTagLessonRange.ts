import type { ReachableSkills, SkillTag } from '@learncraft-spanish/shared';
import { SkillType } from '@learncraft-spanish/shared';

/**
 * The reachable skill dimensions in lookup form, so a long tag list can be
 * filtered without rescanning arrays.
 */
export interface ReachableSkillSets {
  vocabularyIds: ReadonlySet<number>;
  subcategoryIds: ReadonlySet<number>;
  verbIds: ReadonlySet<number>;
  conjugationTags: ReadonlySet<string>;
}

export function toReachableSkillSets(
  reachableSkills: ReachableSkills,
): ReachableSkillSets {
  return {
    vocabularyIds: new Set(reachableSkills.vocabularyIds),
    subcategoryIds: new Set(reachableSkills.subcategoryIds),
    verbIds: new Set(reachableSkills.verbIds),
    conjugationTags: new Set(reachableSkills.conjugationTags),
  };
}

/**
 * Determines whether a skill tag can appear in examples limited to a lesson
 * range.
 *
 * The example query filters by lesson range before applying skill tags, and the
 * lesson range filter rejects any example containing vocabulary the student has
 * not reached. A tag whose vocabulary lies entirely outside that range can
 * therefore never return results.
 */
export function isSkillTagReachable(
  tag: SkillTag,
  reachableSkills: ReachableSkillSets,
): boolean {
  switch (tag.type) {
    case SkillType.Vocabulary:
    case SkillType.Idiom:
      return reachableSkills.vocabularyIds.has(tag.vocabularyId);
    case SkillType.Subcategory:
      return reachableSkills.subcategoryIds.has(tag.subcategoryId);
    case SkillType.Verb:
      return reachableSkills.verbIds.has(tag.verbId);
    case SkillType.Conjugation:
      return reachableSkills.conjugationTags.has(tag.name);
    default:
      return false;
  }
}

/**
 * Narrows a list of skill tags to those that can appear in examples limited to
 * a lesson range.
 */
export function filterSkillTagsByReachability(
  tags: SkillTag[],
  reachableSkills: ReachableSkillSets,
): SkillTag[] {
  return tags.filter((tag) => isSkillTagReachable(tag, reachableSkills));
}
