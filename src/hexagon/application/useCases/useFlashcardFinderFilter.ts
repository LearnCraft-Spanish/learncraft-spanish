import type { VocabTag } from 'src/types/interfaceDefinitions';
import { useState } from 'react';

import { useVocabulary } from 'src/hooks/CourseData/useVocabulary';
import useContextualMenu from 'src/hooks/useContextualMenu';

export default function useFlashcardFinderFilter() {
  const [includeSpanglish, setIncludeSpanglish] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<VocabTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<VocabTag[]>([]);

  const { tagTable } = useVocabulary();

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

  return {
    includeSpanglish,
    toggleIncludeSpanglish,
    tagSearchTerm,
    updateTagSearchTerm,
    suggestedTags,
    selectedTags,
    addTag,
    removeTag,
  };
}
