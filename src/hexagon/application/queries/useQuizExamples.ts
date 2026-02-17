import { useQuizAdapter } from '@application/adapters/quizAdapter';
import { useQuery } from '@tanstack/react-query';
export function useQuizExamples({
  quizId,
  vocabularyComplete,
}: {
  quizId: number;
  vocabularyComplete?: boolean;
}) {
  const { getQuizExamples } = useQuizAdapter();
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['quizExamples', quizId],
    queryFn: () => getQuizExamples({ quizId, vocabularyComplete }),
    enabled: !!quizId,
  });
  return { data, isLoading, error, isFetching };
}
