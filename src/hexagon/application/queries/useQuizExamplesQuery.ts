import { useOfficialQuizAdapter } from '@application/adapters/officialQuizAdapter';
import { useQuery } from '@tanstack/react-query';

export function useQuizExamplesQuery({
  courseCode,
  quizNumber,
  ignoreCache = false,
}: {
  courseCode: string;
  quizNumber: number;
  ignoreCache?: boolean;
}) {
  const { getOfficialQuizExamples } = useOfficialQuizAdapter();
  const quizExamplesQuery = useQuery({
    queryKey: ['quizExamples', courseCode, quizNumber],
    queryFn: () =>
      getOfficialQuizExamples({ courseCode, quizNumber, ignoreCache }),
    enabled: courseCode !== '' && quizNumber > 0,
  });
  return {
    quizExamples: quizExamplesQuery.data,
    isLoading: quizExamplesQuery.isLoading,
    isFetching: quizExamplesQuery.isFetching,
    error: quizExamplesQuery.error,
  };
}
