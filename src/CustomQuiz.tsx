import { Route, Routes } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useVerifiedExamples } from './hooks/useVerifiedExamples';
import { useVocabulary } from './hooks/useVocabulary';
import { useFlashcardFilter } from './hooks/useFlashcardFilter';

import Loading from './components/Loading';
import useNavigatePreserveQuery from './hooks/useNavigatePreserveQuery';
import Filter from './components/FlashcardFinder/Filter';
import QuizComponent from './components/Quiz/QuizComponent';

// This script displays the Database Tool (Example Retriever), where coaches can lookup example sentences on the database by vocab word
const CustomQuiz = () => {
  const verifiedExamplesQuery = useVerifiedExamples();
  const { vocabularyQuery } = useVocabulary();
  const { filterFlashcards } = useFlashcardFilter();
  const navigate = useNavigatePreserveQuery();

  const [showMenu, setShowMenu] = useState(true);

  const isError = verifiedExamplesQuery.isError || vocabularyQuery.isError;
  const dataLoaded =
    verifiedExamplesQuery.isSuccess && vocabularyQuery.isSuccess;
  const isLoading =
    (verifiedExamplesQuery.isLoading || vocabularyQuery.isLoading) &&
    !isError &&
    !dataLoaded;

  const availableExamplesCount = useMemo(() => {
    if (!verifiedExamplesQuery.data) {
      return 0;
    }
    const filteredExamples = filterFlashcards(verifiedExamplesQuery.data);
    return filteredExamples.length;
  }, [verifiedExamplesQuery.data, filterFlashcards]);

  function readyQuiz() {
    navigate('flashcards');
    setShowMenu(false);
  }

  function unreadyQuiz() {
    setShowMenu(true);
  }

  return (
    <div className="flashcardFinder">
      {isError && (
        <div>
          <h2>Error Loading Flashcards</h2>
        </div>
      )}
      {isLoading && (
        <div>
          <Loading message="Loading Flashcard Data..." />
        </div>
      )}
      {dataLoaded && (
        <>
          {showMenu && (
            <div>
              <div className="flashcardFinderHeader">
                <h2>Setup Custom Quiz</h2>
                <Filter />
              </div>
              {availableExamplesCount ? (
                <div className="buttonBox">
                  <button type="button" onClick={readyQuiz}>
                    Start Custom Quiz
                  </button>
                </div>
              ) : (
                <div className="buttonBox">
                  <button className="disabledButton" type="button">
                    Start Custom Quiz
                  </button>
                </div>
              )}
              <h4>{availableExamplesCount} examples available</h4>
            </div>
          )}
          <Routes>
            <Route
              path="flashcards"
              element={
                <QuizComponent
                  examplesToParse={verifiedExamplesQuery.data}
                  quizTitle={'Custom Quiz'}
                  respectFilters
                  cleanupFunction={unreadyQuiz}
                />
              }
            />
          </Routes>
        </>
      )}
    </div>
  );
};

export default CustomQuiz;
