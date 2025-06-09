import type { ExampleRecord } from '@LearnCraft-Spanish/shared';

import type { VocabTag } from 'src/types/interfaceDefinitions';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useVocabulary } from 'src/hooks/CourseData/useVocabulary';

import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { useSelectedLesson } from 'src/hooks/useSelectedLesson';
import { useExamplesAdapter } from '../adapters/examplesAdapter';

export default function useFlashcardFinderFilter() {
  const { selectedProgram, selectedFromLesson, selectedToLesson } =
    useSelectedLesson();

  const [includeSpanglish, setIncludeSpanglish] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<VocabTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<VocabTag[]>([]);

  const [examples, setExamples] = useState<ExampleRecord[]>([]);

  // const { filterFlashcards } = useFlashcardFilter();
  const examplesAdapter = useExamplesAdapter();

  // This is not hexagon atm. refactor
  const { tagTable } = useVocabulary();

  // this is not the new way to do it. turn the filtering part into an api call
  // const { verifiedExamplesQuery } = useVerifiedExamples();

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

  // const filteredFlashcards = useMemo(() => {
  //   return filterFlashcards({
  //     examples: verifiedExamplesQuery.data || [],
  //     includeSpanglish,
  //     orTags: selectedTags,
  //   });
  // }, [
  //   verifiedExamplesQuery.data,
  //   includeSpanglish,
  //   selectedTags,
  //   filterFlashcards,
  // ]);

  const filterTagsByInput = useCallback(
    (tagInput: string) => {
      function filterBySearch(tagTable: VocabTag[]) {
        const filteredTags = [];
        const searchTerm = tagInput.toLowerCase();

        for (let i = 0; i < tagTable.length; i++) {
          const tagLowercase = tagTable[i].tag.toLowerCase();
          const descriptorLowercase = tagTable[i].vocabDescriptor;
          if (
            tagLowercase.includes(searchTerm) ||
            descriptorLowercase?.includes(searchTerm)
          ) {
            if (
              tagLowercase === searchTerm ||
              descriptorLowercase === searchTerm
            ) {
              filteredTags.unshift(tagTable[i]);
            } else {
              filteredTags.push(tagTable[i]);
            }
          }
        }

        return filteredTags;
      }

      function filterByActiveTags(tag: VocabTag) {
        const matchFound = selectedTags.find((item) => item.id === tag.id);
        if (matchFound) {
          return false;
        }
        return true;
      }
      const filteredBySearch = filterBySearch(tagTable);
      const filteredByActiveTags = filteredBySearch.filter(filterByActiveTags);
      const suggestTen = [];
      for (let i = 0; i < 10; i++) {
        if (filteredByActiveTags[i]) {
          suggestTen.push(filteredByActiveTags[i]);
        }
      }
      setSuggestedTags(suggestTen);
    },
    [tagTable, selectedTags],
  );

  useEffect(() => {
    filterTagsByInput(tagSearchTerm);
  }, [tagSearchTerm, selectedTags, filterTagsByInput]);

  const handleGetExamplesFromTags = async () => {
    const vocabTags = selectedTags.filter(
      (tag) => tag.vocabDescriptor && tag.vocabDescriptor.length > 0,
    );

    function getTagParams(tags: VocabTag[]) {
      const tagParamsList = tags.map((tag) => tag.vocabDescriptor || '');
      let tagParams = '';
      tagParamsList.forEach((tag) => {
        if (tagParams.length > 0) {
          tagParams = `${tagParams};${tag}`;
        } else {
          tagParams = tag;
        }
      });
      return tagParams;
    }
    const examples = await examplesAdapter.getExamplesByFilters({
      tags: getTagParams(vocabTags),
      course: selectedProgram?.name || '',
      toLesson: selectedToLesson?.lessonNumber.toString() || '0',
      fromLesson: selectedFromLesson?.lessonNumber.toString() || '0',
    });
    setExamples(examples);
  };

  const getExamplesReady = useMemo(() => {
    if (selectedProgram && selectedToLesson) return true;
    else return false;
  }, [selectedProgram, selectedToLesson]);

  return {
    includeSpanglish,
    toggleIncludeSpanglish,
    tagSearchTerm,
    updateTagSearchTerm,
    suggestedTags,
    selectedTags,
    addTag,
    removeTag,

    examples,
    handleGetExamplesFromTags,
    getExamplesReady,
  };
}
