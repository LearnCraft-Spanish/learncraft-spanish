import React, { useCallback, useEffect, useState } from 'react';
import type { DisplayOrder, Flashcard } from '../../interfaceDefinitions';

import '../../App.css';

import { fisherYatesShuffle } from '../../functions/fisherYatesShuffle';
import { useFlashcardFilter } from '../../hooks/useFlashcardFilter';
import { useSelectedLesson } from '../../hooks/useSelectedLesson';
import { useVerifiedExamples } from '../../hooks/useVerifiedExamples';
import { useVocabulary } from '../../hooks/useVocabulary';

import Loading from '../../components/Loading';
import Filter from '../../components/FlashcardFinder/Filter';
import ExamplesTable from './ExamplesTable';

// This script displays the Database Tool (Example Retriever), where coaches can lookup example sentences on the database by vocab word
const FlashcardFinder = () => {
  const verifiedExamplesQuery = useVerifiedExamples();
  const { vocabularyQuery } = useVocabulary();
  const { filterExamplesBySelectedLesson } = useSelectedLesson();
  const { filterFlashcards, requiredTags, excludeSpanglish } =
    useFlashcardFilter();

  const isError = verifiedExamplesQuery.isError || vocabularyQuery.isError;
  const dataLoaded =
    verifiedExamplesQuery.isSuccess && vocabularyQuery.isSuccess;
  const isLoading =
    (verifiedExamplesQuery.isLoading || vocabularyQuery.isLoading) &&
    !isError &&
    !dataLoaded;

  const [displayOrder, setDisplayOrder] = useState<DisplayOrder[]>([]);

  const getFilteredExamples = useCallback(
    (table: Flashcard[]): Flashcard[] => {
      const filteredBySelectedLesson = filterExamplesBySelectedLesson(table);
      const filteredBySearchCriteria = filterFlashcards(
        filteredBySelectedLesson,
      );
      return filteredBySearchCriteria;
    },
    [filterExamplesBySelectedLesson, filterFlashcards],
  );

  function makeDisplayOrderFromExamples(examples: Flashcard[]) {
    const newDisplayOrder: DisplayOrder[] = examples.map((example) => {
      return {
        recordId: example.recordId,
      };
    });
    return newDisplayOrder;
  }

  useEffect(() => {
    if (verifiedExamplesQuery.data?.length) {
      const newExampleTable = getFilteredExamples(verifiedExamplesQuery.data);
      const randomizedExamples = fisherYatesShuffle(newExampleTable);
      const newDisplayOrder = makeDisplayOrderFromExamples(randomizedExamples);
      setDisplayOrder(newDisplayOrder);
    }
  }, [
    requiredTags,
    excludeSpanglish,
    verifiedExamplesQuery.data,
    getFilteredExamples,
  ]);

  return (
    <div className="flashcardFinder">
      {isError && (
        <div>
          <h2>Error Loading Flashcards</h2>
        </div>
      )}
      {isLoading && (
        <div>
          <Loading message="Loading Flashcard Data..." />
        </div>
      )}
      {dataLoaded && (
        <div>
          <div className="flashcardFinderHeader">
            <h2>Flashcard Finder</h2>
            <Filter />
          </div>
          <ExamplesTable
            dataSource={verifiedExamplesQuery.data}
            displayOrder={displayOrder}
          />
        </div>
      )}
    </div>
  );
};

export default FlashcardFinder;
