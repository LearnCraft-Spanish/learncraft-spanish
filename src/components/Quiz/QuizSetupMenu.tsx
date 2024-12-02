import React, { useMemo, useState } from 'react';
import { useStudentFlashcards } from '../../hooks/useStudentFlashcards';
import MenuButton from '../Buttons/MenuButton';

interface QuizSetupMenuProps {
  isSrs: boolean;
  setIsSrs: (isSrs: boolean) => void;
  spanishFirst: boolean;
  setSpanishFirst: (spanishFirst: boolean) => void;
  customOnly: boolean;
  setCustomOnly: (customOnly: boolean) => void;
  quizLength: number;
  setQuizLength: (quizLength: number) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}
export default function QuizSetupMenu({
  isSrs,
  setIsSrs,
  spanishFirst,
  setSpanishFirst,
  customOnly,
  setCustomOnly,
  quizLength,
  setQuizLength,
  handleSubmit,
}: QuizSetupMenuProps) {
  const { flashcardDataQuery } = useStudentFlashcards();

  const [quizType, setQuizType] = useState<'standard' | 'audio'>('standard');
  const [isComprehension, setIsComprehension] = useState(false);
  const hasCustomExamples = useMemo(() => {
    return flashcardDataQuery.data?.studentExamples?.some(
      (studentExample) => studentExample?.coachAdded,
    );
  }, [flashcardDataQuery.data?.studentExamples]);

  function calculateQuizLengthOptions() {
    let currentAllowedExamples = flashcardDataQuery.data?.studentExamples;
    if (isSrs) {
      currentAllowedExamples = currentAllowedExamples?.filter(
        (studentExample) =>
          studentExample.nextReviewDate
            ? new Date(studentExample.nextReviewDate) <= new Date()
            : true,
      );
    }
    if (customOnly) {
      currentAllowedExamples = flashcardDataQuery.data?.studentExamples?.filter(
        (studentExample) => studentExample.coachAdded,
      );
    }
    if (!currentAllowedExamples?.length) {
      return [0];
    }
    const exampleCount = currentAllowedExamples.length;
    const quizLengthOptions = [];
    if (currentAllowedExamples?.length > 10) {
      for (let i = 10; i < exampleCount; i = 5 * Math.floor(i * 0.315)) {
        quizLengthOptions.push(i);
      }
    }
    quizLengthOptions.push(exampleCount);
    return quizLengthOptions;
  }

  return (
    <form className="myFlashcardsForm" onSubmit={(e) => handleSubmit(e)}>
      <div className="myFlashcardsFormContentWrapper">
        <h3>Review My Flashcards</h3>
        <h4>Quiz Type:</h4>
        <div className="buttonBox header">
          <input type="radio" id="standard" value="standard" name="quizType" />
          <label
            htmlFor="standard"
            className={quizType === 'standard' ? 'selected' : ''}
            onClick={() => setQuizType('standard')}
          >
            Standard
          </label>
          <input type="radio" id="audio" value="audio" name="quizType" />
          <label
            htmlFor="audio"
            className={quizType === 'audio' ? 'selected' : ''}
            onClick={() => setQuizType('audio')}
          >
            Audio
          </label>
          {/* <button type="button">Standard</button> */}
          {/* <button type="button">Audio</button> */}
        </div>
        {quizType === 'standard' && (
          <div className="quizTypeSettingsWrapper">
            <div>
              <p>Start with Spanish:</p>
              <label htmlFor="spanishFirst" className="switch">
                <input
                  type="checkbox"
                  name="Spanish First"
                  id="spanishFirst"
                  checked={spanishFirst}
                  onChange={(e) => setSpanishFirst(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div>
              <p>SRS Quiz:</p>
              <label htmlFor="isSrs" className="switch">
                <input
                  type="checkbox"
                  name="Srs"
                  id="isSrs"
                  checked={isSrs}
                  onChange={(e) => setIsSrs(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        )}
        {quizType === 'audio' && (
          <div className="quizTypeSettingsWrapper">
            <div>
              <p>Comprehension Quiz:</p>
              <label htmlFor="isComprehension" className="switch">
                <input
                  type="checkbox"
                  name="comprehension"
                  id="isComprehension"
                  checked={isComprehension}
                  onChange={(e) => setIsComprehension(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        )}
        {hasCustomExamples && (
          <div>
            <p>Custom Only:</p>
            <label htmlFor="customOnly" className="switch">
              <input
                type="checkbox"
                name="Custom Only"
                id="customOnly"
                checked={customOnly}
                onChange={(e) => setCustomOnly(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        )}
        <label htmlFor="quizLength">
          <p>Number of Flashcards:</p>
          <select
            name="length"
            id="quizLength"
            onChange={(e) => setQuizLength(Number.parseInt(e.target.value))}
            defaultValue={quizLength}
          >
            {calculateQuizLengthOptions().map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="buttonBox">
        <button type="submit" disabled={calculateQuizLengthOptions()[0] === 0}>
          Start Quiz
        </button>
      </div>
      <div className="buttonBox">
        <MenuButton />
      </div>
    </form>
  );
}
