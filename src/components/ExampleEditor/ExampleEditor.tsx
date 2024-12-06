import React, { useEffect, useMemo, useState } from 'react';
import {
  formatEnglishText,
  formatSpanishText,
} from '../../functions/formatFlashcardText';
import type { NewFlashcard } from '../../interfaceDefinitions';
import { useUnverifiedExamples } from '../../hooks/useUnverifiedExamples';
import { useOfficialQuizzes } from '../../hooks/useOfficialQuizzes';
import ExamplesTable from '../FlashcardFinder/ExamplesTable';
import quizCourses from '../../functions/QuizCourseList';

export default function ExampleEditor() {
  const [spanishExample, setSpanishExample] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [spanishAudioLa, setSpanishAudioLa] = useState('');
  const [englishAudio, setEnglishAudio] = useState('');
  const [quizCourse, setQuizCourse] = useState('');
  const [quizNumber, setquizNumber] = useState(undefined as number | undefined);

  const { addUnverifiedExample } = useUnverifiedExamples();
  const { officialQuizzesQuery, quizExamplesQuery } =
    useOfficialQuizzes(quizNumber);

  const quizList = officialQuizzesQuery.data;
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
        <option key={quiz.quizNumber} value={quiz.quizNumber}>
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

  const spanglish = useMemo(() => {
    const hasAsterisk = spanishExample.includes('*');
    if (hasAsterisk) {
      return 'spanglish';
    } else {
      return 'esp';
    }
  }, [spanishExample]);

  const newFlashcard: NewFlashcard = useMemo(() => {
    return {
      spanishExample,
      englishTranslation,
      spanglish,
      englishAudio,
      spanishAudioLa,
      vocabComplete: false,
    };
  }, [
    spanishExample,
    englishTranslation,
    spanishAudioLa,
    englishAudio,
    spanglish,
  ]);

  function handleAddExample(e: React.FormEvent) {
    e.preventDefault();
    addUnverifiedExample(newFlashcard);
    setSpanishExample('');
    setEnglishTranslation('');
    setSpanishAudioLa('');
    setEnglishAudio('');
  }

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
            {quizCourseOptions}
          </select>
          <select
            value={quizNumber}
            onChange={(e) => setquizNumber(Number.parseInt(e.target.value))}
          >
            {quizOptions}
          </select>
        </div>
        <form onSubmit={(e) => handleAddExample(e)}>
          <h3>Create Example</h3>
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
          <button type="submit">Save Example</button>
        </form>
        <h3>
          {quizCourse} Quiz {quizNumber} Examples
        </h3>
        <ExamplesTable
          dataSource={tableData ?? []}
          displayOrder={displayOrder ?? []}
        />
      </div>
    </div>
  );
}
