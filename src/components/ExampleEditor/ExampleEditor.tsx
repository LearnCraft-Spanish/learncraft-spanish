import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOfficialQuizzes } from 'src/hooks/CourseData/useOfficialQuizzes';
import { useRecentlyEditedExamples } from 'src/hooks/ExampleData/useRecentlyEditedExamples';
import type { Flashcard, Vocabulary } from 'src/types/interfaceDefinitions';
import { useVocabulary } from 'src/hooks/CourseData/useVocabulary';
import quizCourses from 'src/functions/QuizCourseList';
import ExamplesTable from 'src/components/FlashcardFinder/ExamplesTable';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import EditOrCreateExample from '../editOrCreateExample';
import { VocabTag } from './VocabTag';
import './ExampleEditor.css';
import '../ExampleCreator/ExampleCreator.css';
import '../../App.css';

export default function ExampleEditor() {
  const [quizId, setQuizId] = useState(undefined as number | undefined);

  const { contextual, openContextual, setContextualRef, closeContextual } =
    useContextualMenu();
  const { officialQuizzesQuery, quizExamplesQuery, updateQuizExample } =
    useOfficialQuizzes(quizId);
  const { recentlyEditedExamplesQuery, updateRecentlyEditedExample } =
    useRecentlyEditedExamples();
  const { vocabularyQuery } = useVocabulary();

  const [tableOption, setTableOption] = useState('');
  const [selectedExampleId, setSelectedExampleId] = useState(
    null as number | null,
  );
  const [spanishExample, setSpanishExample] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [spanishAudioLa, setSpanishAudioLa] = useState('');
  const [englishAudio, setEnglishAudio] = useState('');
  const [vocabIncluded, setVocabIncluded] = useState([] as string[]);

  const [vocabComplete, setVocabComplete] = useState(false);
  const [confirmSubmission, setConfirmSubmission] = useState(false);

  const [vocabSearchTerm, setVocabSearchTerm] = useState('');
  const [suggestedTags, setSugestedTags] = useState<Vocabulary[]>([]);

  const includedVocabObjects = useMemo(() => {
    return vocabIncluded
      .map((vocab) => {
        return vocabularyQuery.data?.find(
          (word) => word.descriptionOfVocabularySkill === vocab,
        );
      })
      .filter((vocab) => vocab !== undefined) as Vocabulary[];
  }, [vocabIncluded, vocabularyQuery.data]);

  const quizList = useMemo(() => {
    return officialQuizzesQuery.data?.filter((quiz) => {
      const courseCode = quiz.quizNickname.split(' ')[0];
      return courseCode === tableOption;
    });
  }, [officialQuizzesQuery.data, tableOption]);

  const firstQuiz = quizList?.[0];

  const tableData = useMemo(() => {
    if (tableOption === 'recently-edited') {
      return recentlyEditedExamplesQuery.data;
    } else {
      return quizExamplesQuery.data;
    }
  }, [tableOption, quizExamplesQuery.data, recentlyEditedExamplesQuery.data]);

  const updateTableOptions = useCallback(
    (newCourse: string) => {
      if (
        tableOption !== 'recently-edited' &&
        newCourse === 'recently-edited'
      ) {
        recentlyEditedExamplesQuery.refetch();
      }
      setTableOption(newCourse);
    },
    [recentlyEditedExamplesQuery, tableOption],
  );

  const updateVocabSearchTerm = useCallback(
    (target: EventTarget & HTMLInputElement) => {
      openContextual('tagSuggestionBox');
      setVocabSearchTerm(target.value);
    },
    [openContextual],
  );

  const displayOrder = useMemo(() => {
    // Return all records if tableOption is 'recently-edited'
    if (tableOption === 'recently-edited') {
      return tableData?.map((example: Flashcard) => ({
        recordId: example.recordId,
      }));
    }
    // If editing quiz examples, return only unverified examples
    return tableData?.flatMap((example: Flashcard) =>
      !example.vocabComplete ? { recordId: example.recordId } : [],
    );
  }, [tableData, tableOption]);

  const activeQuiz = useMemo(() => {
    return quizList?.find((quiz) => quiz.recordId === quizId);
  }, [quizId, quizList]);

  const spanglish = useMemo(() => {
    const hasAsterisk = spanishExample.includes('*');
    if (hasAsterisk) {
      return 'spanglish';
    } else {
      return 'esp';
    }
  }, [spanishExample]);

  const addToSelectedVocab = useCallback(
    (vocabTerm: string) => {
      const vocab = vocabTerm;
      if (vocab && !vocabIncluded.includes(vocab)) {
        setVocabIncluded([...vocabIncluded, vocab]);
        setVocabSearchTerm('');
      }
    },
    [vocabIncluded],
  );
  const removeFromVocabIncluded = useCallback(
    (vocabName: string) => {
      setVocabIncluded(vocabIncluded.filter((vocab) => vocab !== vocabName));
    },
    [vocabIncluded],
  );

  // essentailly same filtering used in FLashcardFinder
  const filterTagsByInput = useCallback(
    (tagInput: string) => {
      function filterBySearch(vocabularyTable: Vocabulary[] | undefined) {
        if (!vocabularyTable) {
          return [];
        }
        const filteredTags = [];
        const searchTerm = tagInput.toLowerCase();

        for (let i = 0; i < vocabularyTable.length; i++) {
          const tagLowercase = vocabularyTable[i].vocabName.toLowerCase();
          const descriptorLowercase =
            vocabularyTable[i].descriptionOfVocabularySkill;
          if (
            tagLowercase.includes(searchTerm) ||
            descriptorLowercase?.includes(searchTerm)
          ) {
            if (
              tagLowercase === searchTerm ||
              descriptorLowercase === searchTerm
            ) {
              filteredTags.unshift(vocabularyTable[i]);
            } else {
              filteredTags.push(vocabularyTable[i]);
            }
          }
        }

        return filteredTags;
      }

      function filterByActiveTags(tag: Vocabulary) {
        const matchFound = includedVocabObjects.find(
          (item) => item.recordId === tag.recordId,
        );
        if (matchFound) {
          return false;
        }
        return true;
      }
      const filteredBySearch = filterBySearch(vocabularyQuery.data);
      const filteredByActiveTags = filteredBySearch.filter(filterByActiveTags);
      const suggestTen = [];
      for (let i = 0; i < 10; i++) {
        if (filteredByActiveTags[i]) {
          suggestTen.push(filteredByActiveTags[i]);
        }
      }
      setSugestedTags(suggestTen);
    },
    [includedVocabObjects, vocabularyQuery.data],
  );

  const formSubmissionAfterConfirm = (
    confirmSubmissionResult: boolean = false,
  ) => {
    if (selectedExampleId !== null) {
      // had to add a double check for confirmSubmission because of the way the state is set directly before this function is called, there must be a better way to do this
      if (
        ((confirmSubmission || confirmSubmissionResult) && vocabComplete) ||
        !vocabComplete
      ) {
        if (!!tableOption && tableOption !== 'recently-edited') {
          updateQuizExample({
            recordId: selectedExampleId,
            spanishExample,
            englishTranslation,
            spanishAudioLa,
            spanglish,
            englishAudio,
            vocabComplete,
            vocabIncluded,
          });
        } else if (tableOption === 'recently-edited') {
          updateRecentlyEditedExample({
            recordId: selectedExampleId,
            spanishExample,
            englishTranslation,
            spanishAudioLa,
            spanglish,
            englishAudio,
            vocabComplete,
            vocabIncluded,
          });
        }
      }
      setConfirmSubmission(false);
    }
  };
  function handleEditExample(e: React.FormEvent | undefined = undefined) {
    if (e) {
      e.preventDefault();
    }
    if (selectedExampleId !== null) {
      if (vocabComplete && !confirmSubmission) {
        openContextual('confirmSubmission');
      } else {
        formSubmissionAfterConfirm();
      }
    }
  }

  const updateConfirmSubmission = (
    e: React.FormEvent,
    confirmSubmissionValue: boolean,
  ) => {
    e.preventDefault();
    setConfirmSubmission(confirmSubmissionValue);
    setVocabComplete(confirmSubmissionValue);
    closeContextual();
    if (confirmSubmissionValue) {
      formSubmissionAfterConfirm(confirmSubmissionValue);
    }
  };
  // Reset Properties when active example changes
  useEffect(() => {
    if (selectedExampleId !== null) {
      const example = tableData?.find(
        (example: Flashcard) => example.recordId === selectedExampleId,
      );
      if (example) {
        setSpanishExample(example.spanishExample);
        setEnglishTranslation(example.englishTranslation);
        setSpanishAudioLa(example.spanishAudioLa);
        setEnglishAudio(example.englishAudio);
        setVocabIncluded(example.vocabIncluded);
        setVocabComplete(example.vocabComplete);
        setConfirmSubmission(false);
      }
    }
  }, [
    recentlyEditedExamplesQuery.data,
    quizExamplesQuery.data,
    tableData,
    vocabularyQuery.data,
    selectedExampleId,
  ]);

  // search functionality for vocab tags
  useEffect(() => {
    filterTagsByInput(vocabSearchTerm);
  }, [vocabSearchTerm, filterTagsByInput]);

  // Update default quiz when tableOption changes
  useEffect(() => {
    if (!firstQuiz) {
      setQuizId(undefined);
    } else {
      setQuizId(firstQuiz.recordId);
    }
  }, [firstQuiz]);

  return (
    <div>
      <div>
        <h2>Example Editor</h2>
      </div>
      <div>
        {!selectedExampleId && (
          <div>
            <h4>Please select an example to preview/edit</h4>
          </div>
        )}
        {selectedExampleId && (
          <>
            <div id="exampleEditor">
              <EditOrCreateExample
                editOrCreate="edit"
                onSubmit={handleEditExample}
                spanishExample={spanishExample}
                setSpanishExample={setSpanishExample}
                spanglish={spanglish}
                englishTranslation={englishTranslation}
                setEnglishTranslation={setEnglishTranslation}
                spanishAudioLa={spanishAudioLa}
                setSpanishAudioLa={setSpanishAudioLa}
                englishAudio={englishAudio}
                setEnglishAudio={setEnglishAudio}
              />
            </div>
            <form onSubmit={(e) => handleEditExample(e)}>
              <div id="vocabTagging">
                <div className="halfOfScreen tagSearchBox">
                  <h3>Search for Vocab</h3>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={vocabSearchTerm}
                    placeholder="Search names, emails, or notes"
                    className="searchBox"
                    onChange={(e) => updateVocabSearchTerm(e.target)}
                    onFocus={(e) => updateVocabSearchTerm(e.target)}
                  />
                  {/* Contextual with results from search bar */}
                  {!!vocabSearchTerm.length &&
                    contextual === 'tagSuggestionBox' &&
                    !!suggestedTags.length && (
                      <div className="tagSuggestionBox" ref={setContextualRef}>
                        {suggestedTags.map((item) => (
                          <div
                            key={item.recordId}
                            className="vocabTag tagCard"
                            onClick={() => addToSelectedVocab(item.vocabName)}
                          >
                            <h4 className="vocabName">
                              {item.descriptionOfVocabularySkill}
                            </h4>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
                <div className="halfOfScreen">
                  <h3>Vocab Included</h3>
                  <div className="vocabTagBox">
                    {includedVocabObjects.map((vocab) => (
                      <VocabTag
                        key={vocab.recordId}
                        vocab={vocab}
                        removeFromVocabList={removeFromVocabIncluded}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="buttonBox">
                <p>Vocab Complete:</p>
                <label htmlFor="vocabComplete" className="switch">
                  <input
                    alt="Vocab Complete"
                    type="checkbox"
                    name="Vocab Complete"
                    id="vocabComplete"
                    checked={vocabComplete}
                    onChange={(e) => setVocabComplete(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="buttonBox">
                <button type="submit">Save Example</button>
              </div>
            </form>
            {contextual === 'confirmSubmission' && (
              <div className="confirmSubmissionBox" ref={setContextualRef}>
                <form onSubmit={(e) => updateConfirmSubmission(e, true)}>
                  <h3>Are you sure?</h3>
                  <p>
                    <b>Warning!</b> You are about to mark this example as "Vocab
                    Complete", making it visible to students. This action can
                    ONLY be undone through the QuickBase app
                  </p>
                  <div className="buttonBox">
                    <button
                      className="removeButton"
                      type="button"
                      onClick={(e) => updateConfirmSubmission(e, false)}
                    >
                      Go Back
                    </button>
                    <div></div>
                    <button type="submit" className="addButton">
                      Confirm
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}

        <div>
          <h3>Example List</h3>
          <select
            value={tableOption}
            onChange={(e) => updateTableOptions(e.target.value)}
          >
            <option value="">Select Example List</option>
            <option key="recently-edited" value="recently-edited">
              Recently Edited
            </option>
            {quizCourses.map((course) => {
              return (
                <option key={course.code} value={course.code}>
                  {course.name}
                </option>
              );
            })}
          </select>
          {!!tableOption && tableOption !== 'recently-edited' && (
            <select
              value={quizId}
              onChange={(e) => setQuizId(Number.parseInt(e.target.value))}
            >
              {quizList?.map((quiz) => {
                return (
                  <option key={quiz.recordId} value={quiz.recordId}>
                    {quiz.quizNumber}
                  </option>
                );
              })}
            </select>
          )}
        </div>
        {!!tableOption && tableOption !== 'recently-edited' && (
          <h3>
            {tableOption} Quiz {activeQuiz?.quizNumber}, Unverified Examples
          </h3>
        )}
        {tableOption === 'recently-edited' && (
          <h3>Recently Added or Edited Examples</h3>
        )}
        <ExamplesTable
          dataSource={tableData ?? []}
          displayOrder={displayOrder ?? []}
          forceShowVocab
          selectFunction={(recordId) => setSelectedExampleId(recordId)}
        />
      </div>
    </div>
  );
}
