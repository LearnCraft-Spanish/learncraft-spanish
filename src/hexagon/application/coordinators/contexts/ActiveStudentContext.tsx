import { createContext } from 'react';

interface ActiveStudentContextType {
  // States
  activeStudentEmail: string | null;

  // Actions
  updateActiveStudentEmail: (activeStudentEmail: string | null) => void;
}

const ActiveStudentContext = createContext<ActiveStudentContextType | null>(
  null,
);

export type { ActiveStudentContextType };

export default ActiveStudentContext;
