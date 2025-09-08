import { preSetQuizzes } from '@domain/preSetQuizzes';

export default function CustomPreSetQuizzes({
  handleSetQuizObject,
}: {
  handleSetQuizObject: (quiz: (typeof preSetQuizzes)[0]) => void;
}) {
  return (
    <div className="customPreSetQuizzes">
      {preSetQuizzes.map((quiz) => (
        <button
          type="button"
          className="customPreSetQuiz"
          key={quiz.quizTitle}
          onClick={() => handleSetQuizObject(quiz)}
        >
          {quiz.quizTitle}
        </button>
      ))}
    </div>
  );
}
