import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOfficialQuizzes } from 'src/hooks/CourseData/useOfficialQuizzes';
import { useRecentlyEditedExamples } from 'src/hooks/ExampleData/useRecentlyEditedExamples';
import type { Flashcard, Vocabulary } from 'src/types/interfaceDefinitions';
import { useVocabulary } from 'src/hooks/CourseData/useVocabulary';
import quizCourses from 'src/functions/QuizCourseList';
import ExamplesTable from 'src/components/FlashcardFinder/ExamplesTable';
import ExampleListItem from '../FlashcardFinder/ExampleListItem';
import { VocabTag } from './VocabTag';
import './ExampleEditor.css';

export default function ExampleEditor() {
  const [tableOption, setTableOption] = useState('');
  const [quizId, setQuizId] = useState(undefined as number | undefined);
  const [selectedExampleId, setSelectedExampleId] = useState(
    null as number | null,
  );
  const [spanishExample, setSpanishExample] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [spanishAudioLa, setSpanishAudioLa] = useState('');
  const [englishAudio, setEnglishAudio] = useState('');
  const [vocabIncluded, setVocabIncluded] = useState([] as string[]);
  const [vocabComplete, setVocabComplete] = useState(false);
  const [selectedVocabTerm, setSelectedVocabTerm] = useState(
    undefined as string | undefined,
  );
  const [vocabSearchTerm, setVocabSearchTerm] = useState('');

  const { officialQuizzesQuery, quizExamplesQuery, updateQuizExample } =
    useOfficialQuizzes(quizId);
  const { recentlyEditedExamplesQuery, updateRecentlyEditedExample } =
    useRecentlyEditedExamples();
  const { vocabularyQuery } = useVocabulary();

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

  const recentlyEditedOption = (
    <option key="recently-edited" value="recently-edited">
      Recently Edited
    </option>
  );

  const quizCourseOptions = quizCourses.map((course) => {
    return (
      <option key={course.code} value={course.code}>
        {course.name}
      </option>
    );
  });

  const allTableOptions = [recentlyEditedOption, ...quizCourseOptions];

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

  const quizOptions = useMemo(() => {
    return quizList?.map((quiz) => {
      return (
        <option key={quiz.recordId} value={quiz.recordId}>
          {quiz.quizNumber}
        </option>
      );
    });
  }, [quizList]);

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

  const vocabOptions = useMemo(() => {
    const filteredVocab =
      vocabularyQuery.data?.filter((term) =>
        term.vocabName.includes(vocabSearchTerm),
      ) ?? [];
    const filteredVocabOptions = filteredVocab.map((vocab) => {
      return (
        <option key={vocab.recordId} value={vocab.descriptionOfVocabularySkill}>
          {vocab.descriptionOfVocabularySkill}
        </option>
      );
    });
    return [
      <option key={0} value={undefined}>
        Choose
      </option>,
      ...filteredVocabOptions,
    ];
  }, [vocabularyQuery.data, vocabSearchTerm]);

  const addSelectedVocab = useCallback(() => {
    const vocab = selectedVocabTerm;
    if (vocab && !vocabIncluded.includes(vocab)) {
      setVocabIncluded([...vocabIncluded, vocab]);
      setVocabSearchTerm('');
    }
  }, [vocabIncluded, selectedVocabTerm]);

  const removeFromVocabIncluded = useCallback(
    (vocabName: string) => {
      setVocabIncluded(vocabIncluded.filter((vocab) => vocab !== vocabName));
    },
    [vocabIncluded],
  );

  const currentFlashcard: Flashcard | null = useMemo(() => {
    if (selectedExampleId === null) {
      return null;
    } else {
      return {
        recordId: selectedExampleId ?? 0,
        spanglish,
        spanishExample,
        englishTranslation,
        spanishAudioLa,
        englishAudio,
        vocabIncluded,
        vocabComplete,
      };
    }
  }, [
    selectedExampleId,
    spanglish,
    vocabIncluded,
    englishAudio,
    englishTranslation,
    spanishAudioLa,
    spanishExample,
    vocabComplete,
  ]);

  function handleEditExample(e: React.FormEvent) {
    e.preventDefault();
    if (selectedExampleId !== null) {
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
  }

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
      }
    }
  }, [
    recentlyEditedExamplesQuery.data,
    quizExamplesQuery.data,
    tableData,
    vocabularyQuery.data,
    selectedExampleId,
  ]);
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
        <div>
          {selectedExampleId && (
            <div>
              <h3>Example Preview</h3>
              <ExampleListItem data={currentFlashcard!} forceShowVocab />
            </div>
          )}
          <div>
            {spanishAudioLa.length > 0 && (
              <>
                <p>Spanish Audio</p>
                <audio src={spanishAudioLa} controls />
              </>
            )}
            {englishAudio.length > 0 && (
              <>
                <p>English Audio</p>
                <audio src={englishAudio} controls />
              </>
            )}
          </div>
        </div>
        <form onSubmit={(e) => handleEditExample(e)}>
          <h3>Edit Example</h3>
          <div>
            <label id="spanishExample">Spanish Example</label>
            <input
              id="spanishExample"
              type="textarea"
              value={spanishExample}
              onChange={(e) => setSpanishExample(e.target.value)}
            />
          </div>
          <div>
            <label id="englishTranslation">English Translation</label>
            <input
              id="englishTranslation"
              type="textarea"
              value={englishTranslation}
              onChange={(e) => setEnglishTranslation(e.target.value)}
            />
          </div>
          <div>
            <label id="spanishAudioLa">Spanish Audio Link</label>
            <input
              id="spanishAudioLa"
              type="textarea"
              value={spanishAudioLa}
              onChange={(e) => setSpanishAudioLa(e.target.value)}
            />
          </div>
          <div>
            <label id="englishAudio">English Audio Link</label>
            <input
              id="englishAudio"
              type="textarea"
              value={englishAudio}
              onChange={(e) => setEnglishAudio(e.target.value)}
            />
          </div>
          <div>
            <label id="vocabIncluded">Vocab Included</label>
            <div className="vocabTagBox">
              {includedVocabObjects.map((vocab) => (
                <VocabTag
                  key={vocab.recordId}
                  vocab={vocab}
                  removeFromVocabList={removeFromVocabIncluded}
                />
              ))}
            </div>
            <input
              type="text"
              value={vocabSearchTerm}
              onChange={(e) => setVocabSearchTerm(e.target.value)}
            />
            <select
              value={selectedVocabTerm}
              onChange={(e) => setSelectedVocabTerm(e.target.value)}
            >
              {vocabOptions}
            </select>
            {selectedVocabTerm ? (
              <button type="button" onClick={addSelectedVocab}>
                Add Vocab
              </button>
            ) : (
              <button type="button" className="disabledButton" disabled>
                Add Vocab
              </button>
            )}
          </div>
          <button type="submit">Save Example</button>
        </form>
        <div>
          <h3>Example List</h3>
          <select
            value={tableOption}
            onChange={(e) => updateTableOptions(e.target.value)}
          >
            <option value="">Select Example List</option>
            {allTableOptions}
          </select>
          {!!tableOption && tableOption !== 'recently-edited' && (
            <select
              value={quizId}
              onChange={(e) => setQuizId(Number.parseInt(e.target.value))}
            >
              {quizOptions}
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
