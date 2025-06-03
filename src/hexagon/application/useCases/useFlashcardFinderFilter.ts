import type { VocabTag } from 'src/types/interfaceDefinitions';
import { useMemo, useState } from 'react';

import { useVocabulary } from 'src/hooks/CourseData/useVocabulary';
import { useVerifiedExamples } from 'src/hooks/ExampleData/useVerifiedExamples';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useFlashcardFilter from 'src/hooks/useFlashcardFilter';

export default function useFlashcardFinderFilter() {
  const [includeSpanglish, setIncludeSpanglish] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<VocabTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<VocabTag[]>([]);

  const { filterFlashcards } = useFlashcardFilter();

  // This is not hexagon atm. refactor
  const { tagTable } = useVocabulary();

  // this is not the new way to do it. turn the filtering part into an api call
  const { verifiedExamplesQuery } = useVerifiedExamples();

  const toggleIncludeSpanglish = () => {
    setIncludeSpanglish(!includeSpanglish);
  };

  const { openContextual } = useContextualMenu();

  const updateTagSearchTerm = (target: EventTarget & HTMLInputElement) => {
    openContextual('tagSuggestionBox');
    setTagSearchTerm(target.value);
  };

  function addTag(id: number) {
    const tagObject = tagTable.find((object) => object.id === id);
    if (tagObject && !selectedTags.find((tag) => tag.id === id)) {
      const newRequiredTags = [...selectedTags];
      newRequiredTags.push(tagObject);
      setSelectedTags(newRequiredTags);
    }
  }

  function removeTag(id: number) {
    const newRequiredTags = selectedTags.filter((item) => item.id !== id);
    setSelectedTags(newRequiredTags);
  }

  const filteredFlashcards = useMemo(() => {
    return filterFlashcards({
      examples: verifiedExamplesQuery.data || [],
      includeSpanglish,
      orTags: selectedTags,
    });
  }, [
    verifiedExamplesQuery.data,
    includeSpanglish,
    selectedTags,
    filterFlashcards,
  ]);

  return {
    includeSpanglish,
    toggleIncludeSpanglish,
    tagSearchTerm,
    updateTagSearchTerm,
    suggestedTags,
    selectedTags,
    addTag,
    removeTag,

    filteredFlashcards,
  };
}
