import type { UseSkillTagSearchReturnType } from '@application/units/useSkillTagSearch';
import type { SkillTag } from '@learncraft-spanish/shared';
import type { JSX } from 'react';
import { SkillType } from '@learncraft-spanish/shared';
import styles from './TagSuggestionList.module.scss';

export interface TagSuggestionListProps {
  suggestions: SkillTag[];
  onSelect: (tag: SkillTag) => void;
}

export function tagLabel(tag: SkillTag): string {
  return tag.type === SkillType.Subcategory ? tag.subcategory : tag.name;
}

export function tagCategory(tag: SkillTag): string {
  switch (tag.type) {
    case SkillType.Vocabulary:
      return 'vocabulary';
    case SkillType.Idiom:
      return 'idiom';
    case SkillType.Subcategory:
      return 'subcategory';
    case SkillType.Verb:
      return 'verb';
    case SkillType.Conjugation:
      return 'conjugation';
  }
}

/** Secondary line under the name — same field mapping as v1 TagFilter. */
export function tagDescriptor(tag: SkillTag): string | null {
  switch (tag.type) {
    case SkillType.Vocabulary: {
      const descriptor = tag.descriptor.trim();
      return descriptor.length > 0 ? descriptor : null;
    }
    case SkillType.Idiom: {
      const subcategoryName = tag.subcategoryName.trim();
      return subcategoryName.length > 0 ? subcategoryName : null;
    }
    case SkillType.Verb: {
      const joined = tag.verbTags.join(' - ').trim();
      return joined.length > 0 ? joined : null;
    }
    case SkillType.Subcategory:
    case SkillType.Conjugation:
      return null;
  }
}

/**
 * `updateTagSearchTerm` takes a DOM event target rather than a plain string,
 * so callers setting the term programmatically (clearing it, seeding it from
 * a click) fabricate a minimal fake one here rather than each repeating the
 * cast.
 */
export function setTagQuery(
  updateTagSearchTerm: UseSkillTagSearchReturnType['updateTagSearchTerm'],
  value: string,
): void {
  if (value.length > 0) {
    updateTagSearchTerm({ value } as HTMLInputElement);
    return;
  }
  updateTagSearchTerm();
}

function suggestionTypeClass(tag: SkillTag): string {
  switch (tag.type) {
    case SkillType.Vocabulary:
      return styles.suggestionVocabulary;
    case SkillType.Idiom:
      return styles.suggestionIdiom;
    case SkillType.Subcategory:
      return styles.suggestionSubcategory;
    case SkillType.Verb:
      return styles.suggestionVerb;
    case SkillType.Conjugation:
      return styles.suggestionConjugation;
  }
}

/**
 * The tag search results sheet. Shared by the Flashcard Finder filter card
 * and custom quiz setup so a tag reads the same wherever it is searched.
 */
export function TagSuggestionList({
  suggestions,
  onSelect,
}: TagSuggestionListProps): JSX.Element {
  if (suggestions.length === 0) {
    return <div className={styles.noSuggestions}>No tags match that.</div>;
  }

  return (
    <ul className={styles.suggestions} role="listbox">
      {suggestions.map((tag) => {
        const descriptor = tagDescriptor(tag);
        return (
          <li key={tag.key}>
            <button
              type="button"
              className={`${styles.suggestion} ${suggestionTypeClass(tag)}`}
              role="option"
              onClick={() => onSelect(tag)}
            >
              <span className={styles.suggestionBody}>
                <span className={styles.suggestionName}>{tagLabel(tag)}</span>
                {descriptor !== null && (
                  <span className={styles.suggestionDescriptor} aria-hidden>
                    {descriptor}
                  </span>
                )}
              </span>
              <span className={styles.suggestionMeta}>{tagCategory(tag)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
