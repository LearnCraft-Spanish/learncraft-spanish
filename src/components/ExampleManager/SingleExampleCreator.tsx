import type {
  Flashcard,
  NewFlashcard,
  Vocabulary,
} from 'src/types/interfaceDefinitions';
import { officialQuizCourses } from '@learncraft-spanish/shared';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ExampleUpdateForm from 'src/components/ExampleManager/ExampleUpdateForm';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import { useModal } from 'src/hexagon/interface/hooks/useModal';
import { useOfficialQuizzes } from 'src/hooks/CourseData/OLD_useOfficialQuizzes';
import { useVocabulary } from 'src/hooks/CourseData/useVocabulary';
import { useRecentlyEditedExamples } from 'src/hooks/ExampleData/useRecentlyEditedExamples';
import ExamplesTable from '../ExamplesTable/ExamplesTable';
import { VocabTag } from './VocabTag';
interface ExampleDetails {
  spanishExample: string;
  englishTranslation: string;
  spanishAudioLa: string;
  englishAudio: string;
}

export default function SingleExampleCreator({
  hasEditAccess,
}: {
  hasEditAccess: boolean;
}) {
  const { openModal, closeModal } = useModal();
  const { setContextualRef, openContextual, contextual } = useContextualMenu();
  const { updateRecentlyEditedExample } = useRecentlyEditedExamples();
  const { recentlyEditedExamplesQuery, addUnverifiedExample } =
    useRecentlyEditedExamples();
  const tempIdCounter = useRef(0);
  const [selectedExampleId, setSelectedExampleId] = useState<number | null>(
    null,
  );
  const [quizId, setQuizId] = useState<number | undefined>(undefined);
  const { quizExamplesQuery, officialQuizzesQuery, updateQuizExample } =
    useOfficialQuizzes(quizId);
  const [tableOption, setTableOption] = useState('none');
  const [vocabIncluded, setVocabIncluded] = useState<string[]>([]);
  const [vocabSearchTerm, setVocabSearchTerm] = useState('');
  const [vocabComplete, setVocabComplete] = useState(false);
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);
  const [exampleDetails, setExampleDetails] = useState<ExampleDetails>({
    spanishExample: '',
    englishTranslation: '',
    spanishAudioLa: '',
    englishAudio: '',
  });
  const [errorCoachReport, setErrorCoachReport] = useState(false);

  const { vocabularyQuery } = useVocabulary();

  const exampleToSave = useMemo<Flashcard>(() => {
    return {
      recordId: selectedExampleId ?? tempIdCounter.current--,
      spanishExample: exampleDetails.spanishExample,
      englishTranslation: exampleDetails.englishTranslation,
      spanishAudioLa: exampleDetails.spanishAudioLa,
      englishAudio: exampleDetails.englishAudio,
      spanglish: exampleDetails.spanishExample.includes('*')
        ? 'spanglish'
        : 'esp',
      vocabIncluded,
      vocabComplete: selectedExampleId ? vocabComplete : false,
      errorCoachReport,
    };
  }, [
    selectedExampleId,
    exampleDetails,
    vocabComplete,
    vocabIncluded,
    errorCoachReport,
  ]);

  const newFlashcard: NewFlashcard = useMemo(() => {
    const { recordId, vocabIncluded, ...rest } = exampleToSave;
    return rest;
  }, [exampleToSave]);

  const quizList = useMemo(() => {
    return officialQuizzesQuery.data?.filter((quiz) => {
      const courseCode = quiz.quizNickname.split(' ')[0];
      return courseCode === tableOption;
    });
  }, [officialQuizzesQuery.data, tableOption]);

  const tableData = useMemo(() => {
    let data;
    if (tableOption === 'none') {
      data = recentlyEditedExamplesQuery.data;
    } else {
      data = quizExamplesQuery.data;
    }

    if (showIncompleteOnly && data) {
      return data.filter((example) => !example.vocabComplete);
    }

    return data;
  }, [
    tableOption,
    quizExamplesQuery.data,
    recentlyEditedExamplesQuery.data,
    showIncompleteOnly,
  ]);

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
            vocabIncluded: example.vocabIncluded,
          },
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
        vocabIncluded: [],
      },
      vocabComplete: false,
    };
  }, [selectedExampleId, tableData]);

  const firstQuiz = useMemo(() => {
    return quizList?.[0];
  }, [quizList]);

  const selectedQuizObject = useMemo(() => {
    return quizList?.find((quiz) => quiz.recordId === quizId);
  }, [quizList, quizId]);

  const addToSelectedVocab = useCallback(
    (vocabTerm: string) => {
      if (vocabTerm && !vocabIncluded.includes(vocabTerm)) {
        setVocabIncluded([...vocabIncluded, vocabTerm]);
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

  const updateVocabSearchTerm = useCallback(
    (target: EventTarget & HTMLInputElement) => {
      setVocabSearchTerm(target.value);
    },
    [],
  );

  const includedVocabObjects = useMemo(() => {
    const mappedVocab = vocabIncluded
      .map((vocab) => {
        return vocabularyQuery.data?.find(
          (word) => word.descriptionOfVocabularySkill === vocab,
        );
      })
      .filter((vocab) => vocab !== undefined) as Vocabulary[];
    return mappedVocab;
  }, [vocabIncluded, vocabularyQuery.data]);

  const tagsFilteredByInput = useMemo(() => {
    function filterBySearch(vocabularyTable: Vocabulary[] | undefined) {
      if (!vocabularyTable) {
        return [];
      }
      const filteredTags = [];
      const searchTerm = vocabSearchTerm.toLowerCase();

      if (searchTerm === '') {
        return [];
      }

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
    return filteredByActiveTags.slice(0, 10);
  }, [vocabSearchTerm, includedVocabObjects, vocabularyQuery.data]);

  const finalizeVerifyExampleChange = (confirmSubmissionValue: boolean) => {
    setVocabComplete(confirmSubmissionValue);
    closeModal();
  };

  const handleVerifyExampleChange = (newValue: boolean) => {
    if (newValue) {
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

  useEffect(() => {
    setExampleDetails(derivedExampleDetails.exampleDetails);
    setVocabIncluded(derivedExampleDetails.exampleDetails.vocabIncluded);
    setVocabComplete(derivedExampleDetails.vocabComplete);
  }, [
    derivedExampleDetails,
    setExampleDetails,
    setVocabComplete,
    setVocabIncluded,
  ]);

  useEffect(() => {
    if (firstQuiz) {
      setQuizId(firstQuiz.recordId);
    }
  }, [firstQuiz, setQuizId]);

  function handleAddExample(e: React.FormEvent) {
    e.preventDefault();
    addUnverifiedExample(newFlashcard);
    setExampleDetails({
      spanishExample: '',
      englishTranslation: '',
      spanishAudioLa: '',
      englishAudio: '',
    });
  }

  function handleEditExample(e: React.FormEvent) {
    e.preventDefault();
    if (!!selectedExampleId && selectedExampleId > 0) {
      if (!!tableOption && tableOption !== 'none') {
        updateQuizExample(exampleToSave);
      } else if (tableOption === 'none') {
        updateRecentlyEditedExample(exampleToSave);
      }
    }
  }

  function submitExample(e: React.FormEvent) {
    e.preventDefault();
    if (!!selectedExampleId && selectedExampleId > 0) {
      handleEditExample(e);
    } else {
      handleAddExample(e);
    }
  }
  const safeTableData = tableData ?? [];

  return (
    <>
      <div id="exampleCreator">
        <ExampleUpdateForm
          editOrCreate={
            !!selectedExampleId && selectedExampleId > 0 ? 'edit' : 'create'
          }
          onSubmit={submitExample}
          spanishExample={exampleDetails.spanishExample}
          setSpanishExample={(value) =>
            setExampleDetails((prev) => ({ ...prev, spanishExample: value }))
          }
          englishTranslation={exampleDetails.englishTranslation}
          setEnglishTranslation={(value) =>
            setExampleDetails((prev) => ({
              ...prev,
              englishTranslation: value,
            }))
          }
          spanishAudioLa={exampleDetails.spanishAudioLa}
          setSpanishAudioLa={(value) =>
            setExampleDetails((prev) => ({ ...prev, spanishAudioLa: value }))
          }
          englishAudio={exampleDetails.englishAudio}
          setEnglishAudio={(value) =>
            setExampleDetails((prev) => ({ ...prev, englishAudio: value }))
          }
        />
      </div>
      {selectedExampleId && selectedExampleId > 0 && (
        <div id="vocabTagging">
          <div className="halfOfScreen tagSearchBox">
            <h3>Search for Vocab</h3>
            <input
              type="text"
              name="search"
              id="search"
              value={vocabSearchTerm}
              placeholder="Search vocabulary"
              className="searchBox"
              onChange={(e) => updateVocabSearchTerm(e.target)}
              onFocus={() => openContextual('vocabTagging')}
            />
            {!!vocabSearchTerm.length && contextual === 'vocabTagging' && (
              <div className="tagSuggestionBox" ref={setContextualRef}>
                {tagsFilteredByInput.map((item) => (
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
            <div className="vocabCompleteContainer">
              <p>ERROR (coach report):</p>
              <label htmlFor="errorCoachReport" className="switch">
                <input
                  type="checkbox"
                  id="errorCoachReport"
                  checked={errorCoachReport}
                  onChange={() => setErrorCoachReport(!errorCoachReport)}
                />
                <span className="slider round"></span>
              </label>
            </div>

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
            <div className="vocabCompleteContainer">
              <p>Vocab Complete:</p>
              <label htmlFor="vocabComplete" className="switch">
                <input
                  type="checkbox"
                  id="vocabComplete"
                  checked={vocabComplete}
                  onChange={() => handleVerifyExampleChange(!vocabComplete)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      )}
      <div className="exampleFilterControls">
        <select
          value={tableOption}
          onChange={(e) => setTableOption(e.target.value)}
        >
          <option value="none">Recently Edited</option>
          {officialQuizCourses.map((course) => (
            <option key={course.code} value={course.code}>
              {course.name}
            </option>
          ))}
        </select>
        {tableOption !== 'none' && quizList && (
          <select onChange={(e) => setQuizId(Number(e.target.value))}>
            <option value="">Select a Quiz</option>
            {quizList.map((quiz) => (
              <option key={quiz.recordId} value={quiz.recordId}>
                {quiz.quizNickname || `Quiz ${quiz.quizNumber}`}
              </option>
            ))}
          </select>
        )}
        <div className="filterToggleContainer">
          <p>Show Incomplete Only:</p>
          <label htmlFor="showIncompleteOnly" className="switch">
            <input
              type="checkbox"
              id="showIncompleteOnly"
              checked={showIncompleteOnly}
              onChange={() => setShowIncompleteOnly(!showIncompleteOnly)}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      {!!tableOption && tableOption !== 'none' && (
        <h3>
          {tableOption} Quiz {selectedQuizObject?.quizNickname}, All Examples
        </h3>
      )}
      {tableOption === 'none' && <h3>Recently Edited Examples</h3>}
      <ExamplesTable
        dataSource={safeTableData}
        displayOrder={safeTableData.map((example) => ({
          recordId: example.recordId,
        }))}
        selectFunction={hasEditAccess ? setSelectedExampleId : undefined}
        forceShowVocab
        studentContext={false}
      />
    </>
  );
}
