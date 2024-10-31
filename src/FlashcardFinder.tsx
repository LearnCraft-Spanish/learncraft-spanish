import React, { useCallback, useEffect, useState } from 'react';
import type { DisplayOrder, Flashcard, VocabTag } from './interfaceDefinitions';

import {
  formatEnglishText,
  formatSpanishText,
} from './functions/formatFlashcardText';
import { useActiveStudent } from './hooks/useActiveStudent';
import { useStudentFlashcards } from './hooks/useStudentFlashcards';

import { useVerifiedExamples } from './hooks/useVerifiedExamples';

import './App.css';

// import { LessonSelector } from './components/LessonSelector'
import { FromToLessonSelector } from './components/LessonSelector';
import Loading from './components/Loading';
import { useContextualMenu } from './hooks/useContextualMenu';
import { fisherYatesShuffle } from './functions/fisherYatesShuffle';
import { useSelectedLesson } from './hooks/useSelectedLesson';
import { useUserData } from './hooks/useUserData';
import { useVocabulary } from './hooks/useVocabulary';

import Filter from './components/FlashcardFinder/Filter';
import useFlashcardFilter from './hooks/useFlashcardFilter';
import formatExampleForTable from './components/FlashcardFinder/DisplayExamplesTable';
import ExamplesTable from './components/FlashcardFinder/ExamplesTable';

// This script displays the Database Tool (Example Retriever), where coaches can lookup example sentences on the database by vocab word
const FlashcardFinder = () => {
  const { openContextual, contextual } = useContextualMenu();
  const userDataQuery = useUserData();
  const { activeStudentQuery } = useActiveStudent();
  const {
    flashcardDataQuery,
    addFlashcardMutation,
    removeFlashcardMutation,
    exampleIsCollected,
    exampleIsPending,
  } = useStudentFlashcards();
  const verifiedExamplesQuery = useVerifiedExamples();
  const { vocabularyQuery, tagTable } = useVocabulary();
  const { filterExamplesBySelectedLesson } = useSelectedLesson();
  const { filterFlashcards } = useFlashcardFilter();

  const isError =
    userDataQuery.isError ||
    activeStudentQuery.isError ||
    flashcardDataQuery.isError ||
    verifiedExamplesQuery.isError ||
    vocabularyQuery.isError;
  const dataLoaded =
    (userDataQuery.data?.isAdmin ||
      (activeStudentQuery.isSuccess && flashcardDataQuery.isSuccess)) &&
    verifiedExamplesQuery.isSuccess &&
    vocabularyQuery.isSuccess;
  const isLoading =
    (userDataQuery.isLoading ||
      activeStudentQuery.isLoading ||
      flashcardDataQuery.isLoading ||
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

  function filterByHasAudio(displayOrderItem: DisplayOrder) {
    const example = getExampleById(displayOrderItem.recordId);
    if (example?.spanishAudioLa) {
      if (example.spanishAudioLa.length > 0) {
        return true;
      }
      return false;
    }
    return false;
  }

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
      .join();

    const copiedText = headers + table;
    navigator.clipboard.writeText(copiedText);
  }

  const addFlashcard = useCallback(
    (exampleId: string) => {
      const exampleIdNumber = Number.parseInt(exampleId);
      const exampleToUpdate = getExampleById(exampleIdNumber);
      if (!exampleToUpdate) {
        return;
      }
      addFlashcardMutation.mutate(exampleToUpdate);
    },
    [addFlashcardMutation, getExampleById],
  );

  const removeFlashcard = useCallback(
    (exampleId: string) => {
      const exampleIdNumber = Number.parseInt(exampleId);
      removeFlashcardMutation.mutate(exampleIdNumber);
    },
    [removeFlashcardMutation],
  );

  const displayExamplesTable = useCallback(() => {
    if (!verifiedExamplesQuery.isSuccess) {
      return null;
    }
    const paginatedDisplayOrder = displayOrder.slice(0, 100);
    const examplesArray = getExamplesFromDisplayOrder(paginatedDisplayOrder);
    const truthyTable = examplesArray.filter((item) => !!item);

    setExamplesToDisplay(truthyTable);
  }, [
    verifiedExamplesQuery.isSuccess,
    getExamplesFromDisplayOrder,
    displayOrder,
  ]);

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
      setDisplayOrder(newDisplayOrder);
    }
  }, [
    verifiedExamplesQuery.isSuccess,
    verifiedExamplesQuery.data,
    requiredTags,
    getFilteredExamples,
  ]);

  useEffect(() => {
    displayExamplesTable();
  }, [displayOrder, verifiedExamplesQuery.isSuccess, displayExamplesTable]);

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
              openContextual={openContextual}
              contextual={contextual}
              tagTable={tagTable}
            />
          </div>
          <div className="examplesTable">
            <div className="buttonBox">
              <button type="button" onClick={copyTable}>
                Copy Table
              </button>
              <div className="displayExamplesDescription">
                <h4>
                  {`${displayOrder.length} flashcards showing (
                    ${displayExamplesWithAudio?.length} with audio)`}
                </h4>
              </div>
            </div>

            <ExamplesTable
              examplesToDisplay={examplesToDisplay}
              exampleIsCollected={exampleIsCollected}
              exampleIsPending={exampleIsPending}
              addFlashcard={addFlashcard}
              removeFlashcard={removeFlashcard}
              studentRole={
                userDataQuery.data?.role ? userDataQuery.data.role : ''
              }
              dataReady={dataLoaded}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardFinder;
