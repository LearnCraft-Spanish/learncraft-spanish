import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';

import { useQuizMyFlashcards } from '@application/useCases/useQuizMyFlashcards';
import {
  QuizSetupMenu,
  SrsQuiz,
  TextQuiz,
} from '@interface/components/Quizzing';
import { useCallback, useState } from 'react';
import { Loading } from 'src/components/Loading';
import NoFlashcards from 'src/components/NoFlashcards';
export default function MyFlashcardsQuiz() {
  const [examplesForQuiz, setExamplesForQuiz] = useState<
    ExampleWithVocabulary[]
  >([]);
  const {
    myFlashcardsLoading: isLoading,
    myFlashcardsError: error,

    quizSetupOptions,
    quizReady,
    setupQuiz,
  } = useQuizMyFlashcards();

  const { maximumQuizLength, quizSettings } = quizSetupOptions;
  const startQuiz = useCallback(() => {
    const examples = setupQuiz();
    if (!examples) {
      console.error('No examples found in SetupQuiz function');
      return;
    }
    setExamplesForQuiz(examples);
  }, [setupQuiz]);

  // const { flashcards } = useStudentFlashcards();
  if (error) {
    return <h2>Error Loading Flashcards</h2>;
  }
  if (isLoading) {
    return <Loading message="Loading Flashcard Data..." />;
  }

  return (
    <div>
      {maximumQuizLength === 0 && <NoFlashcards />}
      {!quizReady && (
        <QuizSetupMenu
          quizSetupOptions={quizSetupOptions}
          startQuiz={startQuiz}
        />
      )}
      {quizReady &&
        quizSettings.quizType === 'text' &&
        quizSettings.srsQuiz && (
          <SrsQuiz
            examples={examplesForQuiz}
            startWithSpanish={quizSetupOptions.quizSettings.startWithSpanish}
          />
        )}
      {quizReady &&
        quizSettings.quizType === 'text' &&
        !quizSettings.srsQuiz && (
          <TextQuiz
            examples={examplesForQuiz}
            startWithSpanish={quizSetupOptions.quizSettings.startWithSpanish}
          />
        )}
      {/*<Routes>
        <Route path="/" element={<Navigate to="/quiz" />} />
        <Route
          path="quiz"
          element={
            quizReady && (
              <QuizComponent
                examples={examplesForQuiz}
                startWithSpanish={
                  quizSetupOptions.quizSettings.startWithSpanish
                }
              />
            )
          }
        />
        <Route
          path="srsquiz"
          element={
            quizReady && (
              <QuizComponent
                examples={examplesForQuiz}
                startWithSpanish={
                  quizSetupOptions.quizSettings.startWithSpanish
                }
              />
            )
          }
        />

        <Route
          path="audio"
          element={
            flashcards && (
              <AudioQuiz
                examplesToParse={flashcards.filter(
                  (example) => example.example.englishAudio?.length,
                )}
                quizTitle={
                  audioQuizVariant === 'speaking'
                    ? 'My Speaking Quiz'
                    : 'My Listening Quiz'
                }
                autoplay={autoplay}
                audioOrComprehension={audioQuizVariant}
                cleanupFunction={() => setQuizReady(false)}
                quizLength={quizLength}
                myFlashcardsQuiz
              />
            )
          }
        />
      </Routes> */}
    </div>
  );
}
