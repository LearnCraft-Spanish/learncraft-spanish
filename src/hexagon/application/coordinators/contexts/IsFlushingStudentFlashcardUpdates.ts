import { createContext } from 'react';

interface IsFlushingStudentFlashcardUpdatesContextType {
  isFlushing: boolean;
  setIsFlushing: (isFlushing: boolean) => void;
}

const IsFlushingStudentFlashcardUpdatesContext =
  createContext<IsFlushingStudentFlashcardUpdatesContextType | null>(null);

export type { IsFlushingStudentFlashcardUpdatesContextType };
export default IsFlushingStudentFlashcardUpdatesContext;
