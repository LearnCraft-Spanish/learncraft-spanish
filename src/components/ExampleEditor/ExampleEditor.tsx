import React, { useEffect, useMemo, useState } from 'react';
import {
  formatEnglishText,
  formatSpanishText,
} from '../../functions/formatFlashcardText';
import type { NewFlashcard, Vocabulary } from '../../interfaceDefinitions';
import { useVocabulary } from '../../hooks/useVocabulary';
import { useUnverifiedExamples } from '../../hooks/useUnverifiedExamples';
import { useOfficialQuizzes } from '../../hooks/useOfficialQuizzes';
import ExamplesTable from '../FlashcardFinder/ExamplesTable';
import quizCourses from '../../functions/QuizCourseList';

export default function ExampleEditor() {
  const [quizCourse, setQuizCourse] = useState('');
  const [quizId, setQuizId] = useState(undefined as number | undefined);
  const [selectedExampleId, setSelectedExampleId] = useState(
    null as number | null,
  );
  const [spanishExample, setSpanishExample] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [spanishAudioLa, setSpanishAudioLa] = useState('');
  const [englishAudio, setEnglishAudio] = useState('');
  const [vocabIncluded, setVocabIncluded] = useState([] as Vocabulary[]);
  const [vocabComplete, setVocabComplete] = useState(false);
  const [selectedVocabTerm, setSelectedVocabTerm] = useState(
    null as Vocabulary | null,
  );

  const { addUnverifiedExample } = useUnverifiedExamples();
  const { officialQuizzesQuery, quizExamplesQuery } =
    useOfficialQuizzes(quizId);
  const { vocabularyQuery } = useVocabulary();

  const quizList = useMemo(() => {
    return officialQuizzesQuery.data?.filter((quiz) => {
      const courseCode = quiz.quizNickname.split(' ')[0];
      return courseCode === quizCourse;
    });
  }, [officialQuizzesQuery.data, quizCourse]);

  const firstQuiz = quizList?.[0];

  const tableData = quizExamplesQuery.data;

  const quizCourseOptions = quizCourses.map((course) => {
    return (
      <option key={course.code} value={course.code}>
        {course.name}
      </option>
    );
  });

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
    return tableData?.flatMap((example) =>
      !example.vocabComplete ? { recordId: example.recordId } : [],
    );
  }, [tableData]);

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

  function addToVocabIncluded(vocab: Vocabulary) {
    setVocabIncluded([...vocabIncluded, vocab]);
  }

  function removeFromVocabIncluded(recordId: number) {
    setVocabIncluded(
      vocabIncluded.filter((vocab) => vocab.recordId !== recordId),
    );
  }

  function handleEditExample(e: React.FormEvent) {
    e.preventDefault();
    if (selectedExampleId !== null) {
      updateExample({
        recordId: selectedExampleId,
        spanishExample,
        englishTranslation,
        spanishAudioLa,
        englishAudio,
        vocabIncluded: vocabIncluded.map((vocab) => vocab.vocabName),
        vocabComplete,
      });
    }
  }

  // Reset Properties when active example changes
  useEffect(() => {
    if (selectedExampleId !== null) {
      const example = tableData?.find(
        (example) => example.recordId === selectedExampleId,
      );
      if (example) {
        const includedVocabStrings = example.vocabIncluded;
        const includedVocabObjects = includedVocabStrings
          .map((vocab) => {
            return vocabularyQuery.data?.find(
              (word) => word.vocabName === vocab,
            );
          })
          .filter((vocab) => vocab !== undefined) as Vocabulary[];

        setSpanishExample(example.spanishExample);
        setEnglishTranslation(example.englishTranslation);
        setSpanishAudioLa(example.spanishAudioLa);
        setEnglishAudio(example.englishAudio);
        setVocabIncluded(includedVocabObjects);
        setVocabComplete(example.vocabComplete);
      }
    }
  }, [vocabularyQuery, selectedExampleId, tableData]);

  // Update default quiz when quizCourse changes
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
          <h3>Example Preview</h3>
          <div>
            {formatSpanishText(spanglish, spanishExample)}
            {spanglish === 'spanglish' && <p>Spanglish Detected</p>}
            {formatEnglishText(englishTranslation)}
          </div>
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
        <div>
          <h3>Choose Quiz</h3>
          <select
            value={quizCourse}
            onChange={(e) => setQuizCourse(e.target.value)}
          >
            <option value="">Select Course</option>
            {quizCourseOptions}
          </select>
          {!!quizCourse && (
            <select
              value={quizId}
              onChange={(e) => setQuizId(Number.parseInt(e.target.value))}
            >
              {quizOptions}
            </select>
          )}
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
            <select onChange={(e) => setVocabIncluded(e.target.value)}>
              {vocabIncluded.map((vocab) => (
                <option key={vocab.recordId} value={vocab.recordId}>
                  {vocab.vocabName}
                </option>
              ))}
            </select>
          </div>
          <button type="submit">Save Example</button>
        </form>
        <h3>
          {quizCourse} Quiz {activeQuiz?.quizNumber}, Unverified Examples
        </h3>
        <ExamplesTable
          dataSource={tableData ?? []}
          displayOrder={displayOrder ?? []}
        />
      </div>
    </div>
  );
}
