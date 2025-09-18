import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { MenuButton } from '@interface/components/general/Buttons';
export default function TextQuizEnd({
  isSrsQuiz,
  restartQuiz,
  returnToQuizSetup,
}: {
  isSrsQuiz: boolean;
  restartQuiz: () => void;
  returnToQuizSetup: () => void;
}) {
  const { flashcardsDueForReview } = useStudentFlashcards();

  return (
    <div className="srsQuizEndWrapper">
      <h2>{isSrsQuiz ? 'SRS Quiz Complete!' : 'Quiz Complete!'}</h2>
      <p>Congratulations! You've completed the quiz.</p>
      {isSrsQuiz ? (
        flashcardsDueForReview && flashcardsDueForReview.length > 0 ? (
          <p>
            It looks like you have{' '}
            <b>{flashcardsDueForReview?.length} flashcards</b> that are still
            due for review. Click "Return to Quiz Setup" to start a new SRS
            quiz.
          </p>
        ) : (
          <p>
            It looks like you've completed all the flashcards that are due for
            review. Come back tomorrow for another review!
          </p>
        )
      ) : (
        <p>
          If you would like to retake the quiz, click{' '}
          <button type="button" onClick={() => restartQuiz()}>
            Restart Quiz
          </button>
        </p>
      )}

      <p>
        If you would like to create a new quiz, click{' '}
        <button type="button" onClick={() => returnToQuizSetup()}>
          Return to Quiz Setup
        </button>
      </p>
      <div className="buttonBox">
        <MenuButton />
      </div>
    </div>
  );
}
