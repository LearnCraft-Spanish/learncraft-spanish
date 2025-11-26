import { createContext } from 'react';

interface IsFlushingStudentFlashcardUpdatesContextType {
  // States
  isFlushing: boolean;

  // Actions
  setIsFlushing: (isFlushing: boolean) => void;
  // flushBatch: () => Promise<void>;
  // addToBatch: (exampleId: number, difficulty: SrsDifficulty) => void;
  // hasExampleBeenReviewed: (exampleId: number) => SrsDifficulty | null;
}

const IsFlushingStudentFlashcardUpdatesContext =
  createContext<IsFlushingStudentFlashcardUpdatesContextType | null>(null);

export type { IsFlushingStudentFlashcardUpdatesContextType };
export default IsFlushingStudentFlashcardUpdatesContext;
