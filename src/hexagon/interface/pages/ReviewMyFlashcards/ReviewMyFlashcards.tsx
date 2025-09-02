import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';

import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { useQuizMyFlashcards } from '@application/useCases/useQuizMyFlashcards';
import { MenuButton } from '@interface/components/general/Buttons';
import { Loading } from '@interface/components/Loading';
import {
  QuizSetupMenu,
  SrsQuiz,
  TextQuiz,
} from '@interface/components/Quizzing';
import { useCallback, useState } from 'react';
import './ReviewMyFlashcards.scss';

export default function MyFlashcardsQuiz() {
  const [examplesForQuiz, setExamplesForQuiz] = useState<
    ExampleWithVocabulary[]
  >([]);
  const {
    isLoading,
    myFlashcardsError: error,

    quizSetupOptions,
    quizReady,
    setQuizReady,
    setupQuiz,
  } = useQuizMyFlashcards();

  // This is only used to display the "No Flashcards Found" message, if student has no flashcards
  const { flashcards } = useStudentFlashcards();

  const { quizSettings } = quizSetupOptions;

  // const navigateToQuiz = useCallback(() => {
  //   if (quizSettings.quizType === 'audio') {
  //     navigate('./audio');
  //   } else if (quizSettings.quizType === 'text') {
  //     if (quizSettings.srsQuiz) {
  //       navigate('./srsquiz');
  //     } else {
  //       navigate('./quiz');
  //     }
  //   }
  // }, [quizSettings.quizType, quizSettings.srsQuiz, navigate]);

  const startQuiz = useCallback(() => {
    const examples = setupQuiz();
    if (!examples) {
      console.error('No examples found in SetupQuiz function');
      return;
    }
    setExamplesForQuiz(examples);
  }, [setupQuiz]);

  if (error) {
    return <h2>Error Loading Flashcards</h2>;
  }
  if (isLoading) {
    return <Loading message="Loading Flashcard Data..." />;
  }

  return (
    <div>
      {flashcards?.length === 0 && (
        <div className="noFlashcardsWrapper">
          <h2>No Flashcards Found</h2>
          <p>It seems you have not collected any flashcards yet.</p>
          <p>
            You can collect flashcards by clicking the "add to my flashcards"
            button (located on the back of a flashcard) during a quiz, or by
            using the "Find Flashcards" page to search for flashcards to add to
            your collection.
          </p>
          <div className="buttonBox">
            <MenuButton />
          </div>
        </div>
      )}
      {!quizReady ? (
        <QuizSetupMenu
          quizSetupOptions={quizSetupOptions}
          startQuiz={startQuiz}
        />
      ) : quizSettings.quizType === 'text' ? (
        quizSettings.srsQuiz ? (
          <SrsQuiz
            examples={examplesForQuiz}
            startWithSpanish={quizSetupOptions.quizSettings.startWithSpanish}
            cleanupFunction={() => setQuizReady(false)}
          />
        ) : (
          <TextQuiz
            examples={examplesForQuiz}
            startWithSpanish={quizSetupOptions.quizSettings.startWithSpanish}
            cleanupFunction={() => setQuizReady(false)}
          />
        )
      ) : (
        // ) : quizSettings.quizType === 'audio' ? (
        <div>Audio Quiz Not Implemented. Please come back Later :D</div>
      )}
    </div>
  );
}
