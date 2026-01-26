import { useOfficialQuizAdapter } from '@application/adapters/officialQuizAdapter';
import { useQuery } from '@tanstack/react-query';

export function useQuizExamplesQuery({
  courseCode,
  quizNumber,
}: {
  courseCode: string;
  quizNumber: number;
}) {
  const { getOfficialQuizExamples } = useOfficialQuizAdapter();
  const quizExamplesQuery = useQuery({
    queryKey: ['quizExamples', courseCode, quizNumber],
    queryFn: () => getOfficialQuizExamples({ courseCode, quizNumber }),
    enabled: courseCode !== '' && quizNumber > 0,
  });
  return {
    quizExamples: quizExamplesQuery.data,
    isLoading: quizExamplesQuery.isLoading,
    error: quizExamplesQuery.error,
  };
}
