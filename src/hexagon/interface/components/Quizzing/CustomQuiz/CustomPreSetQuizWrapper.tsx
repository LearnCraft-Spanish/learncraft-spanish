import { useCustomPreSetQuizQuery } from '@application/queries/useCustomPreSetQuizQuery';
import { Loading } from '@interface/components/Loading';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz/TextQuiz';

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
    return <Loading message="Loading..." />;
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
