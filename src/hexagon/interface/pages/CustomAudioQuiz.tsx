import FlashcardFinderFilter from '@interface/components/FlashcardFinder/FlashcardFinderFilter';
import { ToggleSwitch } from '@interface/components/general';
import AudioQuiz from '@interface/components/Quizzing/AudioQuiz/AudioQuiz';
import { InlineLoading } from 'src/components/Loading';
import { useCustomAudioQuiz } from 'src/hexagon/application/useCases/useCustomAudioQuiz';
import { AudioQuizType } from 'src/hexagon/domain/audioQuizzing';
import '@interface/components/Quizzing/general/QuizSetupMenu.scss';
import './CustomAudioQuiz.scss';
import '@interface/styles/QuizSetupMenu.scss';

export default function CustomAudioQuiz() {
  const {
    audioQuizSetup,
    audioQuizProps,
    quizReady,
    setQuizReady,

    isLoadingExamples,
    errorExamples,
    totalCount,
  } = useCustomAudioQuiz();

  const {
    audioQuizType,
    autoplay,
    setAudioQuizType,
    setAutoplay,
    selectedQuizLength,
    setSelectedQuizLength,
    availableQuizLengths,
  } = audioQuizSetup;

  return (
    <div>
      {!quizReady ? (
        <div className="CustomAudioQuizWrapper">
          <h2>Audio Quiz</h2>
          <FlashcardFinderFilter
            filtersChanging={true}
            setFiltersChanging={() => {}}
            requireAudioOnly={true}
            closeable={false}
          />
          {errorExamples ? (
            <div className="errorMessage">Error: {errorExamples.message}</div>
          ) : (
            <div className="customQuizSettingsWrapper quizSettingsWrapper">
              <div className="quizSettingsHeader titleOnly">Audio Quiz</div>

              <div className="quizSettingsBody">
                <label className="menuRow dropdown">
                  Quiz Type:
                  <select
                    value={audioQuizType}
                    onChange={(e) =>
                      setAudioQuizType(e.target.value as AudioQuizType)
                    }
                  >
                    <option value={AudioQuizType.Speaking.toString()}>
                      Speaking
                    </option>
                    <option value={AudioQuizType.Listening.toString()}>
                      Listening
                    </option>
                  </select>
                </label>
                <div className="menuRow">
                  <ToggleSwitch
                    id="autoplay"
                    ariaLabel="Autoplay"
                    label="Autoplay"
                    checked={autoplay}
                    onChange={() => setAutoplay(!autoplay)}
                  />
                </div>
                {isLoadingExamples ? (
                  <InlineLoading message="Loading examples..." />
                ) : (
                  <>
                    <label className="menuRow dropdown">
                      Quiz Length:
                      <select
                        onChange={(e) =>
                          setSelectedQuizLength(Number.parseInt(e.target.value))
                        }
                        value={selectedQuizLength}
                      >
                        {availableQuizLengths.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="menuRow">
                      <p className="totalCount">{`${totalCount} examples found`}</p>
                    </div>
                  </>
                )}
                <div className="buttonBox">
                  <button
                    onClick={() => setQuizReady(true)}
                    type="button"
                    className={`startQuizButton ${totalCount === 0 ? 'disabled' : ''}`}
                    disabled={totalCount === 0}
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <AudioQuiz audioQuizProps={audioQuizProps} />
      )}
    </div>
  );
}
