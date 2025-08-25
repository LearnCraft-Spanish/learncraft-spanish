import type { QuizSetupOptions } from '@application/useCases/useQuizMyFlashcards';
import { MenuButton, ToggleSwitch } from '@interface/components/general';

import React, { useMemo, useState } from 'react';

interface QuizSetupMenuProps {
  options: QuizSetupOptions;
}
export default function QuizSetupMenu({ options }: QuizSetupMenuProps) {
  const [quizType, setQuizType] = useState<'text' | 'audio'>('text');
  const {
    availableFlashcards,
    srsQuiz,
    setSrsQuiz,
    customOnly,
    setCustomOnly,
    startWithSpanish,
    setStartWithSpanish,
    quizLength,
    setQuizLength,
    startQuiz,
  } = options;
  const calculateQuizLengthOptions = useMemo(() => {
    // Calculate quiz length options
    const exampleCount = options.availableFlashcards.length;
    const quizLengthOptions = [];
    if (options.availableFlashcards?.length > 5) {
      for (let i = 5; i < exampleCount; i = i * 2) {
        quizLengthOptions.push(i);
      }
    }
    quizLengthOptions.push(exampleCount);
    return quizLengthOptions;
  }, [options.availableFlashcards]);

  return (
    <form className="myFlashcardsForm" onSubmit={startQuiz}>
      <div className="myFlashcardsFormContentWrapper">
        <h3>Review My Flashcards</h3>
        <h4>Quiz Type:</h4>
        <div className="buttonBox header">
          <input type="radio" id="quizType" value="text" name="quizType" />
          <label
            htmlFor="quizType"
            className={quizType === 'text' ? 'selected' : ''}
            onClick={() => setQuizType('text')}
          >
            Text
          </label>
          <input type="radio" id="audio" value="audio" name="quizType" />
          <label
            htmlFor="audio"
            className={quizType === 'audio' ? 'selected' : ''}
            onClick={() => setQuizType('audio')}
          >
            Audio
          </label>
        </div>
        {quizType === 'text' && (
          <div className="quizTypeSettingsWrapper">
            <ToggleSwitch
              id="spanishFirst"
              ariaLabel="Start with Spanish"
              label="Start with Spanish"
              checked={startWithSpanish}
              onChange={() => setStartWithSpanish(!startWithSpanish)}
            />
            <ToggleSwitch
              id="srsQuiz"
              ariaLabel="SRS Quiz"
              label="SRS Quiz"
              checked={srsQuiz}
              onChange={() => setSrsQuiz(!srsQuiz)}
            />
          </div>
        )}
        {quizType === 'audio' && (
          <div className="quizTypeSettingsWrapper">
            <ToggleSwitch
              id="isComprehension"
              ariaLabel="Comprehension Quiz"
              label="Comprehension Quiz"
              checked={audioOrComprehension === 'comprehension'}
              onChange={() =>
                setAudioOrComprehension(
                  audioOrComprehension === 'comprehension'
                    ? 'audio'
                    : 'comprehension',
                )
              }
            />
            <ToggleSwitch
              id="autoplay"
              ariaLabel="Autoplay"
              label="Autoplay"
              checked={autoplay}
              onChange={() => setAutoplay(!autoplay)}
            />
          </div>
        )}
        {hasCustomExamples && (
          <div className="QuizMenuCustomOnly">
            <ToggleSwitch
              id="customOnly"
              ariaLabel="Custom Only"
              label="Custom Only"
              checked={customOnly}
              onChange={() => setCustomOnly(!customOnly)}
            />
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
            {calculateQuizLengthOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="buttonBox">
        <button type="submit" disabled={calculateQuizLengthOptions[0] === 0}>
          Start Quiz
        </button>
      </div>
      <div className="buttonBox">
        <MenuButton />
      </div>
    </form>
  );
}
