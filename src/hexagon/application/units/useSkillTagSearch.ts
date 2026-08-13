import type { SkillTag } from '@learncraft-spanish/shared';
import { useSkillTags } from '@application/queries/useSkillTags';
import { filterSkillTagsByKnownVocabulary } from '@domain/functions/skillTagLessonRange';
import { SkillType } from '@learncraft-spanish/shared';
import { useMemo, useState } from 'react';

export interface UseSkillTagSearchProps {
  /**
   * Vocabulary ids the student can encounter. When provided, tags pointing at
   * vocabulary outside this list are withheld from suggestions. Leave undefined
   * to search the full tag catalog.
   */
  allowedVocabularyIds?: number[];
}

export interface UseSkillTagSearchReturnType {
  tagSearchTerm: string;
  tagSuggestions: SkillTag[];
  updateTagSearchTerm: (target?: EventTarget & HTMLInputElement) => void;
  removeTagFromSuggestions: (tagId: string) => void;
  addTagBackToSuggestions: (tagId: string) => void;
  isLoading: boolean;
  error: Error | null;
}

export function useSkillTagSearch({
  allowedVocabularyIds,
}: UseSkillTagSearchProps = {}): UseSkillTagSearchReturnType {
  const { skillTags, isLoading, error } = useSkillTags();
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [removedTagIds, setRemovedTagIds] = useState<Set<string>>(
    () => new Set(),
  );

  const updateTagSearchTerm = (target?: EventTarget & HTMLInputElement) => {
    if (target && target.value && target.value.length > 0) {
      setTagSearchTerm(target.value);
    } else {
      setTagSearchTerm('');
    }
  };

  const removeTagFromSuggestions = (tagId: string) => {
    setRemovedTagIds((prev) => new Set([...prev, tagId]));
  };

  const addTagBackToSuggestions = (tagId: string) => {
    setRemovedTagIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(tagId);
      return newSet;
    });
  };

  // An undefined list means the lesson range is unknown or still loading, which
  // is different from a range that teaches no vocabulary.
  const availableTags: SkillTag[] | undefined = useMemo(() => {
    if (!skillTags || !allowedVocabularyIds) {
      return skillTags;
    }
    return filterSkillTagsByKnownVocabulary(
      skillTags,
      new Set(allowedVocabularyIds),
    );
  }, [skillTags, allowedVocabularyIds]);

  const tagSuggestions: SkillTag[] = useMemo(() => {
    // Early return for empty search terms or no skill tags
    if (!availableTags?.length || !tagSearchTerm.trim()) return [];

    const searchTerm = tagSearchTerm.toLowerCase().trim();
    const exactNameMatches: SkillTag[] = [];
    const exactTraitMatches: SkillTag[] = [];
    const partialNameMatches: SkillTag[] = [];
    const partialTraitMatches: SkillTag[] = [];

    // Process tags in a single pass
    for (const tag of availableTags) {
      // Skip if removed
      if (removedTagIds.has(tag.key)) {
        continue;
      }

      const nameLower = tag.name.toLowerCase();
      const isExactNameMatch = nameLower === searchTerm;
      let isExactTraitMatch = false;
      let isPartialNameMatch = false;
      let isPartialTraitMatch = false;

      if (!isExactNameMatch) {
        const verbTraitMatch =
          tag.type === SkillType.Verb &&
          tag.verbTags?.some((verbTag) => verbTag.toLowerCase() === searchTerm);
        const vocabularyTraitMatch =
          tag.type === SkillType.Vocabulary &&
          tag.descriptor?.toLowerCase() === searchTerm;
        const subcategoryTraitMatch =
          tag.type === SkillType.Subcategory &&
          tag.partOfSpeech?.toLowerCase() === searchTerm;
        isExactTraitMatch =
          verbTraitMatch || vocabularyTraitMatch || subcategoryTraitMatch;
      }

      if (!isExactTraitMatch) {
        isPartialNameMatch = nameLower.includes(searchTerm);
      }

      if (!isPartialNameMatch) {
        const verbPartialTraitMatch =
          tag.type === SkillType.Verb &&
          tag.verbTags.some((verbTag) =>
            verbTag.toLowerCase().includes(searchTerm),
          );
        const vocabularyPartialTraitMatch =
          tag.type === SkillType.Vocabulary &&
          tag.descriptor?.toLowerCase().includes(searchTerm);
        const subcategoryPartialTraitMatch =
          tag.type === SkillType.Subcategory &&
          tag.partOfSpeech.toLowerCase().includes(searchTerm);

        isPartialTraitMatch =
          verbPartialTraitMatch ||
          vocabularyPartialTraitMatch ||
          subcategoryPartialTraitMatch;
      }

      // Categorize by match type for efficient sorting
      if (isExactNameMatch) {
        exactNameMatches.push(tag);
      } else if (isExactTraitMatch) {
        exactTraitMatches.push(tag);
      } else if (isPartialNameMatch) {
        partialNameMatches.push(tag);
      } else if (isPartialTraitMatch) {
        partialTraitMatches.push(tag);
      }
    }

    // Combine exact matches first, then partial matches, and limit to 10
    const result = [
      ...exactNameMatches,
      ...exactTraitMatches,
      ...partialNameMatches,
      ...partialTraitMatches,
    ];
    return result.slice(0, 10);
  }, [availableTags, tagSearchTerm, removedTagIds]);

  return {
    tagSearchTerm,
    tagSuggestions,
    updateTagSearchTerm,
    removeTagFromSuggestions,
    addTagBackToSuggestions,
    isLoading,
    error,
  };
}
