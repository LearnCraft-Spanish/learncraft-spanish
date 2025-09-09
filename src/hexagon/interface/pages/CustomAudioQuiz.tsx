import FlashcardFinderFilter from '@interface/components/FlashcardFinder/FlashcardFinderFilter';
import AudioQuiz from '@interface/components/Quizzing/AudioQuiz/AudioQuiz';
import { AudioQuizMenu } from '@interface/components/Quizzing/general';
import { InlineLoading } from 'src/components/Loading';
import { useCustomAudioQuiz } from 'src/hexagon/application/useCases/useCustomAudioQuiz';
import '@interface/components/Quizzing/general/QuizSetupMenu.scss';
import './CustomAudioQuiz.scss';

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

  return (
    <div>
      {!quizReady ? (
        <>
          <h2>Audio Quiz</h2>
          <FlashcardFinderFilter
            filtersChanging={true}
            setFiltersChanging={() => {}}
            requireAudioOnly={true}
            closeable={false}
          />
          {isLoadingExamples ? (
            <div className="loadingWrapper">
              <InlineLoading message="Loading examples..." />
            </div>
          ) : errorExamples ? (
            <div className="errorMessage">Error: {errorExamples.message}</div>
          ) : (
            <form
              className="myFlashcardsForm"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <h4>Quiz Options:</h4>
              <div className="myFlashcardsFormContentWrapper">
                <AudioQuizMenu quizSetupOptions={audioQuizSetup} />
                <div className="buttonBox">
                  {!(totalCount && totalCount > 0) ? (
                    <p>There are no audio examples for this lesson range</p>
                  ) : (
                    <p>{`${totalCount} examples found`}</p>
                  )}
                </div>
              </div>
              <div className="buttonBox">
                <button type="submit" onClick={() => setQuizReady(true)}>
                  Start Quiz
                </button>
              </div>
            </form>
          )}
        </>
      ) : (
        <AudioQuiz audioQuizProps={audioQuizProps} />
      )}
    </div>
  );
}
