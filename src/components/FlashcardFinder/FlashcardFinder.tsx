import type {
  DisplayOrder,
  Flashcard,
  VocabTag,
} from 'src/types/interfaceDefinitions';
import { useAuthAdapter } from '@application/adapters/authAdapter';

import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';

import React, { useCallback, useEffect, useState } from 'react';
import Filter from 'src/components/FlashcardFinder/Filter';
import { Loading } from 'src/components/Loading';
import { fisherYatesShuffle } from 'src/functions/fisherYatesShuffle';
import { useVocabulary } from 'src/hooks/CourseData/useVocabulary';
import { useVerifiedExamples } from 'src/hooks/ExampleData/useVerifiedExamples';

import useFlashcardFilter from 'src/hooks/useFlashcardFilter';
import { useSelectedLesson } from 'src/hooks/useSelectedLesson';
import ExamplesTable from '../ExamplesTable/ExamplesTable';
import 'src/App.css';

// This script displays the Database Tool (Example Retriever), where coaches can lookup example sentences on the database by vocab word
export default function FlashcardFinder() {
  const { isAdmin, isCoach, isLoading: authLoading } = useAuthAdapter();
  const {
    appUser,
    isLoading: activeStudentLoading,
    error: activeStudentError,
  } = useActiveStudent();
  const { verifiedExamplesQuery } = useVerifiedExamples();
  const { vocabularyQuery, tagTable } = useVocabulary();
  const { filterExamplesBySelectedLesson } = useSelectedLesson();
  const { filterFlashcards } = useFlashcardFilter();

  const isError =
    activeStudentError ||
    verifiedExamplesQuery.isError ||
    vocabularyQuery.isError;
  const dataLoaded =
    (isAdmin || isCoach || appUser) &&
    verifiedExamplesQuery.isSuccess &&
    vocabularyQuery.isSuccess;
  const isLoading =
    (authLoading ||
      activeStudentLoading ||
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
}
