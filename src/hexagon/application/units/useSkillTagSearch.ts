import type { ReachableSkills, SkillTag } from '@learncraft-spanish/shared';
import { useSkillTags } from '@application/queries/useSkillTags';
import {
  filterSkillTagsByReachability,
  toReachableSkillSets,
} from '@domain/functions/skillTagLessonRange';
import { searchSkillTags } from '@domain/functions/skillTagSearch';
import { useMemo, useState } from 'react';

const SUGGESTION_LIMIT = 20;

export interface UseSkillTagSearchProps {
  /**
   * The skills the student can encounter in their lesson range. When provided,
   * tags outside it are withheld from suggestions. Leave undefined to search
   * the full tag catalog.
   */
  reachableSkills?: ReachableSkills;
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
  reachableSkills,
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

  // Undefined means the lesson range is unknown or still loading, which is
  // different from a range that teaches nothing.
  const availableTags: SkillTag[] | undefined = useMemo(() => {
    if (!skillTags || !reachableSkills) {
      return skillTags;
    }
    return filterSkillTagsByReachability(
      skillTags,
      toReachableSkillSets(reachableSkills),
    );
  }, [skillTags, reachableSkills]);

  const tagSuggestions: SkillTag[] = useMemo(() => {
    if (!availableTags?.length) return [];

    const searchableTags = removedTagIds.size
      ? availableTags.filter((tag) => !removedTagIds.has(tag.key))
      : availableTags;

    return searchSkillTags(searchableTags, tagSearchTerm, {
      limit: SUGGESTION_LIMIT,
    });
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
