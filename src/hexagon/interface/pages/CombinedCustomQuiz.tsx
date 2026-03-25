import {
  CombinedCustomQuizType,
  useCombinedCustomQuiz,
} from '@application/useCases/useCombinedCustomQuiz';
import { FilterPanel } from '@interface/components/Filters';
import { MenuButton } from '@interface/components/general/Buttons';
import { Loading } from '@interface/components/Loading';
import { RegularAudioQuiz } from '@interface/components/Quizzing/AudioQuiz/RegularAudioQuiz';
import {
  AudioQuizMenu,
  MyTextQuizMenu,
} from '@interface/components/Quizzing/general';
import { RegularTextQuiz } from '@interface/components/Quizzing/TextQuiz';
import { useState } from 'react';

// This seems like a boundary violation: pulling styles from the wrong scope?
import '@interface/components/Quizzing/general/QuizSetupMenu.scss';
import './CombinedCustomQuiz.scss';

const MOBILE_STEP_LABELS: Record<0 | 1 | 2, string> = {
  0: 'Choose Course and Lessons',
  1: 'Choose Tags (or Skip)',
  2: 'Choose Quiz Type',
};

const MOBILE_ACTIVE_SECTION: Record<
  0 | 1 | 2,
  'courseLesson' | 'tags' | 'togglesOnly'
> = {
  0: 'courseLesson',
  1: 'tags',
  2: 'togglesOnly',
};

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

  const [mobileStep, setMobileStep] = useState<0 | 1 | 2>(0);

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

  const countLabel = isLoadingExamples
    ? 'counting flashcards...'
    : `${totalCount ?? 0} flashcard${totalCount === 1 ? '' : 's'} available`;

  return (
    <div
      className="myFlashcardsFormContentWrapper"
      data-mobile-step={mobileStep}
    >
      {!quizReady ? (
        <>
          <h2 className="combinedCustomQuizDesktopTitle">Custom Quiz</h2>

          {/* Mobile-only stepper header */}
          <div className="mobileStepHeader">
            <span className="mobileStepLabel">
              Step {mobileStep + 1} of 3 — {MOBILE_STEP_LABELS[mobileStep]}
            </span>
          </div>

          {/* Filter panel — visible on all steps; CSS controls which column shows */}
          <div className="mobileFilterSection">
            <FilterPanel
              requireAudioOnly={quizType === CombinedCustomQuizType.Audio}
              requireNoSpanglish={quizType === CombinedCustomQuizType.Audio}
              mobileActiveSection={MOBILE_ACTIVE_SECTION[mobileStep]}
            />
          </div>

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

            <div className="buttonBox desktopStartButton">
              <button
                type="submit"
                disabled={quizNotReady}
                onClick={readyQuiz}
                className={`startQuizButton ${quizNotReady ? 'disabled' : ''}`}
              >
                Start Quiz
              </button>
            </div>
            <div className="buttonBox desktopMenuButton">
              <MenuButton />
            </div>
          </form>

          {/* Mobile-only stepper footer */}
          <div className="mobileStepFooter">
            <p className="mobileCountText">{countLabel}</p>

            {mobileStep < 2 ? (
              <button
                type="button"
                className="mobileStepNextButton"
                onClick={() => setMobileStep((prev) => (prev + 1) as 0 | 1 | 2)}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                disabled={quizNotReady}
                onClick={readyQuiz}
                className={`mobileStartQuizButton ${quizNotReady ? 'disabled' : ''}`}
              >
                Start Quiz
              </button>
            )}
            {mobileStep > 0 && (
              <button
                type="button"
                className="mobileStepBackButton"
                onClick={() => setMobileStep((prev) => (prev - 1) as 0 | 1 | 2)}
              >
                ← Back
              </button>
            )}
          </div>
        </>
      ) : quizType === CombinedCustomQuizType.Text ? (
        <RegularTextQuiz textQuizProps={textQuizProps} />
      ) : (
        <RegularAudioQuiz audioQuizProps={audioQuizProps} />
      )}
    </div>
  );
}
