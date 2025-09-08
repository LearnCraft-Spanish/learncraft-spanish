import {
  MyFlashcardsQuizType,
  useQuizMyFlashcards,
} from '@application/useCases/useQuizMyFlashcards';
import { MenuButton } from '@interface/components/general/Buttons';
import { Loading } from '@interface/components/Loading';
import {
  MyAudioQuizMenu,
  MyTextQuizMenu,
  SrsQuiz,
  TextQuiz,
} from '@interface/components/Quizzing';
import AudioQuiz from '@interface/components/Quizzing/AudioQuiz/AudioQuiz';
import FlashcardManagerFilters from '../../components/FlashcardManager/FlashcardManagerFilters';
import '@interface/components/Quizzing/general/QuizSetupMenu.scss';
import './ReviewMyFlashcards.scss';

export default function MyFlashcardsQuiz() {
  const {
    filtersEnabled,
    setFiltersEnabled,
    exampleFilter,
    audioQuizSetup,
    textQuizSetup,
    audioQuizProps,
    textQuizProps,
    quizType,
    setQuizType,
    quizReady,
    quizNotReady,
    readyQuiz,
    noFlashcards,
    isLoading,
    error,
  } = useQuizMyFlashcards();

  const { filterState, skillTagSearch } = exampleFilter;

  if (error) {
    return <h2>Error Loading Flashcards</h2>;
  }
  if (isLoading) {
    return <Loading message="Loading Flashcard Data..." />;
  }

  if (noFlashcards) {
    return (
      <div className="noFlashcardsWrapper">
        <h2>No Flashcards Found</h2>
        <p>It seems you have not collected any flashcards yet.</p>
        <p>
          You can collect flashcards by clicking the "add to my flashcards"
          button (located on the back of a flashcard) during a quiz, or by using
          the "Find Flashcards" page to search for flashcards to add to your
          collection.
        </p>
        <div className="buttonBox">
          <MenuButton />
        </div>
      </div>
    );
  }

  return (
    <div>
      {!quizReady ? (
        <form
          className="myFlashcardsForm"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <FlashcardManagerFilters
            filterState={filterState}
            skillTagSearch={skillTagSearch}
            filtersEnabled={filtersEnabled}
            toggleFilters={() => setFiltersEnabled(!filtersEnabled)}
          />
          <div className="myFlashcardsFormContentWrapper">
            <h3>Review My Flashcards</h3>
            <h4>Quiz Type:</h4>
            <div className="buttonBox header">
              <input type="radio" id="quizType" value="text" name="quizType" />
              <label
                htmlFor="quizType"
                className={
                  quizType === MyFlashcardsQuizType.Text ? 'selected' : ''
                }
                onClick={() => setQuizType(MyFlashcardsQuizType.Text)}
              >
                Text
              </label>
              <input type="radio" id="audio" value="audio" name="quizType" />
              <label
                htmlFor="audio"
                className={
                  quizType === MyFlashcardsQuizType.Audio ? 'selected' : ''
                }
                onClick={() => setQuizType(MyFlashcardsQuizType.Audio)}
              >
                Audio
              </label>
            </div>
            {quizType === MyFlashcardsQuizType.Text && (
              <MyTextQuizMenu quizSetupOptions={textQuizSetup} />
            )}
            {quizType === MyFlashcardsQuizType.Audio && (
              <MyAudioQuizMenu quizSetupOptions={audioQuizSetup} />
            )}
          </div>
          <div className="buttonBox">
            <button type="submit" disabled={quizNotReady} onClick={readyQuiz}>
              Start Quiz
            </button>
          </div>
          <div className="buttonBox">
            <MenuButton />
          </div>
        </form>
      ) : quizType === MyFlashcardsQuizType.Text ? (
        textQuizSetup.srsQuiz ? (
          <SrsQuiz textQuizProps={textQuizProps} />
        ) : (
          <TextQuiz textQuizProps={textQuizProps} />
        )
      ) : (
        <AudioQuiz audioQuizProps={audioQuizProps} />
      )}
    </div>
  );
}
