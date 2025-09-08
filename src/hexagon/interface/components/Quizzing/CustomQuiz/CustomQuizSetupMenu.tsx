import { ToggleSwitch } from '@interface/components/general';
import { InlineLoading } from '../../Loading';
// Universal Settings:

// collected flashcard only
// audio or text
// quiz length (max of 150)

//text settings:
// spanish first

// audio settings:
// autoplay
// listening or speaking

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
    <div className="CustomQuizSetupMenu">
      <div className="header">
        <h2>Custom Quiz Settings</h2>
      </div>
      <div className="content">
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
