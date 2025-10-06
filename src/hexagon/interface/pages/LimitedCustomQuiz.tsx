import { useLimitedCustomQuiz } from '@application/useCases/useLimitedCustomQuiz';
import { MenuButton } from '@interface/components/general/Buttons';
import { LessonRangeSelector } from '@interface/components/LessonSelector';
import { Loading } from '@interface/components/Loading';
import AudioQuiz from '@interface/components/Quizzing/AudioQuiz/AudioQuiz';
import { AudioQuizMenu } from '@interface/components/Quizzing/general';
import '@interface/components/Quizzing/general/QuizSetupMenu.scss';
import './LimitedCustomQuiz.scss';

export default function LimitedCustomQuiz() {
  const {
    quizReady,
    quizNotReady,
    readyQuiz,
    isLoadingExamples,
    isInitialLoading,
    errorExamples,
    audioQuizSetup,
    audioQuizProps,
    totalCount,
  } = useLimitedCustomQuiz();

  if (errorExamples) {
    return (
      <div className="LimitedCustomQuizWrapper">
        <div className="errorMessage">Error: {errorExamples.message}</div>
      </div>
    );
  }

  // Show full screen loading on initial load (when prerequisites are loading)
  if (isInitialLoading) {
    return <Loading message="Loading audio quiz..." />;
  }

  return (
    <div className="LimitedCustomQuizWrapper">
      {!quizReady ? (
        <>
          <h2>Audio Quiz</h2>

          {/* Lesson Range Selector */}
          <div className="lessonSelectorWrapper">
            <h3>Select Lessons:</h3>
            <LessonRangeSelector />
          </div>

          <form
            className="limitedCustomQuizForm"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="limitedCustomQuizFormContentWrapper">
              <h4>Audio Quiz Options:</h4>
              <div className="quizSettingsWrapper">
                <div className="quizSettingsHeader titleOnly">
                  Audio Quiz Settings
                </div>

                {/* Audio Quiz Settings */}
                <AudioQuizMenu
                  quizSetupOptions={audioQuizSetup}
                  filteringIsLoading={isLoadingExamples}
                  totalCount={totalCount}
                />
              </div>
            </div>

            <div className="buttonBox">
              <button
                type="submit"
                disabled={quizNotReady}
                onClick={readyQuiz}
                className={`startQuizButton ${quizNotReady ? 'disabled' : ''}`}
              >
                Start Audio Quiz
              </button>
            </div>
            <div className="buttonBox">
              <MenuButton />
            </div>
          </form>
        </>
      ) : (
        <AudioQuiz audioQuizProps={audioQuizProps} />
      )}
    </div>
  );
}
