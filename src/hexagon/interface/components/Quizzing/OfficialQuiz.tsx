import { useOfficialQuiz } from '@application/units/OfficialQuiz/useOfficialQuiz';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loading } from '../Loading';
import { TextQuiz } from './TextQuiz';
export function OfficialQuiz() {
  // use useLocation
  const location = useLocation();
  const navigate = useNavigate();
  // grab the quizNumber & courseCode from the url
  const result = location.pathname.split('/');
  const courseCode = result[2];
  const quizNumber = Number(result[3]);
  const { quizExamples, isLoading, error, quizTitle } = useOfficialQuiz({
    courseCode,
    quizNumber,
  });

  if (isLoading) {
    return <Loading message="Loading Quiz..." />;
  }
  if (error) {
    return <h2 className="error">Error Loading Official Quiz</h2>;
  }
  if (quizExamples) {
    return (
      <>
        <TextQuiz
          quizTitle={quizTitle}
          examples={quizExamples}
          cleanupFunction={() => {
            navigate('/officialquizzes');
          }} // navigate back to the quiz setup menu
          startWithSpanish={false}
        />
      </>
    );
  }

  return <div>Error Loading Official Quiz</div>;
}
