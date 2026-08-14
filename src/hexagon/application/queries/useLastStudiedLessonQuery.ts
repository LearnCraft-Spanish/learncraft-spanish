import type { LastStudiedLessonRecord } from '@domain/lastStudiedLesson/types';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useLastStudiedLessonAdapter } from '@application/adapters/lastStudiedLessonAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export interface RecordLastStudiedLessonInput {
  courseId: number;
  lessonNumber: number;
}

export interface UseLastStudiedLessonQueryReturn {
  lastStudiedLesson: LastStudiedLessonRecord | null;
  isLoading: boolean;
  error: Error | null;
  recordLastStudiedLesson: (
    input: RecordLastStudiedLessonInput,
  ) => Promise<void>;
}

export function useLastStudiedLessonQuery(): UseLastStudiedLessonQueryReturn {
  const { getLastStudiedLesson, setLastStudiedLesson } =
    useLastStudiedLessonAdapter();
  const { authUser } = useAuthAdapter();
  const { isOwnUser } = useActiveStudent();
  const queryClient = useQueryClient();

  // Auth0 email is available for every logged-in user, including free users
  // who have no postgres record and therefore no appUser.recordId.
  const email = authUser?.email;
  const queryKey = ['lastStudiedLesson', email];

  const fetchLastStudiedLesson = useCallback(async () => {
    if (!email) {
      return null;
    }
    return await getLastStudiedLesson(email);
  }, [email, getLastStudiedLesson]);

  const lastStudiedLessonQuery = useQuery({
    queryKey,
    queryFn: fetchLastStudiedLesson,
    enabled: isOwnUser && !!email,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: async ({
      courseId,
      lessonNumber,
    }: RecordLastStudiedLessonInput) => {
      if (!email) {
        return null;
      }
      return await setLastStudiedLesson({ email, courseId, lessonNumber });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const { mutateAsync } = mutation;

  const recordLastStudiedLesson = useCallback(
    async (input: RecordLastStudiedLessonInput) => {
      // Never record progress on behalf of a student a coach is viewing
      if (!isOwnUser || !email) {
        return;
      }
      await mutateAsync(input);
    },
    [isOwnUser, email, mutateAsync],
  );

  return {
    lastStudiedLesson: lastStudiedLessonQuery.data ?? null,
    isLoading: lastStudiedLessonQuery.isLoading,
    error: lastStudiedLessonQuery.error,
    recordLastStudiedLesson,
  };
}
