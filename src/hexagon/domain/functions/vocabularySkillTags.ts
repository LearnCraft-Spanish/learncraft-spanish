import type { SkillTag } from '@learncraft-spanish/shared';
import { SkillType } from '@learncraft-spanish/shared';

/**
 * Vocabulary and Idiom tags name a single term and carry a vocabularyId.
 * Structural tags (Subcategory, Verb, Conjugation) do not — they span many
 * terms and cannot open a vocabulary detail panel.
 */
export function vocabularyIdFromSkillTag(tag: SkillTag): number | null {
  switch (tag.type) {
    case SkillType.Vocabulary:
    case SkillType.Idiom:
      return tag.vocabularyId;
    default:
      return null;
  }
}

/**
 * Keeps only tags that map to a vocabulary record — Vocabulary and Idiom.
 * Used by vocab lookup so every suggestion can open a detail panel.
 */
export function filterToVocabularyTags(tags: SkillTag[]): SkillTag[] {
  return tags.filter(
    (tag) => tag.type === SkillType.Vocabulary || tag.type === SkillType.Idiom,
  );
}
