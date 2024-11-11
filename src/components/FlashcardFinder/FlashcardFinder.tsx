import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  DisplayOrder,
  Flashcard,
  VocabTag,
} from '../../interfaceDefinitions';

import '../../App.css';

import { fisherYatesShuffle } from '../../functions/fisherYatesShuffle';
import { useActiveStudent } from '../../hooks/useActiveStudent';
import { useVerifiedExamples } from '../../hooks/useVerifiedExamples';
import { useSelectedLesson } from '../../hooks/useSelectedLesson';
import { useUserData } from '../../hooks/useUserData';
import { useVocabulary } from '../../hooks/useVocabulary';

import Loading from '../../components/Loading';
import Filter from '../../components/FlashcardFinder/Filter';
import useFlashcardFilter from '../../hooks/useFlashcardFilter';
import ExamplesTable from './ExamplesTable';

// This script displays the Database Tool (Example Retriever), where coaches can lookup example sentences on the database by vocab word
const FlashcardFinder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const userDataQuery = useUserData();
  const { activeStudentQuery } = useActiveStudent();
  const verifiedExamplesQuery = useVerifiedExamples();
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
  const [displayOrder, setDisplayOrder] = useState<DisplayOrder[]>([]);
  // FromToLessonSelector

  const [examplesToDisplay, setExamplesToDisplay] = useState<Flashcard[]>([]);

  const excludeSpanglish = searchParams.get('excludeSpanglish') === 'true';

  function toggleSpanglishFilter() {
    const newSearchParams = new URLSearchParams(searchParams);
    const spanglishExcluded =
      newSearchParams.get('excludeSpanglish') === 'true';

    if (spanglishExcluded) {
      newSearchParams.delete('excludeSpanglish');
    } else {
      newSearchParams.set('excludeSpanglish', 'true');
    }

    setSearchParams(newSearchParams); // Type-safe
  }

  const getExampleById = useCallback(
    (recordId: number) => {
      if (!verifiedExamplesQuery.isSuccess) {
        return null;
      }
      const foundExample = verifiedExamplesQuery.data.find(
        (example) => example.recordId === recordId,
      );
      return foundExample;
    },
    [verifiedExamplesQuery.isSuccess, verifiedExamplesQuery.data],
  );
  const getExamplesFromDisplayOrder = useCallback(
    (displayOrder: DisplayOrder[]) => {
      const examples = displayOrder.map((displayOrderObject) => {
        const foundExample = getExampleById(displayOrderObject.recordId);
        if (!foundExample) {
          console.error(
            'unable to find example with recordId:',
            displayOrderObject.recordId,
          );
          return null;
        }
        return foundExample;
      });
      return examples;
    },
    [getExampleById],
  );

  const filterByHasAudio = useCallback(
    (displayOrderItem: DisplayOrder) => {
      const example = getExampleById(displayOrderItem.recordId);
      if (example?.spanishAudioLa) {
        if (example.spanishAudioLa.length > 0) {
          return true;
        }
        return false;
      }
      return false;
    },
    [getExampleById],
  );

  const displayExamplesWithAudio = displayOrder.filter(filterByHasAudio);

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
        includeSpanglish: !excludeSpanglish,
        orTags: requiredTags,
      });
      return filteredBySearchCriteria;
    },
    [
      filterExamplesBySelectedLesson,
      filterFlashcards,
      excludeSpanglish,
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
              toggleIncludeSpanglish={toggleSpanglishFilter}
              includeSpanglish={!excludeSpanglish}
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
