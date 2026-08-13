import type { SkillTag } from '@learncraft-spanish/shared';
import { SkillType } from '@learncraft-spanish/shared';

/**
 * Determines whether a skill tag can appear in examples limited to a set of
 * known vocabulary.
 *
 * The example query filters by lesson range before applying skill tags, and the
 * lesson range filter rejects any example containing vocabulary the student has
 * not reached. A vocabulary or idiom tag outside that set can therefore never
 * return results.
 *
 * Subcategory, Verb, and Conjugation tags carry no vocabulary id, so they
 * cannot be resolved against the known set and are always treated as available.
 */
export function isSkillTagInKnownVocabulary(
  tag: SkillTag,
  knownVocabularyIds: ReadonlySet<number>,
): boolean {
  if (tag.type === SkillType.Vocabulary || tag.type === SkillType.Idiom) {
    return knownVocabularyIds.has(tag.vocabularyId);
  }
  return true;
}

/**
 * Narrows a list of skill tags to those that can appear in examples limited to
 * the given known vocabulary.
 */
export function filterSkillTagsByKnownVocabulary(
  tags: SkillTag[],
  knownVocabularyIds: ReadonlySet<number>,
): SkillTag[] {
  return tags.filter((tag) =>
    isSkillTagInKnownVocabulary(tag, knownVocabularyIds),
  );
}
