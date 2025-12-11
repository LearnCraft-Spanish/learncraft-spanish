import { useOfficialQuizAdapter } from '@application/adapters/officialQuizAdapter';
import { useQuery } from '@tanstack/react-query';

export interface UseSearchByQuizResultsParams {
  courseCode: string;
  quizNumber: number | undefined;
}

export function useSearchByQuizResults({
  courseCode,
  quizNumber,
}: UseSearchByQuizResultsParams) {
  const { getOfficialQuizExamples } = useOfficialQuizAdapter();
  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['examples', 'by quiz', courseCode, quizNumber],
    queryFn: () =>
      getOfficialQuizExamples({ courseCode, quizNumber: quizNumber! }),
    enabled: !!courseCode && !!quizNumber,
  });

  return {
    examples: results,
    isLoading,
    error: error ?? null,
  };
}
