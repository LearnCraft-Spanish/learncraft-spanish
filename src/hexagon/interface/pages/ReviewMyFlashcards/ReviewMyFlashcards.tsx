import {
  MyFlashcardsQuizType,
  useQuizMyFlashcards,
} from '@application/useCases/useQuizMyFlashcards';
import { CloseableFilterPanel } from '@interface/components/Filters';
import { MenuButton } from '@interface/components/general/Buttons';
import { Loading } from '@interface/components/Loading';
import {
  AudioQuizMenu,
  MyTextQuizMenu,
  SrsQuiz,
} from '@interface/components/Quizzing';
import { SrsAudioQuiz } from '@interface/components/Quizzing/AudioQuiz/SrsAudioQuiz';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
// import { Tooltip } from '../../components/Tooltip';
import '@interface/components/Quizzing/general/QuizSetupMenu.scss';
import './ReviewMyFlashcards.scss';

export default function MyFlashcardsQuiz() {
  const location = useLocation();
  const navigate = useNavigate();

  // Check for URL parameter to enable filtering by default
  const searchParams = new URLSearchParams(location.search);
  const enableFiltering = searchParams.get('enableFiltering') === 'true';

  const {
    filterOwnedFlashcards,
    setFilterOwnedFlashcards,
    audioQuizSetup,
    textQuizSetup,
    exampleFilter,
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
    totalCount,
  } = useQuizMyFlashcards({
    initialFilterOwnedFlashcards: enableFiltering,
  });

  // Clean up URL parameter after initialization
  useEffect(() => {
    if (enableFiltering) {
      // Remove the parameter from the URL without causing a page refresh
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete('enableFiltering');
      const newSearch = newSearchParams.toString();
      const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      navigate(newUrl, { replace: true });
    }
  }, [enableFiltering, location.pathname, location.search, navigate]);

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
        <>
          <h2>Review My Flashcards</h2>
          <CloseableFilterPanel
            isOpen={filterOwnedFlashcards}
            setIsOpen={setFilterOwnedFlashcards}
            requireNoSpanglish={quizType === MyFlashcardsQuizType.Audio}
            requireAudioOnly={quizType === MyFlashcardsQuizType.Audio}
          />
          <form
            className="myFlashcardsForm"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="myFlashcardsFormContentWrapper">
              <h4>Quiz Options:</h4>
              <div className="quizSettingsWrapper">
                <div className="quizSettingsHeader twoOptions">
                  <a
                    data-tooltip-id="quizType"
                    className={`option ${
                      quizType === MyFlashcardsQuizType.Text ? 'selected' : ''
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setQuizType(MyFlashcardsQuizType.Text);
                    }}
                  >
                    <label htmlFor="quizType">
                      Flashcards
                      <input
                        type="radio"
                        id="quizType"
                        value="text"
                        name="quizType"
                      />
                    </label>
                  </a>
                  <Tooltip id="quizType" style={{ maxWidth: '350px' }}>
                    <h3 style={{ color: 'white' }}>
                      Flashcard Quizzing Settings
                    </h3>
                    <p>
                      SRS Quiz: SRS is a study technique that stands for Spaced
                      Repetition System. It is a technique that helps you
                      remember information by repeating it over time at
                      increasing intervals.
                    </p>
                  </Tooltip>
                  <a
                    data-tooltip-id="audioQuizType"
                    className={`option ${
                      quizType === MyFlashcardsQuizType.Audio ? 'selected' : ''
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setQuizType(MyFlashcardsQuizType.Audio);
                    }}
                  >
                    <label htmlFor="audio">
                      Audio
                      <input
                        type="radio"
                        id="audio"
                        value="audio"
                        name="quizType"
                      />
                    </label>
                  </a>
                  <Tooltip id="audioQuizType" style={{ maxWidth: '350px' }}>
                    <h3 style={{ color: 'white' }}>Audio Quizzing Settings</h3>
                    <p>
                      Speaking Quiz: This quiz helps you practice speaking in
                      Spanish.
                    </p>
                    <p>
                      Listening Quiz: This quiz helps you practice listening to
                      Spanish.
                    </p>
                    <p>
                      Autoplay: This option allows the quiz to progress
                      automatically.
                    </p>
                  </Tooltip>
                </div>
                {quizType === MyFlashcardsQuizType.Text && (
                  <MyTextQuizMenu
                    quizSetupOptions={textQuizSetup}
                    filteringIsLoading={exampleFilter.isLoading}
                    totalCount={totalCount}
                  />
                )}
                {quizType === MyFlashcardsQuizType.Audio && (
                  <AudioQuizMenu
                    quizSetupOptions={audioQuizSetup}
                    filteringIsLoading={exampleFilter.isLoading}
                    totalCount={totalCount}
                  />
                )}
              </div>
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
        </>
      ) : quizType === MyFlashcardsQuizType.Text ? (
        <SrsQuiz
          textQuizProps={textQuizProps}
          showSrsButtons={textQuizSetup.srsQuiz} // what actually determines if its an srs quiz!
        />
      ) : (
        <SrsAudioQuiz audioQuizProps={audioQuizProps} />
      )}
    </div>
  );
}
