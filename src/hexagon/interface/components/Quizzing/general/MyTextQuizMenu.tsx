import type { TextQuizSetupReturn } from '@application/units/useTextQuizSetup';
import { ToggleSwitch } from '@interface/components/general';

import React from 'react';
import './QuizSetupMenu.scss';

interface MyTextQuizMenuProps {
  quizSetupOptions: TextQuizSetupReturn;
}
export function MyTextQuizMenu({ quizSetupOptions }: MyTextQuizMenuProps) {
  const {
    srsQuiz,
    startWithSpanish,
    setSrsQuiz,
    setStartWithSpanish,
    customOnly,
    setCustomOnly,
    quizLength,
    setSelectedQuizLength,
    availableQuizLengths,
  } = quizSetupOptions;

  return (
    <>
      <div className="quizTypeSettingsWrapper">
        <ToggleSwitch
          id="srsQuiz"
          ariaLabel="SRS Quiz"
          label="SRS Quiz"
          checked={srsQuiz}
          onChange={() => setSrsQuiz(!srsQuiz)}
        />
        <ToggleSwitch
          id="startWithSpanish"
          ariaLabel="Start With Spanish"
          label="Start With Spanish"
          checked={startWithSpanish}
          onChange={() => setStartWithSpanish(!startWithSpanish)}
        />
        <ToggleSwitch
          id="customOnly"
          ariaLabel="Custom Only"
          label="Custom Only"
          checked={customOnly}
          onChange={() => setCustomOnly(!customOnly)}
        />
      </div>
      <label htmlFor="quizLength">
        <p>Number to Quiz:</p>
        <select
          name="length"
          id="quizLength"
          onChange={(e) =>
            setSelectedQuizLength(Number.parseInt(e.target.value))
          }
          value={quizLength}
        >
          {availableQuizLengths.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
