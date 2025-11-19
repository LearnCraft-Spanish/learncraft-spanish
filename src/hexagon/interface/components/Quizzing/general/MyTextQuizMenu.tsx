import type { TextQuizSetupReturn } from '@application/units/useTextQuizSetup';
import { ToggleSwitch } from '@interface/components/general';

import { InlineLoading } from '@interface/components/Loading';

import React from 'react';
import './QuizSetupMenu.scss';

// What is this? Why the duplicate styles?
import '@interface/styles/QuizSetupMenu.scss';

interface MyTextQuizMenuProps {
  quizSetupOptions: TextQuizSetupReturn;
  filteringIsLoading?: boolean;
  totalCount?: number | null;
}
export function MyTextQuizMenu({
  quizSetupOptions,
  filteringIsLoading = false,
  totalCount,
}: MyTextQuizMenuProps) {
  const {
    canAccessSRS,
    canAccessCustom,
    srsQuiz,
    startWithSpanish,
    setSrsQuiz,
    setStartWithSpanish,
    customFlashcardsChoice,
    setCustomFlashcardsChoice,
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
        <div className="menuRow dropdown">
          <label htmlFor="customFlashcardsChoice">Custom Flashcards</label>

          <select
            name="customFlashcardsChoice"
            id="customFlashcardsChoice"
            onChange={(e) =>
              setCustomFlashcardsChoice(
                e.target.value as 'included' | 'onlyCustom' | 'excluded',
              )
            }
            value={customFlashcardsChoice}
          >
            <option value="included">Included</option>
            <option value="onlyCustom">Only Custom</option>
            <option value="excluded">Excluded</option>
          </select>
        </div>
      )}
      {filteringIsLoading ? (
        <InlineLoading message="Filtering examples..." />
      ) : (
        <>
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
          <div className="quizSettingsBody">
            <div className="menuRow">
              <p className="totalCount">{`${totalCount ?? 0} flashcards found`}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
