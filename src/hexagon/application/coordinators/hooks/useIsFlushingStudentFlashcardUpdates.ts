import IsFlushingStudentFlashcardUpdatesContext from '@application/coordinators/contexts/IsFlushingStudentFlashcardUpdates';
import { use } from 'react';

export function useIsFlushingStudentFlashcardUpdates() {
  const context = use(IsFlushingStudentFlashcardUpdatesContext);
  if (!context) {
    throw new Error(
      'useIsFlushingStudentFlashcardUpdates must be used within a IsFlushingStudentFlashcardUpdatesProvider',
    );
  }
  return context;
}
