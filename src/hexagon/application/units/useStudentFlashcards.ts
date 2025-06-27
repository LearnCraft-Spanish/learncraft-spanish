import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { showSuccessToast } from 'src/functions/showToast';
import { useFlashcardAdapter } from '../adapters/flashcardAdapter';
import { useActiveStudent } from '../coordinators/hooks/useActiveStudent';
export function useStudentFlashcards(studentId: number | undefined) {
  const { appUser, isOwnUser } = useActiveStudent();
  const adapter = useFlashcardAdapter();

  const getFlashcards = useCallback(() => {
    if (isOwnUser) {
      return adapter.getMyFlashcards();
    }
    return adapter.getStudentFlashcards(studentId!);
  }, [studentId, adapter, isOwnUser]);

  const {
    data: flashcards,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['studentFlashcards', studentId],
    queryFn: getFlashcards,
    enabled: !!appUser,
  });

  const createStudentExample = useMutation({
    mutationFn: async (exampleId: number) => {
      const response = await adapter.createStudentExample({
        studentId: studentId!,
        exampleId,
      });
      return response;
    },
    onSuccess: (_data, _variables, _context) => {
      showSuccessToast('Flashcard added successfully');
      refetch();
    },
  });

  const deleteStudentExample = useMutation({
    mutationFn: async (studentExampleId: number) => {
      const response = await adapter.deleteStudentExample(studentExampleId);
      return response;
    },
    onSuccess: (_data, _variables, _context) => {
      showSuccessToast('Flashcard deleted successfully');
      refetch();
    },
  });

  // This lets us know if a flashcard is collected or not
  // helpful when comparing against a list of examples (flashcard manager/finder)
  const collectedFlashcardsIds = useMemo(() => {
    return flashcards?.map((flashcard) => flashcard.id);
  }, [flashcards]);

  const isFlashcardCollected = useCallback(
    (flashcardId: number) => {
      return collectedFlashcardsIds?.includes(flashcardId);
    },
    [collectedFlashcardsIds],
  );

  return {
    flashcards,
    isLoading,
    error,
    isFlashcardCollected,
    createStudentExample,
    deleteStudentExample,
  };
}
