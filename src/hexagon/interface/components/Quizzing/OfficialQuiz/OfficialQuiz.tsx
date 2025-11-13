import { useOfficialQuiz } from '@application/units/OfficialQuiz/useOfficialQuiz';
import { Loading } from '@interface/components/Loading';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz';
import { useLocation, useNavigate } from 'react-router-dom';
import NotFoundPage from 'src/NotFoundPage';

export function OfficialQuiz() {
  // use useLocation
  const location = useLocation();

  // ["", "officialquizzes", "courseCode", "quizNumber"]
  const relativePath = location.pathname.split('/');
  const courseCode = relativePath[2];

  // get the quiz number from the relative path
  const quizNumber = Number(relativePath[3]);

  // get the examples for the quiz
  const { quizExamples, isLoading, error, quizTitle } = useOfficialQuiz({
    courseCode,
    quizNumber,
  });

  // navigate to the official quizzes page
  const navigate = useNavigate();

  // if the quiz is loading, show a loading message
  if (isLoading) {
    return <Loading message="Loading Quiz..." />;
  }

  // if the quiz is not loading, show the quiz
  if (error) {
    // if the error is a 404, show the not found page
    if ((error as any)?.response?.status === 404) {
      return <NotFoundPage />;
    }
    console.error(error);
    return <h2 className="error">Error Loading Official Quiz</h2>;
  }

  // if the quiz is not loading and there are examples, show the quiz
  if (quizExamples) {
    return (
      <>
        <TextQuiz
          quizTitle={quizTitle}
          textQuizProps={{
            examples: quizExamples,
            startWithSpanish: false,
            cleanupFunction: () => navigate('/officialquizzes'),
          }}
        />
      </>
    );
  }

  // if the quiz is not loading and there are no examples, show an error message
  return <div>Error Loading Official Quiz</div>;
}
