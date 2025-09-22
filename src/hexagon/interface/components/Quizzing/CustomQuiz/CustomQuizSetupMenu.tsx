import { ToggleSwitch } from '@interface/components/general';
import { InlineLoading } from '../../Loading';
import '@interface/styles/QuizSetupMenu.scss';

export function CustomQuizSetupMenu({
  availableQuizLengths,
  safeQuizLength,
  setSelectedQuizLength,
  startQuizFunction,
  startWithSpanish,
  updateStartWithSpanish,
  isLoadingExamples,
  totalCount,
}: {
  availableQuizLengths: number[];
  safeQuizLength: number;
  setSelectedQuizLength: (quizLength: number) => void;
  startQuizFunction: () => void;
  startWithSpanish: boolean;
  updateStartWithSpanish: (startWithSpanish: boolean) => void;
  isLoadingExamples: boolean;
  totalCount: number;
}) {
  return (
    <div className="quizSettingsWrapper">
      <div className="quizSettingsHeader titleOnly">Custom Quiz Settings</div>

      <div className="quizSettingsBody">
        <div className="menuRow">
          <ToggleSwitch
            id="startWithSpanish"
            ariaLabel="startWithSpanish"
            label="Start With Spanish: "
            checked={startWithSpanish ?? false}
            onChange={() => updateStartWithSpanish(!startWithSpanish)}
          />
        </div>
        {isLoadingExamples ? (
          <InlineLoading message="Loading examples..." />
        ) : (
          <>
            <label htmlFor="quizLength" className="menuRow">
              <p>Quiz Length:</p>
              <select
                name="length"
                id="quizLength"
                onChange={(e) =>
                  setSelectedQuizLength(Number.parseInt(e.target.value))
                }
                value={safeQuizLength}
              >
                {availableQuizLengths.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <div className="menuRow">
              <p className="totalCount">{`${totalCount} flashcards found`}</p>
            </div>
          </>
        )}

        <div className="buttonBox">
          <button
            onClick={startQuizFunction}
            type="button"
            className={`startQuizButton ${safeQuizLength === 0 ? 'disabled' : ''}`}
            disabled={safeQuizLength === 0}
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
