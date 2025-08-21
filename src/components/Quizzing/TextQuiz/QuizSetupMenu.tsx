import type { QuizSetupOptions } from '@application/useCases/useQuizMyFlashcards';
import React, { useMemo } from 'react';
import MenuButton from 'src/components/Buttons/MenuButton';

interface QuizSetupMenuProps {
  options: QuizSetupOptions;
}
export default function QuizSetupMenu({ options }: QuizSetupMenuProps) {
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
            <div>
              <p>Start with Spanish:</p>
              <label htmlFor="spanishFirst" className="switch">
                <input
                  type="checkbox"
                  name="Spanish First"
                  id="spanishFirst"
                  checked={startWithSpanish}
                  onChange={(e) => setStartWithSpanish(e.target.checked)}
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
                  checked={srsQuiz}
                  onChange={(e) => setSrsQuiz(e.target.checked)}
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
                  checked={audioOrComprehension === 'comprehension'}
                  onChange={(e) =>
                    setAudioOrComprehension(
                      e.target.checked ? 'comprehension' : 'audio',
                    )
                  }
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div>
              <p>Autoplay:</p>
              <label htmlFor="autoplay" className="switch">
                <input
                  type="checkbox"
                  name="autoplay"
                  id="autoplay"
                  checked={autoplay}
                  onChange={(e) => setAutoplay(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        )}
        {hasCustomExamples && (
          <div className="QuizMenuCustomOnly">
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
