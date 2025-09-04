import type { AudioQuizSetupReturn } from '@application/units/useAudioQuizSetup';
import { LessonSelector } from '@interface/components/LessonSelector';
import React from 'react';
import MenuButton from 'src/components/Buttons/MenuButton';

import { AudioQuizType } from 'src/hexagon/domain/audioQuizzing';
import './AudioBasedReview.css';

interface AudioQuizSetupMenuProps {
  audioQuizSetupOptions: AudioQuizSetupReturn;
  startQuiz: () => void;
}
export default function AudioQuizSetupMenu({
  audioQuizSetupOptions,
  startQuiz,
}: AudioQuizSetupMenuProps): React.JSX.Element {
  // Destructure the audio quiz setup options
  const {
    autoplay,
    setAutoplay,
    totalExamples,
    availableQuizLengths,
    selectedQuizLength,
    setSelectedQuizLength,
    audioQuizType,
    setAudioQuizType,
  } = audioQuizSetupOptions;

  // Render the audio quiz setup menu
  return (
    <div className="audioQuizSetupMenu">
      {/* Change className? currently confusing */}
      <div className="form">
        <LessonSelector />
        <div className="menuRow">
          <p>Quiz Type:</p>
          <label
            htmlFor="audioQuizType"
            className="switch"
            aria-label="toggleAudioQuizType"
          >
            <select
              name="audioQuizType"
              id="audioQuizType"
              value={audioQuizType}
              onChange={(e) =>
                setAudioQuizType(e.target.value as AudioQuizType)
              }
            >
              <option value={AudioQuizType.Speaking}>Speaking</option>
              <option value={AudioQuizType.Listening}>Listening</option>
            </select>
            <span className="slider round"></span>
          </label>
        </div>
        <div className="menuRow">
          <p>Autoplay:</p>
          <label
            htmlFor="isAutoplay"
            className="switch"
            aria-label="toggleAutoplay"
          >
            <input
              type="checkbox"
              name="isAutoplay"
              id="isAutoplay"
              checked={autoplay}
              onChange={(e) => setAutoplay(e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="menuRow">
          <p>Quiz Length:</p>
          <label
            htmlFor="quizLength"
            className="switch"
            aria-label="changeQuizLength"
          >
            <select
              name="quizLength"
              id="quizLength"
              value={selectedQuizLength}
              onChange={(e) => setSelectedQuizLength(Number(e.target.value))}
            >
              {availableQuizLengths.map((length) => (
                <option key={length} value={length}>
                  {length}
                </option>
              ))}
            </select>
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      <div className="buttonBox">
        <MenuButton />
        <button
          type="button"
          onClick={startQuiz}
          disabled={!(totalExamples > 0)}
        >
          Start
        </button>
      </div>
      <div className="buttonBox">
        {!(totalExamples > 0) ? (
          <p>There are no audio examples for this lesson range</p>
        ) : (
          <p>{`${totalExamples} examples found`}</p>
        )}
      </div>
    </div>
  );
}
