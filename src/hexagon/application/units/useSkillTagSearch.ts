import type { SkillTag } from '@learncraft-spanish/shared';
import { SkillType } from '@learncraft-spanish/shared';
import { useMemo, useState } from 'react';
import { useSkillTags } from '../queries/useSkillTags';

export interface UseSkillTagSearchReturnType {
  tagSearchTerm: string;
  tagSuggestions: SkillTag[];
  updateTagSearchTerm: (target?: EventTarget & HTMLInputElement) => void;
  removeTagFromSuggestions: (tagId: string) => void;
  addTagBackToSuggestions: (tagId: string) => void;
  isLoading: boolean;
  error: Error | null;
}

export function useSkillTagSearch(): UseSkillTagSearchReturnType {
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

  const tagSuggestions: SkillTag[] = useMemo(() => {
    // Early return for empty search terms or no skill tags
    if (!skillTags?.length || !tagSearchTerm.trim()) return [];

    const searchTerm = tagSearchTerm.toLowerCase().trim();
    const exactNameMatches: SkillTag[] = [];
    const exactTraitMatches: SkillTag[] = [];
    const partialNameMatches: SkillTag[] = [];
    const partialTraitMatches: SkillTag[] = [];

    // Process tags in a single pass
    for (const tag of skillTags) {
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
  }, [skillTags, tagSearchTerm, removedTagIds]);

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
