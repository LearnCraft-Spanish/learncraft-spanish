import {
  CombinedCustomQuizType,
  useCombinedCustomQuiz,
} from '@application/useCases/useCombinedCustomQuiz';
import { FilterPanel } from '@interface/components/Filters';
import { MenuButton } from '@interface/components/general/Buttons';
import { Loading } from '@interface/components/Loading';
import AudioQuiz from '@interface/components/Quizzing/AudioQuiz/AudioQuiz';
import {
  AudioQuizMenu,
  MyTextQuizMenu,
} from '@interface/components/Quizzing/general';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz';

// This seems like a boundary violation: pulling styles from the wrong scope?
import '@interface/components/Quizzing/general/QuizSetupMenu.scss';
import './CombinedCustomQuiz.scss';

export default function CombinedCustomQuiz() {
  const {
    quizType,
    setQuizType,
    quizReady,
    quizNotReady,
    readyQuiz,
    isLoadingExamples,
    isInitialLoading,
    totalCount,
    errorExamples,
    textQuizSetup,
    audioQuizSetup,
    textQuizProps,
    audioQuizProps,
  } = useCombinedCustomQuiz();

  if (errorExamples) {
    return (
      <div className="CombinedCustomQuizWrapper">
        <div className="errorMessage">Error: {errorExamples.message}</div>
      </div>
    );
  }

  // Show full screen loading on initial load (when prerequisites are loading)
  // For filter changes, we'll use inline loading instead
  if (isInitialLoading) {
    return <Loading message="Loading quiz setup..." />;
  }

  return (
    <div className="myFlashcardsFormContentWrapper">
      {!quizReady ? (
        <>
          <h2>Custom Quiz</h2>
          <FilterPanel
            requireAudioOnly={quizType === CombinedCustomQuizType.Audio}
            requireNoSpanglish={quizType === CombinedCustomQuizType.Audio}
          />

          <form
            className="combinedCustomQuizForm"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="combinedCustomQuizFormContentWrapper">
              <h4>Quiz Options:</h4>
              <div className="quizSettingsWrapper">
                <div className="quizSettingsHeader twoOptions">
                  <label
                    htmlFor="textQuizType"
                    className={`option ${
                      quizType === CombinedCustomQuizType.Text ? 'selected' : ''
                    }`}
                    onClick={() => setQuizType(CombinedCustomQuizType.Text)}
                  >
                    Flashcards
                    <input
                      type="radio"
                      id="textQuizType"
                      value="text"
                      name="quizType"
                    />
                  </label>

                  <label
                    htmlFor="audioQuizType"
                    className={`option ${
                      quizType === CombinedCustomQuizType.Audio
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => setQuizType(CombinedCustomQuizType.Audio)}
                  >
                    Audio
                    <input
                      type="radio"
                      id="audioQuizType"
                      value="audio"
                      name="quizType"
                    />
                  </label>
                </div>

                {/* Text Quiz Settings */}
                {quizType === CombinedCustomQuizType.Text && (
                  <MyTextQuizMenu
                    quizSetupOptions={textQuizSetup}
                    filteringIsLoading={isLoadingExamples}
                    totalCount={totalCount}
                  />
                )}

                {/* Audio Quiz Settings */}
                {quizType === CombinedCustomQuizType.Audio && (
                  <AudioQuizMenu
                    quizSetupOptions={audioQuizSetup}
                    filteringIsLoading={isLoadingExamples}
                    totalCount={totalCount}
                  />
                )}
              </div>
            </div>

            <div className="buttonBox">
              <button
                type="submit"
                disabled={quizNotReady}
                onClick={readyQuiz}
                className={`startQuizButton ${quizNotReady ? 'disabled' : ''}`}
              >
                Start Quiz
              </button>
            </div>
            <div className="buttonBox">
              <MenuButton />
            </div>
          </form>
        </>
      ) : quizType === CombinedCustomQuizType.Text ? (
        <TextQuiz textQuizProps={textQuizProps} />
      ) : (
        <AudioQuiz audioQuizProps={audioQuizProps} />
      )}
    </div>
  );
}
