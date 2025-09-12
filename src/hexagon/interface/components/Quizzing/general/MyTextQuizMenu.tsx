import type { TextQuizSetupReturn } from '@application/units/useTextQuizSetup';
import { ToggleSwitch } from '@interface/components/general';

import React from 'react';
import { InlineLoading } from '../../Loading';

import './QuizSetupMenu.scss';
import '@interface/styles/QuizSetupMenu.scss';

interface MyTextQuizMenuProps {
  quizSetupOptions: TextQuizSetupReturn;
  filteringIsLoading?: boolean;
}
export function MyTextQuizMenu({
  quizSetupOptions,
  filteringIsLoading = false,
}: MyTextQuizMenuProps) {
  const {
    canAccessSRS,
    canAccessCustom,
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
    <div className="quizSettingsBody">
      {canAccessSRS && (
        <div className="menuRow">
          <ToggleSwitch
            id="srsQuiz"
            ariaLabel="SRS Quiz"
            label="SRS Quiz"
            checked={srsQuiz}
            onChange={() => setSrsQuiz(!srsQuiz)}
          />
        </div>
      )}
      <div className="menuRow">
        <ToggleSwitch
          id="startWithSpanish"
          ariaLabel="Start With Spanish"
          label="Start With Spanish"
          checked={startWithSpanish}
          onChange={() => setStartWithSpanish(!startWithSpanish)}
        />
      </div>
      {canAccessCustom && (
        <div className="menuRow">
          <ToggleSwitch
            id="customOnly"
            ariaLabel="Custom Only"
            label="Custom Only"
            checked={customOnly}
            onChange={() => setCustomOnly(!customOnly)}
          />
        </div>
      )}
      {filteringIsLoading ? (
        <InlineLoading message="Filtering examples..." />
      ) : (
        <div className="menuRow dropdown">
          <label htmlFor="quizLength">Quiz Length:</label>

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
        </div>
      )}
    </div>
  );
}
