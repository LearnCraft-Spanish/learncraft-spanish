import { preSetQuizzes } from 'src/hexagon/application/units/Filtering/FilterPresets/preSetQuizzes';

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
          key={quiz.preset}
          onClick={() => handleSetQuizObject(quiz)}
        >
          {quiz.preset}
        </button>
      ))}
    </div>
  );
}
