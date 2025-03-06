import type {
  DisplayOrder,
  Flashcard,
  Vocabulary,
} from 'src/types/interfaceDefinitions';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import quizCourses from 'src/functions/QuizCourseList';
import { useOfficialQuizzes } from 'src/hooks/CourseData/useOfficialQuizzes';
import { useVocabulary } from 'src/hooks/CourseData/useVocabulary';
import { useRecentlyEditedExamples } from 'src/hooks/ExampleData/useRecentlyEditedExamples';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { useModal } from 'src/hooks/useModal';
import { useActiveStudent } from 'src/hooks/UserData/useActiveStudent';
import { useStudentFlashcards } from 'src/hooks/UserData/useStudentFlashcards';
import { useUserData } from 'src/hooks/UserData/useUserData';
import ExamplesTable from '../ExamplesTable/ExamplesTable';
import SearchableStudentList from '../StudentSearch';
import ExampleSetCreator from './ExampleSetCreator';
import SingleExampleCreator from './SingleExampleCreator';
import { VocabTag } from './VocabTag';
import 'src/App.css';
import './ExampleCreator.css';
export default function ExampleCreator() {
  const { openModal, closeModal } = useModal();
  const { openContextual, closeContextual, setContextualRef, contextual } =
    useContextualMenu();
  const { vocabularyQuery } = useVocabulary();
  const userDataQuery = useUserData();
  const [quizId, setQuizId] = useState(undefined as number | undefined);
  const { officialQuizzesQuery, quizExamplesQuery, updateQuizExample } =
    useOfficialQuizzes(quizId);
  const { recentlyEditedExamplesQuery, updateRecentlyEditedExample } =
    useRecentlyEditedExamples();
  const { flashcardDataQuery } = useStudentFlashcards();
  const { activeStudentQuery } = useActiveStudent();
  const adminRole = userDataQuery.data?.roles.adminRole;
  const hasAccess = adminRole === 'admin' || adminRole === 'coach';
  const [singleOrSet, setSingleOrSet] = useState<'single' | 'set'>('set');
  const [editOrCreate, setEditOrCreate] = useState<'create' | 'edit'>('create');
  const [tableOption, setTableOption] = useState('none');
  const [selectedExampleId, setSelectedExampleId] = useState<number | null>(
    null,
  );
  const [exampleDetails, setExampleDetails] = useState({
    spanishExample: '',
    englishTranslation: '',
    spanishAudioLa: '',
    englishAudio: '',
  });
  const [vocabIncluded, setVocabIncluded] = useState([] as string[]);
  const [vocabComplete, setVocabComplete] = useState(false);
  const [vocabSearchTerm, setVocabSearchTerm] = useState('');
  const [suggestedTags, setSugestedTags] = useState<Vocabulary[]>([]);

  const toggleSingleOrSet = () => {
    setSingleOrSet((prev) => (prev === 'single' ? 'set' : 'single'));
  };

  const updateQuizId = useCallback(
    (newQuizId: number | string | undefined) => {
      if (typeof newQuizId === 'string') {
        setQuizId(Number.parseInt(newQuizId));
      } else {
        setQuizId(newQuizId);
      }
    },
    [setQuizId],
  );

  const updateTableOptions = useCallback(
    (type: string) => {
      if (tableOption !== 'none' && type === 'none') {
        recentlyEditedExamplesQuery.refetch();
      } else if (tableOption !== 'student' && type === 'student') {
        activeStudentQuery.refetch();
      } else {
        quizExamplesQuery.refetch();
      }
      setTableOption(type);
    },
    [
      recentlyEditedExamplesQuery,
      activeStudentQuery,
      quizExamplesQuery,
      tableOption,
    ],
  );

  function handleEditExample(e: React.FormEvent) {
    e.preventDefault();
    if (!!selectedExampleId && selectedExampleId > 0) {
      if (
        !!tableOption &&
        tableOption !== 'none' &&
        tableOption !== 'student'
      ) {
        updateQuizExample({
          recordId: selectedExampleId,
          spanishExample: exampleDetails.spanishExample,
          englishTranslation: exampleDetails.englishTranslation,
          spanishAudioLa: exampleDetails.spanishAudioLa,
          spanglish: exampleDetails.spanishExample.includes('*')
            ? 'spanglish'
            : 'esp',
          englishAudio: exampleDetails.englishAudio,
          vocabComplete,
          vocabIncluded,
        });
      } else if (tableOption === 'none') {
        updateRecentlyEditedExample({
          recordId: selectedExampleId,
          spanishExample: exampleDetails.spanishExample,
          englishTranslation: exampleDetails.englishTranslation,
          spanishAudioLa: exampleDetails.spanishAudioLa,
          spanglish: exampleDetails.spanishExample.includes('*')
            ? 'spanglish'
            : 'esp',
          englishAudio: exampleDetails.englishAudio,
          vocabComplete,
          vocabIncluded,
        });
      } else if (tableOption === 'student') {
        updateRecentlyEditedExample({
          recordId: selectedExampleId,
          spanishExample: exampleDetails.spanishExample,
          englishTranslation: exampleDetails.englishTranslation,
          spanishAudioLa: exampleDetails.spanishAudioLa,
          spanglish: exampleDetails.spanishExample.includes('*')
            ? 'spanglish'
            : 'esp',
          englishAudio: exampleDetails.englishAudio,
          vocabComplete,
          vocabIncluded,
        });
      }
    }
  }

  const includedVocabObjects = useMemo(() => {
    return vocabIncluded
      .map((vocab) => {
        return vocabularyQuery.data?.find(
          (word) => word.descriptionOfVocabularySkill === vocab,
        );
      })
      .filter((vocab) => vocab !== undefined) as Vocabulary[];
  }, [vocabIncluded, vocabularyQuery.data]);

  const updateVocabSearchTerm = useCallback(
    (target: EventTarget & HTMLInputElement) => {
      openContextual('tagSuggestionBox');
      setVocabSearchTerm(target.value);
    },
    [openContextual],
  );

  const spanglish = useMemo(() => {
    const hasAsterisk = exampleDetails.spanishExample.includes('*');
    if (hasAsterisk) {
      return 'spanglish';
    } else {
      return 'esp';
    }
  }, [exampleDetails.spanishExample]);

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
  const tagsFilteredByInput = useMemo(() => {
    function filterBySearch(vocabularyTable: Vocabulary[] | undefined) {
      if (!vocabularyTable) {
        return [];
      }
      const filteredTags = [];
      const searchTerm = vocabSearchTerm.toLowerCase();

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
  }, [vocabSearchTerm, includedVocabObjects, vocabularyQuery.data]);

  const updateExample = useCallback(
    (example: Flashcard) => {
      if (tableOption === 'none') {
        updateRecentlyEditedExample(example);
      } else {
        updateQuizExample(example);
      }
    },
    [updateRecentlyEditedExample, updateQuizExample, tableOption],
  );

  const quizList = useMemo(() => {
    return officialQuizzesQuery.data?.filter((quiz) => {
      const courseCode = quiz.quizNickname.split(' ')[0];
      return courseCode === tableOption;
    });
  }, [officialQuizzesQuery.data, tableOption]);

  const firstQuiz = quizList?.[0];

  const tableData = useMemo(() => {
    if (tableOption === 'none') {
      return recentlyEditedExamplesQuery.data;
    } else if (tableOption === 'student') {
      return flashcardDataQuery.data?.examples;
    } else {
      return quizExamplesQuery.data;
    }
  }, [
    tableOption,
    quizExamplesQuery.data,
    recentlyEditedExamplesQuery.data,
    flashcardDataQuery.data,
  ]);

  const displayOrder: DisplayOrder[] = useMemo(() => {
    if (!tableData) return [];
    if (!tableData?.length) return [];
    return tableData.map((example: Flashcard) => ({
      recordId: example.recordId,
    }));
  }, [tableData]);

  const activeQuiz = useMemo(() => {
    return quizList?.find((quiz) => quiz.recordId === quizId);
  }, [quizId, quizList]);

  const finalizeVerifyExampleChange = (confirmSubmissionValue: boolean) => {
    setVocabComplete(confirmSubmissionValue);
    closeModal();
    // closeContextual();
  };
  const handleVerifyExampleChange = (newValue: boolean) => {
    if (newValue) {
      // openContextual('confirmSubmission');
      openModal({
        title: 'Are you sure?',
        body: 'Warning! You are about to mark this example as "Vocab Complete", making it visible to students. This action can ONLY be undone through the QuickBase app',
        type: 'confirm',
        confirmFunction: () => finalizeVerifyExampleChange(true),
        cancelFunction: () => finalizeVerifyExampleChange(false),
      });
    } else {
      setVocabComplete(false);
    }
  };

  const derivedExampleDetails = useMemo(() => {
    if (selectedExampleId !== null) {
      const example = tableData?.find(
        (example: Flashcard) => example.recordId === selectedExampleId,
      );
      if (example) {
        return {
          exampleDetails: {
            spanishExample: example.spanishExample,
            englishTranslation: example.englishTranslation,
            spanishAudioLa: example.spanishAudioLa,
            englishAudio: example.englishAudio,
          },
          vocabIncluded: example.vocabIncluded,
          vocabComplete: example.vocabComplete,
        };
      }
    }
    return {
      exampleDetails: {
        spanishExample: '',
        englishTranslation: '',
        spanishAudioLa: '',
        englishAudio: '',
      },
      vocabIncluded: [],
      vocabComplete: false,
    };
  }, [selectedExampleId, tableData]);

  useEffect(() => {
    setExampleDetails(derivedExampleDetails.exampleDetails);
    setVocabIncluded(derivedExampleDetails.vocabIncluded);
    setVocabComplete(derivedExampleDetails.vocabComplete);
  }, [derivedExampleDetails]);

  // Set default Quiz ID when quiz course is selected
  useEffect(() => {
    if (firstQuiz) {
      setQuizId(firstQuiz.recordId);
    }
  }, [firstQuiz, setQuizId]);

  return (
    <div>
      <h2>Example Creator</h2>
      <div className="buttonBox" id="singleOrSet">
        <button type="button" onClick={toggleSingleOrSet}>
          {singleOrSet === 'single'
            ? 'Create Example Set'
            : 'Create/Edit Single Example'}
        </button>
      </div>

      {singleOrSet === 'single' ? (
        <>
          <SingleExampleCreator
            editOrCreate={selectedExampleId ? 'edit' : 'create'}
            exampleDetails={exampleDetails}
            setExampleDetails={setExampleDetails}
            vocabIncluded={vocabIncluded}
            setVocabIncluded={setVocabIncluded}
          />
          {editOrCreate === 'edit' && (
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
                    onChange={(e) =>
                      handleVerifyExampleChange(e.target.checked)
                    }
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="buttonBox">
                <button type="submit">Save Example</button>
              </div>
            </form>
          )}
        </>
      ) : (
        <ExampleSetCreator hasAccess={hasAccess} />
      )}
      {!!tableOption && tableOption !== 'none' && tableOption !== 'student' && (
        <h3>
          {tableOption} Quiz {activeQuiz?.quizNumber}, All Examples
        </h3>
      )}
      {tableOption === 'none' && <h3>Recently Edited Examples</h3>}
      {tableOption === 'student' && (
        <h3>{activeStudentQuery.data?.name}, Collected Examples</h3>
      )}
      <select
        value={tableOption}
        onChange={(e) => updateTableOptions(e.target.value)}
      >
        <option key="none" value="none">
          Recently Edited
        </option>
        {quizCourses.map((course) => {
          return (
            <option key={course.code} value={course.code}>
              {course.name}
            </option>
          );
        })}
        <option key="student" value="student">
          Student
        </option>
      </select>
      {!!tableOption && tableOption !== 'none' && tableOption !== 'student' && (
        <select value={quizId} onChange={(e) => updateQuizId(e.target.value)}>
          {quizList?.map((quiz) => {
            return (
              <option key={quiz.recordId} value={quiz.recordId}>
                Quiz {quiz.quizNumber}
              </option>
            );
          })}
        </select>
      )}
      {!!tableOption && tableOption === 'student' && <SearchableStudentList />}
      <ExamplesTable
        dataSource={tableData ?? []}
        displayOrder={displayOrder ?? []}
        forceShowVocab
        selectFunction={
          singleOrSet === 'single'
            ? (recordId) => setSelectedExampleId(recordId)
            : undefined
        }
        studentContext={false}
      />
    </div>
  );
}
