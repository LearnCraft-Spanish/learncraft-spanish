import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Flashcard, VocabTag } from '../interfaceDefinitions';

import { useVocabulary } from './useVocabulary';
import { useSelectedLesson } from './useSelectedLesson';

export function useFlashcardFilter() {
  const { vocabularyQuery, tagTable } = useVocabulary();
  const { filterExamplesBySelectedLesson, selectedProgram } =
    useSelectedLesson();
  const [searchParams, setSearchParams] = useSearchParams();

  const excludeSpanglish = searchParams.get('excludeSpanglish') === 'true';
  const requiredTagsString = searchParams.get('requiredTags');

  function toggleSpanglishFilter() {
    const newSearchParams = new URLSearchParams(searchParams);
    if (excludeSpanglish) {
      newSearchParams.delete('excludeSpanglish');
    } else {
      newSearchParams.set('excludeSpanglish', 'true');
    }

    setSearchParams(newSearchParams); // Type-safe
  }

  function serializeTags(tags: VocabTag[]): string {
    return tags
      .map((tag) => {
        const parts = [
          tag.type,
          tag.tag,
          tag.vocabDescriptor || '', // Leave empty if vocabDescriptor is absent
        ];
        return parts.filter(Boolean).join('|'); // Join fields with colons, omitting empty vocabDescriptor
      })
      .join('||'); // Separate tags with pipes
  }

  const deserializeTags = useCallback(
    (queryString: string | null): VocabTag[] => {
      if (!queryString) {
        return [];
      }
      const tagPartialArray = queryString.split('||').map((tagString) => {
        const [type, tag, vocabDescriptor] = tagString.split('|');
        return vocabDescriptor
          ? { id: 0, type, tag, vocabDescriptor }
          : { id: 0, type, tag };
      });
      const tagArray = tagPartialArray.map((tagPartial) => {
        const tag = tagTable.find((tagObject) => {
          if (!tagPartial.vocabDescriptor) {
            return (
              tagObject.type === tagPartial.type &&
              tagObject.tag === tagPartial.tag
            );
          } else {
            return (
              tagObject.type === tagPartial.type &&
              tagObject.tag === tagPartial.tag &&
              tagObject.vocabDescriptor === tagPartial.vocabDescriptor
            );
          }
        });
        if (!tag) {
          return null;
        }
        return tag;
      });
      const filteredTagArray = tagArray.filter((tag) => !!tag);
      return filteredTagArray;
    },
    [tagTable],
  );

  const requiredTags = useMemo(() => {
    const deserializedTags = deserializeTags(requiredTagsString);
    return deserializedTags;
  }, [requiredTagsString, deserializeTags]);

  function updateRequiredTags(newTags: VocabTag[]) {
    const newSearchParams = new URLSearchParams(searchParams);
    const serializedTags = serializeTags(newTags);
    if (newTags.length === 0) {
      newSearchParams.delete('requiredTags');
    } else {
      newSearchParams.set('requiredTags', serializedTags);
    }
    setSearchParams(newSearchParams);
  }

  function addTagToRequiredTags(id: number) {
    const tagObject = tagTable.find((object) => object.id === id);
    if (!tagObject) {
      console.error('Tag not found in tagTable');
      return;
    }
    if (tagObject && !requiredTags.find((tag) => tag.id === id)) {
      const newRequiredTags = [...requiredTags];
      newRequiredTags.push(tagObject);
      updateRequiredTags(newRequiredTags);
    }
  }

  function removeTagFromRequiredTags(id: number) {
    const newRequiredTags = requiredTags.filter((item) => item.id !== id);
    updateRequiredTags(newRequiredTags);
  }

  // Helper Functions
  const filterBySpanglish = useCallback((examples: Flashcard[]) => {
    return examples.filter((item) => {
      if (item.spanglish === 'esp') {
        return true;
      }
      return false;
    });
  }, []);

  const filterByRequiredTags = useCallback(
    (examples: Flashcard[]) => {
      if (!vocabularyQuery.data?.length) {
        console.error(
          'No vocabulary data, unable to filter flashcards by tags',
        );
        return examples;
      }
      const filteredExamples = examples.filter((example) => {
        if (
          example.vocabIncluded.length === 0 ||
          example.vocabComplete === false
        ) {
          return false;
        }
        let isGood = false;
        requiredTags.forEach((tag) => {
          if (!isGood) {
            switch (tag.type) {
              case 'subcategory':
                example.vocabIncluded.forEach((item) => {
                  const word = vocabularyQuery.data.find(
                    (element) => element.vocabName === item,
                  );
                  if (word?.vocabularySubcategorySubcategoryName === tag.tag) {
                    isGood = true;
                  }
                });
                break;
              case 'verb':
                example.vocabIncluded.forEach((item) => {
                  const word = vocabularyQuery.data.find(
                    (element) => element.vocabName === item,
                  );
                  if (word?.verbInfinitive === tag.tag) {
                    isGood = true;
                  }
                });
                break;
              case 'conjugation':
                example.vocabIncluded.forEach((item) => {
                  const word = vocabularyQuery.data.find(
                    (element) => element.vocabName === item,
                  );
                  word?.conjugationTags.forEach((conjugationTag) => {
                    if (conjugationTag === tag.tag) {
                      isGood = true;
                    }
                  });
                });
                break;
              case 'vocabulary':
                example.vocabIncluded.forEach((item) => {
                  const word = vocabularyQuery.data.find(
                    (element) => element.vocabName === item,
                  );
                  if (word?.wordIdiom === tag.tag) {
                    isGood = true;
                  }
                });
                break;
              case 'idiom':
                example.vocabIncluded.forEach((item: string) => {
                  const word = vocabularyQuery.data.find(
                    (element) => element.vocabName === item,
                  );
                  if (word?.wordIdiom === tag.tag) {
                    isGood = true;
                  }
                });
                break;
            }
          }
        });
        return isGood;
      });
      return filteredExamples;
    },
    [vocabularyQuery.data, requiredTags],
  );

  // Main Function
  const filterFlashcards = useCallback(
    (examples: Flashcard[]): Flashcard[] => {
      let filteredExamples = examples;
      if (excludeSpanglish) {
        filteredExamples = filterBySpanglish(filteredExamples);
      }
      if (requiredTags.length > 0) {
        filteredExamples = filterByRequiredTags(filteredExamples);
      }
      if (selectedProgram) {
        filteredExamples = filterExamplesBySelectedLesson(filteredExamples);
      }

      return filteredExamples;
    },
    [
      filterByRequiredTags,
      filterBySpanglish,
      filterExamplesBySelectedLesson,
      excludeSpanglish,
      requiredTags,
      selectedProgram,
    ],
  );

  return {
    filterFlashcards,
    excludeSpanglish,
    toggleSpanglishFilter,
    requiredTags,
    addTagToRequiredTags,
    removeTagFromRequiredTags,
  };
}
