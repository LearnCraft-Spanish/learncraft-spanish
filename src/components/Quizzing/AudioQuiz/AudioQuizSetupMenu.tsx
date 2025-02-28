import React from 'react';
import MenuButton from 'src/components/Buttons/MenuButton';
import { FromToLessonSelector } from 'src/components/LessonSelector';

import './AudioBasedReview.css';

interface AudioQuizSetupMenuProps {
  autoplay: boolean;
  updateAutoplay: (autoplay: boolean) => void;
  examplesToPlayLength: number;
  readyQuiz: () => void;
}
export default function AudioQuizSetupMenu({
  autoplay,
  updateAutoplay,
  examplesToPlayLength,
  readyQuiz,
}: AudioQuizSetupMenuProps): React.JSX.Element {
  return (
    <div className="audioQuizSetupMenu">
      {/* Change className? currently confusing */}
      <div className="form">
        <FromToLessonSelector />
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
              onChange={(e) => updateAutoplay(e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      <div className="buttonBox">
        <MenuButton />
        <button
          type="button"
          onClick={readyQuiz}
          disabled={!(examplesToPlayLength > 0)}
        >
          Start
        </button>
      </div>
      <div className="buttonBox">
        {examplesToPlayLength < 1 ? (
          <p>There are no audio examples for this lesson range</p>
        ) : (
          <p>{`${examplesToPlayLength} examples found`}</p>
        )}
      </div>
    </div>
  );
}
