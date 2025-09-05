import { useOfficialQuiz } from '@application/units/OfficialQuiz/useOfficialQuiz';
import { useLocation, useNavigate } from 'react-router-dom';
import NotFoundPage from 'src/NotFoundPage';
import { Loading } from '../Loading';
import { TextQuiz } from './TextQuiz';
export function OfficialQuiz() {
  // use useLocation
  const location = useLocation();
  const relativePath = location.pathname.split('/');
  // ["", "officialquizzes", "courseCode", "quizNumber"]
  const courseCode = relativePath[2];
  const quizNumber = Number(relativePath[3]);
  const { quizExamples, isLoading, error, quizTitle } = useOfficialQuiz({
    courseCode,
    quizNumber,
  });
  const navigate = useNavigate();

  if (isLoading) {
    return <Loading message="Loading Quiz..." />;
  }
  if (error) {
    if ((error as any)?.response?.status === 404) {
      return <NotFoundPage />;
    }
    console.error(error);
    return <h2 className="error">Error Loading Official Quiz</h2>;
  }
  if (quizExamples) {
    return (
      <>
        <TextQuiz
          quizTitle={quizTitle}
          examples={quizExamples}
          cleanupFunction={() => navigate('/officialquizzes')} // navigate back to the quiz setup menu
          startWithSpanish={false}
        />
      </>
    );
  }

  return <div>Error Loading Official Quiz</div>;
}
