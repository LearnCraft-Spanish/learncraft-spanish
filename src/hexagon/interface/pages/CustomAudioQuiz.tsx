import FlashcardFinderFilter from '@interface/components/FlashcardFinder/FlashcardFinderFilter';
import AudioQuiz from '@interface/components/Quizzing/AudioQuiz/AudioQuiz';
import { AudioQuizMenu } from '@interface/components/Quizzing/general';
import { InlineLoading } from 'src/components/Loading';
import { useCustomAudioQuiz } from 'src/hexagon/application/useCases/useCustomAudioQuiz';
import './CustomAudioQuiz.scss';

export default function CustomAudioQuiz() {
  const {
    audioQuizSetup,
    audioQuizProps,
    quizReady,
    setQuizReady,

    isLoadingExamples,
    errorExamples,
  } = useCustomAudioQuiz();

  return (
    <div className="customAudioQuiz">
      {!quizReady ? (
        <>
          <h2>Audio Quiz</h2>
          <div className="filterSection">
            <FlashcardFinderFilter
              filtersChanging={true}
              setFiltersChanging={() => {}}
              requireAudioOnly={true}
              closeable={false}
            />
          </div>
          {isLoadingExamples ? (
            <div className="loadingWrapper">
              <InlineLoading message="Loading examples..." />
            </div>
          ) : errorExamples ? (
            <div className="errorMessage">Error: {errorExamples.message}</div>
          ) : (
            <div className="audioQuizMenuWrapper">
              <AudioQuizMenu quizSetupOptions={audioQuizSetup} />
              <div className="buttonBox">
                <button type="button" onClick={() => setQuizReady(true)}>
                  Start Quiz
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <AudioQuiz audioQuizProps={audioQuizProps} />
      )}
    </div>
  );
}
