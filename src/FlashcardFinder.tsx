import React, { forwardRef, useCallback, useEffect, useState } from "react";
import type { DisplayOrder, Flashcard, VocabTag } from "./interfaceDefinitions";

import {
  formatEnglishText,
  formatSpanishText,
} from "./functions/formatFlashcardText";
import { useActiveStudent } from "./hooks/useActiveStudent";
import { useStudentFlashcards } from "./hooks/useStudentFlashcards";

import { useVerifiedExamples } from "./hooks/useVerifiedExamples";

import "./App.css";

// import { LessonSelector } from './components/LessonSelector'
import { FromToLessonSelector } from "./components/LessonSelector";
import Loading from "./components/Loading";
import { fisherYatesShuffle } from "./functions/fisherYatesShuffle";
import { useSelectedLesson } from "./hooks/useSelectedLesson";
import { useUserData } from "./hooks/useUserData";
import { useVocabulary } from "./hooks/useVocabulary";

interface FlashcardFinderProps {
  contextual: string;
  openContextual: (currentContextual: string) => void;
}

// This script displays the Database Tool (Example Retriever), where coaches can lookup example sentences on the database by vocab word
const FlashcardFinder = forwardRef<HTMLDivElement, FlashcardFinderProps>(
  ({ contextual, openContextual }: FlashcardFinderProps, currentContextual) => {
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

    const [tagSearchTerm, setTagSearchTerm] = useState("");
    const [suggestedTags, setSuggestedTags] = useState<VocabTag[]>([]);
    const [requiredTags, setRequiredTags] = useState<VocabTag[]>([]);
    const [noSpanglish, setNoSpanglish] = useState(false);
    const [displayOrder, setDisplayOrder] = useState<DisplayOrder[]>([]);
    // FromToLessonSelector

    function getExampleById(recordId: number) {
      if (!verifiedExamplesQuery.isSuccess) {
        return null;
      }
      const foundExample = verifiedExamplesQuery.data.find(
        (example) => example.recordId === recordId,
      );
      return foundExample;
    }

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

    function toggleSpanglish() {
      if (noSpanglish) {
        setNoSpanglish(false);
      } else {
        setNoSpanglish(true);
      }
    }

    function updateTagSearchTerm(target: EventTarget & HTMLInputElement) {
      openContextual("tagSuggestionBox");
      setTagSearchTerm(target.value);
    }

    function addTagToRequiredTags(id: number) {
      const tagObject = tagTable.find((object) => object.id === id);
      if (tagObject && !requiredTags.find((tag) => tag.id === id)) {
        const newRequiredTags = [...requiredTags];
        newRequiredTags.push(tagObject);
        setRequiredTags(newRequiredTags);
      }
    }

    function removeTagFromRequiredTags(id: number) {
      const newRequiredTags = [...requiredTags].filter(
        (item) => item.id !== id,
      );
      setRequiredTags(newRequiredTags);
    }

    const filterExamplesBySelectedTags = useCallback(
      (examples: Flashcard[]) => {
        if (requiredTags.length > 0 && vocabularyQuery.isSuccess) {
          const filteredExamples = examples.filter((example) => {
            if (
              example.vocabIncluded.length === 0 ||
              example.vocabComplete === false
            ) {
              return false;
            }
            // console.log(example.vocabIncluded)
            let isGood = false;
            requiredTags.forEach((tag) => {
              // console.log(word.vocabName)
              if (!isGood) {
                switch (tag.type) {
                  case "subcategory":
                    example.vocabIncluded.forEach((item) => {
                      const word = vocabularyQuery.data.find(
                        (element) => element.vocabName === item,
                      );
                      if (
                        word?.vocabularySubcategorySubcategoryName === tag.tag
                      ) {
                        isGood = true;
                      }
                    });
                    break;
                  case "verb":
                    example.vocabIncluded.forEach((item) => {
                      const word = vocabularyQuery.data.find(
                        (element) => element.vocabName === item,
                      );
                      if (word?.verbInfinitive === tag.tag) {
                        isGood = true;
                      }
                    });
                    break;
                  case "conjugation":
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
                  case "vocabulary":
                    example.vocabIncluded.forEach((item) => {
                      const word = vocabularyQuery.data.find(
                        (element) => element.vocabName === item,
                      );
                      if (word?.wordIdiom === tag.tag) {
                        isGood = true;
                      }
                    });
                    break;
                  case "idiom":
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
        } else {
          return examples;
        }
      },
      [requiredTags, vocabularyQuery.isSuccess, vocabularyQuery.data],
    );

    const filterBySpanglish = useCallback(
      (examples: Flashcard[]) => {
        if (noSpanglish) {
          const filteredBySpanglish = examples.filter((item) => {
            if (item.spanglish === "esp") {
              return true;
            }
            return false;
          });
          return filteredBySpanglish;
        } else {
          return examples;
        }
      },
      [noSpanglish],
    );

    // cause of circular dependency?
    const getFilteredExamples = useCallback(
      (table: Flashcard[]) => {
        const allExamples = [...table];
        const filteredBySpanglish = filterBySpanglish(allExamples);
        const filteredByAllowed =
          filterExamplesBySelectedLesson(filteredBySpanglish);
        // = filterExamplesByAllowedVocab(filteredBySpanglish)
        const filteredByTags = filterExamplesBySelectedTags(filteredByAllowed);
        return filteredByTags;
      },
      [
        filterBySpanglish,
        filterExamplesBySelectedTags,
        filterExamplesBySelectedLesson,
      ],
    );

    // called when user clicks 'Copy as Table' button
    // copies sentences in a table format to be pasted into a google doc or excel sheet
    function copyTable() {
      if (!verifiedExamplesQuery.isSuccess) {
        return null;
      }
      const headers = "ID\tSpanish\tEnglish\tAudio_Link\n";
      const table = displayOrder
        .map((displayOrderObject) => {
          const foundExample = getExampleById(displayOrderObject.recordId);
          if (!foundExample) {
            return "";
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

    const filterTagsByInput = useCallback(
      (tagInput: string) => {
        function filterBySearch(tag: VocabTag) {
          const lowerTerm = tag.tag.toLowerCase();
          const lowerTagInput = tagInput.toLowerCase();
          if (lowerTerm.includes(lowerTagInput)) {
            return true;
          }
          return false;
        }

        function filterByActiveTags(tag: VocabTag) {
          const matchFound = requiredTags.find((item) => item.id === tag.id);
          if (matchFound) {
            return false;
          }
          return true;
        }

        const filteredBySearch = tagTable.filter(filterBySearch);
        const filteredByActiveTags =
          filteredBySearch.filter(filterByActiveTags);
        const suggestTen = [];
        for (let i = 0; i < 10; i++) {
          if (filteredByActiveTags[i]) {
            suggestTen.push(filteredByActiveTags[i]);
          }
        }
        setSuggestedTags(suggestTen);
      },
      [tagTable, requiredTags],
    );

    function addFlashcard(exampleId: string) {
      const exampleIdNumber = Number.parseInt(exampleId);
      const exampleToUpdate = getExampleById(exampleIdNumber);
      if (!exampleToUpdate) {
        return;
      }
      addFlashcardMutation.mutate(exampleToUpdate);
    }

    function removeFlashcard(exampleId: string) {
      const exampleIdNumber = Number.parseInt(exampleId);
      removeFlashcardMutation.mutate(exampleIdNumber);
    }

    function displayExamplesTable() {
      if (!verifiedExamplesQuery.isSuccess) {
        return null;
      }
      const tableToDisplay = displayOrder.map((displayOrderObject) => {
        const item = verifiedExamplesQuery.data.find(
          (example) => example.recordId === displayOrderObject.recordId,
        );
        if (!item) {
          return null;
        }
        return (
          <div className="exampleCard" key={item.recordId}>
            <div className="exampleCardSpanishText">
              {formatSpanishText(item.spanglish, item.spanishExample)}
            </div>
            <div className="exampleCardEnglishText">
              {formatEnglishText(item.englishTranslation)}
            </div>
            {activeStudentQuery.data?.role === "student" &&
              !!flashcardDataQuery.data &&
              !exampleIsCollected(item.recordId) && (
                <button
                  type="button"
                  className="addButton"
                  value={item.recordId}
                  onClick={(e) => addFlashcard(e.currentTarget.value)}
                >
                  Add
                </button>
              )}
            {activeStudentQuery.data?.role === "student" &&
              !!flashcardDataQuery.data &&
              exampleIsCollected(item.recordId) &&
              exampleIsPending(item.recordId) && (
                <button
                  type="button"
                  className="pendingButton"
                  value={item.recordId}
                >
                  Adding...
                </button>
              )}
            {activeStudentQuery.data?.role === "student" &&
              !!flashcardDataQuery.data &&
              exampleIsCollected(item.recordId) &&
              !exampleIsPending(item.recordId) && (
                <button
                  type="button"
                  className="removeButton"
                  value={item.recordId}
                  onClick={(e) => removeFlashcard(e.currentTarget.value)}
                >
                  Remove
                </button>
              )}
          </div>
        );
      });
      const truthyTable = tableToDisplay.filter((item) => !!item);
      return truthyTable;
    }

    function makeDisplayOrderFromExamples(examples: Flashcard[]) {
      const newDisplayOrder = examples.map((example) => {
        return {
          recordId: example.recordId,
        };
      });
      return newDisplayOrder;
    }

    useEffect(() => {
      filterTagsByInput(tagSearchTerm);
    }, [tagSearchTerm, requiredTags, contextual, filterTagsByInput]);

    useEffect(() => {
      if (verifiedExamplesQuery.isSuccess) {
        const newExampleTable = getFilteredExamples(verifiedExamplesQuery.data);
        const randomizedExamples = fisherYatesShuffle(newExampleTable);
        const newDisplayOrder =
          makeDisplayOrderFromExamples(randomizedExamples);
        setDisplayOrder(newDisplayOrder);
      }
    }, [
      verifiedExamplesQuery.isSuccess,
      verifiedExamplesQuery.data,
      requiredTags,
      noSpanglish,
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
              <div className="filterSection">
                <div className="filterBox options">
                  <div className="FromToLessonSelectorWrapper">
                    <FromToLessonSelector />
                  </div>
                  <div className="removeSpanglishBox">
                    <p>Include Spanglish: </p>
                    <label
                      htmlFor="removeSpanglish"
                      className="switch"
                      aria-label="noSpanglish"
                    >
                      <input
                        type="checkbox"
                        name="removeSpanglish"
                        id="removeSpanglish"
                        checked={!noSpanglish}
                        style={
                          !noSpanglish
                            ? { backgroundColor: "darkgreen" }
                            : { backgroundColor: "darkred" }
                        }
                        onChange={toggleSpanglish}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
                <div className="filterBox search">
                  <div className="searchFilter">
                    <div className="tagSearchBox">
                      <div className="searchTermBox">
                        {/*consider adding a Search Icon at some point */}
                        <input
                          type="text"
                          onChange={(e) => updateTagSearchTerm(e.currentTarget)}
                          onClick={() => openContextual("tagSuggestionBox")}
                          placeholder="Search tags"
                        />
                        <br></br>
                      </div>
                      {!!tagSearchTerm.length &&
                        contextual === "tagSuggestionBox" &&
                        !!suggestedTags.length && (
                          <div
                            className="tagSuggestionBox"
                            ref={currentContextual}
                          >
                            {suggestedTags.map((item) => (
                              <div
                                key={item.id}
                                className="tagCard"
                                onClick={() => addTagToRequiredTags(item.id)}
                              >
                                <div className={`${item.type}Card`}>
                                  <h4 className="vocabName">{item.tag}</h4>
                                  {item.vocabDescriptor && (
                                    <h5 className="vocabDescriptor">
                                      {item.vocabDescriptor}
                                    </h5>
                                  )}
                                  <p className="vocabUse">{item.type}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                    <div className="selectedTagsBox">
                      <p>Selected Tags:</p>
                      {!!requiredTags.length && (
                        <div className="selectedVocab">
                          {/* <h5>Search Terms:</h5> */}
                          {requiredTags.map((item) => (
                            <div
                              key={item.id}
                              className="tagCard"
                              onClick={() => removeTagFromRequiredTags(item.id)}
                            >
                              <div className={`${item.type}Card`}>
                                <h4 className="vocabName">{item.tag}</h4>
                                {item.vocabDescriptor && (
                                  <h5 className="vocabDescriptor">
                                    {item.vocabDescriptor}
                                  </h5>
                                )}
                                <p className="vocabUse">{item.type}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
              {displayExamplesTable()}
            </div>
          </div>
        )}
      </div>
    );
  },
);

export default FlashcardFinder;
