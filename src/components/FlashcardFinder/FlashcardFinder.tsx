import React, { useCallback, useEffect, useState } from 'react';
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
import ExamplesTable from '../../components/FlashcardFinder/ExamplesTable';

// This script displays the Database Tool (Example Retriever), where coaches can lookup example sentences on the database by vocab word
const FlashcardFinder = () => {
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
  const [includeSpanglish, setIncludeSpanglish] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<DisplayOrder[]>([]);
  // FromToLessonSelector

  const [examplesToDisplay, setExamplesToDisplay] = useState<Flashcard[]>([]);

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

  // cause of circular dependency?
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

  // called when user clicks 'Copy as Table' button
  // copies sentences in a table format to be pasted into a google doc or excel sheet
  function copyTable() {
    if (!verifiedExamplesQuery.isSuccess) {
      return null;
    }
    const headers = 'ID\tSpanish\tEnglish\tAudio_Link\n';
    const table = displayOrder
      .map((displayOrderObject) => {
        const foundExample = getExampleById(displayOrderObject.recordId);
        if (!foundExample) {
          return '';
        }
        return `${foundExample.recordId}\t\
            ${foundExample.spanishExample}\t\
            ${foundExample.englishTranslation}\t\
            ${foundExample.spanishAudioLa}\n`;
      })
      .join('');

    const copiedText = headers + table;
    navigator.clipboard.writeText(copiedText);
  }

  const updateExamplesToDisplay = useCallback(() => {
    // const paginatedDisplayOrder = displayOrder.slice(0, 30);
    const examplesArray = getExamplesFromDisplayOrder(displayOrder);
    const truthyTable = examplesArray.filter((item) => !!item);

    setExamplesToDisplay(truthyTable);
  }, [getExamplesFromDisplayOrder, displayOrder]);

  const updateDisplayOrder = useCallback((newDisplayOrder: DisplayOrder[]) => {
    setDisplayOrder(newDisplayOrder);
  }, []);

  function makeDisplayOrderFromExamples(examples: Flashcard[]) {
    const newDisplayOrder = examples.map((example) => {
      return {
        recordId: example.recordId,
      };
    });
    return newDisplayOrder;
  }

  useEffect(() => {
    if (verifiedExamplesQuery.isSuccess) {
      const newExampleTable = getFilteredExamples(verifiedExamplesQuery.data);
      const randomizedExamples = fisherYatesShuffle(newExampleTable);
      const newDisplayOrder = makeDisplayOrderFromExamples(randomizedExamples);
      updateDisplayOrder(newDisplayOrder);
    }
  }, [
    requiredTags,
    verifiedExamplesQuery.isSuccess,
    verifiedExamplesQuery.data,
    getFilteredExamples,
    updateDisplayOrder,
  ]);

  useEffect(() => {
    // When displayOrder changes, update the examples to display array
    if (verifiedExamplesQuery.isSuccess) {
      updateExamplesToDisplay();
    }
  }, [displayOrder, verifiedExamplesQuery.isSuccess, updateExamplesToDisplay]);

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
            examplesToDisplay={examplesToDisplay}
            studentRole={
              userDataQuery.data?.role ? userDataQuery.data.role : ''
            }
            dataReady={dataLoaded}
            getExampleById={getExampleById}
            flashcardsFound={displayOrder.length}
            flashcardsFoundWithAudio={displayExamplesWithAudio.length}
            copyTable={copyTable}
          />
        </div>
      )}
    </div>
  );
};

export default FlashcardFinder;
