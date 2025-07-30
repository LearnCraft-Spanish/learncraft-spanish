import type { SkillTag } from '@learncraft-spanish/shared';
import { SkillType } from '@learncraft-spanish/shared';
import { useMemo, useState } from 'react';
import { useSkillTags } from '../queries/useSkillTags';

export interface UseSkillTagSearchReturnType {
  tagSearchTerm: string;
  tagSuggestions: SkillTag[];
  updateTagSearchTerm: (target?: EventTarget & HTMLInputElement) => void;
  removeTagFromSuggestions: (tagId: string) => void;
  isLoading: boolean;
  error: Error | null;
}

export function useSkillTagSearch(): UseSkillTagSearchReturnType {
  const { skillTags, isLoading, error } = useSkillTags();
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [removedTagIds, setRemovedTagIds] = useState<Set<string>>(new Set());

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

  const tagSuggestions: SkillTag[] = useMemo(() => {
    if (!skillTags || !tagSearchTerm) return [];

    const searchTerm = tagSearchTerm.toLowerCase();

    // Create a map to track seen keys functionally
    const seenKeys = new Map<string, boolean>();

    const processTag = (tag: SkillTag) => {
      if (seenKeys.get(tag.key)) return null;

      // Skip tags that have been removed
      if (removedTagIds.has(tag.key)) return null;

      const nameLower = tag.name.toLowerCase();
      const isExactNameMatch = nameLower === searchTerm;
      const isPartialNameMatch = nameLower.includes(searchTerm);

      const hasDescriptorMatch =
        tag.type === SkillType.Vocabulary &&
        tag.descriptor?.toLowerCase().includes(searchTerm);
      const hasConjugationMatch =
        tag.type === SkillType.Vocabulary &&
        tag.conjugationTags?.some((conjugation) =>
          conjugation.toLowerCase().includes(searchTerm),
        );
      const hasVerbTagMatch =
        tag.type === SkillType.Verb &&
        tag.verbTags.some((verb) => verb.toLowerCase().includes(searchTerm));

      const hasAnyMatch =
        isPartialNameMatch ||
        hasDescriptorMatch ||
        hasConjugationMatch ||
        hasVerbTagMatch;

      if (hasAnyMatch) {
        seenKeys.set(tag.key, true);
        return { tag, isExactMatch: isExactNameMatch };
      }

      return null;
    };

    // Process all tags functionally
    const processed = skillTags
      .map(processTag)
      .filter(
        (result): result is { tag: SkillTag; isExactMatch: boolean } =>
          result !== null,
      );

    // Sort by exact matches first
    const sorted = processed
      .sort((a, b) => {
        if (a.isExactMatch && !b.isExactMatch) return -1;
        if (!a.isExactMatch && b.isExactMatch) return 1;
        return 0;
      })
      .map((result) => result.tag);
    const firstTen = sorted.slice(0, 10);

    return firstTen;
  }, [skillTags, tagSearchTerm, removedTagIds]);

  return {
    tagSearchTerm,
    tagSuggestions,
    updateTagSearchTerm,
    removeTagFromSuggestions,
    isLoading,
    error,
  };
}
