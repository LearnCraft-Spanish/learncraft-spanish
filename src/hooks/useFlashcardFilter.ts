import { useCallback } from 'react';
import type { Flashcard, VocabTag } from '../interfaceDefinitions';

import { useVocabulary } from './useVocabulary';

interface FilterFlashcardsOptions {
  examples: Flashcard[];
  includeSpanglish?: boolean;
  orTags?: VocabTag[];
}

export default function useFlashcardFilter() {
  const { vocabularyQuery } = useVocabulary();

  // Helper Functions
  const filterBySpanglish = useCallback((examples: Flashcard[]) => {
    return examples.filter((item) => {
      if (item.spanglish === 'esp') {
        return true;
      }
      return false;
    });
  }, []);

  const filterByOrTags = useCallback(
    (examples: Flashcard[], orTags: VocabTag[]) => {
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
        orTags.forEach((tag) => {
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
                  if (
                    word?.wordIdiom === tag.tag &&
                    word?.descriptionOfVocabularySkill === tag.vocabDescriptor
                  ) {
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
    [vocabularyQuery.data],
  );

  // Main Function
  const filterFlashcards = useCallback(
    ({
      examples,
      includeSpanglish,
      orTags = [],
    }: FilterFlashcardsOptions): Flashcard[] => {
      let filteredExamples = examples;
      if (!includeSpanglish) {
        filteredExamples = filterBySpanglish(filteredExamples);
      }
      if (orTags.length > 0) {
        filteredExamples = filterByOrTags(filteredExamples, orTags);
      }

      return filteredExamples;
    },
    [filterByOrTags, filterBySpanglish],
  );

  return { filterFlashcards };
}
