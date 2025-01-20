import React, { useCallback, useEffect, useState } from 'react';
import type {
  DisplayOrder,
  Flashcard,
  VocabTag,
} from 'src/types/interfaceDefinitions';

import 'src/App.css';

import { fisherYatesShuffle } from 'src/functions/fisherYatesShuffle';
import { useActiveStudent } from 'src/hooks/UserData/useActiveStudent';
import { useVerifiedExamples } from 'src/hooks/ExampleData/useVerifiedExamples';
import { useSelectedLesson } from 'src/hooks/useSelectedLesson';
import { useUserData } from 'src/hooks/UserData/useUserData';
import { useVocabulary } from 'src/hooks/CourseData/useVocabulary';

import Loading from 'src/components/Loading';
import Filter from 'src/components/FlashcardFinder/Filter';
import useFlashcardFilter from 'src/hooks/useFlashcardFilter';
import ExamplesTable from './ExamplesTable';

// This script displays the Database Tool (Example Retriever), where coaches can lookup example sentences on the database by vocab word
const FlashcardFinder = () => {
  const userDataQuery = useUserData();
  const { activeStudentQuery } = useActiveStudent();
  const { verifiedExamplesQuery } = useVerifiedExamples();
  const { vocabularyQuery, tagTable } = useVocabulary();
  const { filterExamplesBySelectedLesson } = useSelectedLesson();
  const { filterFlashcards } = useFlashcardFilter();

  const isError =
    userDataQuery.isError ||
    activeStudentQuery.isError ||
    verifiedExamplesQuery.isError ||
    vocabularyQuery.isError;
  const dataLoaded =
    (userDataQuery.data?.isAdmin || activeStudentQuery.isSuccess) &&
    verifiedExamplesQuery.isSuccess &&
    vocabularyQuery.isSuccess;
  const isLoading =
    (userDataQuery.isLoading ||
      activeStudentQuery.isLoading ||
      verifiedExamplesQuery.isLoading ||
      vocabularyQuery.isLoading) &&
    !isError &&
    !dataLoaded;

  const [requiredTags, setRequiredTags] = useState<VocabTag[]>([]);
  const [includeSpanglish, setIncludeSpanglish] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<DisplayOrder[]>([]);

  const toggleIncludeSpanglish = useCallback(() => {
    setIncludeSpanglish(!includeSpanglish);
  }, [includeSpanglish]);

  function addTagToRequiredTags(id: number) {
    const tagObject = tagTable.find((object) => object.id === id);
    if (tagObject && !requiredTags.find((tag) => tag.id === id)) {
      const newRequiredTags = [...requiredTags];
      newRequiredTags.push(tagObject);
      setRequiredTags(newRequiredTags);
    }
  }

  function removeTagFromRequiredTags(id: number) {
    const newRequiredTags = requiredTags.filter((item) => item.id !== id);
    setRequiredTags(newRequiredTags);
  }

  const getFilteredExamples = useCallback(
    (table: Flashcard[]): Flashcard[] => {
      const filteredBySelectedLesson = filterExamplesBySelectedLesson(table);
      const filteredBySearchCriteria = filterFlashcards({
        examples: filteredBySelectedLesson,
        includeSpanglish,
        orTags: requiredTags,
      });
      return filteredBySearchCriteria;
    },
    [
      filterExamplesBySelectedLesson,
      filterFlashcards,
      includeSpanglish,
      requiredTags,
    ],
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
  }, [requiredTags, verifiedExamplesQuery.data, getFilteredExamples]);

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
            <Filter
              addTagToRequiredTags={addTagToRequiredTags}
              removeTagFromRequiredTags={removeTagFromRequiredTags}
              requiredTags={requiredTags}
              toggleIncludeSpanglish={toggleIncludeSpanglish}
              includeSpanglish={includeSpanglish}
            />
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
