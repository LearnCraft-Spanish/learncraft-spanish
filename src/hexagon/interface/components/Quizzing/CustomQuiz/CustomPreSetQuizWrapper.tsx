import { useCustomPreSetQuizQuery } from '@application/queries/useCustomPreSetQuizQuery';
import { TextQuiz } from '../TextQuiz/TextQuiz';

export default function CustomPreSetQuizWrapper({
  quizTitle,
  quizSkillTagKeys,

  cleanupFunction,
}: {
  quizTitle: string;
  quizSkillTagKeys: string[];
  cleanupFunction: () => void;
}) {
  const { quizExamples, isLoading, error } = useCustomPreSetQuizQuery({
    quizTitle,
    quizSkillTagKeys,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!quizExamples) {
    return <div>No examples found</div>;
  }

  return (
    <div className="customPreSetQuizWrapper">
      <TextQuiz
        textQuizProps={{
          examples: quizExamples,
          startWithSpanish: false,
          cleanupFunction,
        }}
      />
    </div>
  );
}
