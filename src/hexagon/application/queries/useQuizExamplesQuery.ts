import { useQuizAdapter } from '@application/adapters/quizAdapter';
import { useQuery } from '@tanstack/react-query';

export function useQuizExamplesQuery({
  courseCode,
  quizNumber,
}: {
  courseCode: string;
  quizNumber: number;
}) {
  const { getOfficialQuizExamples } = useQuizAdapter();
  const quizExamplesQuery = useQuery({
    queryKey: ['quizExamples', courseCode, quizNumber],
    queryFn: () => getOfficialQuizExamples({ courseCode, quizNumber }),
  });
  return {
    quizExamples: quizExamplesQuery.data,
    isLoading: quizExamplesQuery.isLoading,
    error: quizExamplesQuery.error,
  };
}
