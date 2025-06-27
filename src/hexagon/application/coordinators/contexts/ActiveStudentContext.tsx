import { createContext } from 'react';

interface ActiveStudentSelection {
  email: string | null;
  changed: boolean;
}

interface ActiveStudentContextType {
  // States
  studentSelectionState: ActiveStudentSelection;

  // Actions
  updateSelectedStudent: (selection: ActiveStudentSelection) => void;
}

const ActiveStudentContext = createContext<ActiveStudentContextType | null>(
  null,
);

export type { ActiveStudentContextType, ActiveStudentSelection };

export default ActiveStudentContext;
