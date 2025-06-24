import { createContext } from 'react';

interface ActiveStudentContextType {
  // States
  studentEmail: string | null;

  // Actions
  updateStudentEmail: (studentEmail: string) => void;
}

const ActiveStudentContext = createContext<ActiveStudentContextType | null>(
  null,
);

export type { ActiveStudentContextType };

export default ActiveStudentContext;
